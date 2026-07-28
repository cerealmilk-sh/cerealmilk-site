"use client";

import { cx } from "@/components/ui/cx";

export interface SegmentOption<T extends string> {
  value: T;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
}

/**
 * Segmented: a small radio-group segmented control (Intercom's inline
 * filters / view switches). The selected segment lifts onto a panel surface
 * with a soft shadow; the rest stay quiet ghost buttons. Accessible
 * (role="radiogroup" + aria-checked).
 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (next: T) => void;
  ariaLabel?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const seg =
    size === "sm"
      ? "h-6 gap-1 px-2 text-[11px]"
      : "h-7 gap-1.5 px-2.5 text-xs";
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx(
        "inline-flex items-center gap-0.5 rounded-lg border border-edge bg-bg-2 p-0.5",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => !active && onChange(o.value)}
            className={cx(
              "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-100",
              seg,
              active
                ? "bg-panel text-ink shadow-card"
                : "text-ink-faint hover:text-ink-dim"
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
