"use client";

// /onboard, the entry point from the welcome email's "Claim your seat" link.
// It kicks off the Clerk pre-order flow on load: a signed-in visitor goes
// straight to /get (checkout); everyone else gets the sign-in modal, which
// lands them on /get once authenticated. A branded "setting up…" screen sits
// behind it so the page never looks blank.
//
// Branch on the build-time HAS_CLERK constant (mirrors GetStarted /
// PlanCheckoutButton) so the Clerk `useAuth` hook only ever runs when a
// ClerkProvider is present; with no key it just forwards to /get.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { MarkTile } from "@/components/ui";
import { GetStartedProvider, useGetStarted } from "@/components/landing/GetStarted";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const ONBOARD_OPTS = {
  redirectTo: "/get",
  title: "Get onboarded now",
  subtitle: "Create your account to pay for your first year and start onboarding today.",
};

export function OnboardFlow() {
  return (
    <GetStartedProvider>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-ink">
        <MarkTile size={40} />
        <div className="flex items-center gap-2 text-[14px] text-ink-dim">
          <Loader2 size={16} className="animate-spin text-accent" />
          Setting up your onboarding…
        </div>
        {HAS_CLERK ? <ClerkLauncher /> : <FallbackLauncher />}
      </main>
    </GetStartedProvider>
  );
}

// With Clerk on: signed-in → checkout; otherwise open the sign-in modal.
function ClerkLauncher() {
  const router = useRouter();
  const { open } = useGetStarted();
  const { isLoaded, isSignedIn } = useAuth();
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) router.replace("/get");
    else open(ONBOARD_OPTS);
  }, [isLoaded, isSignedIn, open, router]);
  return null;
}

// No Clerk configured → just forward to the checkout page.
function FallbackLauncher() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/get");
  }, [router]);
  return null;
}
