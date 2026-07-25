import { cx } from "@/components/ui/cx";

// DotField, a hero backdrop ported from agentmail.to: a fine engineered dot
// lattice, brightest up top, dissolving into the page below. Pure CSS (see
// `.x-dotfield` in globals.css): no DOM weight, self-themes off `--color-ink`.
//
// Drop it as the first child of a `relative isolate overflow-hidden` container
// and keep the real content in a sibling `relative z-10` wrapper, so the field
// sits behind. It's aria-hidden and non-interactive.
export function DotField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx(
        "x-dotfield pointer-events-none absolute inset-0 z-0",
        className
      )}
    />
  );
}
