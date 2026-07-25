"use client";

// The signed-in account surface. 80x is a native Mac app now. There is no web
// messenger to sign into, so this replaces the old app.80x.ai login. Returning
// customers reach it from the nav "Log in" button (the shared sign-in modal,
// told to land on /account). Here they manage their subscription (Clerk's
// billing portal), get the app, and find their license key.
//
// ROLLOUT-SAFE, matching the rest of the site (see GetStarted.tsx / layout.tsx):
// with no Clerk publishable key the page degrades to a download-and-install
// surface, since there is no auth/billing to show yet. The HAS_CLERK branch is a
// build-time constant, so the Clerk hooks/components are only ever mounted when a
// <ClerkProvider> exists.

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Copy, LogOut } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { MarkTile, cx } from "@/components/ui";
import { GetStartedProvider, useGetStarted } from "@/components/landing/GetStarted";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AccountClient() {
  // Build-time branch: with Clerk, gate on auth; without it, just the basics.
  if (!HAS_CLERK) {
    return (
      <Shell>
        <NoAuthPanel />
      </Shell>
    );
  }
  // GetStartedProvider mounts the shared sign-in modal so the signed-out state
  // here can open it (and land back on /account once authenticated).
  return (
    <GetStartedProvider>
      <Shell>
        <ClerkGate />
      </Shell>
    </GetStartedProvider>
  );
}

// Auth gate via useUser (this Clerk version doesn't export the SignedIn/SignedOut
// control components). Until Clerk has loaded we render nothing, the session is
// resolved client-side, so a flash of the wrong state would be misleading.
function ClerkGate() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  return isSignedIn ? <Dashboard /> : <SignInPanel />;
}

/* --------------------------------------------------------------------------
   Page chrome: header + centered column, matching /download and /get.
   -------------------------------------------------------------------------- */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bcl-scroll flex min-h-dvh flex-col bg-bg text-ink">
      <header className="border-b border-edge">
        <div className="mx-auto flex h-14 w-full max-w-[44rem] items-center px-5">
          <Link href="/" className="flex items-center gap-2 select-none" aria-label="80x · home">
            <MarkTile size={26} />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">80x</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[44rem] flex-1 px-5 py-12">{children}</main>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Signed out: a prompt that opens the shared sign-in modal (→ /account).
   -------------------------------------------------------------------------- */
function SignInPanel() {
  const { open } = useGetStarted();
  return (
    <div className="mx-auto max-w-[26rem] py-12 text-center">
      <MarkTile size={48} className="mx-auto" />
      <h1 className="mt-6 text-[24px] font-semibold tracking-[-0.015em]">Sign in to 80x</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">
        Manage your plan, download 80x, and find your license key.
      </p>
      <button
        type="button"
        onClick={() =>
          open({ redirectTo: "/account", title: "Sign in to 80x", subtitle: "Manage your plan and download the app." })
        }
        className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 text-[14px] font-semibold text-white transition-colors hover:bg-accent-dim"
      >
        Sign in
      </button>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Signed in: manage plan · download · license key.
   -------------------------------------------------------------------------- */
function Dashboard() {
  const { user } = useUser();
  const clerk = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;
  const greeting = user?.firstName ?? email ?? "there";
  const licenseKey =
    typeof user?.publicMetadata?.licenseKey === "string" ? user.publicMetadata.licenseKey : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.015em]">Welcome back, {greeting}</h1>
          {email && <p className="mt-1 text-[14px] text-ink-dim">Signed in as {email}</p>}
        </div>
        <button
          type="button"
          onClick={() => clerk.signOut({ redirectUrl: "/" })}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-edge-2 bg-panel px-3 text-[13px] font-medium text-ink-dim shadow-card transition-colors hover:bg-panel-2 hover:text-ink"
        >
          <LogOut size={14} strokeWidth={2.25} />
          Sign out
        </button>
      </div>

      <div className="mt-9 space-y-5">
        <Card title="Your plan" body="Update payment details, switch between monthly and yearly, or cancel anytime.">
          <button
            type="button"
            onClick={() => clerk.openUserProfile()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-[14px] font-semibold text-white transition-colors hover:bg-accent-dim"
          >
            Manage plan &amp; billing
          </button>
        </Card>

        <Card title="Get 80x" body="The native Mac app. Your subscription unlocks WhatsApp & LinkedIn, CRM sync, and insights.">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/demo?src=account"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-[14px] font-semibold text-white transition-colors hover:bg-accent-dim"
            >
              Book a call to get set up
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center gap-1 text-[13.5px] font-medium text-accent hover:underline"
            >
              How getting 80x works
              <ArrowRight size={14} strokeWidth={2.25} />
            </Link>
          </div>
        </Card>

        <Card title="License key" body="Paste this in the app under Settings → License to unlock Pro.">
          {licenseKey ? (
            <LicenseKey value={licenseKey} />
          ) : (
            <p className="text-[13.5px] leading-relaxed text-ink-dim">
              Your license key is emailed right after checkout. Can&apos;t find it? Use{" "}
              <strong className="text-ink">Manage plan &amp; billing</strong> above to check your
              subscription, or reach out and we&apos;ll resend it.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function LicenseKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable, the key is still visible to select manually */
    }
  };
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg border border-edge bg-bg px-3 py-2 font-mono text-[13px] text-ink">
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy license key"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge-2 bg-panel px-3 text-[13px] font-medium text-ink-dim shadow-card transition-colors hover:bg-panel-2 hover:text-ink"
      >
        {copied ? <Check size={14} strokeWidth={2.5} className="text-accent" /> : <Copy size={14} strokeWidth={2.25} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/* --------------------------------------------------------------------------
   No Clerk configured: request-access placeholder (rollout-safe). 80x
   is invite-only, so this never exposes a public download; the build is granted
   to approved customers only.
   -------------------------------------------------------------------------- */
function NoAuthPanel() {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.015em]">Get 80x</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
        80x is invite-only while we onboard new teams in waves. Request access and
        we&apos;ll set you up, the build and your license arrive once you&apos;re approved.
      </p>
      <div className="mt-9 space-y-5">
        <Card title="Request access" body="We're onboarding in waves. Leave your details and we'll reach out the moment a spot opens.">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 h-10 text-[14px] font-semibold text-white transition-colors hover:bg-accent-dim"
          >
            Request access
            <ArrowRight size={14} strokeWidth={2.25} />
          </Link>
        </Card>
        <Card title="License key" body="Paste your key in the app under Settings → License to unlock Pro.">
          <p className="text-[13.5px] leading-relaxed text-ink-dim">
            Your license key is emailed right after checkout.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Shared card shell.
   -------------------------------------------------------------------------- */
function Card({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <section className={cx("rounded-2xl border border-edge bg-panel p-6 shadow-card")}>
      <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">{body}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
