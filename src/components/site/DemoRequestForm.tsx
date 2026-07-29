"use client";

// The /demo lead form: the standard B2B demo flow, form first, scheduler
// second. Three fields, the fewest that still let the founder prep the call:
// every extra field on a demo form costs completions, and team size was
// answering itself on the call anyway. It posts to /api/inquiry (best-effort,
// keepalive so the redirect doesn't cancel it), then sends the visitor to the
// booking page with name and email prefilled. The ?src= attribution param on
// inbound /demo links is read here, client-side, so the page stays static.
//
// Progressive enhancement: the <form> also carries a real action/method, so
// with JavaScript off the browser posts form-encoded to /api/inquiry, which
// captures the lead and 303-redirects source=demo posts to the same booking
// page (see src/app/api/inquiry/route.ts).

import { useState } from "react";
import { CAL_BOOKING_URL } from "@/lib/site";
import { setPerson, track } from "@/lib/analytics";

const FIELD =
  "mt-2 h-10 w-full rounded-md border border-edge-2 bg-transparent px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-faint";
const LABEL = "block text-[14px] font-medium text-ink";

export function DemoRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [firm, setFirm] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    const src = new URLSearchParams(window.location.search).get("src") ?? "";

    // Best-effort lead capture; the booking is the point, so a hiccup here
    // never blocks the calendar. Structured fields only: the API composes the
    // email body itself (free text over source=demo was a spam vector).
    fetch("/api/inquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        firm,
        src,
        source: "demo",
        company_website: honeypot,
      }),
      keepalive: true,
    }).catch(() => {});
    // The visitor just told us who they are: attach it to their PostHog
    // person so the pre-signup journey is named (see src/lib/analytics.ts).
    setPerson({
      email,
      lead_source: "demo_request",
      ...(name ? { name } : {}),
      ...(firm ? { company: firm } : {}),
    });
    track("demo_request_submitted", { src });

    const cal = new URL(CAL_BOOKING_URL);
    cal.searchParams.set("name", name);
    cal.searchParams.set("email", email);
    window.location.assign(cal.toString());
  }

  return (
    <form
      onSubmit={submit}
      action="/api/inquiry"
      method="post"
      className="grid gap-5"
    >
      {/* Tells /api/inquiry this is the demo flow; a no-JS form post gets
          redirected on to the booking page. */}
      <input type="hidden" name="source" value="demo" />
      {/* Honeypot: off-screen, hidden from assistive tech; scripts fill it
          and the API silently drops the lead. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0">
        <label htmlFor="demo_company_website">Company website</label>
        <input
          id="demo_company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="demo-name" className={LABEL}>
          Your name
        </label>
        <input
          id="demo-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={FIELD}
          placeholder="Jane Cooper"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="demo-email" className={LABEL}>
          Work email
        </label>
        <input
          id="demo-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={FIELD}
          placeholder="jane@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="demo-firm" className={LABEL}>
          Company
        </label>
        <input
          id="demo-firm"
          name="firm"
          type="text"
          required
          autoComplete="organization"
          className={FIELD}
          placeholder="Cooper and Co"
          value={firm}
          onChange={(e) => setFirm(e.target.value)}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-10 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-dim disabled:opacity-60"
        >
          {sending ? "Opening the calendar…" : "Pick a time"}
        </button>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
          Next you choose a slot on the calendar. Your details go to the
          founder, not a sales queue.
        </p>
      </div>
    </form>
  );
}
