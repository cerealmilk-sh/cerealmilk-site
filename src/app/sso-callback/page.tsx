"use client";

// The OAuth landing spot. Google/Microsoft/Apple redirect back here; Clerk
// finishes establishing the session, then forwards to the destination the modal
// requested via `?after=` (the checkout /get by default, or /account for the nav
// "Log in"). Only same-origin paths are honored, so the param can't be used as
// an open redirect.
//
// The Clerk callback is rendered only on the client, after mount, and only when
// a publishable key is configured, so it never runs during prerender (where
// there is no <ClerkProvider>), keeping the build green with or without keys.
import { useState, useSyncExternalStore } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { MarkTile } from "@/components/ui";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// "Are we hydrated on the client?" without a setState-in-effect: false during
// prerender/SSR, true on the client. (subscribe is a no-op; the value never
// changes after mount.)
const noopSubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export default function SSOCallback() {
  const mounted = useMounted();
  // Resolved once, lazily, from the query string. Only same-origin paths
  // ("/…", not "//host" or "/\…") are honored, never an off-site URL.
  const [after] = useState(() => {
    if (typeof window === "undefined") return "/get";
    const a = new URLSearchParams(window.location.search).get("after");
    return a && /^\/[^/\\]/.test(a) ? a : "/get";
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg text-ink">
      <MarkTile size={40} />
      <p className="text-[14px] text-ink-dim">Signing you in…</p>
      {mounted && HAS_CLERK && (
        <AuthenticateWithRedirectCallback signInForceRedirectUrl={after} signUpForceRedirectUrl={after} />
      )}
    </div>
  );
}
