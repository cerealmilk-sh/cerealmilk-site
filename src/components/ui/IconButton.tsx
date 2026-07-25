"use client";

import { cx } from "@/components/ui/cx";

/** Square icon-only button: ghost by default, optional active (lit) state. */
export function IconButton({
  active = false,
  size = 30,
  className,
  children,
  ...rest
}: {
  active?: boolean;
  size?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      style={{ width: size, height: size, ...rest.style }}
      className={cx(
        "flex shrink-0 items-center justify-center rounded-lg transition-colors duration-100 disabled:cursor-default disabled:opacity-60 disabled:saturate-0",
        active
          ? "bg-panel-3 text-ink"
          : "text-ink-faint hover:bg-panel-2 hover:text-ink-dim",
        className
      )}
    >
      {children}
    </button>
  );
}
