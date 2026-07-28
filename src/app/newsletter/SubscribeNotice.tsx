"use client";

// Renders the result banner for the /api/waitlist form-post flow, which
// redirects back to /newsletter with ?subscribed=1 or ?error=email. A client
// island (useSearchParams) wrapped in <Suspense> by the page so the page
// itself stays static. Renders nothing when neither param is present.

import { useSearchParams } from "next/navigation";

export function SubscribeNotice() {
  const params = useSearchParams();

  if (params.get("subscribed") === "1") {
    return (
      <p
        role="status"
        className="mt-6 rounded-2xl border border-edge bg-panel px-4 py-3 text-[14px] leading-relaxed text-ink"
      >
        You&rsquo;re on the list. One email when something new ships. That&rsquo;s the whole deal.
      </p>
    );
  }

  if (params.get("error") === "email") {
    return (
      <p
        role="alert"
        className="mt-6 rounded-2xl border border-edge-2 bg-panel px-4 py-3 text-[14px] leading-relaxed text-danger"
      >
        That email address didn&rsquo;t go through. Check it and try again
        below.
      </p>
    );
  }

  return null;
}
