import { NextResponse } from "next/server";
import { sendEmail, DOWNLOAD_URL, PREORDER_URL } from "@/lib/drip/email";
import { markPreordered, startWaitlist } from "@/lib/drip/engine";
import { STARTER, BUSINESS, TRIAL_DAYS } from "@/lib/pricing";
import { NEWSLETTER_NAME, SITE_URL } from "@/lib/site";
import { getPostHogClient, posthogCookieDistinctId } from "@/lib/posthog-server";

// Every email-capture form on cerealmilk.sh posts here: the newsletter forms
// (header/footer/Terminus, source: "footer" | "home" | …), the /preorder form
// (source: "preorder"), and any product signup (source: "app" | "waitlist",
// also the documented path in openapi.json). Rollout-safe and
// provider-agnostic: it forwards each signup to whatever is configured in the
// environment, and if nothing is set it logs and still succeeds: so the form
// works the moment it ships, and pointing it at a real list later is just an
// env var, no code change.
//
//   WAITLIST_WEBHOOK_URL. POST the JSON entry to any endpoint
//                                          (Zapier / Make / your own handler).
//   RESEND_API_KEY + RESEND_AUDIENCE_ID, add the contact to a Resend audience.
//
// Set either, both, or neither. Failures are logged, never surfaced to the user
// (a transient provider hiccup shouldn't lose a lead or show an error).
//
// The `source` field decides the journey:
//   "app"/"waitlist" → product lead: Day-0 product welcome + the nurture drip.
//   "preorder"       → founding reservation: confirmation email, no nurture.
//   anything else    → Breakfast Club subscriber: newsletter welcome, NO product
//                      drip (a reader subscribing on an article must never get
//                      "reserve your seat" product emails).
//
// (The "ai-spend-course" source was retired 2026-07-29 with the docs site its
// five chapter emails linked to; a stray post carrying it now gets the
// newsletter journey.)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export async function POST(req: Request) {
  // JSON from the site's own forms; form-encoded from any plain HTML <form>
  // post (no JS). That one gets a redirect back, not JSON.
  let raw: Record<string, unknown> = {};
  let isFormPost = false;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      raw = ((await req.json()) ?? {}) as Record<string, unknown>;
    } catch {
      return bad("Invalid request.");
    }
  } else if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    isFormPost = true;
    try {
      const form = await req.formData();
      raw = Object.fromEntries(form.entries());
    } catch {
      return bad("Invalid request.");
    }
  } else {
    return bad("Invalid request.");
  }

  const email = String(raw.email ?? "").trim().toLowerCase();
  const name = String(raw.name ?? "").trim();
  const source = String(raw.source ?? "waitlist").trim().slice(0, 64) || "waitlist";
  const isProduct = source === "app" || source === "waitlist";
  // A founding pre-order reservation from /preorder: carries the plan the
  // visitor chose to lock, gets its own confirmation email, and redirects
  // no-JS posts to the confirmation page.
  const isPreorder = source === "preorder";
  const plan = String(raw.plan ?? "").trim().slice(0, 32) || undefined;

  // Honeypot: real visitors never see the field; a filled value means a
  // script, so pretend success and drop the lead.
  if (String(raw.company_website ?? "").trim()) {
    if (isFormPost) {
      return NextResponse.redirect(
        `${SITE_URL}${isPreorder ? "/preorder/thanks" : "/newsletter?subscribed=1"}`,
        303
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (!EMAIL_RE.test(email)) {
    if (isFormPost) {
      return NextResponse.redirect(
        `${SITE_URL}${isPreorder ? "/preorder?error=email" : "/newsletter?error=email"}`,
        303
      );
    }
    return bad("Please enter a valid email address.");
  }

  const entry = {
    email,
    name,
    source,
    ...(plan ? { plan } : {}),
    at: new Date().toISOString(),
  };

  let delivered = false;

  // 1. Generic webhook: points anywhere.
  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (webhook) {
    try {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (r.ok) delivered = true;
      else console.error("[waitlist] webhook responded", r.status);
    } catch (err) {
      console.error("[waitlist] webhook failed", err);
    }
  }

  // 2. Resend audience: adds the contact to the mailing list.
  const resendKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (resendKey && audienceId) {
    try {
      const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
      const r = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${resendKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName || undefined,
          last_name: rest.join(" ") || undefined,
          unsubscribed: false,
        }),
      });
      if (r.ok) delivered = true;
      else console.error("[waitlist] resend responded", r.status, await r.text().catch(() => ""));
    } catch (err) {
      console.error("[waitlist] resend failed", err);
    }
  }

  // 3. Nothing configured (or every provider errored) → log so the lead is never
  // silently dropped, and still report success to the user.
  if (!delivered) {
    console.log("[waitlist] signup (no provider delivered):", entry);
  }

  // Welcome email (Day 0): best-effort, sent whenever Resend is configured,
  // independent of where the contact is stored. Never blocks or fails the
  // signup. Product signups get the founder's product welcome; everyone else
  // gets the Breakfast Club welcome.
  if (resendKey) {
    if (isPreorder) {
      await sendPreorderConfirmationEmail(email, name, plan).catch((err) =>
        console.error("[waitlist] preorder confirmation failed", err)
      );
    } else {
      const welcome = isProduct ? sendProductWelcomeEmail : sendBreakfastClubWelcomeEmail;
      await welcome(email, name).catch((err) =>
        console.error("[waitlist] welcome email failed", err)
      );
    }
  }

  // Lifecycle enrollment (store-gated: all no-ops until UPSTASH_* is set).
  // Product signups enter the nurture sequence, whose job is to get them to
  // download the app and start the trial (with the founding seat as the
  // price-lock offer). A reservation marks the contact converted so nurture
  // ends and never pitches someone who already reserved; activation still
  // waits for the real account creation. Newsletter signups are untouched: no
  // product drip for them.
  if (isPreorder) {
    await markPreordered(email, name).catch((err) =>
      console.error("[waitlist] preorder lifecycle mark failed", err)
    );
  } else if (isProduct) {
    await startWaitlist(email, name).catch((err) =>
      console.error("[waitlist] nurture enrol failed", err)
    );
  }

  // Server-side ground truth: fires for every non-dropped signup so the
  // conversion is counted even when client-side tracking is blocked or the
  // submission came from a no-JS form post.
  const posthog = getPostHogClient();
  if (posthog) {
    let phEvent: string;
    if (isPreorder) {
      phEvent = "preorder_submitted";
    } else if (isProduct) {
      phEvent = "waitlist_joined";
    } else {
      phEvent = "newsletter_subscribed";
    }
    // Analytics must never fail the signup: a dead PostHog endpoint logs
    // and the lead still goes through.
    try {
      posthog.identify({
        distinctId: email,
        properties: {
          email,
          ...(name ? { name } : {}),
          lead_source: source,
        },
      });
      posthog.capture({
        distinctId: email,
        event: phEvent,
        properties: {
          source,
          ...(isPreorder && plan ? { plan } : {}),
        },
      });
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
      console.error("[waitlist] posthog capture failed", err);
    }
  }

  if (isFormPost) {
    return NextResponse.redirect(
      `${SITE_URL}${isPreorder ? "/preorder/thanks" : "/newsletter?subscribed=1"}`,
      303
    );
  }
  return NextResponse.json({ ok: true });
}

// The pre-order confirmation (the transactional receipt for a reservation):
// confirm the seat, restate what was locked with the real numbers, set
// expectations in order, and make the referral ask. Sent through the same
// shared transport as every other email (one path, one from/reply-to, one
// unsubscribe footer).
async function sendPreorderConfirmationEmail(
  email: string,
  name: string,
  plan?: string
) {
  const firstName = name.split(/\s+/).filter(Boolean)[0] || undefined;
  const planLine =
    plan === "business"
      ? `You locked the Business plan at today's published rate: $${BUSINESS.monthly} per user a month, or $${BUSINESS.yearly} a year.`
      : plan === "starter"
        ? `You locked the Starter plan at today's published rate: $${STARTER.monthly} per user a month, or $${STARTER.yearly} a year.`
        : "You locked today's published pricing.";
  await sendEmail({
    to: email,
    subject: "Your Cereal Milk founding seat is reserved",
    firstName,
    sequence: "welcome",
    blocks: [
      "I'm Daniel, founder of Cereal Milk. Your founding seat is reserved: no charge was made, and none will be until your seat is set up and you decide to keep it.",
      `${planLine} It never rises for a founding seat, and you can switch plans before setup.`,
      "What happens next: founding installs are set up first, personally, on a call with me. You'll get an email from me shortly with a link to pick your setup time. We do install, accounts, and your agent's model connection together in about 30 minutes, and it's free to try after the call either way.",
      `No need to wait for the call to look around: the app is live for Mac and Windows at ${DOWNLOAD_URL}, and creating your account starts a free ${TRIAL_DAYS}-day trial, no card.`,
      "Change your mind anytime before setup: just reply to this email and the reservation is gone, no questions.",
      `And if someone you trade deals with should be in the founding cohort too, send them ${PREORDER_URL}. Seats are capped at 100, and a forward from you beats anything I could write.`,
    ],
  });
}

// The founder's Day-0 welcome for a product signup: a plain, personal note
// (not a designed template), sent through the same shared transport as every
// drip step so the from/reply-to, plain-text-first rendering, and one-click
// unsubscribe headers all stay in one place (see src/lib/drip/email.ts).
async function sendProductWelcomeEmail(email: string, name: string) {
  const firstName = name.split(/\s+/).filter(Boolean)[0] || undefined;
  await sendEmail({
    to: email,
    subject: "Welcome to Cereal Milk (start here)",
    firstName,
    sequence: "welcome",
    blocks: [
      "I'm Daniel, founder of Cereal Milk. Thanks for signing up. It genuinely means a lot.",
      "Cereal Milk is the messenger built for AI agents: WhatsApp in one fast desktop window with an AI agent beside every chat, running on your own Claude, ChatGPT, Gemini, or OpenAI-compatible account. It summarises threads, pulls out commitments, and drafts replies you send yourself. LinkedIn and Gmail are next.",
      `The good news: there's nothing to wait for. The app is live for Mac and Windows, and creating your account starts a free ${TRIAL_DAYS}-day trial of the full product, no card.`,
      { label: "Download Cereal Milk for Mac or Windows →", href: DOWNLOAD_URL },
      "And if Cereal Milk isn't the right fit, just hit reply and tell me why. Whatever's holding you back genuinely shapes what we build next.",
    ],
  });
}

// The Breakfast Club welcome, for everyone who subscribed on the site. Light
// product framing, no drip; the next email they get is a real issue. Links go
// to live pages only (/demo, /pricing, /for/venture-capital).
async function sendBreakfastClubWelcomeEmail(email: string, name: string) {
  const firstName = name.split(/\s+/).filter(Boolean)[0] || undefined;
  await sendEmail({
    to: email,
    subject: `You're in ${NEWSLETTER_NAME}`,
    firstName,
    sequence: "newsletter",
    blocks: [
      "I'm Daniel, founder of Cereal Milk. We make the Cereal Milk desktop app: the messenger built for AI agents. It puts WhatsApp in one fast window, with an AI agent beside every chat that runs on your own model account. LinkedIn and Gmail are next.",
      "You'll get one email when something new ships: a new release, a new capability, or a note from the build. No schedule, no filler: if nothing shipped, you hear nothing.",
      `In the meantime: how funds run it is at ${SITE_URL}/for/venture-capital, and pricing is published in full at ${SITE_URL}/pricing.`,
      { label: "See Cereal Milk on your own pipeline →", href: `${SITE_URL}/demo` },
      "And if the conversations that pay you happen somewhere Cereal Milk doesn't reach yet, hit reply and tell me. I read everything.",
    ],
  });
}
