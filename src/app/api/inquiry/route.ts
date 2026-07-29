import { NextResponse } from "next/server";
import { sendEmail, firstNameOf } from "@/lib/drip/email";
import { AUTHOR, CAL_BOOKING_URL, SITE_URL } from "@/lib/site";
import {
  clientIp,
  spamVerdict,
  underRateLimit,
  verifyInquiryToken,
} from "@/lib/inquiry-guard";
import { getPostHogClient, posthogCookieDistinctId } from "@/lib/posthog-server";

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
//   INQUIRY_TO, override the destination inbox (defaults to AUTHOR.email).
//
// A hidden honeypot field ("company_website") catches naive bots: real people
// and form-filling agents leave it empty, scripts fill every field. A filled
// honeypot is treated as success (so the bot moves on) but never emailed.
//
// Beyond the honeypot, submissions pass through src/lib/inquiry-guard.ts: a
// signed form token on contact form posts, content heuristics, and a per-IP
// rate limit. Anything dropped still gets the success response (bots move on,
// nothing to probe) and is logged with its reason for auditing.
//
// Silent to the sender is never silent to us. Vercel logs roll off and nobody
// reads them on a schedule, so both ways a lead can vanish are also PostHog
// events, which are queryable and can carry a dashboard alert:
//
//   lead_notification_failed, Resend would not take the inbox copy (after one
//     retry). Carries the whole brief, so the lead is recoverable from the
//     event itself even though the email never arrived.
//   inquiry_dropped, a spam gate ate the submission. Carries the reason and
//     the identity, so a false positive is both countable and recoverable.
//
// The lead events themselves also carry notification_delivered / ack_delivered,
// so "did my inbox copy actually send" is a property on the conversion rather
// than a separate hunt through logs.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = process.env.WAITLIST_EMAIL_FROM || "Cereal Milk <clippy@updates.cerealmilk.sh>";
const TO = process.env.INQUIRY_TO || AUTHOR.email;

// One PostHog person collects every dropped submission (see the dropped()
// helper): the drops are a spam counter, not people worth tracking.
const DROPPED_DISTINCT_ID = "inquiry-dropped";

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
    const src = String(raw.src ?? "").trim().slice(0, 40);
    message = [
      "Demo request via the cerealmilk.sh/demo form.",
      src && !src.includes("://") ? `Source: ${src}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  // Every dropped submission gets the same success response a real one gets
  // (nothing for a bot to probe), plus a reason in the log for auditing and an
  // inquiry_dropped event so false positives are countable long after the log
  // has rolled off. The event is keyed to one fixed distinct id, not the
  // submitted email: a spam wave must not mint thousands of PostHog people.
  // The identity rides along as properties, so a real lead caught by a
  // heuristic can still be read off the event and answered by hand.
  const dropped = async (reason: string) => {
    console.warn(`[inquiry] dropped (${reason})`, { email, name: name.slice(0, 40) });
    const posthog = getPostHogClient();
    if (posthog) {
      try {
        posthog.capture({
          distinctId: DROPPED_DISTINCT_ID,
          event: "inquiry_dropped",
          properties: {
            reason,
            source,
            lead_email: email,
            lead_name: name,
            lead_firm: firm,
          },
        });
        await posthog.flush();
      } catch (err) {
        console.error("[inquiry] dropped-event capture failed", err);
      }
    }
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

  const notified = await sendInquiry({ name, email, firm, message, source }).catch(
    (err): SendResult => {
      console.error("[inquiry] send failed", err);
      return "failed";
    }
  );
  if (notified === "failed") {
    // Loud, greppable, and paired with the PostHog event below: a real lead
    // came in and the inbox copy did not go out.
    console.error("[inquiry] NOTIFICATION FAILED, lead reached PostHog only", {
      email,
      firm,
      source,
    });
  }

  // Acknowledge the sender: a one-time transactional confirmation (no
  // unsubscribe machinery) so a demo request that never reached the calendar
  // still carries the booking link, and a contact inquiry knows the reply
  // window. Best-effort, after the spam gates, never blocks the submission.
  // sendEmail reports failure by returning false rather than throwing, so the
  // boolean is the signal here and the catch is only for the unexpected.
  const acked = await sendInquiryAck({ name, email, source }).catch((err) => {
    console.error("[inquiry] ack failed", err);
    return false;
  });

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
  // Analytics must never fail the submission: a dead PostHog endpoint logs
  // and the lead still goes through.
  const posthog = getPostHogClient();
  if (posthog) {
    const event = source === "demo" ? "demo_request_submitted" : "inquiry_submitted";
    try {
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
          notification_delivered: notified === "sent",
          ack_delivered: acked,
        },
      });
      // The inbox copy never went out. Carry the whole brief on the event so
      // the lead survives in full, and alert on this in PostHog: it is the
      // only signal that a real request is sitting unanswered.
      if (notified === "failed") {
        posthog.capture({
          distinctId: email,
          event: "lead_notification_failed",
          properties: {
            source,
            lead_email: email,
            lead_name: name,
            lead_firm: firm,
            lead_message: message,
          },
        });
      }
      const anonId = posthogCookieDistinctId(req);
      if (anonId && anonId !== email) {
        // The same merge posthog-js performs on identify(): the browser's
        // anonymous journey (pageviews, CTA clicks) folds into the lead.
        posthog.capture({
          distinctId: email,
          event: "$identify",
          properties: { $anon_distinct_id: anonId },
        });
      }
      await posthog.flush();
    } catch (err) {
      console.error("[inquiry] posthog capture failed", err);
    }
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

// "unconfigured" is the local-dev path (no key, the brief goes to the log and
// nothing is wrong); "failed" means a configured provider refused a real lead
// and somebody needs to know.
type SendResult = "sent" | "unconfigured" | "failed";

async function sendInquiry({ name, email, firm, message, source }: Inquiry): Promise<SendResult> {
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
    return "unconfigured";
  }

  // Two attempts. A rate limit or a 5xx is a blip worth one more try; a 4xx is
  // a fact about the request (bad payload, unverified sender, revoked key) and
  // will fail identically a second later, so it returns straight away.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
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
      if (r.ok) return "sent";
      const body = await r.text().catch(() => "");
      console.error(`[inquiry] resend responded (attempt ${attempt})`, r.status, body);
      if (r.status !== 429 && r.status < 500) return "failed";
    } catch (err) {
      console.error(`[inquiry] resend request threw (attempt ${attempt})`, err);
    }
    if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return "failed";
}

// The sender's confirmation, through the shared drip transport (one from, one
// reply-to, plain-text-first) as an "ack": one-time transactional, so it
// carries no unsubscribe footer or headers. Demo requests get the booking
// link again in case the redirect never completed; contact inquiries get the
// honest reply window.
async function sendInquiryAck({
  name,
  email,
  source,
}: Pick<Inquiry, "name" | "email" | "source">): Promise<boolean> {
  const firstName = firstNameOf(name);
  if (source === "demo") {
    return sendEmail({
      to: email,
      subject: "Your Cereal Milk demo: pick a time",
      firstName,
      sequence: "ack",
      blocks: [
        "Got your demo request, thank you. It's 30 minutes on a screen-share with me, on your own messages: bring the conversations you actually work in and we'll put an agent next to them live.",
        "If you haven't picked a slot yet (or the calendar didn't load), here's the direct link:",
        { label: "Book your 30 minutes →", href: CAL_BOOKING_URL },
        "Anything you want the demo to cover, just reply to this email; it comes straight to my real inbox.",
      ],
    });
  }
  return sendEmail({
    to: email,
    subject: "Got your message",
    firstName,
    sequence: "ack",
    blocks: [
      "Thanks for writing in. Your message landed in my real inbox (no ticket queue here), and I reply personally within one business day.",
      "If it's time-sensitive, reply to this email with URGENT in the subject and I'll get to it first.",
    ],
  });
}
