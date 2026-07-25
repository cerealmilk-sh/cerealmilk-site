// The lifecycle engine. Every state change funnels through processContact(),
// which is the single place that decides what (if anything) to send, persists
// the contact, and keeps the active set in sync. The daily cron calls tick();
// the API routes call the mutators (startWaitlist / markConverted / recordSignal
// / markReplied / markUnsubscribed). All are no-ops when the store is disabled,
// so the drip is simply off until UPSTASH_* is set, the welcome email and the
// rest of the site keep working regardless.

import { sendEmail, firstNameOf } from "./email";
import { SEQUENCES } from "./sequences";
import {
  storeEnabled,
  getContact,
  putContact,
  addActive,
  removeActive,
  listActive,
  getContacts,
} from "./store";
import { freshContact } from "./types";
import type { Contact, SegmentId, SignalKey, SequenceId } from "./types";

const dayOf = (iso: string) => iso.slice(0, 10);
const ONE_DAY = 86_400_000;

// Sequences run activation before nurture so a paying customer's onboarding
// always takes priority over any leftover nurture step. The AI-spend course is
// independent of the product funnel and runs last, so it never delays onboarding
// under the one-email-per-day cap.
const ORDER: SequenceId[] = ["activation", "nurture", "course"];

// The core. Mutates `c`, sends at most one email (frequency cap: one drip per
// contact per day), persists, and adds/removes the contact from the active set.
async function processContact(c: Contact): Promise<{ sent: boolean }> {
  const now = new Date();
  const nowIso = now.toISOString();
  const today = dayOf(nowIso);
  const firstName = firstNameOf(c.name);
  let sentThisTick = false;

  for (const seqId of ORDER) {
    const st = c.sequences[seqId];
    if (!st || st.done) continue;

    // Hard stops and pauses.
    if (c.unsubscribed) {
      st.done = true;
      continue;
    }
    if (seqId === "nurture" && c.converted) {
      st.done = true; // they bought, nurture's job is finished
      continue;
    }
    if (c.replied) continue; // handed to a human: pause, don't advance or end
    if (sentThisTick) continue; // already sent one email this run
    if (c.lastDripAt && dayOf(c.lastDripAt) === today) continue; // one per day

    const steps = SEQUENCES[seqId];
    const anchor = new Date(st.startedAt).getTime();

    // Walk forward: skip steps whose skipIf is satisfied (free), send the first
    // due one, or stop and wait if the next step isn't due yet.
    while (st.step < steps.length) {
      const step = steps[st.step];
      if (step.skipIf?.(c)) {
        st.step++;
        continue;
      }
      const dueAt = anchor + step.afterDays * ONE_DAY;
      if (now.getTime() < dueAt) break; // not due yet, wait for a later tick

      const ok = await sendEmail({
        to: c.email,
        subject: step.subject,
        blocks: step.blocks,
        firstName,
        sequence: seqId,
      });
      if (ok) {
        st.sentAt[st.step] = nowIso;
        c.lastDripAt = nowIso;
        st.step++;
        sentThisTick = true;
      }
      break; // one send per sequence per tick (and the cap above stops the next)
    }

    if (st.step >= steps.length) st.done = true;
  }

  await putContact(c);
  const anyLive = ORDER.some((s) => c.sequences[s] && !c.sequences[s]!.done);
  await (anyLive ? addActive(c.email) : removeActive(c.email));
  return { sent: sentThisTick };
}

async function loadOrCreate(email: string, segment: SegmentId, name?: string): Promise<Contact> {
  const existing = await getContact(email);
  if (existing) {
    if (name && !existing.name) existing.name = name;
    return existing;
  }
  return freshContact(email, segment, name);
}

// ── Mutators (called from the API routes) ───────────────────────────────────

// A new waitlist signup. Starts the nurture sequence anchored on signup time
// (the Day-0 welcome is sent separately, inline by /api/waitlist). Idempotent,
// a repeat signup never restarts the sequence.
export async function startWaitlist(email: string, name?: string, segment: SegmentId = "mac") {
  if (!storeEnabled()) return;
  const c = await loadOrCreate(email, segment, name);
  c.sequences.nurture ??= { startedAt: c.createdAt, step: 0, done: false, sentAt: {} };
  await processContact(c);
}

// A signup for the AI-spend email course. Day 1 is sent inline by /api/waitlist
// (so it lands immediately and works with just RESEND_API_KEY); this enrolls the
// timed tail, days 2–5. Anchored on now: an existing contact who signs up later
// still gets a clean five-day cadence, not a burst. Idempotent: a repeat signup
// never restarts the sequence.
export async function startCourse(email: string, name?: string) {
  if (!storeEnabled()) return;
  const c = await loadOrCreate(email, "mac", name);
  c.sequences.course ??= {
    startedAt: new Date().toISOString(),
    step: 0,
    done: false,
    sentAt: {},
  };
  await processContact(c);
}

// A founding pre-order reservation. Marks the contact converted so nurture
// ends (its job, driving the pre-order, is done) but does NOT start
// activation: that anchors on the real setup/purchase, when the seat is
// actually onboarded (markConverted below). The confirmation email is sent
// inline by /api/waitlist.
export async function markPreordered(email: string, name?: string) {
  if (!storeEnabled()) return;
  const c = await loadOrCreate(email, "mac", name);
  c.converted = true;
  await processContact(c);
}

// A purchase. Stops nurture, anchors and starts activation, and fires its Day-0
// welcome inline so it lands immediately, not on the next cron tick.
export async function markConverted(email: string, name?: string) {
  if (!storeEnabled()) return;
  const c = await loadOrCreate(email, "mac", name);
  c.converted = true;
  c.sequences.activation ??= {
    startedAt: new Date().toISOString(),
    step: 0,
    done: false,
    sentAt: {},
  };
  await processContact(c);
}

// A usage signal from the Mac app, lets the matching activation step skip
// itself on the next tick.
export async function recordSignal(email: string, key: SignalKey, value = true) {
  if (!storeEnabled()) return;
  const c = await getContact(email);
  if (!c) return; // no contact = not a customer we're tracking; ignore
  c.signals[key] = value;
  await processContact(c);
}

// The contact replied: hand to a human, pause both sequences.
export async function markReplied(email: string) {
  if (!storeEnabled()) return;
  const c = await getContact(email);
  if (!c) return;
  c.replied = true;
  await processContact(c);
}

// Unsubscribe, hard stop on everything (also called by /api/unsubscribe).
export async function markUnsubscribed(email: string) {
  if (!storeEnabled()) return;
  const c = await getContact(email);
  if (!c) return;
  c.unsubscribed = true;
  await processContact(c);
}

// ── Cron ─────────────────────────────────────────────────────────────────────

export interface TickResult {
  enabled: boolean;
  processed: number;
  sent: number;
}

export async function tick(): Promise<TickResult> {
  if (!storeEnabled()) return { enabled: false, processed: 0, sent: 0 };
  const emails = await listActive();
  const contacts = await getContacts(emails);

  // Prune any active-set entries whose contact record vanished, so the set
  // doesn't grow stale forever.
  const present = new Set(contacts.map((c) => c.email.toLowerCase()));
  for (const e of emails) if (!present.has(e.toLowerCase())) await removeActive(e);

  let sent = 0;
  for (const c of contacts) {
    const r = await processContact(c);
    if (r.sent) sent++;
  }
  return { enabled: true, processed: contacts.length, sent };
}
