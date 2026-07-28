import Link from "next/link";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { breadcrumbNode, faqNode, graph } from "@/lib/jsonld";
import { cx } from "@/components/ui/cx";
import { BOOK_PATH } from "@/lib/site";
import { BUSINESS, PLANS, STARTER, TRIAL_DAYS } from "@/lib/pricing";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { Terminus } from "@/components/site/Terminus";
import { PillButton, SectionHeading } from "@/components/site/vercel-kit";

// /pricing: two plans, one button each, nothing to decipher (see
// BILLING-MODEL.md in product-backend). No toggle, no calculator, no
// comparison matrix: the page is a decision between Starter and Business,
// and everything else is one line of fine print. Fully server-rendered, no
// JS required. Numbers live in src/lib/pricing.ts only; body of record
// mirrored in src/content/pricing.md.

const entry = pageByPath("/pricing")!;
export const metadata = pageMetadata(entry);

const KICKER = "font-mono text-[13px] text-ink-faint";
const QUIET_LINK =
  "font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint";

const PRICING_FAQ: { q: string; a: string; aNode?: React.ReactNode }[] = [
  {
    q: "Can I see it first?",
    a: "Yes. Book a demo for 30 minutes on a screen-share with the founder, on your own pipeline, before you buy. Plans are monthly and cancel any month, so there is no lock-in either way.",
    aNode: (
      <>
        Yes.{" "}
        <Link href="/demo" className={QUIET_LINK}>
          Book a demo
        </Link>{" "}
        for 30 minutes on a screen-share with the founder, on your own
        pipeline, before you buy. Plans are monthly and cancel any month, so
        there is no lock-in either way.
      </>
    ),
  },
  {
    q: "Is there a free trial?",
    a: `Yes, and it needs no card. Download the app and create your account: the ${TRIAL_DAYS}-day free trial of the full product starts right there, on your own accounts. When it ends, nothing is charged until you pick a plan inside the app: Starter at $${STARTER.monthly} a month or Business at $${BUSINESS.monthly} per user.`,
  },
  {
    q: "What is the difference between Starter and Business?",
    a: "Starter is for one person. Business is for a team: everyone shares one CRM of record, team privacy controls are enforced server-side, and billing is per seat, so inviting a teammate just adds a seat. Checkout creates your team; guided setup and CRM mapping on a call are included.",
  },
  {
    q: "Monthly or yearly?",
    a: `Either. Starter is $${STARTER.monthly} a month or $${STARTER.yearly} a year; Business is $${BUSINESS.monthly} a month or $${BUSINESS.yearly} a year. Yearly is about two months free, and monthly cancels any month.`,
  },
  {
    q: "Any usage fees?",
    a: "No. No per-contact fees, no per-message fees, no AI surcharges, and no WhatsApp platform fees, because the app runs on your own accounts.",
  },
];

export default function Page() {
  return (
    <SiteShell>
      <JsonLd
        data={graph(
          breadcrumbNode("/pricing", [{ name: "Pricing", path: "/pricing" }]),
          faqNode("/pricing", PRICING_FAQ)
        )}
      />
      <div className="mx-auto max-w-[880px] px-6 py-16 sm:py-24">
        <SectionHeading
          as="h1"
          kicker="Pricing"
          title="Two plans. Pick one."
          lede={`Per user, monthly or yearly, no usage meters. Every plan starts with a ${TRIAL_DAYS}-day free trial: download, sign in, and it's running. No card.`}
        />

        {/* The two plans */}
        <div className="mt-12 grid gap-px border border-edge bg-edge sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cx(
                "relative flex flex-col bg-bg p-8 lg:p-10",
                plan.popular && "outline outline-2 -outline-offset-2 outline-accent"
              )}
            >
              {plan.popular && (
                <span className="absolute right-4 top-4 rounded bg-accent px-1.5 py-0.5 font-mono text-[11px] leading-none text-accent-ink">
                  Most popular
                </span>
              )}
              <p className={KICKER}>{plan.name}</p>
              <p className="x-display mt-4 text-[40px] leading-none text-ink">
                ${plan.monthly}
                <span className="text-[16px] text-ink-dim">/month</span>
              </p>
              <p className="mt-2 font-mono text-[12px] text-ink-faint">
                or ${plan.yearly} a year · per user
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-dim">{plan.audience}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.includes.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-dim">
                    <span aria-hidden className="mt-[2px] text-ink-faint">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PillButton
                  href={plan.cta.href}
                  size="lg"
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full justify-center"
                  data-track="buy_cta_clicked"
                  data-track-props={JSON.stringify({ src: "pricing", plan: plan.id })}
                >
                  {plan.cta.label}
                </PillButton>
              </div>
            </div>
          ))}
        </div>

        {/* Fine print: everything else, two lines */}
        <ul className="mt-6 space-y-1.5 text-[13.5px] leading-relaxed text-ink-dim">
          <li>
            Every plan starts with a {TRIAL_DAYS}-day free trial, no card: it
            begins when you create your account in the app, and nothing is
            charged until you choose a plan. Monthly plans cancel any month.
          </li>
          <li>
            Rolling out a whole team?{" "}
            <Link
              href={`${BOOK_PATH}?src=pricing-rollout`}
              className={QUIET_LINK}
              data-track="demo_cta_clicked"
              data-track-props='{"src":"pricing-rollout"}'
            >
              Book a demo
            </Link>{" "}
            and we will set it up with you.
          </li>
        </ul>

        {/* FAQ */}
        <section aria-labelledby="pricing-faq" className="mt-20">
          <SectionHeading
            kicker="FAQ"
            title={<span id="pricing-faq">Fair questions</span>}
          />
          <div className="mt-10 border-t border-edge">
            {PRICING_FAQ.map((f, i) => (
              <div key={f.q} className="border-b border-edge py-6">
                <h3 className="flex gap-3 text-[16px] text-ink">
                  <span className="font-mono text-[13px] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{f.q}</span>
                </h3>
                <p className="mt-2 pl-8 text-[14.5px] leading-relaxed text-ink-dim">
                  {f.aNode ?? f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Terminus source="pricing" path="/pricing" />
      </div>
    </SiteShell>
  );
}
