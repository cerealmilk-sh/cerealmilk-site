import { cx } from "@/components/ui/cx";

/**
 * Frame: a simple layout passthrough. It draws no border or decoration; it
 * just wraps its children in a positioned span. The bracket/inset props are
 * accepted but unused, kept only so existing callers continue to work.
 */
export function Frame({
  children,
  className,
  // accepted for API compatibility; no longer drawn
  cornerClass: _cornerClass,
  arm: _arm,
  thickness: _thickness,
  inset: _inset,
  inline = true,
}: {
  children: React.ReactNode;
  className?: string;
  cornerClass?: string;
  arm?: number;
  thickness?: number;
  inset?: number;
  inline?: boolean;
}) {
  return (
    <span className={cx(inline ? "relative inline-flex" : "relative flex", className)}>
      {children}
    </span>
  );
}
