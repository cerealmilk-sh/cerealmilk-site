import { cx } from "@/components/ui/cx";
import type { Tone } from "@/components/ui/Tag";

const DOT: Record<Exclude<Tone, "holo">, string> = {
  // "accent" is canonical; "wire" is a back-compat alias for the same color.
  accent: "text-wire",
  wire: "text-wire",
  amber: "text-amber",
  iris: "text-iris",
  neutral: "text-ink-faint",
  danger: "text-danger",
  whatsapp: "text-whatsapp",
  linkedin: "text-linkedin",
};

/**
 * SignalDot: a status point. `live` adds a soft pulse ring for an active
 * connection. `tone="holo"` gives the dot a filled accent treatment.
 */
export function SignalDot({
  tone = "accent",
  live = false,
  size = 7,
  className,
  title,
}: {
  tone?: Tone;
  live?: boolean;
  size?: number;
  className?: string;
  title?: string;
}) {
  const holo = tone === "holo";
  return (
    <span
      title={title}
      aria-hidden="true"
      className={cx(
        "inline-block shrink-0 rounded-full",
        holo ? "bc-holo-bg text-wire" : cx("bg-current", DOT[tone]),
        live && "bc-live-dot",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
