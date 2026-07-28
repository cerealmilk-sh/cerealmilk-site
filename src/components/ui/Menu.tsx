"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui/cx";

/**
 * Menu: a minimal, dependency-free dropdown popover (Intercom's sort/overflow
 * menus). Closes on outside-click and Escape. `trigger` may be a render fn that
 * receives the open state; `children` may be a render fn that receives a
 * `close` callback so items can dismiss after acting.
 */
export function Menu({
  trigger,
  children,
  align = "left",
  panelClassName,
}: {
  trigger: React.ReactNode | ((open: boolean) => React.ReactNode);
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: "left" | "right";
  panelClassName?: string;
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

  return (
    <div ref={rootRef} className="relative">
      <span onClick={() => setOpen((o) => !o)} className="contents">
        {typeof trigger === "function" ? trigger(open) : trigger}
      </span>
      {open && (
        <div
          role="menu"
          className={cx(
            "cm-pop-in cm-elev-pop absolute z-50 mt-2 min-w-[180px] rounded-xl border border-edge bg-panel p-1",
            align === "right" ? "right-0" : "left-0",
            panelClassName
          )}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

/** A single menu row, icon · label · optional hint. */
export function MenuItem({
  icon,
  children,
  hint,
  active = false,
  danger = false,
  onClick,
  disabled,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-label transition-colors disabled:cursor-default disabled:text-ink-faint disabled:opacity-50 disabled:hover:bg-transparent",
        danger
          ? "text-danger hover:bg-danger/10"
          : active
            ? "bg-panel-2 text-ink"
            : "text-ink-dim hover:bg-panel-2 hover:text-ink"
      )}
    >
      {icon && <span className="flex w-4 shrink-0 items-center justify-center text-ink-faint">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className="shrink-0 text-caption text-ink-faint">{hint}</span>}
    </button>
  );
}
