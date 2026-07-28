// The server-side download log shared by the two evergreen download routes
// (/download/CerealMilk.dmg and /download/CerealMilk.exe). Every GET is logged SERVER-side
// (independent of cookies, opt-outs, and ad-blockers); the route then
// 307s to the installer. This is why "has anyone downloaded the app?" is
// answerable first-party: GitHub only keeps an aggregate counter, the
// PostHog click event is client-side and ad-blockable, and
// bookmarks/emails/curl never touch the tracked button.
//
// PRIVACY: no cookie is set and no PII is stored. The client IP is reduced
// to a salted SHA-256 before it leaves this process (raw IPs never reach
// the backend); geo is country-level (Vercel edge header). Logging is
// best-effort via after() in the route: the redirect always wins, a logging
// failure can never block or slow a download.
//
// Env (rollout-safe: unset ⇒ the redirect still works, hits go unlogged):
//   DOWNLOAD_TRACK_SECRET: shared secret; same value as the backend's
//                           DOWNLOAD_TRACK_SECRET (see ops/secrets-inventory.md)
//   DOWNLOAD_TRACK_URL:    override the backend endpoint (defaults to prod)

import { createHash, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

const TRACK_URL =
  process.env.DOWNLOAD_TRACK_URL ?? "https://app.cerealmilk.sh/api/track/download";
// The public (client-side) PostHog project key, same project as the web +
// app dataset; safe to commit, see ANALYTICS.md. Server-side capture so
// download counts also land in PostHog insights: anonymous (random per-hit
// distinct_id, no cookie, no profile).
// Empty when NEXT_PUBLIC_POSTHOG_KEY is unset: capture is skipped entirely.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_CAPTURE = "https://us.i.posthog.com/capture/";

const BOT_RE =
  /bot|crawl|spider|slurp|curl|wget|python-requests|httpie|headless|preview|monitor/i;

function classify(ua: string): "browser" | "updater" | "bot" {
  if (/sparkle/i.test(ua)) return "updater"; // the app's auto-updater
  if (!ua || BOT_RE.test(ua)) return "bot";
  return "browser";
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
}

export async function logDownload(
  req: NextRequest,
  opts: {
    /** The evergreen asset name, e.g. "CerealMilk.dmg" / "CerealMilk.exe". */
    asset: string;
    /** The PostHog event, e.g. "dmg_download_requested". */
    event: string;
    outcome: "served" | "paused";
  }
): Promise<void> {
  const url = req.nextUrl;
  const ua = req.headers.get("user-agent") ?? "";
  const secret = process.env.DOWNLOAD_TRACK_SECRET;
  const downloadId = randomUUID();
  const kind = classify(ua);
  const source = url.searchParams.get("src")?.slice(0, 64) ?? null;
  const country = req.headers.get("x-vercel-ip-country");
  const referrer = req.headers.get("referer")?.slice(0, 256) ?? null;

  const jobs: Promise<unknown>[] = [];

  // First-party log → backend Postgres (the source of truth).
  if (secret) {
    const ip = clientIp(req);
    const ipHash = ip
      ? createHash("sha256").update(`${secret}:${ip}`).digest("hex").slice(0, 32)
      : null;
    jobs.push(
      fetch(TRACK_URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-download-secret": secret },
        body: JSON.stringify({
          downloadId,
          asset: opts.asset,
          source,
          referrer,
          userAgent: ua.slice(0, 256),
          ipHash,
          country,
          utmSource: url.searchParams.get("utm_source")?.slice(0, 64) ?? null,
          utmMedium: url.searchParams.get("utm_medium")?.slice(0, 64) ?? null,
          utmCampaign: url.searchParams.get("utm_campaign")?.slice(0, 64) ?? null,
          kind,
          outcome: opts.outcome,
        }),
        signal: AbortSignal.timeout(4000),
      })
    );
  }

  // Second sink → PostHog insights (anonymous, events-only, no person profile).
  // Skipped entirely when no key is configured.
  if (POSTHOG_KEY) jobs.push(
    fetch(POSTHOG_CAPTURE, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: opts.event,
        distinct_id: downloadId, // random per hit, deliberately un-joinable
        properties: {
          outcome: opts.outcome,
          asset: opts.asset,
          source: source ?? "direct",
          kind,
          country,
          $process_person_profile: false,
        },
      }),
      signal: AbortSignal.timeout(4000),
    })
  );

  await Promise.allSettled(jobs);
}
