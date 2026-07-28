# Publishing cerealmilk-site

The site deploys to Vercel manually from a local clone. There is no
git-to-Vercel integration: pushing to GitHub deploys nothing.

## Deploy

```sh
npm run build        # prebuild runs the pricing guard (scripts/check-pricing.mjs)
vercel deploy --prod
```

Vercel project and scope: see CLAUDE.md (project `cerealmilk-site`, scope
`clippycommits-projects`, renamed from its pre-rebrand name 2026-07-29).
A fresh clone needs `vercel link` first, command in CLAUDE.md.

## Where things live

- Copy of record: `src/lib/site.ts` (the page registry) plus the
  `src/content/*.md` mirrors. Edit both and keep them in sync (CLAUDE.md is
  the authority on this contract).
- Pricing numbers: `src/lib/pricing.ts` only; the prebuild guard fails the
  build on any non-canonical dollar literal.
- Machine surfaces (all route handlers, none are static files): `robots.txt`,
  `sitemap.xml`, `llms.txt`, `llms-full.txt`, per-page `.md` mirrors,
  `og/*.png`, `openapi.json`, `manifest.webmanifest`.
- Analytics: PostHog via `public/consent-analytics.js`. The key comes from
  `NEXT_PUBLIC_POSTHOG_KEY` (the layout injects it as
  `window.__CM_POSTHOG_KEY`); server-side download logging
  (`src/lib/download-track.ts`) reads the same var. With no key set, both
  no-op cleanly: analytics is off, nothing breaks.
- Email/drip: `src/lib/drip/*` plus Upstash Redis and Resend; the daily cron
  lives in `vercel.json`. See `docs/gtm/README.md`.

## Post-deploy checks

```sh
curl -s https://cerealmilk.sh/robots.txt | head
curl -s https://cerealmilk.sh/llms.txt | head
curl -sI https://cerealmilk.sh/download/CerealMilk.dmg | grep -i location
```
