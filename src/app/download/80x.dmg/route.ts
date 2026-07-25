// The evergreen DMG path, as a route handler instead of a next.config.ts
// redirect: the redirect could never log anything, which is why "has anyone
// downloaded the app?" used to be unanswerable first-party (GitHub only keeps
// an aggregate counter; the PostHog click event is consent-gated and
// ad-blockable; bookmarks/emails/curl never touched the tracked button).
//
// Every GET is logged SERVER-side (see src/lib/download-track.ts for the
// privacy contract) and then redirected:
//   SELF_SERVE_DOWNLOADS on  → 307 to the current desktop-line Mac dmg
//   SELF_SERVE_DOWNLOADS off → 307 to the /download page (outcome: "paused",
//                              blocked demand, never counted as a download)
//
// The destination is resolved from the desktop release channel's own
// electron-updater manifest (src/lib/desktop-release.ts) rather than
// /releases/latest/download/: two release lines publish to product-releases
// (legacy Mac v1.4-b* and desktop-v*), so "latest" flips with whichever
// ships most recently, and the legacy line carries no evergreen 80x.dmg
// asset. If the manifest cannot be read, the old /releases/latest/ URL is
// the fallback.

import { NextRequest, NextResponse, after } from "next/server";
import { SELF_SERVE_DOWNLOADS } from "@/lib/site";
import { resolveDesktopAsset } from "@/lib/desktop-release";
import { logDownload } from "@/lib/download-track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_URL =
  "https://github.com/80x-org/product-releases/releases/latest/download/80x.dmg";
const PAUSED_PATH = "/download";

async function destination(req: NextRequest): Promise<URL> {
  if (!SELF_SERVE_DOWNLOADS) return new URL(PAUSED_PATH, req.nextUrl.origin);
  return new URL((await resolveDesktopAsset("mac")) ?? FALLBACK_URL);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // after(): the redirect is sent immediately; logging finishes in the
  // background without the lambda freezing under it (Vercel keeps the
  // invocation alive until after() callbacks settle).
  after(() =>
    logDownload(req, {
      asset: "80x.dmg",
      event: "dmg_download_requested",
      outcome: SELF_SERVE_DOWNLOADS ? "served" : "paused",
    }).catch(() => undefined)
  );
  return NextResponse.redirect(await destination(req), 307);
}

// Download managers and some browsers probe with HEAD before GET: redirect
// identically but do NOT log, so one download never counts twice.
export async function HEAD(req: NextRequest): Promise<NextResponse> {
  return NextResponse.redirect(await destination(req), 307);
}
