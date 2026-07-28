"use client";

// The one brand-tinted download button, superset.sh pattern: a client
// island that detects the visitor's platform after hydration and swaps its
// label ("Download for macOS" / "Download for Windows"). The SSR default is
// macOS, matching every static surface; the href always points at the
// /download interstitial, which serves the right file for the platform.
// Used by the header (size="sm") and the homepage hero + final CTA ("md").

import Link from "next/link";
import { Platform, usePlatform } from "@/lib/platform";

const SIZES = {
  sm: "px-2 py-2 text-sm sm:px-4",
  md: "px-3 py-2 text-sm sm:px-6 sm:py-3 sm:text-base",
} as const;

function DownloadIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2.5v8m0 0 3-3m-3 3-3-3M3 13.5h10" />
    </svg>
  );
}

export function DownloadCta({
  href,
  src,
  size = "md",
}: {
  href: string;
  src: string;
  size?: keyof typeof SIZES;
}) {
  const platform = usePlatform();
  const osLabel = platform === Platform.Windows ? "Windows" : "macOS";

  return (
    <Link
      href={href}
      data-track="get_started_cta_clicked"
      data-track-props={`{"src":"${src}"}`}
      className={`flex items-center gap-2 border border-brand/20 bg-brand/10 font-normal text-brand-light transition-colors hover:border-brand/35 hover:bg-brand/15 ${SIZES[size]}`}
    >
      <span className="hidden sm:inline">Download for {osLabel}</span>
      <span className="sm:hidden">Download</span>
      <DownloadIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </Link>
  );
}
