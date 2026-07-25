# PRODUCT-SITE-SPEC: cerealmilk.sh as the product site

**Status:** live spec since 2026-07-09, when cerealmilk.sh was re-architected from the
studio/agency site into the marketing site for the Cereal Milk Mac app. The studio site
is archived in full: branch `archive/studio-site-2026-07-08`, tag
`studio-site-2026-07-08`. Restore any page from there.

## What the site is

cerealmilk.sh sells one thing: the Cereal Milk Mac app, "the deal messenger for venture
capital". A native Mac app that puts the official WhatsApp Web, LinkedIn, and
Gmail in one window, docks the Attio/Affinity record beside every chat, and
syncs only the conversations the user chooses (server-enforced privacy gate).

The **canonical entity sentence** lives in `src/lib/site.ts`
(`CANONICAL_SENTENCE`) and appears byte-identical in the default meta
description, the Organization JSON-LD, the llms.txt blockquote, and the footer.
Never paraphrase it; change it in one place.

## The funnel

Founder-led, product-led sales (see `product-backend/BILLING-MODEL.md`):

- **Primary CTA everywhere: Book a demo → `/demo`** (Cal.com
  `danieljh/30min` iframe). `?src=` carries placement attribution.
- **Secondary: Download → `/download`** (free individual tier, the wedge).
  The page is a superset.sh-style interstitial: it detects the visitor's
  platform client-side (`src/lib/platform.ts`) and auto-starts the right
  installer, `/download/CerealMilk.dmg` on Mac or `/download/CerealMilk.exe` on Windows,
  with a manual platform picker anywhere else. Both evergreen file routes
  first-party-log the hit (`src/lib/download-track.ts`), then 307 to the
  current installer resolved from the desktop release manifests on the
  public `cerealmilk-sh/product-releases` repo (`src/lib/desktop-release.ts`).
- **Pricing is published** (`/pricing`): per-fund anchor from
  `FUND_PRICE_ANCHOR` in site.ts ($12,000/yr, provisional until the
  van Westendorp survey), "custom for larger funds", supported paid pilots.
- Written path: `/contact` → `/api/inquiry` (agent-fillable, no captcha).

## Page inventory (all in `src/lib/registry.ts`)

`/` (product page, hero + mockup + FAQ + SoftwareApplication JSON-LD) ·
`/pricing` · `/security` · `/download` · `/demo` · `/contact` · `/about` ·
`/careers` · `/newsletter` · plus non-registry `/privacy` and `/terms`.

Adding a page = one registry entry + one route dir + a markdown mirror under
`src/content/`; sitemap, llms.txt, llms-full.txt, the `.md` mirrors, and OG
images all derive from the registry.

## Invariants carried over from the studio site

- **No em dashes** anywhere in copy. Replace by role (comma/colon/period).
- Machine surfaces (sitemap/llms/og/md-mirrors) derive from the registry;
  hardcoded dates only, never `new Date()`.
- Geist design system: `.studio` skin tokens, vercel-kit primitives,
  `max-w-[1080px] px-6` container, hairlines not cards.
- Analytics: consent-gated PostHog via `public/consent-analytics.js` +
  `/ingest` proxy; `[data-track]` attributes for CTA events
  (`demo_cta_clicked`, `dmg_download_clicked`, `ribbon_download_clicked`).
- `/docs` and `/sentry` rewrites MUST stay first in `next.config.ts`.
- The email drip engine (`src/lib/drip/` + `/api/cron/drip` in vercel.json)
  is load-bearing; do not break the api routes.
- Deploys: commits authored `daniel@bastoni.xyz`, push via `cerealmilk-sh`,
  `vercel deploy --prod --scope cerealmilk`.

## Redirect map for removed studio routes

services|work|writing|blog|tools|stack|videos → `/` or `/about`;
`/book` → `/demo`; `/teardown` → `/demo`; `/methodology` → `/about`;
`/mcp`,`/prompts` → `/llms.txt`; `/app` → `/`. All permanent (308), in
next.config.ts.
