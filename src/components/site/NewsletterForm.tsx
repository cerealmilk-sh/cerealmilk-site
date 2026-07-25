"use client";

// The Field Notes signup, the site's primary CTA. Posts to the same
// /api/waitlist endpoint the product page uses; `source` tells the API this
// is a newsletter placement (Field Notes welcome, no product drip) and gives
// per-placement analytics. Every placement passes a distinct source id.
//
// Progressive enhancement: the <form> carries a real action/method (the same
// pattern as the docs site's plain HTML form), so with JavaScript off the
// browser posts form-encoded to /api/waitlist, which 303-redirects to
// /newsletter?subscribed=1.

import { useState } from "react";
import { NEWSLETTER_PITCH } from "@/lib/site";
import { setPerson, track } from "@/lib/analytics";

type State = "idle" | "sending" | "done" | "error";

export function NewsletterForm({
  source,
  compact = false,
}: {
  source: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await r.json()) as { ok?: boolean };
      if (data.ok) {
        // Name the visitor's PostHog person with the email they just gave us
        // (see src/lib/analytics.ts).
        setPerson({ email, lead_source: "newsletter" });
        track("newsletter_subscribed", { source });
      }
      setState(data.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="text-[14px] leading-relaxed text-ink" role="status">
        You&apos;re on the list. One email when something new ships. Nothing else.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      action="/api/waitlist"
      method="post"
      className="w-full max-w-[26rem]"
    >
      <input type="hidden" name="source" value={source} />
      <div className="flex gap-2">
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@fund.com"
          autoComplete="email"
          className="h-10 w-full min-w-0 flex-1 rounded-md border border-edge-2 bg-transparent px-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-ink-faint"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-10 shrink-0 rounded-full bg-accent px-5 text-[14px] font-medium text-accent-ink transition-colors hover:bg-accent-dim disabled:opacity-60"
        >
          {state === "sending" ? "Joining…" : "Join"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-[13px] text-danger" role="alert">
          That didn&apos;t go through. Check the address and try again.
        </p>
      )}
      {!compact && (
        <p className="mt-2.5 text-[13px] leading-relaxed text-ink-faint">
          {NEWSLETTER_PITCH}
        </p>
      )}
    </form>
  );
}
