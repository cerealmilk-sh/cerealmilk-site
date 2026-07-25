"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { cx } from "@/components/ui/cx";

export interface SplitAction {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * SplitButton. Intercom's "Send ▾": a primary action fused to a caret that
 * opens a menu of alternative actions (e.g. Send / Send & close). Two visually
 * joined segments, one dropdown. Closes on outside-click and Escape.
 */
export function SplitButton({
  label,
  icon,
  onClick,
  actions,
  disabled = false,
  loading = false,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  actions: SplitAction[];
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const segment =
    "inline-flex items-center justify-center bg-accent font-semibold text-white transition-colors duration-100 hover:bg-accent-dim disabled:cursor-default disabled:opacity-60 disabled:saturate-0";

  return (
    <div ref={rootRef} className="relative inline-flex shadow-card">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={cx(segment, "h-8 gap-2 rounded-l-lg pl-3 pr-3 text-label")}
      >
        {loading ? <LoaderCircle size={13} className="animate-spin" /> : icon}
        {label}
      </button>
      <span className="w-px self-stretch bg-accent/20" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled || loading || actions.length === 0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More send options"
        className={cx(segment, "h-8 w-7 rounded-r-lg")}
      >
        <ChevronDown size={14} strokeWidth={2.5} />
      </button>

      {open && (
        <div
          role="menu"
          className="bc-pop-in bc-elev-pop absolute bottom-full right-0 z-50 mb-2 min-w-[220px] rounded-xl border border-edge bg-panel p-1"
        >
          {actions.map((a) => (
            <button
              key={a.label}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                a.onClick();
              }}
              disabled={a.disabled}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-panel-2 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {a.icon && (
                <span className="mt-0.5 flex w-4 shrink-0 items-center justify-center text-ink-faint">
                  {a.icon}
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-label text-ink">{a.label}</span>
                {a.description && (
                  <span className="mt-1 block text-caption leading-snug text-ink-faint">
                    {a.description}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
