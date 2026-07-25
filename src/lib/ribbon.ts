import { DOWNLOAD_PATH } from "@/lib/site";
import { PRICE_ANCHOR, TRIAL_DAYS } from "@/lib/pricing";

// The global announcement ribbon shown at the top of every page
// (src/components/site/Ribbon.tsx, mounted in SiteShell above the header).
// Now the download-first line: the ribbon carries the trial promise and the
// direct CTA to the download page (the trial starts in the app, no card).
//
// Dismissal is no-flash, mirroring the theme init (src/lib/theme.ts): a tiny
// blocking script in <head> reads the stored version and, if it matches the
// CURRENT ribbon, sets `<html data-ribbon="hidden">` before first paint,
// globals.css then hides `.site-ribbon`. Bump RIBBON.version whenever the
// message changes to re-show the bar to everyone who dismissed the old one.

export const RIBBON = {
  // Bump this string whenever the message changes so past dismissals reset.
  version: "download-first-2026-07-win",
  href: `${DOWNLOAD_PATH}?src=ribbon`,
  eyebrow: "80x is live",
  message: `WhatsApp, LinkedIn, and Gmail in one window, synced to your CRM. Free for ${TRIAL_DAYS} days, no card, then from ${PRICE_ANCHOR} a month`,
  cta: "Download 80x",
  // The [data-track] event auto-captured on click by public/consent-analytics.js.
  track: "get_started_cta_clicked",
} as const;

export const RIBBON_STORAGE_KEY = "x-ribbon-dismissed";

/**
 * Inlined in <head> before first paint (like THEME_INIT_SCRIPT) so a visitor
 * who already dismissed the current ribbon never sees it flash. Sets
 * `<html data-ribbon="hidden">` only when the stored version matches the
 * current RIBBON.version, a bumped version re-shows the bar.
 */
export const RIBBON_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("${RIBBON_STORAGE_KEY}")==="${RIBBON.version}"){document.documentElement.dataset.ribbon="hidden";}}catch(e){}})();`;
