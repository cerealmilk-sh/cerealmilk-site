"use client";

// Fires a single analytics event once on mount. Used to record conversions
// that complete via a full-page navigation rather than a click, e.g. the
// contact form posts to /api/inquiry and lands on /contact?sent=1, so we
// mark the conversion when that thank-you state renders.

import { useEffect, useRef } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

export function TrackEvent({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: Record<string, unknown>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
