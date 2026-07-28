// Signed unsubscribe tokens for the lifecycle emails (see /api/unsubscribe).
//
// The visible unsubscribe link and the RFC 8058 List-Unsubscribe header both
// carry `?e=<email>&t=<token>`, where the token is an HMAC-SHA256 of the
// lowercased email under UNSUBSCRIBE_SECRET (falling back to
// LIFECYCLE_INGEST_SECRET so no new secret is strictly required). That stops
// third parties unsubscribing arbitrary addresses and stops garbage `?e=`
// params rendering a fake "you're unsubscribed" confirmation.
//
// Rollout-safe: with neither secret set, links are emitted unsigned and the
// endpoint accepts unsigned requests (the pre-signing behavior), so nothing
// breaks before the env var lands. Once a secret is set, new emails carry
// signed links and unsigned/invalid requests fail neutrally.

import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/site";

function secret(): string | undefined {
  return process.env.UNSUBSCRIBE_SECRET || process.env.LIFECYCLE_INGEST_SECRET;
}

export function hasUnsubSecret(): boolean {
  return !!secret();
}

/** The HMAC token for an email, or null with no secret configured. */
export function unsubToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key)
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

/** True when the presented token matches the email's expected token. */
export function verifyUnsubToken(email: string, token: string): boolean {
  const expected = unsubToken(email);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The full unsubscribe URL for an email (signed when a secret is set). */
export function unsubUrlFor(email: string): string {
  const base = `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(email)}`;
  const token = unsubToken(email);
  return token ? `${base}&t=${token}` : base;
}
