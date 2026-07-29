import { NextResponse } from "next/server";
import {
  markConverted,
  markReplied,
  markUnsubscribed,
  recordSignal,
} from "@/lib/drip/engine";
import type { SignalKey } from "@/lib/drip/types";

// Lifecycle signal ingest. A single secret-protected endpoint the Mac app (and
// anything else) POSTs to as a customer moves through onboarding. It's how the
// activation sequence advances and suppresses itself, a step that nudges
// "connect WhatsApp" is skipped once whatsapp_connected lands here.
//
// Auth: header `x-lifecycle-secret: <LIFECYCLE_INGEST_SECRET>`. Rollout-safe,
// with the secret unset the endpoint is closed (503), and the engine is inert
// anyway until the store is configured.
//
// Body: { "type": "<event>", "email": "you@co.com", "name"?: "Jane Doe" }
//   converted: created an account (trial started; a purchase lands here too
//              once billing ships); stops nurture, starts activation
//   replied, replied to a drip; pause and hand to a human
//   unsubscribed, hard stop
//   whatsapp_connected → activation A2 (connect) skips
//   first_insight (first agent ask) → A3 (first ask) skips
//   first_sync (first thread export) → A4 (cockpit) skips
//   linkedin_connected, crm_linked: accepted and recorded, reserved for the
//   next channels and the MCP/CRM step as they ship

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNALS: Record<string, SignalKey> = {
  whatsapp_connected: "whatsappConnected",
  linkedin_connected: "linkedinConnected",
  crm_linked: "crmLinked",
  first_sync: "firstSync",
  first_insight: "firstInsight",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const secret = process.env.LIFECYCLE_INGEST_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }
  if (req.headers.get("x-lifecycle-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const type = String(body.type ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = body.name ? String(body.name).trim() : undefined;
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  try {
    if (type === "converted") await markConverted(email, name);
    else if (type === "replied") await markReplied(email);
    else if (type === "unsubscribed") await markUnsubscribed(email);
    else if (SIGNALS[type]) await recordSignal(email, SIGNALS[type]);
    else return NextResponse.json({ ok: false, error: `Unknown type: ${type}` }, { status: 400 });
  } catch (err) {
    console.error("[lifecycle] failed", err);
    // Never surface internal errors; the caller shouldn't retry-storm us.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
