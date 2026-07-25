"use client";

// The plan CTA on /get. When Clerk is configured it opens Clerk's in-app
// checkout window (the hosted payment drawer) for the chosen billing period;
// with no Clerk key it inertly no-ops, matching the rollout-safe pattern used
// across the site (see GetStarted.tsx / layout).
//
// 80x is a single plan (CLERK_PLAN_ID) with a monthly and a yearly price, so the
// only thing that varies between the two cards is `planPeriod`.

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { CLERK_PLAN_SLUG, CHECKOUT_SUCCESS_URL } from "@/lib/site";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Clerk's checkout takes a plan id (`cplan_…`), but we only configure the plan's
// slug. Resolve it once and cache, so both cards share a single lookup.
let planIdPromise: Promise<string> | null = null;
function resolvePlanId(clerk: ReturnType<typeof useClerk>): Promise<string> {
  planIdPromise ??= clerk.billing.getPlans().then(({ data }) => {
    const plan = data.find((p) => p.slug === CLERK_PLAN_SLUG);
    if (!plan) throw new Error(`No Clerk plan with slug "${CLERK_PLAN_SLUG}"`);
    return plan.id;
  });
  return planIdPromise;
}

type Props = {
  /** 'month' → monthly card, 'annual' → yearly card. */
  planPeriod: "month" | "annual";
  className: string;
  children: React.ReactNode;
};

export function PlanCheckoutButton(props: Props) {
  // Branch on a build-time constant so the hooks rule is never violated:
  // exactly one of these components is ever mounted.
  return HAS_CLERK ? <ClerkCheckout {...props} /> : <FallbackLink {...props} />;
}

function ClerkCheckout({ planPeriod, className, children }: Props) {
  const clerk = useClerk();
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    try {
      const planId = await resolvePlanId(clerk);
      clerk.__internal_openCheckout({
        planId,
        planPeriod,
        newSubscriptionRedirectUrl: CHECKOUT_SUCCESS_URL,
        onClose: () => setBusy(false),
      });
    } catch {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={open} disabled={busy} className={className}>
      {children}
    </button>
  );
}

function FallbackLink({ className, children }: Props) {
  return (
    <a href="#" className={className}>
      {children}
    </a>
  );
}
