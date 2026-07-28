// /privacy, the privacy policy for BOTH surfaces: this website (analytics,
// cookies, forms) and the Cereal Milk product (the Mac app plus the hosted service it
// syncs to). Plain, honest, and structured; written as disclosure, not as
// reviewed-by-counsel boilerplate. Linked from the consent banner
// (public/consent-analytics.js), the footer, and the /terms "Your data"
// section. Kept as a self-contained page (not registry-driven) so it stays
// independent of the marketing surface.

import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/vercel-kit";
import { Prose } from "@/components/site/Prose";
import { ConsentReset } from "@/components/site/ConsentReset";
import { AUTHOR, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${SITE_NAME} handles your data on this site, in the desktop app, and in the hosted service: what is collected, where it is stored, and how to get it deleted.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    images: [{ url: "/og/privacy.png", width: 1200, height: 630 }],
  },
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

Nothing analytics-related loads until you choose **Accept** on the consent
banner. If you **Decline** (or ignore the banner), no analytics scripts run, no
cookies are set, and no data is sent.

If you accept, we use:

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

With your consent, PostHog sets first-party cookies (and uses local storage) to
recognise a returning browser across a session, so a visit is not double-counted.
These are analytics cookies only. There is no advertising, and we do not sell or
share your data with advertisers.

### Forms you fill in

When you send a brief via the contact form, book a demo, or join the Field
Notes newsletter, we use the details you provide (name, email, and your
message) solely to reply to you and, if you opt in, to send the newsletter.
Email is sent through Resend, our email provider. That is separate from the
analytics above and happens whether or not you accept analytics. You can
unsubscribe from any email at any time.

### Data we route first-party

Analytics requests are served through this domain (a \`/ingest\` path that
forwards to PostHog's US cloud) rather than a third-party domain. This is a
reliability measure so the data is not silently dropped by network filters; it
does not change what is collected or who processes it.

## The Cereal Milk product

The ${SITE_NAME} Mac app puts your WhatsApp, LinkedIn, and Gmail in one window
and syncs the conversations you choose to your CRM (Attio or Affinity) through
the ${SITE_NAME} hosted service. Because the product's whole job is handling
your conversations, here is exactly what that means for your data.

### What the app reads, and when

The app reads only the single conversation you are actively viewing, and only
when you act: when you sync it, or when you have turned on auto-sync for that
specific conversation. It does not crawl your accounts or read chats in the
background. Nothing leaves your Mac until you choose to sync it; the privacy
gate that decides what may sync is enforced on our server, not just in the app.

### What the hosted service stores

When you choose to sync a conversation, the hosted service stores:

- **Message content** of the conversations you synced, including attachments
  and media in those conversations.
- **Contact details** of the people in those conversations (names, phone
  numbers, email addresses, profile links), so messages can be matched to the
  right CRM record.
- **Your CRM credentials**, the per-workspace API keys you connect for Attio
  or Affinity, stored to write synced notes into your CRM on your behalf.
- **Account and workspace data**: your sign-in identity, workspace membership,
  and subscription state.

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

- **Fly.io**, application hosting (Frankfurt, EU)
- **Supabase**, database hosting (Postgres)
- **Vercel**, website hosting
- **PostHog**, analytics and telemetry (US region)
- **Resend**, email delivery

**Attio and Affinity** are a different case: they are your CRM, connected by
you. Conversations you sync are written into your own CRM workspace and are
governed there by your agreement with that CRM, not by this policy.

### Retention and deletion

Synced content stays in the hosted service for as long as your workspace is
active, so your CRM history keeps working. Delete requests are honoured in
full: email **${AUTHOR.email}** and we delete your workspace's stored
conversations, contacts, credentials, and account data. Note that notes already
written into your Attio or Affinity workspace live in your CRM and are yours to
keep or delete there.

### Your rights (GDPR)

Wherever you are, and specifically under the GDPR if you are in the EU/EEA or
UK, you can ask us:

- **what we hold** about you (access),
- for **a copy** of it (portability),
- to **correct** it,
- to **delete** it,
- to **restrict or object** to how it is used, and
- to **withdraw consent** at any time where consent is the basis (site
  analytics; withdraw with the button below).

Email **${AUTHOR.email}**; requests go straight to the founder. If you believe
we have not handled your data properly, you also have the right to complain to
your local data-protection authority.

## Changes

If this policy changes materially, we will update this page and, for site
analytics, the consent banner will ask again.
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
          <ConsentReset />
        </div>
      </article>
    </SiteShell>
  );
}
