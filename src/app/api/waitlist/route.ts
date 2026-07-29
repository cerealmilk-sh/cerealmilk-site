import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/drip/email";
import { markPreordered, startCourse, startWaitlist } from "@/lib/drip/engine";
import { COURSE_DAY1 } from "@/lib/drip/sequences";
import { NEWSLETTER_NAME, SITE_URL } from "@/lib/site";
import { getPostHogClient } from "@/lib/posthog-server";

// Every email-capture form on cerealmilk.sh posts here, the studio newsletter forms
// (header/footer/Terminus, source: "footer" | "home" | "work/…"), the docs
// site's form (form-encoded POST), and the Mac-app product page (source:
// "app"). Rollout-safe and provider-agnostic: it forwards each signup to
// whatever is configured in the environment, and if nothing is set it logs and
// still succeeds: so the form works the moment it ships, and pointing it at a
// real list later is just an env var, no code change.
//
//   WAITLIST_WEBHOOK_URL. POST the JSON entry to any endpoint
//                                          (Zapier / Make / your own handler).
//   RESEND_API_KEY + RESEND_AUDIENCE_ID, add the contact to a Resend audience.
//
// Set either, both, or neither. Failures are logged, never surfaced to the user
// (a transient provider hiccup shouldn't lose a lead or show an error).
//
// The `source` field decides the journey:
//   "app"           → Cereal Milk waitlist: a single Day-0 product welcome.
//                     The payment/onboarding nurture drip is OFF while the app
//                     is invite-only (see below).
//   anything else   → Field Notes subscriber: newsletter welcome, NO product
//                     email (a fund partner signing up on a case study must
//                     never get "claim your seat" product emails).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export async function POST(req: Request) {
  // JSON from the site's own forms; form-encoded from the docs site (a plain
  // HTML <form> post, no JS). That one gets a redirect back, not JSON.
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
  // The AI-spend email course: a five-day drip, not a product or newsletter
  // signup. Day 1 lands inline below; days 2–5 are enrolled after.
  const isCourse = source === "ai-spend-course";
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
  // signup. Product signups get the founder's waitlist note; everyone else
  // gets the Field Notes welcome.
  if (resendKey) {
    if (isCourse) {
      await sendCourseDay1Email(email, name).catch((err) =>
        console.error("[waitlist] course day-1 email failed", err)
      );
    } else if (isPreorder) {
      await sendPreorderConfirmationEmail(email, name, plan).catch((err) =>
        console.error("[waitlist] preorder confirmation failed", err)
      );
    } else {
      const welcome = isProduct ? sendProductWelcomeEmail : sendFieldNotesWelcomeEmail;
      await welcome(email, name).catch((err) =>
        console.error("[waitlist] welcome email failed", err)
      );
    }
  }

  // AI-spend course: enrol the timed tail (days 2–5). Store-gated, so with the
  // drip store off the Day-1 email above still lands and the rest are simply
  // inert until UPSTASH_* is set. Never blocks or fails the signup.
  if (isCourse) {
    await startCourse(email, name).catch((err) =>
      console.error("[waitlist] course enrol failed", err)
    );
  }

  // Lifecycle enrollment (store-gated: all no-ops until UPSTASH_* is set).
  // Product waitlist signups enter the nurture sequence, whose job is now to
  // convert them into a founding pre-order (re-enabled 2026-07-14 with the
  // /preorder launch; it was off during the invite-only era). A reservation
  // marks the contact converted so nurture ends and never pitches someone who
  // already reserved; activation still waits for the real setup. Newsletter
  // and course signups are untouched: no product drip for them.
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
// confirm the seat, set expectations in order, restate the agreement, and
// make the referral ask. Sent through the same shared transport as every
// other email (one path, one from/reply-to, one unsubscribe footer).
async function sendPreorderConfirmationEmail(
  email: string,
  name: string,
  plan?: string
) {
  const firstName = name.split(/\s+/).filter(Boolean)[0] || undefined;
  const planLine =
    plan === "business"
      ? "You locked the Business plan at today's published rate."
      : plan === "starter"
        ? "You locked the Starter plan at today's published rate."
        : "You locked today's published pricing.";
  await sendEmail({
    to: email,
    subject: "Your Cereal Milk founding seat is reserved",
    firstName,
    sequence: "welcome",
    blocks: [
      "I'm Daniel, founder of Cereal Milk. Your founding seat is reserved: no charge was made, and none will be until your seat is set up and you decide to keep it.",
      `${planLine} It never rises for a founding seat, and you can switch plans before setup.`,
      "What happens next: founding seats are onboarded first, in the order they reserved. When your wave opens you get a personal email from me with a link to pick your setup call. Install, accounts, and CRM mapping are done with you in about 30 minutes, and your free trial starts there.",
      "Change your mind anytime before setup: just reply to this email and the reservation is gone, no questions.",
      `And if someone you trade deals with should be in the founding cohort too, send them ${SITE_URL}/preorder. Seats are capped, and a forward from you beats anything I could write.`,
    ],
  });
}

// The founder's Day-0 welcome for the Mac-app waitlist: a plain, personal note
// (not a designed template), sent through the same shared transport as every
// drip step so the from/reply-to, plain-text-first rendering, and one-click
// unsubscribe headers all stay in one place (see src/lib/drip/email.ts).
async function sendProductWelcomeEmail(email: string, name: string) {
  const firstName = name.split(/\s+/).filter(Boolean)[0] || undefined;
  await sendEmail({
    to: email,
    subject: "Thanks for joining the Cereal Milk waitlist",
    firstName,
    sequence: "welcome",
    blocks: [
      "I'm Daniel, founder of Cereal Milk. Thanks for signing up for the Cereal Milk waitlist. It genuinely means a lot.",
      "Cereal Milk is the native Mac client for WhatsApp & LinkedIn: it syncs the conversations that matter to Attio or Affinity, gives you a command palette and relationship insights, and keeps everything private by default.",
      "We're onboarding new teams in waves, and I'll personally email you the moment a spot opens.",
      "And if Cereal Milk isn't the right fit, just hit reply and tell me why. Whatever's holding you back genuinely shapes what we build next.",
    ],
  });
}

// Day 1 of the AI-spend email course, sent inline so it lands the moment
// someone signs up, through the same shared transport as every drip step. The
// remaining four days are enrolled via startCourse (see above). Content lives in
// the sequence file so all five emails stay together.
async function sendCourseDay1Email(email: string, name: string) {
  const firstName = name.split(/\s+/).filter(Boolean)[0] || undefined;
  await sendEmail({
    to: email,
    subject: COURSE_DAY1.subject,
    firstName,
    sequence: "course",
    blocks: COURSE_DAY1.blocks,
  });
}

// The Field Notes welcome, for everyone who subscribed on the site or the
// docs. Light product framing, no drip; the next email they get is a real
// issue. Links go to live pages only (/demo, /pricing). The /docs link was
// dropped 2026-07-29: the docs proxy left next.config.ts on 2026-07-28, so
// /docs 404s. Restore the link here when a docs site ships again.
async function sendFieldNotesWelcomeEmail(email: string, name: string) {
  const firstName = name.split(/\s+/).filter(Boolean)[0] || undefined;
  await sendEmail({
    to: email,
    subject: `You're on ${NEWSLETTER_NAME}`,
    firstName,
    sequence: "welcome",
    blocks: [
      "I'm Daniel, founder of Cereal Milk. We make the Cereal Milk desktop app: the messenger built for AI agents. It puts WhatsApp in one fast window, with an AI agent beside every chat that runs on your own model account. LinkedIn and Gmail are next.",
      "You'll get one email when something new ships: a new release, a new capability, or a field note from the build. No schedule, no filler: if nothing shipped, you hear nothing.",
      `In the meantime, pricing is published in full at ${SITE_URL}/pricing.`,
      { label: "See Cereal Milk on your own pipeline →", href: `${SITE_URL}/demo` },
      "And if the conversations that pay you happen somewhere Cereal Milk doesn't reach yet, hit reply and tell me. I read everything.",
    ],
  });
}
