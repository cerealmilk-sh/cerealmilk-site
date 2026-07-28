import Link from "next/link";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { breadcrumbNode, faqNode, graph } from "@/lib/jsonld";
import { BRANDSCRIPT } from "@/content/brandscript";
import { FOUNDING, PLANS } from "@/lib/pricing";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { DotField } from "@/components/site/DotField";
import { PreorderForm } from "@/components/landing/PreorderForm";
import {
  Crosshair,
  FeatureCell,
  FeatureGrid,
  SectionHeading,
} from "@/components/site/vercel-kit";

// /preorder, the founding offer page. The direct CTA of the SB7 home page
// lands here; the page's one job is to turn intent into a reservation. The
// narrative (pre-order plan, agreement) renders from src/content/brandscript.ts
// and every price from src/lib/pricing.ts. Reservation mode: no card, no
// charge, no payment code; the waitlist form below is the capture point. Copy mirror: src/content/preorder.md, keep in sync.

const entry = pageByPath("/preorder")!;
export const metadata = pageMetadata(entry);

const QUIET_LINK =
  "font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint";

const PREORDER_FAQ: { q: string; a: string; aNode?: React.ReactNode }[] = [
  {
    q: "What exactly am I reserving?",
    a: "A founding seat: first access when your wave opens, your install set up personally on a call with the founder, and your pricing locked at today's published rate for as long as you keep the seat.",
  },
  {
    q: "Will I be charged today?",
    a: "No. There is no card field on this page. You pay nothing until your seat is set up and you have decided to keep it; billing starts on the plan you locked, and the free trial still applies first.",
  },
  {
    q: "Is Cereal Milk live yet?",
    a: "Yes, in waves. The app ships today to funds being onboarded personally. Pre-ordering puts you in the founding cohort so your wave opens sooner, not on a someday list.",
  },
  {
    q: "What if I change my mind?",
    a: "Reply to any email from us and the reservation is gone. No charge was made, so there is nothing to refund and nothing to cancel beyond the seat itself.",
  },
  {
    q: "I'm not on a Mac.",
    a: "Cereal Milk is Mac-first today and a Windows client is in development. Reserve with your work email and note Windows on the setup call, and your seat waits for the Windows build.",
    aNode: (
      <>
        Cereal Milk is Mac-first today and a Windows client is in development. Reserve
        with your work email and{" "}
        <Link href="/contact" className={QUIET_LINK}>
          tell us you&apos;re on Windows
        </Link>
        , and your seat waits for the Windows build.
      </>
    ),
  },
  {
    q: "What happens to my data?",
    a: "The same rules as every Cereal Milk install: every thread starts private, the sharing gate is enforced on the server, and your Repository lives on your Mac and exports in one click. Reserving stores only your name, email, and chosen plan.",
    aNode: (
      <>
        The same rules as every Cereal Milk install: every thread starts private, the
        sharing gate is{" "}
        <Link href="/security" className={QUIET_LINK}>
          enforced on the server
        </Link>
        , and your Repository lives on your Mac and exports in one click.
        Reserving stores only your name, email, and chosen plan.
      </>
    ),
  },
];

export default function Page() {
  return (
    <SiteShell>
      <JsonLd
        data={graph(
          breadcrumbNode("/preorder", [
            { name: "Pre-order Cereal Milk", path: "/preorder" },
          ]),
          faqNode("/preorder", PREORDER_FAQ)
        )}
      />

      {/* 1 · The offer, stated whole above the fold: what you get, what it
          costs today (nothing), and the true scarcity. */}
      <section className="relative isolate overflow-hidden">
        <DotField />
        <div className="relative z-10 mx-auto max-w-[1080px] px-6 pb-14 pt-16 sm:pt-24">
          <SectionHeading
            as="h1"
            kicker="The founding offer"
            title="Reserve your founding seat"
            lede="Cereal Milk rolls out in waves, and every install is set up personally with the founder. Reserving takes two minutes and no card: you lock today's published pricing, and you get first access when your wave opens."
          />
          <p className="mt-8 max-w-[54ch] text-[15px] leading-relaxed text-ink-dim">
            Built by the team that ran deal-ops engineering for{" "}
            <span className="font-medium text-ink">
              68 venture funds and firms
            </span>
            , from first-time managers to long-established multi-stage firms.
          </p>
          <p className="mt-4 font-mono text-[13px] text-ink-faint">
            {FOUNDING.seatCap} founding seats · no card at reservation · cancel
            anytime before setup
          </p>
        </div>
      </section>

      {/* 2 · The pre-order plan: three steps, so the path feels obvious. */}
      <section aria-labelledby="plan" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="How reserving works"
            title={<span id="plan">Three steps, two minutes</span>}
          />
          <FeatureGrid cols={3} crosshairs className="mt-12">
            {BRANDSCRIPT.plan.preorder.map((s, i) => (
              <div key={s.title} className="flex h-full flex-col bg-bg p-8 lg:p-10">
                <p className="font-mono text-[13px] text-ink-faint">
                  0{i + 1}
                </p>
                <h3 className="mt-4 text-[18px] leading-[1.25] text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-dim">
                  {s.body}
                </p>
              </div>
            ))}
          </FeatureGrid>
        </div>
      </section>

      {/* 3 · What you lock: the plans, from the single pricing source. */}
      <section aria-labelledby="lock" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="What you lock"
            title={<span id="lock">Today&apos;s pricing, held for you</span>}
            lede={FOUNDING.lockLine}
          />
          <div className="mt-12 grid gap-px border border-edge bg-edge sm:grid-cols-2">
            {PLANS.map((p) => (
              <div key={p.id} className="flex h-full flex-col bg-bg p-8 lg:p-10">
                <p className="font-mono text-[13px] text-ink-faint">{p.name}</p>
                <p className="x-display mt-3 text-[32px] leading-none text-ink">
                  ${p.monthly}
                  <span className="text-[15px] text-ink-dim"> /user/mo</span>
                </p>
                <p className="mt-2 text-[13px] text-ink-faint">
                  or ${p.yearly}/user/yr
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">
                  {p.audience}
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.includes.map((line) => (
                    <li
                      key={line}
                      className="text-[14px] leading-relaxed text-ink-dim"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[14px] leading-relaxed text-ink-dim">
            The same numbers as the{" "}
            <Link href="/pricing" className={QUIET_LINK}>
              pricing page
            </Link>
            , because there is only one price list. Free to try after your
            setup call either way.
          </p>
        </div>
      </section>

      {/* 4 · The agreement: risk reversal, right before the ask. */}
      <section aria-labelledby="agreement" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="The agreement"
            title={<span id="agreement">What we promise a founding seat</span>}
          />
          <FeatureGrid cols={3} className="mt-12">
            {BRANDSCRIPT.plan.agreement.map((a) => (
              <FeatureCell key={a} title={a.split(":")[0]}>
                {a.split(":").slice(1).join(":").trim()}
              </FeatureCell>
            ))}
          </FeatureGrid>
        </div>
      </section>

      {/* 5 · The reservation form: the ask itself. */}
      <section aria-labelledby="reserve" className="border-t border-edge">
        <div className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="Reserve"
            title={<span id="reserve">Two minutes, no card</span>}
            lede="Your reservation goes straight to the founder. You get a confirmation email now and a personal email when your wave opens."
          />
          <div className="relative mt-10 border border-edge bg-bg p-6 sm:p-8">
            <Crosshair position="tl" />
            <Crosshair position="br" />
            <PreorderForm />
          </div>
          <p className="mt-8 text-[14px] leading-relaxed text-ink-dim">
            Not ready to reserve?{" "}
            <Link href="/demo?src=preorder" className={QUIET_LINK}>
              Book a demo
            </Link>{" "}
            and see it on your own pipeline first.
          </p>
        </div>
      </section>

      {/* 6 · Objection killers. */}
      <section aria-labelledby="faq" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeading
                kicker="FAQ"
                title={<span id="faq">Before you reserve</span>}
              />
              <p className="mt-8 text-[14px] text-ink-dim">
                Something else on your mind?{" "}
                <Link href="/demo?src=preorder-faq" className={QUIET_LINK}>
                  Ask it on a demo
                </Link>
                .
              </p>
            </div>
            <div className="border-t border-edge">
              {PREORDER_FAQ.map((f, i) => (
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
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
