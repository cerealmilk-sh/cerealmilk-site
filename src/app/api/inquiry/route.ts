import { NextResponse } from "next/server";
import { AUTHOR, CAL_BOOKING_URL, SITE_URL } from "@/lib/site";
import {
  clientIp,
  spamVerdict,
  underRateLimit,
  verifyInquiryToken,
} from "@/lib/inquiry-guard";
import { getPostHogClient } from "@/lib/posthog-server";

// The /contact inquiry endpoint. Deliberately simple and agent-friendly: it
// accepts a normal HTML <form> POST (so a browsing agent: ChatGPT Agent,
// Claude computer-use, or a human with JavaScript off can submit it) AND a
// JSON POST (so a tool/MCP server can submit programmatically). It emails the
// brief straight to Daniel via Resend, with reply_to set to the sender so a
// reply goes right back to them. Best-effort delivery: a provider hiccup is
// logged, never shown, and never loses the lead.
//
//   RESEND_API_KEY, required to actually send (falls back to a log).
//   WAITLIST_EMAIL_FROM, verified sending identity (shared with the drip).
//   INQUIRY_TO, override the destination inbox (defaults to dan@).
//
// A hidden honeypot field ("company_website") catches naive bots: real people
// and form-filling agents leave it empty, scripts fill every field. A filled
// honeypot is treated as success (so the bot moves on) but never emailed.
//
// Beyond the honeypot, submissions pass through src/lib/inquiry-guard.ts: a
// signed form token on contact form posts, content heuristics, and a per-IP
// rate limit. Anything dropped still gets the success response (bots move on,
// nothing to probe) and is logged with its reason for auditing.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = process.env.WAITLIST_EMAIL_FROM || "Cereal Milk <daniel@updates.cerealmilk.sh>";
const TO = process.env.INQUIRY_TO || AUTHOR.email;

function backToForm(params: string, source: "contact" | "demo" = "contact") {
  return NextResponse.redirect(`${SITE_URL}/${source}?${params}`, 303);
}

// Where a successful no-JS form post from /demo lands: the same Cal.com
// booking page the JS flow redirects to, with name and email prefilled.
function onToCalendar(name: string, email: string) {
  const cal = new URL(CAL_BOOKING_URL);
  if (name) cal.searchParams.set("name", name);
  if (email) cal.searchParams.set("email", email);
  return NextResponse.redirect(cal.toString(), 303);
}

// GET returns the endpoint's own contract as JSON, so an agent that hits the URL
// (or a tool/MCP server discovering it) learns how to POST without reading the
// docs. The honeypot field is deliberately omitted, real submitters never fill
// it, and documenting it would only help bots defeat it.
export function GET() {
  return NextResponse.json({
    description:
      "Send an inquiry to Cereal Milk (a demo request, a fund pilot, or a question about the Mac app). The message is emailed to the founder, who replies within one business day. This is the same endpoint the cerealmilk.sh/contact form posts to.",
    method: "POST",
    accepts: [
      "application/json",
      "application/x-www-form-urlencoded",
      "multipart/form-data",
    ],
    fields: [
      { name: "name", required: false, type: "string", description: "The sender's name." },
      { name: "email", required: true, type: "string", description: "A valid email Cereal Milk can reply to." },
      { name: "firm", required: false, type: "string", description: "The fund or firm, and which CRM it runs (Attio or Affinity)." },
      { name: "message", required: true, type: "string", description: "What the sender needs: the problem and what a good outcome looks like." },
      { name: "source", required: false, type: "string", description: "Where the inquiry came from: \"contact\" (default) or \"demo\" (the /demo booking form)." },
      { name: "subscribe", required: false, type: "boolean", description: "Opt in to The Cereal Milk Field Notes newsletter. Never auto-subscribed." },
    ],
    example: {
      name: "Jordan Rivera",
      email: "jordan@examplefund.com",
      firm: "Example Ventures (Attio)",
      message:
        "We'd like a demo of Cereal Milk for our six-person investment team, and to hear how a pilot works.",
      subscribe: false,
    },
    note: "A JSON POST returns { ok: true } on success; a form POST redirects to /contact?sent=1 (or, for source=demo, on to the booking calendar). A valid email is always required; a message is required except for source=demo, where one is synthesized.",
  });
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let raw: Record<string, unknown> = {};
  try {
    if (isJson) {
      raw = ((await req.json()) ?? {}) as Record<string, unknown>;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await req.formData();
      raw = Object.fromEntries(form.entries());
    } else {
      return isJson
        ? NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 })
        : backToForm("error=1");
    }
  } catch {
    return isJson
      ? NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 })
      : backToForm("error=1");
  }

  const honeypot = String(raw.company_website ?? "").trim();
  const name = String(raw.name ?? "").trim().slice(0, 200);
  const email = String(raw.email ?? "").trim().toLowerCase().slice(0, 200);
  const firm = String(raw.firm ?? "").trim().slice(0, 200);
  let message = String(raw.message ?? "").trim().slice(0, 5000);
  // Whitelisted: it lands in the email subject/footer, so free text stays out.
  const source = raw.source === "demo" ? "demo" : "contact";
  const subscribe =
    raw.subscribe === true || raw.subscribe === "on" || raw.subscribe === "1";

  // Demo posts never carry free text to the inbox: the message is ALWAYS
  // synthesized server-side from the structured fields, whatever the client
  // sent. (The form's own JS used to compose this client-side; a bot could
  // ride the same path with a payload.)
  if (source === "demo") {
    const teamSize = String(raw.team_size ?? "").trim().slice(0, 40);
    const src = String(raw.src ?? "").trim().slice(0, 40);
    message = [
      "Demo request via the cerealmilk.sh/demo form.",
      teamSize ? `Team size: ${teamSize}` : "",
      src && !src.includes("://") ? `Source: ${src}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  // Every dropped submission gets the same success response a real one gets
  // (nothing for a bot to probe), plus a reason in the log for auditing.
  const dropped = (reason: string) => {
    console.warn(`[inquiry] dropped (${reason})`, { email, name: name.slice(0, 40) });
    if (isJson) return NextResponse.json({ ok: true });
    return source === "demo" ? onToCalendar(name, email) : backToForm("sent=1");
  };

  // Honeypot tripped: pretend success, send nothing.
  if (honeypot) return dropped("honeypot");

  // A form-encoded contact post must carry the signed token /contact renders.
  // Bots that POST here without ever loading the page have none; bots that
  // submit within seconds of loading fail the minimum age. JSON posts are the
  // documented agent path and are exempt (the heuristics below still apply).
  if (!isJson && source === "contact" && !verifyInquiryToken(String(raw.ft ?? ""))) {
    return dropped("form-token");
  }

  const verdict = spamVerdict({ name, email, firm, message });
  if (verdict) return dropped(verdict);

  if (!EMAIL_RE.test(email)) {
    return isJson
      ? NextResponse.json({ ok: false, error: "A valid email is required." }, { status: 400 })
      : backToForm("error=email", source);
  }
  if (!message) {
    return isJson
      ? NextResponse.json({ ok: false, error: "A message is required." }, { status: 400 })
      : backToForm("error=message", source);
  }

  // Volume cap, last: only well-formed submissions spend a Redis op.
  if (!(await underRateLimit(clientIp(req)))) return dropped("rate-limit");

  await sendInquiry({ name, email, firm, message, source }).catch((err) =>
    console.error("[inquiry] send failed", err)
  );

  // Opt-in newsletter only. Never auto-subscribe. Forward to the existing
  // capture endpoint so the Field Notes welcome + audience logic stays in one
  // place; best-effort and non-blocking.
  if (subscribe) {
    fetch(`${SITE_URL}/api/waitlist`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name, source: "contact" }),
    }).catch((err) => console.error("[inquiry] newsletter forward failed", err));
  }

  // Server-side ground truth: fires for every non-dropped submission so the
  // conversion is counted even when the client-side TrackEvent is blocked by
  // an ad-blocker or a no-JS form post.
  const posthog = getPostHogClient();
  if (posthog) {
    const event = source === "demo" ? "demo_request_submitted" : "inquiry_submitted";
    posthog.identify({
      distinctId: email,
      properties: {
        email,
        ...(name ? { name } : {}),
        ...(firm ? { company: firm } : {}),
        lead_source: source,
      },
    });
    posthog.capture({
      distinctId: email,
      event,
      properties: {
        source,
        ...(firm ? { firm } : {}),
        has_name: Boolean(name),
        subscribed_newsletter: subscribe,
      },
    });
    await posthog.flush();
  }

  if (isJson) return NextResponse.json({ ok: true });
  // No-JS demo posts continue to the calendar, mirroring the JS flow; contact
  // posts return to the form with the confirmation banner.
  return source === "demo" ? onToCalendar(name, email) : backToForm("sent=1");
}

interface Inquiry {
  name: string;
  email: string;
  firm: string;
  message: string;
  source: "contact" | "demo";
}

async function sendInquiry({ name, email, firm, message, source }: Inquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const subject =
    source === "demo"
      ? `New Cereal Milk demo request, ${firm || name || email}`
      : `New Cereal Milk inquiry, ${firm || name || email}`;
  const lines = [
    `Name:  ${name || "(not given)"}`,
    `Email: ${email}`,
    `Firm:  ${firm || "(not given)"}`,
    "",
    "Message:",
    message,
    "",
    `Submitted via cerealmilk.sh/${source}`,
  ];
  const text = lines.join("\n");

  if (!apiKey) {
    console.log("[inquiry] RESEND_API_KEY unset, would email inquiry:\n" + text);
    return;
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject,
      text,
    }),
  });
  if (!r.ok) {
    console.error("[inquiry] resend responded", r.status, await r.text().catch(() => ""));
  }
}
