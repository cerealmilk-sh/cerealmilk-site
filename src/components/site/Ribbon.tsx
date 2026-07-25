// The global announcement ribbon: a thin, dismissible bar pinned above the
// header on every studio page (mounted in SiteShell, before the sticky Header,
// so it scrolls away as you read). Server-rendered so it works without JS and
// stays in the SSR HTML; only the dismiss control is a client island. Content
// + no-flash dismissal live in src/lib/ribbon.ts.
//
// Styling matches the studio pill buttons (bg-accent / text-accent-ink): a
// solid near-black bar in light, a white bar in dark, flipping with the theme.
// The whole bar is the link; on narrow screens the "Free 5-day course" label
// collapses and the message itself stays tappable.

import Link from "next/link";
import { RIBBON } from "@/lib/ribbon";
import { RibbonDismiss } from "./RibbonDismiss";

export function Ribbon() {
  return (
    <div className="site-ribbon relative isolate bg-accent text-accent-ink">
      <Link
        href={RIBBON.href}
        data-track={RIBBON.track}
        data-track-props='{"placement":"ribbon"}'
        className="group mx-auto flex max-w-[1080px] items-center justify-center gap-x-2.5 gap-y-0.5 px-10 py-2 text-center text-[13px] leading-tight"
      >
        <span className="inline-flex shrink-0 items-center rounded-full bg-accent-ink/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          {RIBBON.eyebrow}
        </span>
        <span className="font-medium">{RIBBON.message}</span>
        <span className="hidden text-accent-ink/45 sm:inline" aria-hidden>
          ·
        </span>
        <span className="hidden whitespace-nowrap text-accent-ink/80 underline decoration-accent-ink/30 underline-offset-2 transition-colors group-hover:text-accent-ink sm:inline">
          {RIBBON.cta}
        </span>
        <span aria-hidden className="shrink-0 font-medium transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </Link>
      <RibbonDismiss />
    </div>
  );
}
