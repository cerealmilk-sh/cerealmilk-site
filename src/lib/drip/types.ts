// Lifecycle-email types, the shared shape of a contact and the two drip
// sequences (nurture + activation). One Contact record per email address is the
// single source of truth the cron reads each day; everything else (which step
// to send, what to suppress) is derived from it.

export type SegmentId = "mac" | "non_mac";

export type SequenceId = "nurture" | "activation";

// Usage signals the Mac app reports (via POST /api/lifecycle). Setting one to
// true lets the activation sequence *skip* the step that would have nudged it,
// so a customer who connects WhatsApp on day one never gets the "connect
// WhatsApp" email.
export type SignalKey =
  | "whatsappConnected"
  | "linkedinConnected"
  | "crmLinked"
  | "firstSync"
  | "firstInsight";

export interface SequenceState {
  // Anchor for relative timing. Nurture anchors on signup; activation on the
  // moment of purchase. afterDays on each step is measured from here.
  startedAt: string; // ISO
  // Next step index the engine should consider. Equals steps.length when done.
  step: number;
  done: boolean;
  // step index → ISO time it was sent. Audit trail + idempotency.
  sentAt: Record<number, string>;
}

export interface Contact {
  email: string;
  name?: string;
  segment: SegmentId;
  createdAt: string; // ISO
  updatedAt: string; // ISO

  // Lifecycle flags. These gate the sequences (see engine.ts).
  converted: boolean; // paid, stops nurture, anchors activation
  unsubscribed: boolean; // hard stop on everything
  replied: boolean; // hand to a human, pauses drips, doesn't end them

  signals: Partial<Record<SignalKey, boolean>>;
  sequences: Partial<Record<SequenceId, SequenceState>>;

  // Global frequency cap: at most one drip email per contact per day, so a
  // burst (e.g. a backfilled cron) never double-sends.
  lastDripAt?: string; // ISO
}

export function freshContact(email: string, segment: SegmentId, name?: string): Contact {
  const now = new Date().toISOString();
  return {
    email,
    name: name || undefined,
    segment,
    createdAt: now,
    updatedAt: now,
    converted: false,
    unsubscribed: false,
    replied: false,
    signals: {},
    sequences: {},
  };
}
