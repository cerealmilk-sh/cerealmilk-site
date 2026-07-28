"use client";

import { LoaderCircle } from "lucide-react";
import { cx } from "@/components/ui/cx";

type Variant = "primary" | "secondary" | "transmit" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

// Buttons are Geist pills: rounded-full, 500 weight, flat fills, no shadows.
const SIZES: Record<Size, string> = {
  sm: "h-7 px-3 text-[13px] gap-2 rounded-full",
  md: "h-8 px-3.5 text-[14px] gap-2 rounded-full",
};

const VARIANTS: Record<Variant, string> = {
  // The primary affordance, the accent pill (white-on-black in the studio's
  // dark theme; the product accent inside /app).
  primary: "bg-accent text-accent-ink font-medium hover:bg-accent-dim",
  // A soft secondary: accent-tinted, quiet (e.g. "Sync now").
  secondary: "bg-accent/12 text-accent font-medium hover:bg-accent/18",
  // Back-compat alias for "secondary".
  transmit: "bg-accent/12 text-accent font-medium hover:bg-accent/18",
  // The default action, the bordered quiet pill (§4 secondary style).
  outline:
    "border border-edge-2 bg-transparent text-ink font-medium hover:border-ink-faint hover:bg-panel-2",
  ghost: "bg-transparent text-ink-dim font-medium hover:bg-panel-2 hover:text-ink",
  danger: "bg-transparent text-danger font-medium hover:bg-danger/10",
};

export function Button({
  variant = "outline",
  size = "md",
  loading = false,
  icon,
  full = false,
  className,
  children,
  disabled,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center whitespace-nowrap transition-colors duration-100 disabled:cursor-default disabled:opacity-60 disabled:saturate-0",
        SIZES[size],
        VARIANTS[variant],
        full && "w-full",
        className
      )}
    >
      {loading ? <LoaderCircle size={13} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
