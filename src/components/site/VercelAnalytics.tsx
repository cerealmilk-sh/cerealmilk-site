"use client";

// Vercel Web Analytics (cookieless pageviews and referrers, the traffic
// counterpart to <SpeedInsights/>). Wired to the same /privacy opt-out as
// PostHog so the site keeps ONE opt-out choice across every apex surface,
// the invariant ANALYTICS.md documents.
//
// beforeSend runs in the browser before an event leaves it: returning null
// drops the event entirely for an opted-out visitor. It is a function prop,
// so it cannot be passed from the server layout; this thin client wrapper is
// what makes that possible.

import { Analytics } from "@vercel/analytics/next";

export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) =>
        window.__cmAnalytics?.isOptedOut() ? null : event
      }
    />
  );
}
