import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { MarkTile } from "@/components/ui";
import { PLANS, type Plan } from "@/lib/pricing";
import { PlanCheckoutButton } from "@/components/landing/PlanCheckoutButton";

// The post-sign-in payment page (dormant: next.config.ts redirects /get to
// /download until self-serve billing turns on). Reached from the "Get 80x"
// sign-in modal once the user has an account: a full-screen, centered
// checkout. Plans and prices render from src/lib/pricing.ts, the single
// source of truth, so this page can never drift from /pricing.
//
// NOTE for the self-serve go-live: PlanCheckoutButton still speaks the old
// single-plan Clerk model (one slug, month/annual periods). Before this page
// goes live it must be wired to the per-plan Clerk slugs (starter/business).
export const metadata: Metadata = {
  title: "Get 80x",
  description: "Choose your 80x plan and check out.",
  alternates: { canonical: "/get" },
  robots: { index: false, follow: false },
};

const BTN_BASE =
  "inline-flex h-11 w-full items-center justify-center rounded-lg text-[14px] font-semibold transition-colors";

function PlanCard({
  plan,
  selected,
  anySelected,
}: {
  plan: Plan;
  selected?: boolean;
  anySelected?: boolean;
}) {
  // An explicit ?plan= choice (from /pricing's "Get Starter/Business" CTAs)
  // wins over the default "most popular" emphasis; with no choice, fall back
  // to the popular plan as before.
  const highlight = anySelected ? !!selected : !!plan.popular;
  const badge = selected ? "Selected" : !anySelected && plan.popular ? "Most popular" : null;
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border bg-panel p-7 text-left shadow-card ${
        highlight ? "border-accent ring-1 ring-accent/30" : "border-edge"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-ink">{plan.name}</span>
        {badge && (
          <span className="rounded-full bg-accent/12 px-2 py-[2px] text-[11px] font-semibold text-accent">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.02em] text-ink">
          ${plan.monthly}
        </span>
        <span className="text-[15px] text-ink-faint">/month</span>
      </div>
      <p className="mt-2 text-[13px] text-ink-dim">
        or ${plan.yearly} a year · per user
      </p>
      <p className="mt-3 text-[13px] text-ink-dim">{plan.audience}</p>
      <PlanCheckoutButton
        planPeriod="month"
        className={`${BTN_BASE} mt-6 ${
          highlight ? "bg-accent text-white hover:bg-accent-dim" : "border border-edge-2 bg-panel text-ink hover:bg-panel-2"
        }`}
      >
        {plan.cta.label}
      </PlanCheckoutButton>
      <ul className="mt-6 flex-1 space-y-2.5 border-t border-edge pt-6">
        {plan.includes.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink-dim">
            <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function GetPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  // ?plan=starter|business carries the plan the user picked on /pricing;
  // preselect (highlight) that card instead of the default popular one.
  // Mirrors the live /preorder form's ?plan handling (PreorderForm.tsx).
  const { plan: planParam } = await searchParams;
  const selectedId =
    planParam === "starter" || planParam === "business" ? planParam : null;
  return (
    <div className="bcl-scroll flex min-h-dvh flex-col bg-bg text-ink">
      <header className="flex h-14 items-center px-6">
        <Link href="/" className="flex items-center gap-2 select-none" aria-label="80x · home">
          <MarkTile size={26} />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">80x</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[44rem] text-center">
          <div className="text-[11px] font-semibold tracking-[0.02em] text-ink-faint">Pricing</div>
          <h1 className="mt-3 text-[clamp(1.8rem,3.4vw,2.4rem)] font-semibold leading-[1.12] tracking-[-0.015em] text-ink">
            Two plans. Pick one.
          </h1>
          <p className="mx-auto mt-4 max-w-[40rem] text-[16px] leading-relaxed text-ink-dim">
            Per user, monthly or yearly, no usage meters. Cancel anytime.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedId === plan.id}
                anySelected={selectedId !== null}
              />
            ))}
          </div>

          <p className="mt-6 text-[12.5px] text-ink-faint">
            Prices in USD · cancel monthly plans any month.
          </p>
        </div>
      </main>
    </div>
  );
}
