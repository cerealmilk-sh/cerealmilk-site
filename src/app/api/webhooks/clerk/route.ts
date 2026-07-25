import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { markConverted } from "@/lib/drip/engine";

// Clerk Billing webhook → the "converted" signal that starts the activation
// sequence. Point a Clerk webhook (Dashboard → Webhooks) at this URL and set
// CLERK_WEBHOOK_SECRET to the signing secret it gives you (whsec_…). Subscribe
// to the subscription events.
//
// Webhooks are Svix-signed; we verify the signature with no SDK (manual HMAC) to
// avoid a dependency. Rollout-safe: with CLERK_WEBHOOK_SECRET unset we 200 and
// no-op, so wiring the webhook before the secret never errors.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Verify the Svix signature: HMAC-SHA256 over `${id}.${timestamp}.${body}`,
// keyed by the base64 secret (after the `whsec_` prefix), base64-compared
// against any of the space-separated `v1,<sig>` entries in svix-signature.
function verify(secret: string, headers: Headers, body: string): boolean {
  const id = headers.get("svix-id");
  const ts = headers.get("svix-timestamp");
  const sigHeader = headers.get("svix-signature");
  if (!id || !ts || !sigHeader) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${id}.${ts}.${body}`)
    .digest("base64");
  const expBuf = Buffer.from(expected);

  return sigHeader.split(" ").some((part) => {
    const sig = part.split(",")[1];
    if (!sig) return false;
    const buf = Buffer.from(sig);
    return buf.length === expBuf.length && crypto.timingSafeEqual(buf, expBuf);
  });
}

// Clerk's billing payloads nest the subscriber differently across event types,
// so search common locations for an email rather than assume one shape.
function findEmail(obj: unknown, depth = 0): string | undefined {
  if (!obj || depth > 6) return undefined;
  if (typeof obj === "string") {
    const s = obj.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : undefined;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const f = findEmail(v, depth + 1);
      if (f) return f;
    }
    return undefined;
  }
  if (typeof obj === "object") {
    const rec = obj as Record<string, unknown>;
    // Prefer obvious email fields first.
    for (const k of ["email_address", "email", "payer_email"]) {
      const f = findEmail(rec[k], depth + 1);
      if (f) return f;
    }
    for (const v of Object.values(rec)) {
      const f = findEmail(v, depth + 1);
      if (f) return f;
    }
  }
  return undefined;
}

// Event types that mean "a subscription is now active / paid".
const CONVERT_EVENTS = /subscription(item)?\.(created|active|updated)/i;

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const raw = await req.text();
  if (!secret) return NextResponse.json({ ok: true }); // unconfigured → no-op

  if (!verify(secret, req.headers, raw)) {
    return NextResponse.json({ ok: false, error: "Bad signature" }, { status: 401 });
  }

  let evt: { type?: string; data?: unknown };
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (evt.type && CONVERT_EVENTS.test(evt.type)) {
    const email = findEmail(evt.data);
    if (email) {
      await markConverted(email).catch((err) => console.error("[clerk] convert failed", err));
    } else {
      console.error("[clerk] no email found on", evt.type);
    }
  }

  return NextResponse.json({ ok: true });
}
