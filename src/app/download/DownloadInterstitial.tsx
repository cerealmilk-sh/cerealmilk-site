"use client";

// The /download interstitial, the superset.sh downloads anatomy carried on
// the 80x skin: a chrome-less page (logo top-left, no site nav), a left
// column with the platform-aware message, the product frame on the right,
// and the file download firing itself ~600ms after the visitor's platform
// is known. Mac gets the dmg, Windows gets the exe; anything else (Linux,
// phones, undetected) gets a manual platform picker, never the wrong file.
// Platform detection lives in src/lib/platform.ts.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { WorkspaceDemo } from "@/components/landing/WorkspaceDemo";
import { Platform, PLATFORM_DOWNLOAD, usePlatform } from "@/lib/platform";

const AUTO_DOWNLOAD_DELAY_MS = 600;

const BUTTON_CLASSES =
  "flex items-center gap-2 border border-brand/20 bg-brand/10 px-3 py-2 text-sm font-normal text-brand-light transition-colors hover:border-brand/35 hover:bg-brand/15 sm:px-6 sm:py-3 sm:text-base";

function DownloadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-4 w-4"
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

export function DownloadInterstitial() {
  const platform = usePlatform();
  const firedRef = useRef(false);
  // Attribution passthrough: /download?src=hero forwards src to the file
  // route so the server-side download log keeps the placement. Read from
  // window.location after mount (avoids a useSearchParams Suspense edge).
  const [src, setSrc] = useState("download");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("src");
    if (q && /^[\w-]{1,64}$/.test(q)) setSrc(q);
  }, []);

  const target =
    platform === Platform.Mac || platform === Platform.Windows
      ? PLATFORM_DOWNLOAD[platform]
      : null;
  const href = target
    ? `${target.path}?src=${encodeURIComponent(src)}`
    : null;
  const clickEvent =
    platform === Platform.Windows ? "exe_download_clicked" : "dmg_download_clicked";

  useEffect(() => {
    if (firedRef.current || !href) return;
    firedRef.current = true;
    const t = window.setTimeout(() => {
      window.location.href = href;
    }, AUTO_DOWNLOAD_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [href]);

  return (
    <div className="studio bcl-scroll h-dvh overflow-x-hidden overflow-y-auto bg-background text-foreground">
      <main
        id="main"
        className="relative isolate min-h-screen overflow-hidden px-6 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-20"
      >
        <Link
          href="/"
          aria-label="80x · home"
          className="inline-flex select-none items-center text-foreground transition-colors hover:text-foreground/80"
        >
          <Logo size={28} />
        </Link>

        <div className="mt-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            {target ? (
              <>
                <h1 className="font-mono text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                  You&apos;re about to get 80x
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Your {target.label} download starts automatically. If it
                  doesn&apos;t, you can{" "}
                  <a
                    href={href}
                    data-track={clickEvent}
                    data-track-props={`{"src":"${src}"}`}
                    className="text-foreground underline underline-offset-4"
                  >
                    download it now
                  </a>
                  .
                </p>
                <p className="font-mono text-xs text-muted-foreground/70">
                  {platform === Platform.Mac
                    ? "macOS 12 or later · Apple Silicon"
                    : "Windows 10 or later"}{" "}
                  · free, no card
                </p>
              </>
            ) : (
              <>
                <h1 className="font-mono text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                  Get 80x for your platform
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                  80x is a desktop app for Mac and Windows. Pick your
                  installer and the download starts right away.
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <a
                    href={`${PLATFORM_DOWNLOAD[Platform.Mac].path}?src=${encodeURIComponent(src)}`}
                    data-track="dmg_download_clicked"
                    data-track-props={`{"src":"${src}"}`}
                    className={BUTTON_CLASSES}
                  >
                    Download for macOS
                    <DownloadIcon />
                  </a>
                  <a
                    href={`${PLATFORM_DOWNLOAD[Platform.Windows].path}?src=${encodeURIComponent(src)}`}
                    data-track="exe_download_clicked"
                    data-track-props={`{"src":"${src}"}`}
                    className={BUTTON_CLASSES}
                  >
                    Download for Windows
                    <DownloadIcon />
                  </a>
                </div>
                <p className="font-mono text-xs text-muted-foreground/70">
                  macOS 12 or later (Apple Silicon) · Windows 10 or later ·
                  free, no card
                </p>
              </>
            )}
          </div>

          <div
            aria-hidden="true"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 18%, black 100%)",
            }}
          >
            <WorkspaceDemo />
          </div>
        </div>
      </main>
    </div>
  );
}
