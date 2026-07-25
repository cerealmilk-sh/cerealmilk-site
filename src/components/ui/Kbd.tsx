import { cx } from "@/components/ui/cx";

/** A single keycap, a bordered mono chip (VERCEL-GEIST-SPEC.md §4). */
export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cx(
        "inline-flex min-w-[18px] items-center justify-center rounded-md border border-edge-2 bg-panel-2 px-1.5 py-px font-mono text-[12px] text-ink-dim",
        className
      )}
    >
      {children}
    </kbd>
  );
}

/** A sequence of keycaps, e.g. ⌘ K. */
export function KbdSeq({
  keys,
  className,
}: {
  keys: string[];
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-1", className)}>
      {keys.map((k, i) => (
        <Kbd key={i}>{k}</Kbd>
      ))}
    </span>
  );
}
