// /terms, the terms of service for the 80x desktop application and this site.
// Plain, honest, and short, matching /privacy. The account-and-platform-risk
// section (how the app accesses WhatsApp, LinkedIn and Gmail, and what that
// means for the user's accounts) is the load-bearing part: the disclosure lives
// here by design rather than as an in-app banner. Linked from the sign-in modal
// (GetStarted.tsx) and the footer. Self-contained, not registry-driven, so it
// stays independent of the marketing surface.

import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/vercel-kit";
import { Prose } from "@/components/site/Prose";
import { AUTHOR, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The terms that govern the ${SITE_NAME} desktop application, this site, and the ${SITE_NAME} hosted service.`,
  alternates: { canonical: "/terms" },
};

const TERMS = `
These terms govern the ${SITE_NAME} desktop application (the "App"), this
website, and the ${SITE_NAME} hosted service that the App connects to (together,
"${SITE_NAME}", "we", "us"). By installing or using the App you agree to them. If
you do not agree, do not use the App.

## What the App is, and is not

The App is a native client that lets you use your own WhatsApp, LinkedIn, and
Gmail accounts in one window and bring the relationships in them into a CRM. It
runs each service's own web interface inside the App.

${SITE_NAME} is an independent product. It is **not affiliated with, endorsed by,
sponsored by, or operated by** WhatsApp or Meta, LinkedIn or Microsoft, or
Google. All product names, logos, and trademarks belong to their respective
owners and are used only to describe what the App connects to.

## Your accounts and your credentials

You sign in to WhatsApp, LinkedIn, and Gmail yourself, through each service's own
login. **${SITE_NAME} never sees or stores your passwords.** You may only connect
accounts you own or are authorised to use, and you remain responsible for
complying with each service's own terms of service. Your relationship with those
services is between you and them.

## Unofficial access, and the risk to your accounts

The App reaches those services through their own web interfaces rather than
through official APIs. **This is an unofficial method of access, and it may be
inconsistent with the terms of service of WhatsApp, LinkedIn, or Google.** In
some cases a service could choose to limit, restrict, or suspend an account that
uses tools like this.

By using the App you understand and accept that risk. **${SITE_NAME} is not
responsible for any action a third-party service takes against your account,**
including limitation, suspension, or loss of access or data, and we cannot
guarantee that any service will keep working with the App.

## How the App interacts with those services

The App is deliberately conservative about what it reads and does:

- It reads only the **single conversation you are actively viewing**, from what
  is rendered on your screen, and only when you ask it to sync, or, if you turn
  on auto-sync, to keep that same open conversation current.
- It does **not** crawl, bulk-export, or read accounts, inboxes, profiles, or
  messages you are not looking at.
- It **never sends messages on your behalf.** Any draft it helps prepare is
  placed in the composer for you to review and send yourself.

## Your data

To provide the CRM features, conversation content you choose to sync is
transmitted to and processed by the ${SITE_NAME} hosted service. How we handle
that data, and how to request a copy or deletion, is described in the
[Privacy Policy](/privacy). Do not use the App to sync content you are not
entitled to store or share.

## Acceptable use

Use the App only for your own legitimate relationship management, with accounts
you are entitled to use. Do not use it to send spam or unsolicited bulk
messages, to harass anyone, to scrape or harvest data at scale, or to break the
law or infringe anyone's rights. We may suspend access that does any of these.

## Subscription and billing

Paid features require a subscription, billed through our payment provider on the
plan and interval you choose. You can cancel at any time; cancellation stops
future renewals and takes effect at the end of the current period. Except where
required by law, payments already made are non-refundable.

## No warranty

The App is provided "as is" and "as available", without warranties of any kind.
Because it depends on third-party services we do not control, those services can
change or block how the App works at any time, and features may break without
notice. We do not warrant that the App will be uninterrupted, error-free, or
available at any given time.

## Limitation of liability

To the fullest extent permitted by law, ${SITE_NAME} is not liable for any
indirect, incidental, or consequential loss, for any action a third-party
service takes against your account, or for loss of data. Our total liability for
any claim relating to the App is limited to the fees you paid us in the twelve
months before the claim.

## Changes

We may update these terms as the product changes. If a change is material, we
will make the updated terms available here before it takes effect. Continuing to
use the App after that means you accept the update.

## Contact

Questions about these terms go straight to the founder: **${AUTHOR.email}**.
`;

export default function Page() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
        <SectionHeading
          as="h1"
          kicker="Legal"
          title="Terms of service"
          lede="What the app is, how it reaches your accounts, and what that means for you."
        />
        <div className="mt-10">
          <Prose source={TERMS} />
        </div>
      </article>
    </SiteShell>
  );
}
