import type { Metadata } from "next";
import { AccountClient } from "@/components/landing/Account";

// The returning-customer account page. Reached from the nav "Log in" button once
// authenticated (the shared sign-in modal lands here). 80x is a native Mac app
// now, no web messenger to sign into, so this is where you manage your plan,
// get the app, and find your license key. Not indexed: it's a logged-in
// surface, not marketing.
export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your 80x plan, download the app, and find your license key.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountClient />;
}
