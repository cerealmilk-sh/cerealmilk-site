# growth-landing CLAUDE.md

The **cerealmilk.sh** product site: the marketing site for the Cereal Milk Mac app ("the deal
messenger for venture capital"), the demo/download funnel, the `/docs` proxy,
and the home of Cereal Milk's machine-facing surfaces (SEO + agent) and lifecycle
email. Part of the `~/github` workspace (`cerealmilk-sh/growth-landing`); see
`~/github/CLAUDE.md` for the org-wide map.

**History:** until 2026-07-09 this repo served the Cereal Milk studio/agency site.
That site is archived in full at branch `archive/studio-site-2026-07-08` /
tag `studio-site-2026-07-08`; its routes 308-redirect to the product pages
(see next.config.ts).

## Stack

Next.js **App Router** + TypeScript, deployed on **Vercel** (team `cerealmilk`).
Content-driven: pages render from markdown in `src/content/` through
`src/lib/content.ts`, indexed by `src/lib/registry.ts`.

## Layout

- `src/app/`: pages + routes: `/` (product page), `pricing`, `security`,
  `download`, `demo` (form-first: lead form posts to `/api/inquiry` then redirects to Cal.com prefilled; the primary CTA target), `contact`,
  `about`, `careers`, `newsletter`, `privacy`, `terms`. Also the **machine
  surfaces** (edit these when changing SEO/agent output):
  - SEO: `sitemap.ts`, `robots.txt`, `feed.xml/`, `og/`, `manifest.ts`, and
    JSON-LD via `components/site/JsonLd.tsx` + `lib/jsonld.ts`
  - Agent/LLM: `llms.txt/`, `llms-full.txt/`, `openapi.json/`, the `.md`
    mirrors (`api/md/` + `src/proxy.ts`)
  - Funnel/email: `api/inquiry`, `api/waitlist`, `api/lifecycle`,
    `api/cron/drip`, `api/unsubscribe` (all load-bearing)
  - Dormant Clerk checkout (the self-serve second lane): `get`, `onboard`,
    `account`, `sso-callback`, currently redirected to `/download`.
- `src/content/`: the markdown behind pages (body of record + AI mirrors).
  **Edit copy here AND in the page JSX; keep the two in sync.**
- `src/components/`: `site/` (chrome: Header, Footer, SiteShell, Terminus,
  vercel-kit primitives), `landing/` (HeroMockup + the dormant checkout flow),
  `ui/` (primitives).
- `src/lib/`: `site.ts` (identity constants incl. `FUND_PRICE_ANCHOR`),
  `registry.ts` (the page spine), `content/markdown/meta/mirror` (content
  pipeline), `drip/` (Resend lifecycle engine), `jsonld.ts`, `analytics.ts`,
  `journeys.ts` (Terminus wayfinding), `ribbon.ts`.
- Specs (read before big changes): `PRODUCT-SITE-SPEC.md`, `ANALYTICS.md`,
  `PUBLISH.md`.

## Run

```
npm install && npm run dev          # also: build · lint · geo-audit · indexnow · agent-eval
```

`node_modules` aren't in the repo.

## Deploy & conventions (important)

- **Vercel, team `cerealmilk`.** Deploy: `vercel deploy --prod --scope cerealmilk`
  from this dir. Commits MUST be authored **`daniel@bastoni.xyz`** (already
  pinned as this repo's `user.email`) or Vercel silently marks the build
  `BLOCKED`.
- **No em dashes** anywhere in copy, comments and docs included. Hard rule: reads as AI slop.
  Replace by role (comma/colon/period).
- **Naming law:** the product is **Cereal Milk**. Backchannel and Cereal Milk are
  retired names; never reintroduce them.
- The `/docs` + `/sentry` rewrites must stay FIRST in next.config.ts.
- Secrets (Resend, Upstash/KV, CRON/LIFECYCLE guards) live in Vercel
  env, see `~/github/ops/secrets-inventory.md`. Drip runbook:
  `~/github/ops/runbooks/email-drip.md`.
- Push via the `cerealmilk-sh` account. Commit/push only when asked; branch off
  `main` first.
