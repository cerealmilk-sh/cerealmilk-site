"use client";

// A small affordance on /privacy that re-opens the consent banner so a visitor
// can change or withdraw their analytics choice at any time. Calls into the
// global installed by public/consent-analytics.js.

export function ConsentReset() {
  return (
    <button
      type="button"
      onClick={() => window.__xConsent?.reset()}
      className="inline-flex h-10 items-center rounded-full border border-edge-2 px-5 text-[14px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-panel-2"
    >
      Change your privacy choice
    </button>
  );
}
