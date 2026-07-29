"use client";

// The /privacy analytics opt-out. Analytics loads by default (see
// public/consent-analytics.js); this toggle lets a visitor turn tracking off
// for their browser, or back on, via PostHog's own persisted opt-out.

import { useEffect, useState } from "react";

export function AnalyticsOptOut() {
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    const read = () => setOptedOut(window.__cmAnalytics?.isOptedOut() ?? false);
    read();
    // PostHog loads async; re-read once it has had a moment to boot.
    const t = setTimeout(read, 1500);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    if (optedOut) {
      window.__cmAnalytics?.optIn();
      setOptedOut(false);
    } else {
      window.__cmAnalytics?.optOut();
      setOptedOut(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-10 w-fit items-center rounded-full border border-edge-2 px-5 text-[14px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-panel-2"
      >
        {optedOut ? "Turn analytics back on" : "Opt out of analytics"}
      </button>
      {optedOut ? (
        <p className="text-[13px] text-ink-faint">
          Analytics is off for this browser. The choice is remembered here, in
          your browser.
        </p>
      ) : null}
    </div>
  );
}
