"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, subscribeTheme, type Theme } from "@/lib/theme";

/**
 * ThemeToggle: flips between the dark (default) and light palettes and
 * persists the choice. The theme lives on <html data-theme> (applied by the
 * no-FOUC head script before hydration); useSyncExternalStore reads it as an
 * external store, so the icon is correct on mount with no setState-in-effect
 * cascade and stays in sync if several toggles are ever rendered at once.
 * Styled as a quiet bordered icon button (VERCEL-GEIST-SPEC.md §5.1).
 */
export function ThemeToggle({ size = 34 }: { size?: number }) {
  // Server snapshot matches the no-preference default ("dark"); after
  // hydration React re-reads the real value.
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark" as Theme);

  const isDark = theme === "dark";
  const toggle = () => applyTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light" : "Switch to dark"}
      aria-label="Toggle light and dark theme"
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-md border border-edge-2 text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink"
    >
      {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
    </button>
  );
}
