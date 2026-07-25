"use client";

import { useEffect, useState } from "react";

// Client-side platform detection, the same pattern superset.sh uses for its
// download UX: the server render is platform-neutral (navigator does not
// exist), detection runs once after hydration, and the download surfaces
// (the CTA labels, the /download interstitial) swap to match the visitor's
// machine. Cereal Milk ships two desktop builds, a Mac dmg and a Windows exe, so
// those two platforms get a direct download and everything else (Linux,
// phones, tablets, undetected) gets a manual platform picker.

export const Platform = {
  Mac: "mac",
  Windows: "windows",
  Linux: "linux",
  Mobile: "mobile",
  Unknown: "unknown",
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return Platform.Unknown;
  const ua = navigator.userAgent;
  if (/android|iphone|ipad|ipod|mobile|tablet/i.test(ua)) {
    return Platform.Mobile;
  }
  if (/mac os x|macintosh/i.test(ua)) return Platform.Mac;
  if (/windows/i.test(ua)) return Platform.Windows;
  if (/linux|x11/i.test(ua)) return Platform.Linux;
  return Platform.Unknown;
}

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>(Platform.Unknown);
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);
  return platform;
}

// What each downloadable platform is called and which evergreen route serves
// it (route handlers that first-party-log the hit, then 307 to the current
// installer on cerealmilk-sh/product-releases).
export const PLATFORM_DOWNLOAD = {
  [Platform.Mac]: { label: "macOS", path: "/download/CerealMilk.dmg" },
  [Platform.Windows]: { label: "Windows", path: "/download/CerealMilk.exe" },
} as const;
