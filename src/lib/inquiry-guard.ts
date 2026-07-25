// Server-side spam defenses for /api/inquiry. The contact flow is deliberately
// captcha-free, no-JS friendly, and open to browsing agents, so the filtering
// all happens here, invisibly, in three layers:
//
//   1. A form token: /contact renders a hidden HMAC-signed timestamp. A
//      form-encoded contact post must carry one that is at least a few seconds
//      old (humans read before they send; bots post the instant they connect,
//      and blind bots that POST without ever fetching the page have no token
//      at all). JSON posts are exempt: the endpoint's GET contract documents
//      them for agents, and they never came from the form anyway.
//   2. Content heuristics tuned to the spam we actually receive: a message
//      that leads with a bare URL, file-locker and link-shortener hosts,
//      URLs stuffed into the name or firm fields, the same gibberish token
//      pasted as both name and firm, and test@-style throwaway emails.
//   3. A per-IP rate limit on the shared Upstash Redis (the drip store's
//      instance). Rollout-safe in the house style: with no credentials it
//      no-ops and every request is allowed.
//
// Dropped submissions are answered with the same success response a real one
// gets (the bot moves on) and logged with a reason, so false positives can be
// audited in the Vercel logs and the rules loosened if a real lead ever trips.

import { createHmac, timingSafeEqual } from "node:crypto";

// The signing key never ships to the client and only needs to be secret and
// stable, so it is derived from a secret that already exists in the Vercel
// env rather than adding a new one. The fallback keeps local dev working.
const TOKEN_KEY = process.env.RESEND_API_KEY || "dev-inquiry-token-key";
const MIN_TOKEN_AGE_MS = 3_000; // faster than any human reads the page
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000; // a tab left open overnight

function sign(ts: string): string {
  return createHmac("sha256", TOKEN_KEY).update(ts).digest("hex");
}

/** A hidden-field token for the /contact form: signed mint timestamp. */
export function mintInquiryToken(): string {
  const ts = String(Date.now());
  return `${ts}.${sign(ts)}`;
}

/** True when the token is genuine and its age sits inside the human window. */
export function verifyInquiryToken(token: string): boolean {
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const ts = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(ts);
  if (mac.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  const age = Date.now() - Number(ts);
  return age >= MIN_TOKEN_AGE_MS && age <= MAX_TOKEN_AGE_MS;
}

// Hosts that have no business in a VC inquiry: file lockers and link
// shorteners, the standard payload carriers. Extend as new waves arrive.
const BLOCKED_HOSTS = [
  "mega.nz",
  "anonfiles.com",
  "pixeldrain.com",
  "gofile.io",
  "t.me",
  "telegra.ph",
  "bit.ly",
  "tinyurl.com",
  "cutt.ly",
  "is.gd",
  "goo.gl",
  "shorturl.at",
  "rebrand.ly",
];

const URL_RE = /https?:\/\/[^\s<>"')]+/gi;

// Throwaway local parts nobody replies from. Exact match on the local part
// only, so e.g. test-fund@realfirm.com still gets through.
const THROWAWAY_LOCAL_RE = /^(test|testing|example|sample|asdf|noreply|no-reply)$/i;

export interface InquiryFields {
  name: string;
  email: string;
  firm: string;
  message: string;
}

/**
 * Content check. Returns null for a clean submission, or a short reason
 * string (for the log line) when it should be dropped.
 */
export function spamVerdict({ name, email, firm, message }: InquiryFields): string | null {
  const urls = message.match(URL_RE) ?? [];

  const firstLine = message.split("\n").find((l) => l.trim().length > 0)?.trim() ?? "";
  if (/^https?:\/\/\S+$/i.test(firstLine)) return "url-lede";

  for (const url of urls) {
    try {
      const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
      if (BLOCKED_HOSTS.some((b) => host === b || host.endsWith(`.${b}`))) {
        return "blocked-host";
      }
    } catch {
      /* unparseable, let the other rules decide */
    }
  }
  if (urls.length >= 3) return "link-dump";

  if (URL_RE.test(name) || URL_RE.test(firm)) return "url-in-identity";

  // The same long single token pasted into both identity fields: a bot
  // filling every box with one generated string. A solo GP who types their
  // own name as the firm has a space in it and passes.
  const n = name.trim();
  if (n && n === firm.trim() && !n.includes(" ") && n.length >= 12) {
    return "identity-echo";
  }

  const local = email.split("@")[0] ?? "";
  if (THROWAWAY_LOCAL_RE.test(local)) return "test-email";

  return null;
}

// ---------------------------------------------------------------------------
// Per-IP rate limit, on the same Upstash instance the drip store uses (either
// env spelling). Fixed one-hour windows via INCR + EXPIRE: generous for any
// human, a wall for a script that posts all day.

const KV_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const RATE_LIMIT = 5; // submissions per IP per window
const RATE_WINDOW_S = 60 * 60;

/** First hop of x-forwarded-for (Vercel sets it), else a shared bucket. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** True when this IP is still under the hourly cap (or the store is off). */
export async function underRateLimit(ip: string): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return true;
  try {
    const r = await fetch(`${KV_URL.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${KV_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify([
        ["INCR", `inq:rl:${ip}`],
        ["EXPIRE", `inq:rl:${ip}`, RATE_WINDOW_S, "NX"],
      ]),
      cache: "no-store",
    });
    if (!r.ok) return true; // store trouble never blocks a lead
    const results = (await r.json()) as { result?: number; error?: string }[];
    const count = results?.[0]?.result;
    return typeof count !== "number" || count <= RATE_LIMIT;
  } catch {
    return true;
  }
}
