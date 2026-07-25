"use client";

import overrides from "./copy-overrides.json";

// The editable-copy layer.
//
// `<T id="…">default</T>` wraps a single piece of marketing prose. It renders
// the override for `id` if one exists in copy-overrides.json, otherwise the
// default that stays inline in the page source. The default is kept in code on
// purpose: only copy that has actually been edited lives in the overrides file,
// so the source tree stays the readable source of truth and the diff on Publish
// is exactly "what changed."
//
// The rendered <span> carries data-copy-id / data-copy-default so the dev-only
// CopyEditor overlay (CopyEditor.tsx) can find every editable string on the
// page, make it contentEditable, and diff it against its default on Save.
//
// Only wrap pure prose. Copy that interpolates a shared constant (prices from
// pricing.ts, TRIAL_DAYS, etc.) must stay un-wrapped so it keeps tracking that
// single source instead of freezing today's number into an override.

const OVERRIDES = overrides as Record<string, string>;

export function T({ id, children }: { id: string; children: string }) {
  const text = OVERRIDES[id] ?? children;
  return (
    <span data-copy-id={id} data-copy-default={children}>
      {text}
    </span>
  );
}
