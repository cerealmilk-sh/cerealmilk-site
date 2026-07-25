"use client";

// 80x · landing-page toolkit.
//
// Everything the marketing page is built from. Deliberately self-contained: it
// depends ONLY on the stable @theme color/shadow/radius tokens (bg-bg, bg-panel,
// bg-accent, border-edge, shadow-card, text-ink…), the protected primitive kit
// (Avatar/Tag/Button/MarkGlyph/cx) and its own scoped keyframes below, never on
// the legacy decorative `.bc-*` utilities, which are being renamed elsewhere.
// That keeps the landing visually identical to the shipped app yet immune to its
// styling churn. The mockups ARE facsimiles of the real product UI (the same
// bubbles, the same Details sidebar), so the page can never drift from the app.

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCheck, Lock, Share2, User } from "lucide-react";
import { Avatar, Tag, cx } from "@/components/ui";

/* ===========================================================================
   Scoped motion: two one-shot/looping keyframes, namespaced bcl-* so they
   never collide with the app's globals. Reduced-motion safe.
   =========================================================================== */
export const LANDING_CSS = `
@keyframes bcl-flash {
  0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 55%, transparent); }
  100% { box-shadow: 0 0 0 8px transparent; }
}
.bcl-flash { animation: bcl-flash 760ms ease-out; }
@keyframes bcl-pulse {
  0%        { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 55%, transparent); }
  70%, 100% { box-shadow: 0 0 0 5px transparent; }
}
.bcl-pulse { animation: bcl-pulse 2.4s ease-out infinite; }
.bcl-scroll { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  .bcl-flash, .bcl-pulse { animation: none !important; }
  .bcl-scroll { scroll-behavior: auto; }
}

/* The product-skin scope. The /app page chrome now runs on the Geist ".studio"
   tokens, but the mockups inside a Frame depict the shipped product, so the
   Frame re-points the same --bc-* / --color-* pairs BACK to the Intercom
   product palette for its subtree (the same indirection trick .studio uses,
   custom properties substitute at the element that declares them, so the
   mappings must be re-declared alongside the values). Values mirror the
   :root light/dark blocks in globals.css; bubbles/amber/iris resolve at :root
   already and need no re-declaration here. */
.bcl-product {
  color-scheme: light;
  --bc-bg: #f3f4f7;
  --bc-bg-2: #eceef1;
  --bc-panel: #ffffff;
  --bc-panel-2: #f3f4f6;
  --bc-panel-3: #e7e9ee;
  --bc-panel-hover: #f5f6f8;
  --bc-edge: #e6e8ec;
  --bc-edge-2: #d4d7df;
  --bc-ink: #1b1d22;
  --bc-ink-dim: #54585f;
  --bc-ink-faint: #868b94;
  --bc-ink-ghost: #b6bac2;
  --bc-accent: #0064ff;
  --bc-accent-bright: #2f7dff;
  --bc-accent-dim: #0050cc;
  --bc-accent-deep: #e7f0ff;
  --bc-accent-ink: #ffffff;
  --color-bg: var(--bc-bg);
  --color-bg-2: var(--bc-bg-2);
  --color-panel: var(--bc-panel);
  --color-panel-2: var(--bc-panel-2);
  --color-panel-3: var(--bc-panel-3);
  --color-panel-hover: var(--bc-panel-hover);
  --color-edge: var(--bc-edge);
  --color-edge-2: var(--bc-edge-2);
  --color-ink: var(--bc-ink);
  --color-ink-dim: var(--bc-ink-dim);
  --color-ink-faint: var(--bc-ink-faint);
  --color-ink-ghost: var(--bc-ink-ghost);
  --color-accent: var(--bc-accent);
  --color-accent-bright: var(--bc-accent-bright);
  --color-accent-dim: var(--bc-accent-dim);
  --color-accent-deep: var(--bc-accent-deep);
  --color-accent-ink: var(--bc-accent-ink);
}
:root[data-theme="dark"] .bcl-product {
  color-scheme: dark;
  --bc-bg: #0a0a0a;
  --bc-bg-2: #101010;
  --bc-panel: #141414;
  --bc-panel-2: #1f1f1f;
  --bc-panel-3: #2a2a2a;
  --bc-panel-hover: #1a1a1a;
  --bc-edge: #242424;
  --bc-edge-2: #343434;
  --bc-ink: #ededed;
  --bc-ink-dim: #a1a1a1;
  --bc-ink-faint: #707070;
  --bc-ink-ghost: #464646;
  --bc-accent: #318dff;
  --bc-accent-bright: #4ca2ff;
  --bc-accent-dim: #2577e6;
  --bc-accent-deep: #11243d;
  --bc-accent-ink: #ffffff;
}
`;

/* ===========================================================================
   A force-dark subtree (kept for API compatibility, the Geist page mirrors
   cleanly between themes, so the marketing page no longer forces a dark chord;
   apply this only if a section must stay dark in the light theme). Values
   mirror the :root[data-theme="dark"] block in globals.css, if that block
   changes, re-sync these. Because ancestors (.studio, .bcl-product) re-declare
   the --color-* mappings, the mappings are re-declared here too, so they
   resolve against these inline values.
   =========================================================================== */
export const DARK_VARS = {
  colorScheme: "dark",
  "--bc-bg": "#0a0a0a",
  "--bc-bg-2": "#101010",
  "--bc-panel": "#141414",
  "--bc-panel-2": "#1f1f1f",
  "--bc-panel-3": "#2a2a2a",
  "--bc-panel-hover": "#1a1a1a",
  "--bc-edge": "#242424",
  "--bc-edge-2": "#343434",
  "--bc-ink": "#ededed",
  "--bc-ink-dim": "#a1a1a1",
  "--bc-ink-faint": "#707070",
  "--bc-ink-ghost": "#464646",
  "--bc-accent": "#318dff",
  "--bc-accent-bright": "#4ca2ff",
  "--bc-accent-dim": "#2577e6",
  "--bc-accent-deep": "#11243d",
  "--bc-accent-ink": "#ffffff",
  "--bc-bubble-in": "#1d1e23",
  "--bc-bubble-in-ink": "#ecedf1",
  "--bc-bubble-out": "#18375f",
  "--bc-bubble-out-ink": "#dbe8fb",
  "--bc-amber": "#c4a86a",
  "--bc-amber-dim": "#8a784a",
  "--bc-amber-deep": "#1d1a10",
  "--bc-iris": "#8fa0c0",
  "--bc-iris-dim": "#5e6a86",
  "--bc-iris-deep": "#15181f",
  "--bc-whatsapp": "#aab3bd",
  "--bc-linkedin": "#aab3bd",
  "--bc-danger": "#ff453a",
  "--bc-danger-dim": "#b33b34",
  "--bc-shadow-card": "0 1px 2px rgba(0, 0, 0, 0.4)",
  "--bc-shadow-pop": "0 12px 34px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.4)",
  "--bc-shadow-bubble": "none",
  "--bc-av-bg": "26% 24%",
  "--bc-av-fg": "42% 78%",
  "--color-bg": "var(--bc-bg)",
  "--color-bg-2": "var(--bc-bg-2)",
  "--color-panel": "var(--bc-panel)",
  "--color-panel-2": "var(--bc-panel-2)",
  "--color-panel-3": "var(--bc-panel-3)",
  "--color-panel-hover": "var(--bc-panel-hover)",
  "--color-edge": "var(--bc-edge)",
  "--color-edge-2": "var(--bc-edge-2)",
  "--color-ink": "var(--bc-ink)",
  "--color-ink-dim": "var(--bc-ink-dim)",
  "--color-ink-faint": "var(--bc-ink-faint)",
  "--color-ink-ghost": "var(--bc-ink-ghost)",
  "--color-accent": "var(--bc-accent)",
  "--color-accent-bright": "var(--bc-accent-bright)",
  "--color-accent-dim": "var(--bc-accent-dim)",
  "--color-accent-deep": "var(--bc-accent-deep)",
  "--color-accent-ink": "var(--bc-accent-ink)",
} as React.CSSProperties;

/* ===========================================================================
   Reveal: gentle fade-up when scrolled into view. SSR/no-JS safe: `inView`
   starts `null` (unknown), which renders VISIBLE, so server output and the first
   client render match (no hydration mismatch) and no-JS users see everything.
   The IntersectionObserver's first callback then reports the element's real
   visibility: in-viewport elements report `true` immediately (no flash), and
   off-screen ones flip to hidden while still off-screen (invisible), revealing
   once when scrolled to. State is only ever set from the observer callback, never
   synchronously in the effect body.
   =========================================================================== */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) io.disconnect(); // reveal once
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, revealed: inView === null || inView };
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: revealed ? `${delay}ms` : "0ms" }}
      className={cx(
        "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none",
        revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ===========================================================================
   Typography + layout atoms
   =========================================================================== */

/** The lone label device: a Geist Mono kicker in faint ink (spec §3, sentence
    case, never uppercase-tracked). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("font-mono text-[13px] text-ink-faint", className)}>
      {children}
    </div>
  );
}

/** THE site container (spec §5.1): max-w-[1080px], px-6, same as the studio
    header/footer, so the product page sits on the same grid. */
export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-[1080px] px-6", className)}>{children}</div>;
}

/* ===========================================================================
   Product-UI facsimile atoms: pixel-true to the shipped Intercom skin.
   =========================================================================== */

/** A chat bubble in the exact product tokens (grey-in / pale-blue-out). */
export function Bubble({
  side,
  children,
  ring = false,
  share = false,
  flash = false,
  synced = false,
  className,
}: {
  side: "in" | "out";
  children: React.ReactNode;
  /** Hairline accent ring to mark the one deal-relevant line. */
  ring?: boolean;
  /** Show the per-message "Share" ghost affordance at the corner. */
  share?: boolean;
  /** One-shot accent flash (the signature share moment). */
  flash?: boolean;
  /** Render the small "Synced" confirmation under the bubble. */
  synced?: boolean;
  className?: string;
}) {
  const out = side === "out";
  return (
    <div className={cx("flex flex-col", out ? "items-end" : "items-start", className)}>
      <div className="group relative max-w-[88%]">
        <div
          className={cx(
            "rounded-bubble px-3 py-2 text-[13px] leading-snug",
            out
              ? "bg-bubble-out text-bubble-out-ink rounded-br-sm"
              : "bg-bubble-in text-bubble-in-ink rounded-bl-sm",
            ring && "ring-2 ring-accent/45",
            flash && "bcl-flash"
          )}
        >
          {children}
        </div>
        {share && (
          <span
            className="absolute -top-2.5 right-1.5 inline-flex items-center gap-1 rounded-full border border-edge bg-panel px-2 py-0.5 text-[10px] font-medium text-ink-dim shadow-card"
            aria-hidden="true"
          >
            <Share2 size={10} strokeWidth={2.25} />
            Share
          </span>
        )}
      </div>
      {synced && (
        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-accent">
          <CheckCheck size={11} strokeWidth={2.5} />
          Synced to Attio
        </span>
      )}
    </div>
  );
}

export function DayDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-2 flex items-center justify-center">
      <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
        {children}
      </span>
    </div>
  );
}

/** A small lock chip, the quiet "Private" state. */
export function LockChip({ label = "Private" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-panel-2 px-2 py-[1px] text-[11px] font-medium text-ink-dim">
      <Lock size={10} strokeWidth={2.5} className="text-amber" />
      {label}
    </span>
  );
}

/** A confidence meter, matching the app's ConfidenceBar; fills on scroll-in. */
export function Meter({
  label,
  value,
  rejected = false,
}: {
  label: string;
  value: number;
  /** A struck-through rejected candidate (shown muted, never filled). */
  rejected?: boolean;
}) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const pct = Math.max(0, Math.min(100, value));
  const bright = pct > 90;
  return (
    <div ref={ref} className="flex items-center gap-3">
      <span
        className={cx(
          "w-[108px] shrink-0 text-[12px]",
          rejected ? "text-ink-faint line-through" : "text-ink-dim"
        )}
      >
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-3">
        <div
          className={cx(
            "h-full rounded-full transition-[width] duration-[900ms] ease-out motion-reduce:transition-none",
            rejected ? "bg-ink-ghost" : bright ? "bg-accent-bright" : "bg-accent"
          )}
          style={{ width: `${revealed ? pct : 0}%` }}
        />
      </div>
      <span
        className={cx(
          "w-9 text-right text-[11px] tabular-nums",
          rejected ? "text-ink-faint" : "text-ink-dim"
        )}
      >
        {pct}%
      </span>
    </div>
  );
}

/** A Details-panel section header + body, mirroring the app's Section primitive. */
export function SidebarSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("border-b border-edge px-4 py-3 last:border-b-0", className)}>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-faint">
        {title}
      </div>
      {children}
    </section>
  );
}

export function AttrRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1">
      <span className="w-16 shrink-0 text-[11px] text-ink-faint">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right text-[13px] text-ink">{value}</span>
    </div>
  );
}

/** The linked-record card from the Details sidebar. */
export function LinkedRecordCard({
  name,
  crm = "Attio",
  type = "person",
  basis = "Phone match · 100% match",
  flash = false,
}: {
  name: string;
  crm?: string;
  type?: string;
  basis?: string;
  flash?: boolean;
}) {
  return (
    <div className={cx("rounded-xl border border-edge bg-panel p-3 shadow-card", flash && "bcl-flash")}>
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-ink ring-1 ring-inset ring-edge-2">
          <User size={15} strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink">{name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Tag tone="neutral">{crm}</Tag>
            <Tag tone="neutral">{type}</Tag>
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-edge pt-2 text-[11px] text-ink-faint">
        <span>{basis.split(" · ")[0]}</span>
        <span className="tabular-nums text-ink-dim">{basis.split(" · ")[1] ?? ""}</span>
      </div>
    </div>
  );
}

/** A small live pulse dot (own implementation, no legacy-class dependency). */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cx("relative inline-flex h-1.5 w-1.5 shrink-0", className)}>
      <span className="bcl-pulse absolute inset-0 rounded-full text-accent" />
      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-accent" />
    </span>
  );
}

/** The Sync stats block. */
export function SyncStat({
  synced,
  total,
  privateCount,
  auto = true,
}: {
  synced: number;
  total: number;
  privateCount: number;
  auto?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <CheckCheck size={13} strokeWidth={2.5} className="text-accent" />
        <span className="text-[11px] text-ink-dim">
          <span className="font-semibold tabular-nums text-ink">{synced}</span> of{" "}
          <span className="font-semibold tabular-nums text-ink">{total}</span> synced
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-ink-faint">
        <Lock size={12} strokeWidth={2.5} className="text-amber" />
        <span className="text-[11px]">
          <span className="tabular-nums text-amber">{privateCount}</span> private
        </span>
      </div>
      {auto && (
        <div className="flex items-center gap-1.5 border-t border-edge pt-2">
          <LiveDot />
          <span className="text-[11px] text-ink-faint">Auto-sync on</span>
        </div>
      )}
    </div>
  );
}

/** A CRM note card, what a synced message becomes. */
export function NoteCard({
  source = "WhatsApp",
  when,
  who,
  body,
  flash = false,
}: {
  source?: string;
  when: string;
  who: string;
  body: string;
  flash?: boolean;
}) {
  return (
    <div className={cx("rounded-xl border border-edge bg-panel p-3.5 shadow-card", flash && "bcl-flash")}>
      <div className="mb-1.5 flex items-center gap-2 text-[11px] text-ink-faint">
        <span className="rounded bg-panel-3 px-1.5 py-[1px] font-medium text-ink-dim">[{source}]</span>
        <span>{when}</span>
      </div>
      <div className="text-[12px] font-semibold text-ink">{who}</div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">{body}</p>
    </div>
  );
}

/** A conversation-list row (for the hero + privacy mockups). */
export function ConvRow({
  name,
  preview,
  selected = false,
  shared = false,
  locked = true,
  unread = 0,
}: {
  name: string;
  preview: string;
  selected?: boolean;
  shared?: boolean;
  locked?: boolean;
  unread?: number;
}) {
  return (
    <div
      className={cx(
        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2",
        selected ? "bg-panel-2" : "hover:bg-panel-hover"
      )}
    >
      {selected && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-accent" />}
      <Avatar name={name} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[12.5px] font-semibold text-ink">{name}</span>
          {locked && !shared && <Lock size={10} strokeWidth={2.5} className="shrink-0 text-amber" />}
        </div>
        <div className="truncate text-[11.5px] text-ink-faint">{preview}</div>
      </div>
      {shared ? (
        <Tag tone="wire">Shared</Tag>
      ) : unread > 0 ? (
        <span className="min-w-[16px] rounded-full bg-accent px-1 text-center text-[9px] font-semibold leading-4 text-white">
          {unread}
        </span>
      ) : null}
    </div>
  );
}

export function FilterTabs({ active = "Private" }: { active?: string }) {
  return (
    <div className="flex items-center gap-1 text-[11.5px]">
      {["All", "Unread", "Shared", "Private"].map((t) => (
        <span
          key={t}
          className={cx(
            "rounded-md px-2 py-0.5 font-medium",
            t === active ? "bg-accent/12 text-accent" : "text-ink-faint"
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ===========================================================================
   The "what to screenshot" guidance marker. Built mockups are the live visual;
   each carries a small hint telling the founder which real screenshot to drop
   in its place. Visible in development (so you see what to capture) but NEVER on
   a production build: the root "/" is public, so these internal notes must not
   ship to visitors. Force them on in any build with NEXT_PUBLIC_SHOW_SHOT_HINTS=1.
   =========================================================================== */
export const SHOW_SHOT_HINTS =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_SHOT_HINTS === "1";

export function ShotHint({ children }: { children: React.ReactNode }) {
  if (!SHOW_SHOT_HINTS) return null;
  return (
    <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-dashed border-edge-2 bg-panel-2/60 px-2.5 py-1.5 text-[10.5px] leading-relaxed text-ink-faint">
      <Camera size={12} strokeWidth={2} className="mt-px shrink-0" />
      <span>
        <span className="font-semibold text-ink-dim">Screenshot to drop in:</span> {children}
      </span>
    </div>
  );
}

/** The Vercel-grade window frame for built mockups + real screenshots alike:
    rounded-xl on a subtle edge-2 hairline, no drop shadow. Inside it, the
    `.bcl-product` scope restores the Intercom product palette (see LANDING_CSS),
    so the depiction stays pixel-true to the shipped app while the page around
    it is pure Geist. */
export function Frame({
  children,
  className,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Kept for API compatibility; adds the soft pop elevation (hero use only). */
  glow?: boolean;
}) {
  return (
    <div
      className={cx(
        "bcl-product overflow-hidden rounded-xl border border-edge-2 bg-panel",
        glow && "shadow-pop",
        className
      )}
    >
      {children}
    </div>
  );
}
