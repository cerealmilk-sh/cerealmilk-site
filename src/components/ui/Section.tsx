"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/components/ui/cx";

/**
 * Section: a collapsible block for the Intercom-style Details panel. A quiet
 * sentence-case header with a chevron and an optional right-aligned accessory
 * (e.g. a count or an action), and a body that collapses away.
 */
export function Section({
  title,
  accessory,
  defaultOpen = true,
  children,
  className,
}: {
  title: string;
  accessory?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={className}>
      <div className="flex items-center gap-1.5 px-4 py-2.5">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            className={cx(
              "shrink-0 text-ink-faint transition-transform duration-150",
              !open && "-rotate-90"
            )}
          />
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-faint">
            {title}
          </span>
        </button>
        {accessory && <span className="shrink-0">{accessory}</span>}
      </div>
      {open && <div className="px-4 pb-3.5 pt-0.5">{children}</div>}
    </section>
  );
}
