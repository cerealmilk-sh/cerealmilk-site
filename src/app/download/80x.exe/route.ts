// The evergreen Windows installer path, the sibling of /download/80x.dmg:
// every GET is logged SERVER-side (see src/lib/download-track.ts for the
// privacy contract) and then redirected:
//   SELF_SERVE_DOWNLOADS on  → 307 to the current desktop-line Windows exe
//   SELF_SERVE_DOWNLOADS off → 307 to the /download page (outcome: "paused",
//                              blocked demand, never counted as a download)
//
// The Windows asset on product-releases is versioned (80x-Setup-<v>.exe),
// so unlike the dmg there is no stable /releases/latest/download/ name;
// the destination is resolved from the desktop release channel's
// electron-updater manifest (src/lib/desktop-release.ts). If the manifest
// cannot be read, the latest-release page is the fallback (a human can
// always click the exe there).

import { NextRequest, NextResponse, after } from "next/server";
import { SELF_SERVE_DOWNLOADS } from "@/lib/site";
import { resolveDesktopAsset } from "@/lib/desktop-release";
import { logDownload } from "@/lib/download-track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_URL =
  "https://github.com/80x-org/product-releases/releases/latest";
const PAUSED_PATH = "/download";

async function destination(req: NextRequest): Promise<URL> {
  if (!SELF_SERVE_DOWNLOADS) return new URL(PAUSED_PATH, req.nextUrl.origin);
  return new URL((await resolveDesktopAsset("windows")) ?? FALLBACK_URL);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // after(): the redirect is sent immediately; logging finishes in the
  // background without the lambda freezing under it (Vercel keeps the
  // invocation alive until after() callbacks settle).
  after(() =>
    logDownload(req, {
      asset: "80x.exe",
      event: "exe_download_requested",
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
