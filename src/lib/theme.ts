// Theme · Cereal Milk runs two palettes: a pure-black Geist dark (the default) and a
// Geist-light mirror. The choice lives in `<html data-theme>` and persists in
// localStorage. Dark is the default: a saved preference wins, and a
// `?theme=light|dark` URL param is honored for the session (applied, never
// persisted, used for screenshot verification).

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "bc-theme";

/**
 * Inlined in <head> before first paint so there is no flash of the wrong
 * theme. Kept tiny and dependency-free; mirrors the logic in `readTheme`.
 * Precedence: ?theme= param (session-only) → stored preference → dark.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search).get("theme");var t=q==="light"||q==="dark"?q:localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t="dark";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;

/** Fired on window whenever applyTheme runs, useSyncExternalStore subscribers
 *  (the toggle icon) re-read without any setState-in-effect. */
export const THEME_CHANGE_EVENT = "bc-theme-change";

/** The theme currently applied to <html> (falls back to "dark"). */
export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Subscribe to theme changes (for useSyncExternalStore). */
export function subscribeTheme(onChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

/** Apply a theme to <html> and remember it. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // private mode / storage disabled, the attribute is still set for this session
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
