"use client";

// Dismiss control for the global Ribbon. Persists the current ribbon version to
// localStorage and hides the bar instantly by setting `<html data-ribbon>`,
// the same attribute the head init script sets pre-paint (see src/lib/ribbon.ts
// + the `.site-ribbon` hide rule in globals.css). A small client island, like
// ThemeToggle/MobileMenu; the rest of the ribbon stays server-rendered.

import { RIBBON, RIBBON_STORAGE_KEY } from "@/lib/ribbon";

export function RibbonDismiss() {
  function dismiss() {
    try {
      localStorage.setItem(RIBBON_STORAGE_KEY, RIBBON.version);
    } catch {
      // storage disabled, still hide for this session via the attribute below
    }
    document.documentElement.dataset.ribbon = "hidden";
    // The dismiss button now sits inside the display:none'd ribbon, so move
    // keyboard focus to the header's first link instead of dropping it to <body>.
    document.querySelector<HTMLElement>("header a")?.focus();
  }
  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Dismiss announcement"
      className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-accent-ink/60 transition-colors hover:bg-accent-ink/10 hover:text-accent-ink"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );
}
