// The Vercel/Geist furniture kit (VERCEL-GEIST-SPEC.md §4), the ONLY building
// blocks page agents use for Vercel-style chrome: pills, mono snippets, code
// windows, section headings, hairline feature grids, crosshair markers, mono
// badges, and tab rows. All server components; the copy affordance is the one
// client island (see copy-button.tsx).

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ui/cx";
import type { NextStop } from "@/lib/journeys";
import { CopyButton } from "./copy-button";

/* ---------------------------------------------------------------------------
   PillButton: the reference-system CTA pair (square, quiet). `primary` is the
   translucent brand-tinted button (bg-brand/10, tinted hairline, bright brand
   label); `secondary` is the bordered neutral button. Renders a Next <Link>
   for internal hrefs and a plain <a> for external ones. The name survives
   from the pill era; the chrome is the reference system's.
--------------------------------------------------------------------------- */

export type PillButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  /** sm = header pills (h-8), md = default (h-10), lg = hero (h-12). */
  size?: "sm" | "md" | "lg";
  external?: boolean;
  /** rel for the <a> branch; defaults to "noopener". Partner CTAs pass
   *  outboundRel(tool) to emit "sponsored nofollow …" (see stack.ts). */
  rel?: string;
  className?: string;
  "aria-label"?: string;
  /** Fire a named analytics event on click (see public/consent-analytics.js). */
  "data-track"?: string;
  "data-track-props"?: string;
};

const PILL_SIZES: Record<NonNullable<PillButtonProps["size"]>, string> = {
  sm: "px-2 py-2 text-sm sm:px-4",
  md: "px-4 py-2.5 text-sm",
  lg: "px-3 py-2 text-sm sm:px-6 sm:py-3 sm:text-base",
};

const PILL_VARIANTS: Record<NonNullable<PillButtonProps["variant"]>, string> = {
  primary:
    "border border-brand/20 bg-brand/10 text-brand-light hover:border-brand/35 hover:bg-brand/15",
  secondary:
    "border border-border bg-background text-foreground hover:bg-muted",
};

export function PillButton({
  href,
  children,
  variant = "primary",
  size = "md",
  external,
  rel,
  className,
  ...rest
}: PillButtonProps) {
  const isExternal =
    external ?? (href.startsWith("http") || href.startsWith("mailto:"));
  const cls = cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-normal transition-colors",
    PILL_SIZES[size],
    PILL_VARIANTS[variant],
    className
  );
  return isExternal ? (
    <a href={href} rel={rel ?? "noopener"} className={cls} {...rest}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------------------------
   MonoSnippet, the `$ npm i ai` affordance: a rounded-full bordered strip in
   Geist Mono with an optional copy button.
--------------------------------------------------------------------------- */

export type MonoSnippetProps = {
  command: string;
  prompt?: string;
  copy?: boolean;
  className?: string;
};

export function MonoSnippet({
  command,
  prompt = "$",
  copy = false,
  className,
}: MonoSnippetProps) {
  return (
    <div
      className={cx(
        "inline-flex h-12 items-center gap-3 rounded-full border border-edge-2 px-6 font-mono text-[14px]",
        className
      )}
    >
      <span aria-hidden className="select-none text-ink-faint">
        {prompt}
      </span>
      <span className="whitespace-nowrap text-ink">{command}</span>
      {copy && <CopyButton text={command} className="-mr-2" />}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CodeWindow: a traffic-light code window on #0a0a0a. Snippets are static,
   hand-tokenized JSX (no highlighting library): color the spans with the §2
   syntax palette (SYNTAX below). Pass `lines` for a ghost line-number gutter,
   or `children` for a free-form body.
--------------------------------------------------------------------------- */

/** The §2 syntax palette, use for hand-tokenized spans inside CodeWindow. */
export const SYNTAX = {
  keyword: "#ff4e8b",
  string: "#62c073",
  function: "#bf7af0",
  property: "#79c0ff",
  plain: "#ededed",
  comment: "#666666",
} as const;

const TRAFFIC = ["#ff5f57", "#febc2e", "#28c840"] as const;

export type CodeWindowProps = {
  /** Filename shown centered in the header row. */
  title?: string;
  /** One node per line, rendered with a line-number gutter. */
  lines?: React.ReactNode[];
  /** Free-form body (used when `lines` is omitted). */
  children?: React.ReactNode;
  className?: string;
};

export function CodeWindow({ title, lines, children, className }: CodeWindowProps) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl border border-edge-2 bg-bg-2",
        className
      )}
    >
      <div className="relative flex h-10 items-center border-b border-edge px-4">
        <span aria-hidden className="flex items-center gap-1.5">
          {TRAFFIC.map((c) => (
            <span
              key={c}
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </span>
        {title && (
          <span className="absolute inset-x-0 text-center font-mono text-[13px] text-ink-dim">
            {title}
          </span>
        )}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13.5px] leading-[1.7] text-ink">
        {lines ? (
          <code className="grid">
            {lines.map((line, i) => (
              <span key={i} className="grid grid-cols-[2rem_1fr]">
                <span aria-hidden className="select-none text-ink-ghost">
                  {i + 1}
                </span>
                <span>{line}</span>
              </span>
            ))}
          </code>
        ) : (
          <code>{children}</code>
        )}
      </pre>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SectionHeading: mono kicker, semibold tight h2 (or h1), ink-dim lede.
   Always left-aligned.
--------------------------------------------------------------------------- */

export type SectionHeadingProps = {
  title: React.ReactNode;
  kicker?: string;
  /** Optional lucide glyph rendered before the kicker (the Vercel eyebrow). */
  icon?: LucideIcon;
  lede?: React.ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
};

export function SectionHeading({
  title,
  kicker,
  icon: Icon,
  lede,
  as: Tag = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div id={id} className={className}>
      {kicker &&
        (Icon ? (
          <Eyebrow icon={Icon} className="mb-3">
            {kicker}
          </Eyebrow>
        ) : (
          <p className="mb-3 font-mono text-[13px] text-ink-faint">{kicker}</p>
        ))}
      <Tag
        className={cx(
          "text-ink",
          Tag === "h1"
            ? "text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.06]"
            : "text-[clamp(2.25rem,4vw,2.75rem)] leading-[1.1]"
        )}
      >
        {title}
      </Tag>
      {lede && (
        <p className="mt-4 max-w-xl text-[18px] leading-[1.6] text-ink-dim">
          {lede}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   FeatureGrid / FeatureCell: the collapsed-border cell grid. Structure comes
   from the 1px `gap-px bg-edge` seams; cells are bg-bg. Optional crosshairs
   sit at the grid's outer corners.
--------------------------------------------------------------------------- */

export type FeatureGridProps = {
  cols?: 2 | 3 | 4;
  crosshairs?: boolean;
  children: React.ReactNode;
  className?: string;
};

const GRID_COLS: Record<NonNullable<FeatureGridProps["cols"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function FeatureGrid({
  cols = 3,
  crosshairs = false,
  children,
  className,
}: FeatureGridProps) {
  return (
    <div className={cx("relative", className)}>
      {crosshairs && (
        <>
          <Crosshair position="tl" />
          <Crosshair position="br" />
        </>
      )}
      <div
        className={cx(
          "grid grid-cols-1 gap-px border border-edge bg-edge",
          GRID_COLS[cols]
        )}
      >
        {children}
      </div>
    </div>
  );
}

export type FeatureCellProps = {
  title: React.ReactNode;
  /** Mono 14px "index-style" title instead of the 16px sans title. */
  mono?: boolean;
  href?: string;
  children?: React.ReactNode;
  className?: string;
};

export function FeatureCell({
  title,
  mono = false,
  href,
  children,
  className,
}: FeatureCellProps) {
  const body = (
    <>
      {/* The un-layered `.studio h3` rule pins font-family, so the mono
          variant re-points it inline (inline style beats un-layered CSS). */}
      <h3
        className={cx(
          "text-ink",
          mono ? "text-[14px] font-medium" : "text-[16px] font-medium"
        )}
        style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
      >
        {title}
      </h3>
      {children && (
        <div className="mt-2 text-[14px] leading-relaxed text-ink-dim">
          {children}
        </div>
      )}
    </>
  );
  const cls = cx("block bg-bg p-8 lg:p-10", className);
  if (!href) return <div className={cls}>{body}</div>;
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  return isExternal ? (
    <a href={href} rel="noopener" className={cx(cls, "transition-colors hover:bg-panel-2")}>
      {body}
    </a>
  ) : (
    <Link href={href} className={cx(cls, "transition-colors hover:bg-panel-2")}>
      {body}
    </Link>
  );
}

/* ---------------------------------------------------------------------------
   Crosshair: the decorative `+` at grid intersections. Use sparingly: one or
   two per section, at real hairline intersections.
--------------------------------------------------------------------------- */

export type CrosshairProps = {
  position?: "tl" | "tr" | "bl" | "br";
  className?: string;
};

const CROSSHAIR_POS: Record<NonNullable<CrosshairProps["position"]>, string> = {
  tl: "-left-2 -top-2",
  tr: "-right-2 -top-2",
  bl: "-bottom-2 -left-2",
  br: "-bottom-2 -right-2",
};

export function Crosshair({ position = "tl", className }: CrosshairProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={cx(
        "pointer-events-none absolute z-10 h-4 w-4 text-ink-ghost",
        CROSSHAIR_POS[position],
        className
      )}
    >
      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Badge: the `[NEW]`-style mono chip.
--------------------------------------------------------------------------- */

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded border border-edge-2 px-1.5 py-0.5 font-mono text-[11px] leading-none text-ink-dim",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   TabRow: a static bordered strip of mono cells (Vercel's Text / Speech /
   Transcription grid). Purely presentational; `active` marks the lit cell.
--------------------------------------------------------------------------- */

export type TabRowProps = {
  items: string[];
  /** Index of the lit cell; pass -1 for none. Defaults to the first. */
  activeIndex?: number;
  className?: string;
};

export function TabRow({ items, activeIndex = 0, className }: TabRowProps) {
  return (
    <div
      className={cx(
        "inline-flex flex-wrap gap-px border border-edge bg-edge",
        className
      )}
    >
      {items.map((item, i) => (
        <span
          key={item}
          className={cx(
            "px-6 py-4 font-mono text-[13px]",
            i === activeIndex ? "bg-panel-2 text-ink" : "bg-bg text-ink-dim"
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   LinkCard: the one linked-cell primitive. Replaces the hand-rolled
   "group flex h-full flex-col bg-bg p-8 hover:bg-panel-2 lg:p-10" chrome that
   was copy-pasted across the homepage and the index pages. A mono kicker, a
   title (16px sans, or mono for index-style rows), a blurb, and a footer CTA
   line with an arrow that sharpens on hover. Renders a Next <Link> for internal
   hrefs and a plain <a> for external ones.
--------------------------------------------------------------------------- */

export type LinkCardProps = {
  href: string;
  title: React.ReactNode;
  kicker?: string;
  blurb?: React.ReactNode;
  /** Footer line (defaults to "Learn more"); the arrow is appended. */
  cta?: string;
  /** Mono title (index-style) instead of the 16px sans title. */
  monoTitle?: boolean;
  external?: boolean;
  className?: string;
};

export function LinkCard({
  href,
  title,
  kicker,
  blurb,
  cta = "Learn more",
  monoTitle = false,
  external,
  className,
}: LinkCardProps) {
  const isExternal =
    external ?? (href.startsWith("http") || href.startsWith("mailto:"));
  const arrow = isExternal ? "↗" : "→";
  const cls = cx(
    "group flex h-full flex-col bg-bg p-8 transition-colors hover:bg-panel-2 lg:p-10",
    className
  );
  const body = (
    <>
      {kicker && (
        <p className="font-mono text-[13px] text-ink-faint">{kicker}</p>
      )}
      <h3
        className={cx(
          "text-ink",
          kicker && "mt-3",
          monoTitle ? "text-[15px] font-semibold" : "text-[16px] font-medium"
        )}
        style={monoTitle ? { fontFamily: "var(--font-mono)", letterSpacing: "0" } : undefined}
      >
        {title}
      </h3>
      {blurb && (
        <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-dim">
          {blurb}
        </p>
      )}
      <p className="mt-6 font-mono text-[13px] text-ink-faint transition-colors group-hover:text-ink">
        {cta}{" "}
        <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">
          {arrow}
        </span>
      </p>
    </>
  );
  return isExternal ? (
    <a href={href} rel="noopener" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}

/* ---------------------------------------------------------------------------
   StatStrip: a hairline row of big numbers, the focal point a page's proof
   otherwise buries in prose. Collapsed-border cells (like FeatureGrid); each
   cell is a display-weight value over a mono/dim label, optionally a link.
--------------------------------------------------------------------------- */

export type Stat = {
  value: string;
  label: string;
  href?: string;
};

export type StatStripProps = {
  items: Stat[];
  className?: string;
};

const STAT_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function StatStrip({ items, className }: StatStripProps) {
  const cols = STAT_COLS[items.length] ?? "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <dl
      className={cx(
        "grid grid-cols-1 gap-px border border-edge bg-edge",
        cols,
        className
      )}
    >
      {items.map((s) => {
        const inner = (
          <>
            <dt className="x-display tabular text-[28px] leading-none text-ink">
              {s.value}
            </dt>
            <dd className="mt-2.5 text-[13px] leading-relaxed text-ink-dim">
              {s.label}
            </dd>
          </>
        );
        return s.href ? (
          <Link
            key={s.label}
            href={s.href}
            className="group flex flex-col bg-bg p-6 transition-colors hover:bg-panel-2 lg:p-8"
          >
            {inner}
          </Link>
        ) : (
          <div key={s.label} className="flex flex-col bg-bg p-6 lg:p-8">
            {inner}
          </div>
        );
      })}
    </dl>
  );
}

/* ---------------------------------------------------------------------------
   NextStops: the "keep reading" wayfinder rendered at the end of a page (by
   Terminus, from src/lib/journeys.ts). A hairline row list, the same visual
   language as the homepage "Latest" list and the /services jobs list, so a
   visitor always has a curated next step deeper into the site. Width-agnostic:
   reads well in both the 1080px column and the 46rem article column.
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   Eyebrow, the section eyebrow (Vercel's "⌖ COLLABORATION"): a tiny lucide
   glyph + a mono micro-label. Calm, never shouting: sentence/Capitalized per
   §3, not uppercase-tracked. The one place a small icon earns its keep.
--------------------------------------------------------------------------- */

export function Eyebrow({
  icon: Icon,
  children,
  id,
  className,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <p
      id={id}
      className={cx("flex items-center gap-2 font-mono text-[13px] text-ink-faint", className)}
    >
      {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden className="text-ink-faint" />}
      {children}
    </p>
  );
}

/* ---------------------------------------------------------------------------
   SplitHeading, the two-column section header (Vercel's Enterprise sections):
   an eyebrow + big h2 on the left, a dimmed lede offset to the right. Stacks on
   mobile. The counterpoint to SectionHeading's single-column stack, use it to
   break the page's rhythm on a marquee section.
--------------------------------------------------------------------------- */

export function SplitHeading({
  title,
  kicker,
  icon,
  lede,
  id,
  className,
}: {
  title: React.ReactNode;
  kicker?: string;
  icon?: LucideIcon;
  lede?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const Icon = icon;
  return (
    <div
      id={id}
      className={cx(
        "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-end lg:gap-16",
        className
      )}
    >
      <div>
        {kicker &&
          (Icon ? (
            <Eyebrow icon={Icon} className="mb-3">
              {kicker}
            </Eyebrow>
          ) : (
            <p className="mb-3 font-mono text-[13px] text-ink-faint">{kicker}</p>
          ))}
        <h2 className="text-ink text-[clamp(2.25rem,4vw,2.75rem)] leading-[1.1]">
          {title}
        </h2>
      </div>
      {lede && (
        <p className="text-[16px] leading-[1.6] text-ink-dim lg:pb-1.5">{lede}</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CategoryTag: a soft colored-outline taxonomy pill (Vercel's template
   categories: Starter / Ecommerce / AI …). The ONE place beyond the blue and
   the data-viz trio that a marketing surface carries hue, restrained: a mid-
   tone stroke + faint tint + colored label, theme-adaptive via color-mix.
--------------------------------------------------------------------------- */

export type CategoryTone =
  | "blue"
  | "green"
  | "violet"
  | "amber"
  | "cyan"
  | "pink"
  | "indigo"
  | "rose";

export const CATEGORY_TONES: Record<CategoryTone, string> = {
  blue: "#4f92ea",
  green: "#35a56a",
  violet: "#9270db",
  amber: "#c2903f",
  cyan: "#37a6ad",
  pink: "#cf6fa0",
  indigo: "#6d7bde",
  rose: "#d06b63",
};

export function CategoryTag({
  tone,
  children,
  className,
}: {
  tone: CategoryTone;
  children: React.ReactNode;
  className?: string;
}) {
  const hue = CATEGORY_TONES[tone];
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-medium leading-none",
        className
      )}
      style={{
        color: hue,
        borderColor: `color-mix(in srgb, ${hue} 42%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${hue} 11%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   BigStatRow, oversized display numerals (Vercel's "15M+ / 4M+ / 40B+"): a
   borderless row, each cell a huge tabular value over an uppercase micro-label
   and an optional dimmed line. Distinct from the hairline StatStrip. This is
   for a handful of short, punchy numbers that deserve to be the focal point.
--------------------------------------------------------------------------- */

export type BigStat = {
  value: string;
  label: string;
  note?: string;
  href?: string;
};

export function BigStatRow({
  items,
  className,
}: {
  items: BigStat[];
  className?: string;
}) {
  const cols =
    items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <dl className={cx("grid grid-cols-1 gap-x-8 gap-y-12", cols, className)}>
      {items.map((s) => {
        const inner = (
          <>
            <dt className="x-display tabular text-[clamp(3rem,6vw,4.5rem)] leading-[0.95] text-ink">
              {s.value}
            </dt>
            <dd>
              <span className="mt-4 block text-[13px] font-semibold uppercase tracking-[0.06em] text-ink">
                {s.label}
              </span>
              {s.note && (
                <span className="mt-3 block max-w-[26ch] text-[14px] leading-relaxed text-ink-dim">
                  {s.note}
                </span>
              )}
            </dd>
          </>
        );
        return s.href ? (
          <Link key={s.label} href={s.href} className="group block">
            {inner}
          </Link>
        ) : (
          <div key={s.label}>{inner}</div>
        );
      })}
    </dl>
  );
}

export function NextStops({
  stops,
  heading = "Keep reading",
  className,
}: {
  stops: NextStop[];
  heading?: string;
  className?: string;
}) {
  if (stops.length === 0) return null;
  return (
    <nav aria-label={heading} className={cx("mt-20 border-t border-edge pt-10", className)}>
      <p className="font-mono text-[13px] text-ink-faint">{heading}</p>
      <ul className="mt-5 border-t border-edge">
        {stops.map((s) => {
          const isExternal =
            s.href.startsWith("http") || s.href.startsWith("mailto:");
          const arrow = isExternal ? "↗" : "→";
          const inner = (
            <>
              <span className="min-w-0 flex-1">
                <span className="text-[15px] font-medium text-ink group-hover:underline group-hover:underline-offset-4">
                  {s.title}
                </span>
                <span className="mt-1 block max-w-[56ch] text-[13.5px] leading-relaxed text-ink-dim">
                  {s.blurb}
                </span>
              </span>
              <span className="mt-0.5 shrink-0">
                <Badge>{s.kicker}</Badge>
              </span>
              <span
                aria-hidden
                className="mt-1 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
              >
                {arrow}
              </span>
            </>
          );
          return (
            <li key={s.href} className="border-b border-edge">
              {isExternal ? (
                <a href={s.href} rel="noopener" className="group flex items-start gap-4 py-4">
                  {inner}
                </a>
              ) : (
                <Link href={s.href} className="group flex items-start gap-4 py-4">
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
