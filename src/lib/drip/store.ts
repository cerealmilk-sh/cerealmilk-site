// Contact store for the lifecycle sequences. Backed by Upstash Redis over its
// REST API: pure fetch, no SDK, no native deps, runs anywhere. Accepts either
// naming for the same endpoint + token: the classic UPSTASH_REDIS_REST_* vars,
// or the KV_REST_API_* vars the Vercel Upstash-for-Redis integration injects.
// Rollout-safe in the house style: with no credentials every method no-ops
// (reads return empty, writes are dropped) so the site keeps working and the
// drip is simply inert until the env is set.
//
// Keys:
//   drip:c:{email}  → JSON Contact
//   drip:active     → Set of emails with at least one live sequence (the cron
//                     iterates this, not the whole keyspace)

import type { Contact } from "./types";

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const ACTIVE_SET = "drip:active";

export function storeEnabled() {
  return !!(URL_ && TOKEN);
}

// One Redis command via the REST endpoint. `["SET", key, value]` etc.
async function cmd<T = unknown>(args: (string | number)[]): Promise<T | null> {
  if (!storeEnabled()) return null;
  try {
    const r = await fetch(URL_!, {
      method: "POST",
      headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!r.ok) {
      console.error("[drip] upstash responded", r.status, await r.text().catch(() => ""));
      return null;
    }
    const { result, error } = (await r.json()) as { result?: T; error?: string };
    if (error) {
      console.error("[drip] upstash error", error);
      return null;
    }
    return (result ?? null) as T | null;
  } catch (err) {
    console.error("[drip] upstash request failed", err);
    return null;
  }
}

const keyFor = (email: string) => `drip:c:${email.toLowerCase()}`;

export async function getContact(email: string): Promise<Contact | null> {
  const raw = await cmd<string>(["GET", keyFor(email)]);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Contact;
  } catch {
    return null;
  }
}

export async function putContact(c: Contact): Promise<void> {
  c.updatedAt = new Date().toISOString();
  await cmd(["SET", keyFor(c.email), JSON.stringify(c)]);
}

export async function addActive(email: string): Promise<void> {
  await cmd(["SADD", ACTIVE_SET, email.toLowerCase()]);
}

export async function removeActive(email: string): Promise<void> {
  await cmd(["SREM", ACTIVE_SET, email.toLowerCase()]);
}

export async function listActive(): Promise<string[]> {
  return (await cmd<string[]>(["SMEMBERS", ACTIVE_SET])) ?? [];
}

// Batch-load the active contacts in one round trip (MGET), dropping any that
// 404'd (e.g. manually deleted) so the caller iterates only live records.
export async function getContacts(emails: string[]): Promise<Contact[]> {
  if (emails.length === 0) return [];
  const raws = (await cmd<(string | null)[]>(["MGET", ...emails.map(keyFor)])) ?? [];
  const out: Contact[] = [];
  for (const raw of raws) {
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw) as Contact);
    } catch {
      /* skip corrupt record */
    }
  }
  return out;
}
