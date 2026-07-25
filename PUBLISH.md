# Editing & publishing the 80x landing page

This is the standalone marketing site (`80x.xyz`). It's a static Next.js app
with no database or auth, the product lives separately at `app.80x.xyz`.

## Edit copy

```bash
npm run dev          # http://localhost:3000
```

1. Click **Edit copy** (bottom-right, dev-only).
2. Click any text in the real layout and type. Use **Meta** for the browser-tab
   title + search/social description.
3. **Save** writes your edits to `src/components/landing/content.json` (no deploy).
4. **Discard** reverts to the last-committed copy.

Only marketing prose is editable. The hero inbox mockup and example chat bubbles
are the product demo and stay in code.

## Publish

Click **Publish** in the editor bar. It:

1. Saves any pending edits to `content.json`,
2. commits just that file (`copy: update landing copy (<timestamp>)`) and pushes
   it (for history),
3. deploys the site to Vercel production via the CLI (`vercel deploy --prod`).

The bar links to the live URL when it's done (~1–2 min). Typo? Use **Instant
Rollback** in the Vercel dashboard.

> Deploying via the CLI means Publish works without the GitHub↔Vercel
> connection. If you later authorize Vercel's GitHub App on `80x-HQ`
> (Vercel → project → Settings → Git), a plain `git push` will *also* auto-deploy.
>
> Publish only ships `content.json`. Code/layout changes are normal commits you
> push and deploy yourself.

## How it's wired

- Copy is the single source of truth in `src/components/landing/content.json`
  (typed by `content-types.ts`), rendered through `<Editable>`.
- The editor and the `/api/dev/*` routes are **dev-only**, disabled when
  `NODE_ENV=production`, so the deployed site is pure static HTML/JS with no
  authoring surface.
- Auth CTAs point at `https://app.80x.xyz` (see `APP_URL` in `LandingPage.tsx`).

## AI search & SEO

- Canonical host, OpenGraph/Twitter cards, and JSON-LD (`Organization`,
  `SoftwareApplication`, `FAQPage`) live in `src/app/layout.tsx` and
  `src/components/landing/structured-data.ts` (keep the FAQ schema in sync with
  `content.json` → `faq.items`).
- `app/robots.ts` and `app/sitemap.ts` generate `/robots.txt` and `/sitemap.xml`;
  robots explicitly allows the major AI crawlers (GPTBot, ClaudeBot, PerplexityBot…).
- `public/llms.txt` is the plain-text product brief for LLMs and AI search. Keep
  it factual and current. It's the canonical answer source for "what is 80x".
- The base host is set once via `SITE_URL` in `src/lib/site.ts`; change it there
  if the domain moves.

## One-time: DNS cutover

Point `80x.xyz` (+ `www`) at Vercel (records shown in the Vercel dashboard).
⚠️ Delete any registrar "URL redirect / parking" record on the apex first. It
injects a second A record and blocks both routing and TLS. Then drop the apex
from the Fly app's host-split (`MARKETING_HOSTS` in the product repo's
`src/proxy.ts`) so the old machine stops trying to serve the apex.
