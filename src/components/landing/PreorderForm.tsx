"use client";

// The /preorder reservation form. Minimum fields (name, email, plan), no
// card, no account: it posts the reservation to /api/waitlist with
// source "preorder" (the one lead-capture path), then sends the visitor to
// /preorder/thanks. The ?src= attribution param on inbound /preorder links is
// read here, client-side, so the page stays static.
//
// Progressive enhancement: the <form> carries a real action/method, so with
// JavaScript off the browser posts form-encoded to /api/waitlist, which
// captures the reservation and 303-redirects preorder posts to
// /preorder/thanks (see src/app/api/waitlist/route.ts).

import { useEffect, useState } from "react";
import { PLANS } from "@/lib/pricing";
import { setPerson, track } from "@/lib/analytics";

const FIELD =
  "mt-2 h-10 w-full rounded-md border border-edge-2 bg-transparent px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-faint";
const LABEL = "block text-[14px] font-medium text-ink";

export function PreorderForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(PLANS.find((p) => p.popular)?.id ?? PLANS[0].id);
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);

  // Inbound ?plan= (the /pricing cards link here per plan) preselects the
  // matching radio. Client-only, after hydration, so the page stays static.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p && PLANS.some((x) => x.id === p)) setPlan(p as typeof plan);
  }, []);

  function markStarted() {
    if (started) return;
    setStarted(true);
    const src = new URLSearchParams(window.location.search).get("src") ?? "";
    track("preorder_started", { src });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    const src = new URLSearchParams(window.location.search).get("src") ?? "";

    // Best-effort capture; the confirmation page is the point, so a hiccup
    // here never strands the visitor (the API logs every lead server-side).
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        plan,
        source: "preorder",
        src,
        company_website: honeypot,
      }),
      keepalive: true,
    }).catch(() => {});
    // The visitor just told us who they are: attach it to their PostHog
    // person so the pre-signup journey is named (see src/lib/analytics.ts).
    setPerson({
      email,
      lead_source: "preorder",
      ...(name ? { name } : {}),
    });
    track("preorder_submitted", { src, plan });

    window.location.assign(`/preorder/thanks?plan=${encodeURIComponent(plan)}`);
  }

  return (
    <form
      onSubmit={submit}
      action="/api/waitlist"
      method="post"
      className="grid gap-5"
    >
      {/* Tells /api/waitlist this is a reservation; a no-JS form post gets
          redirected on to /preorder/thanks. */}
      <input type="hidden" name="source" value="preorder" />
      {/* Honeypot: off-screen, hidden from assistive tech; scripts fill it
          and the API silently drops the lead. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0">
        <label htmlFor="preorder_company_website">Company website</label>
        <input
          id="preorder_company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="preorder-name" className={LABEL}>
            Your name
          </label>
          <input
            id="preorder-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={FIELD}
            placeholder="Jane Partner"
            value={name}
            onFocus={markStarted}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="preorder-email" className={LABEL}>
            Work email
          </label>
          <input
            id="preorder-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
            placeholder="jane@company.com"
            value={email}
            onFocus={markStarted}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <span className={LABEL}>Plan to lock</span>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${
                plan === p.id
                  ? "border-ink-faint bg-bg"
                  : "border-edge-2 hover:border-ink-faint"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={p.id}
                checked={plan === p.id}
                onFocus={markStarted}
                onChange={() => setPlan(p.id)}
                className="mt-1"
              />
              <span>
                <span className="block text-[14px] font-medium text-ink">
                  {p.name} · ${p.monthly}/user/mo
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-dim">
                  {p.audience}
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">
          You can switch plans before your seat is set up. Nothing is charged
          today.
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-dim disabled:opacity-60"
        >
          {sending ? "Reserving your seat…" : "Reserve my founding seat"}
        </button>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
          No card, no charge. Your reservation goes to the founder, and you can
          cancel anytime before your seat is set up.
        </p>
      </div>
    </form>
  );
}
