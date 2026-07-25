import type { Metadata } from "next";
import { OnboardFlow } from "@/components/landing/OnboardFlow";

// Reached from the welcome email's "Claim your seat" link. Drives the Clerk
// sign-in → checkout flow on load (see OnboardFlow). Not indexed.
export const metadata: Metadata = {
  title: "Get onboarded",
  description: "Start your 80x onboarding.",
  alternates: { canonical: "/onboard" },
  robots: { index: false, follow: false },
};

export default function OnboardPage() {
  return <OnboardFlow />;
}
