// The page terminus. Two jobs, in order: (1) guide the reader onward with a
// curated "keep reading" list (from src/lib/journeys.ts, keyed by `path`), so
// no page is a dead end; (2) the site's primary conversion, a Book-a-demo
// CTA, with a quieter Field Notes capture beneath it. `source` gives
// per-placement attribution on both actions; pass `path` to light up the
// wayfinding.

import { BOOK_PATH, NEWSLETTER_NAME } from "@/lib/site";
import { nextStops } from "@/lib/journeys";
import { NewsletterForm } from "./NewsletterForm";
import { NextStops, PillButton } from "./vercel-kit";

export function Terminus({ source, path }: { source: string; path?: string }) {
  const stops = path ? nextStops(path) : [];
  return (
    <>
      <NextStops stops={stops} />
      <aside
        aria-label="Book a demo"
        className="mt-16 border-t border-edge pt-10"
      >
        <p className="font-mono text-[13px] text-ink-faint">Book a demo</p>
        <h2 className="mt-3 text-[24px] leading-[1.2] text-ink">
          See 80x on your own pipeline
        </h2>
        <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-ink-dim">
          Book 30 minutes with the founder: the app live on a real pipeline,
          the privacy model answered plainly, and a pilot scoped if it fits.
        </p>
        <div className="mt-5">
          <PillButton
            href={`${BOOK_PATH}?src=${encodeURIComponent(source)}`}
            size="lg"
          >
            Book a demo
          </PillButton>
        </div>
        <div className="mt-8 border-t border-edge pt-6">
          <p className="text-[14px] text-ink-dim">
            Not ready to talk? Get {NEWSLETTER_NAME}, one email when something
            ships.
          </p>
          <div className="mt-4">
            <NewsletterForm source={source} />
          </div>
        </div>
      </aside>
    </>
  );
}
