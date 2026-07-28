import { cx } from "@/components/ui/cx";

export type Tone =
  | "accent"
  | "wire"
  | "amber"
  | "iris"
  | "neutral"
  | "danger"
  | "whatsapp"
  | "linkedin"
  | "holo";

const ACCENT_TONE = {
  soft: "text-accent bg-accent/12",
  solid: "bg-accent text-white",
};

const TONES: Record<Exclude<Tone, "holo">, { soft: string; solid: string }> = {
  // "accent", the brand blue; used for Shared / synced. "wire" is a back-compat alias.
  accent: ACCENT_TONE,
  wire: ACCENT_TONE,
  amber: { soft: "text-amber bg-amber/12", solid: "bg-amber/20 text-amber" },
  iris: { soft: "text-iris bg-iris/12", solid: "bg-iris/20 text-iris" },
  neutral: { soft: "text-ink-dim bg-panel-3", solid: "bg-panel-3 text-ink-dim" },
  danger: { soft: "text-danger bg-danger/12", solid: "bg-danger/20 text-danger" },
  whatsapp: { soft: "text-ink-dim bg-panel-3", solid: "bg-panel-3 text-ink-dim" },
  linkedin: { soft: "text-ink-dim bg-panel-3", solid: "bg-panel-3 text-ink-dim" },
};

/**
 * Tag, a soft, sentence-case pill: rounded, quiet, proportional type (no
 * uppercase, no tracking). Use it sparingly for states like "Shared".
 * `tone="holo"` renders as a soft accent chip.
 */
export function Tag({
  tone = "neutral",
  solid = false,
  children,
  icon,
  className,
  title,
}: {
  tone?: Tone;
  /** louder, filled treatment (e.g. the active "Shared" state). */
  solid?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const base =
    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-[1px] text-label";

  const t = tone === "holo" ? TONES.accent : TONES[tone];
  return (
    <span title={title} className={cx(base, solid ? t.solid : t.soft, className)}>
      {icon}
      {children}
    </span>
  );
}
