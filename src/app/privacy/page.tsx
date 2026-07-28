// /privacy, the privacy policy for BOTH surfaces: this website (analytics,
// cookies, forms) and the Cereal Milk product (the Mac app plus the hosted service it
// syncs to). Plain, honest, and structured; written as disclosure, not as
// reviewed-by-counsel boilerplate. Linked from the footer and the /terms
// "Your data" section; analytics itself loads by default via
// public/consent-analytics.js, with the opt-out toggle living on this page.
// Kept as a self-contained page (not registry-driven) so it stays
// independent of the marketing surface.

import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/vercel-kit";
import { Prose } from "@/components/site/Prose";
import { AnalyticsOptOut } from "@/components/site/AnalyticsOptOut";
import { AUTHOR, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${SITE_NAME} handles your data on this site, in the desktop app, and in the hosted service: what is collected, where it is stored, and how to get it deleted.`,
  alternates: { canonical: "/privacy" },
};

const POLICY = `
This policy covers two things: **this website** (cerealmilk.sh) and **the ${SITE_NAME}
product** (the Mac app and the hosted service it syncs to). Both are run by
${SITE_NAME}. Questions and requests go straight to the founder:
**${AUTHOR.email}**.

## This website

This site is a marketing and documentation site. We collect the minimum needed
to understand how it is used and to make it better.

### What we collect, and when

Analytics runs by default so we can see how the site is used. If you would
rather not be counted, use the opt-out button at the bottom of this page: the
choice is remembered in your browser and no further data is sent.

We use:

- **Product analytics (PostHog, US region).** Page views, referrers, the pages
  you visit, approximate location (country/region, derived from your IP. We do
  not store the full IP), device and browser type, and clicks on key elements.
  This tells us which content and channels bring the right people, and where
  people get stuck.
- **Session replays (PostHog).** A reconstruction of on-page interactions
  (clicks, scrolls, navigation) so we can see where the experience is confusing.
  **All form inputs and text you type are masked** and never captured. Replays
  are not linked to your name or email.
- **Performance metrics (Vercel Speed Insights).** Anonymous, aggregated page-load
  and Core Web Vitals measurements. No cookies, no personal data.

### Cookies

PostHog sets first-party cookies (and uses local storage) to
recognise a returning browser across a session, so a visit is not double-counted.
These are analytics cookies only. There is no advertising, and we do not sell or
share your data with advertisers.

### Forms you fill in

When you send a brief via the contact form, book a demo, or join the Field
Notes newsletter, we use the details you provide (name, email, and your
message) solely to reply to you and, if you opt in, to send the newsletter.
Email is sent through Resend, our email provider. That is separate from the
analytics above and is unaffected by the analytics opt-out. You can
unsubscribe from any email at any time.

### Data we route first-party

Analytics requests are served through this domain (a \`/ingest\` path that
forwards to PostHog's US cloud) rather than a third-party domain. This is a
reliability measure so the data is not silently dropped by network filters; it
does not change what is collected or who processes it.

## The Cereal Milk product

The ${SITE_NAME} desktop app puts your WhatsApp in one fast window with an
AI agent beside every chat, running on the model account you connect. Because
the product's whole job is handling your conversations, here is exactly what
that means for your data.

### What the app reads, and when

The app reads only the single conversation you are actively viewing, and only
when you act: when you ask the agent, export a thread, or use a snippet. It
does not crawl your accounts or read chats in the background. Conversation
content stays on your machine. When you ask the agent about a chat, that
content goes to the model provider you connected (Claude, ChatGPT, Gemini, or
your own OpenAI-compatible endpoint) under your agreement with that provider,
and nowhere else: ${SITE_NAME} runs no model and stores no conversations.

### What the hosted service stores

The hosted service stores your account only:

- **Account data**: your sign-in identity (email, name, and Google account
  linkage if you use it) and session state.

Conversation content, contact details, and credentials for your channels are
never sent to or stored by ${SITE_NAME}'s servers.

The app never sees or stores your WhatsApp, LinkedIn, or Google passwords: you
sign in to each service directly, inside its own web interface.

### Product telemetry

The app sends usage telemetry (feature usage, errors, performance) to PostHog
under a **pseudonymous per-workspace identifier**, not your name or email.
Telemetry never includes message content or contact details. We also keep a
first-party copy of the same events for our own dashboards.

### Where it is stored

The hosted service runs on **Fly.io** in Frankfurt, Germany (EU), with the
database on **Supabase** (Postgres). Website hosting is **Vercel**. Sign-in
run your own model credentials; nothing is processed through our servers,
and card details would be held by the payment processor, never by us. Product
and site analytics are **PostHog** (US region). Transactional and lifecycle
email is **Resend**.

### Subprocessors

The third parties that process data on our behalf:

- **Fly.io**, sign-in service hosting (US region)
- **Vercel**, website hosting
- **Upstash**, newsletter/drip state storage (Redis)
- **PostHog**, website analytics (US region, opt-out on this page)
- **Resend**, email delivery

**Your model provider** is a different case: the AI agent runs on the Claude,
ChatGPT, Gemini, or OpenAI-compatible account you connect, so what you ask it
to read is governed by your agreement with that provider, not by this policy.

### Retention and deletion

Your conversations are not stored by ${SITE_NAME}, so there is nothing of
them to retain. Account data is kept while your account exists. Delete
requests are honoured in full: email **${AUTHOR.email}** and we delete your
sign-in identity and session data. Anything you exported lives on your own
machine and is yours.

### Your rights (GDPR)

Wherever you are, and specifically under the GDPR if you are in the EU/EEA or
UK, you can ask us:

- **what we hold** about you (access),
- for **a copy** of it (portability),
- to **correct** it,
- to **delete** it,
- to **restrict or object** to how it is used, and
- to **opt out of site analytics** at any time (the button below).

Email **${AUTHOR.email}**; requests go straight to the founder. If you believe
we have not handled your data properly, you also have the right to complain to
your local data-protection authority.

## Changes

If this policy changes materially, we will update this page.
`;

export default function Page() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
        <SectionHeading
          as="h1"
          kicker="Legal"
          title="Privacy policy"
          lede="What this site and the Cereal Milk product collect, where it is stored, who processes it, and how to get it deleted."
        />
        <div className="mt-10">
          <Prose source={POLICY} />
        </div>
        <div className="mt-10 border-t border-edge pt-8">
          <AnalyticsOptOut />
        </div>
      </article>
    </SiteShell>
  );
}
