import { cx } from "@/components/ui/cx";

/**
 * MarkGlyph, the 80x mark: a central node held open between two
 * parties' arcs (a private channel). Monochrome (currentColor).
 */
export function MarkGlyph({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M8.2 8.4a5 5 0 0 0 0 7.2" opacity="0.95" />
      <path d="M5.4 5.6a9 9 0 0 0 0 12.8" opacity="0.4" />
      <path d="M15.8 8.4a5 5 0 0 1 0 7.2" opacity="0.95" />
      <path d="M18.6 5.6a9 9 0 0 1 0 12.8" opacity="0.4" />
    </svg>
  );
}

/**
 * MarkTile, the app icon: the mark on a soft rounded square, flat and calm.
 * `holo` fills it with the accent (white mark) for the active state.
 */
export function MarkTile({
  size = 30,
  holo = false,
  className,
}: {
  size?: number;
  holo?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "flex items-center justify-center rounded-[9px] ring-1 ring-inset",
        holo ? "bg-accent text-white ring-transparent" : "bg-panel-2 text-ink ring-edge",
        className
      )}
      style={{ width: size, height: size }}
    >
      <MarkGlyph size={Math.round(size * 0.56)} />
    </span>
  );
}

/**
 * Wordmark, the "80x" lockup: the display face, tight, with an
 * optional leading tile. No caps, no tracking.
 */
export function Wordmark({
  withTile = false,
  className,
  tileSize = 26,
}: {
  withTile?: boolean;
  className?: string;
  tileSize?: number;
}) {
  return (
    <span className={cx("flex items-center gap-2 select-none", className)}>
      {withTile && <MarkTile size={tileSize} />}
      <span className="bc-display text-[15px] text-ink">80x</span>
    </span>
  );
}
