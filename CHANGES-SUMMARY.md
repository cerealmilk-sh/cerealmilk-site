# CHANGES-SUMMARY.md — 80x to Cereal Milk Rebrand

Date: 2026-07-25

## What changed

### A. Brand + naming

- **~410 hits** of "80x"/"eightyx"/"80x-org"/"80x.ai" replaced with "Cereal Milk"/"cerealmilk"/"cerealmilk-sh"/"cerealmilk.sh" across 92 source files.
- `src/lib/site.ts`: `SITE_URL` set to `https://cerealmilk.sh`, all brand constants rewritten.
- `src/content/brandscript.ts`: entire positioning narrative rewritten for free, local-first, BYO-model product thesis.
- `src/app/layout.tsx`: metadata, OG, Twitter, JSON-LD all updated. ClerkProvider removed. Comments updated.
- All 14 content markdown files under `src/content/` rewritten.
- CSS class names (`.x80-app`, `.x80-wa`, `@keyframes x80-breathe`) left unchanged in `CerealMilkShell.tsx` (internal component mockup, not user-facing).
- `CLAUDE.md` naming law updated to reference Cereal Milk.
- Zero em dashes introduced.

### B. Domain

- `SITE_URL` changed in `src/lib/site.ts` from `https://80x.ai` to `https://cerealmilk.sh`.
- This propagates to: `metadataBase`, canonical alternates, `robots.txt`, sitemap, `manifest.ts`, `llms.txt`, `llms-full.txt`, JSON-LD person/organization, OG images, and email links.
- Hardcoded `https://www.80x.ai` in `src/app/api/unsubscribe/route.ts` fixed.
- Hardcoded `https://80x.ai/llms.txt` in `src/app/api/md/[...path]/route.ts` fixed.
- Email domain `daniel@80x.ai` → `daniel@cerealmilk.sh`, `@updates.80x.ai` → `@updates.cerealmilk.sh`.

### C. Downloads + release host

- `src/app/download/80x.dmg/` → `src/app/download/CerealMilk.dmg/` (directory and route handler).
- `src/app/download/80x.exe/` → `src/app/download/CerealMilk.exe/` (directory and route handler).
- `src/lib/platform.ts`: `PLATFORM_DOWNLOAD` paths updated.
- `src/lib/desktop-release.ts`: `MANIFEST_BASE` now points to `cerealmilk-sh/product-releases`.
- `src/lib/site.ts`: `DOWNLOAD_URL` → `/download/CerealMilk.dmg`.
- All callers updated: `DownloadInterstitial.tsx`, `DownloadCta.tsx`, `download.md`, `platform.ts`.
- Download tracking logic preserved; renamed env var `X80_DOWNLOAD_SECRET` → `DOWNLOAD_TRACK_SECRET`.

### D. Auth — Clerk removed (option A)

Deleted files:
- `src/proxy.ts` — Clerk middleware. Replaced with markdown-mirror-only proxy.
- `src/app/sso-callback/` — OAuth callback page + layout.
- `src/app/get/` — post-sign-in checkout page.
- `src/app/onboard/` — onboarding flow page.
- `src/app/account/` — account management page.
- `src/app/api/webhooks/clerk/` — Clerk webhook handler.
- `src/components/landing/Account.tsx` — Clerk account UI.
- `src/components/landing/OnboardFlow.tsx` — Clerk onboarding flow.
- `src/components/landing/GetStarted.tsx` — Clerk sign-in modal.
- `src/components/landing/PlanCheckoutButton.tsx` — Clerk billing checkout.

Cleanup in remaining files:
- `package.json`: `@clerk/nextjs` dependency removed.
- `src/app/layout.tsx`: `ClerkProvider` import and wrapping removed.
- `src/app/privacy/page.tsx`: Clerk/Stripe billing mentions removed.
- `src/app/terms/page.tsx`: reference to deleted `GetStarted.tsx` removed.
- `src/lib/pricing.ts`: Clerk plan references removed from comments.
- `src/lib/analytics.ts`: Clerk identify() mention removed.
- `src/lib/drip/email.ts`: `ONBOARD_URL` replaced with `DOWNLOAD_URL`.
- `src/lib/drip/sequences.ts`: Clerk lane reference removed.
- `.env.example`: all `CLERK_*` keys removed.

### E. Analytics + email env

- `src/lib/download-track.ts`: Hardcoded PostHog project key replaced with `TODO(human)` placeholder.
- `NEXT_PUBLIC_POSTHOG_KEY` kept as env placeholder (no hardcoded fallback).
- `DOWNLOAD_TRACK_SECRET` renamed from `X80_DOWNLOAD_SECRET`.
- Lifecycle drip (Resend + Upstash/KV, `CRON_SECRET`, `LIFECYCLE_INGEST_SECRET`): code preserved, env placeholders kept in `.env.example`.
- `public/consent-analytics.js`: PostHog key replaced with env placeholder.
- Consent key `80x-consent` → `cereal-milk-consent` in localStorage.

### F. Docs

- `CLAUDE.md`: domain, org, and Clerk references updated. `80x-djh` → `cerealmilk-sh`.
- `PRODUCT-SITE-SPEC.md`: Clerk dormant routes section removed. Domain/org updated.
- `PUBLISH.md`: domain references updated (`80x.xyz` → `cerealmilk.sh`).
- `ANALYTICS.md`: domain/org/key references updated.
- `docs/gtm/*.md`, `docs/geo/*.md`, `docs/design/*.md`: brand name updated.
- `prompts/loop-preorder-funnel.md`: brand updated.
- `.env.example`: rewritten for new variable set.

### G. Desktop app (cerealmilk-app)

- 57 hits of "80x"/"eightyx" replaced across 12 files.
- `package.json`: `productName` → "Cereal Milk", `appId` → `ai.cerealmilk.inbox`, artifact name → `CerealMilk-Setup-${version}.exe`.
- `build.publish.url` → `cerealmilk-sh/product-releases`.
- All UI strings updated: window title, sign-in flow, update notifications, settings link.
- Clerk sign-in code preserved (app-level auth decision pending; see TODOs below).

---

## TODO(human) items

### Blocking
| Item | Context |
|---|---|
| **New brand palette hex values** | Currently `#E4F222` (lime) + `#0B0B09` (ink) in `globals.css`, mask-icon, OG route. Need Cereal Milk palette values. |
| **New brand assets** | Logo SVG (`src/app/icon.svg`), favicon (`favicon.ico`), Apple touch icon (`apple-icon.png`), OG image (`src/app/og/[...slug]/route.tsx`), mask-icon (`public/mask-icon.svg`), manifest icons. All still show the 80x mark. |
| **GitHub release repo** | `desktop-release.ts` points to `cerealmilk-sh/product-releases`. If a separate app repo is used, update `RELEASE_REPO` in `site.ts` and the manifest base in `desktop-release.ts`. |
| **PostHog project key** | Set `NEXT_PUBLIC_POSTHOG_KEY` in Vercel env and `public/consent-analytics.js`. Create a new Cereal Milk PostHog project. |
| **Lifecycle drip: confirm** | The Resend + Upstash/KV lifecycle engine is preserved. Confirm whether Cereal Milk still wants the email drip. If yes, set `CRON_SECRET`, `LIFECYCLE_INGEST_SECRET`, `RESEND_API_KEY`, and Upstash KV env vars in Vercel. |

### Desktop app
| Item | Context |
|---|---|
| **Clerk → Better Auth migration** | The desktop app `cerealmilk-app` still uses Clerk for sign-in. The already-deployed version at `cerealmilk-sh/cerealmilk` (v0.2.0) uses Better Auth. Decide which is canonical, or migrate Clerk to Better Auth. |
| **New Clerk instance** | If keeping Clerk, a new Clerk application with `cerealmilk.sh` domain and new publishable/secret keys is needed (old keys are domain-locked to `80x.ai`). |
| **Sign-in domain** | `signin.80x.ai` → needs new hosted sign-in page at `auth.cerealmilk.sh` (or remove the gate entirely; the app went free). |
| **App ID collision** | Current: `ai.cerealmilk.inbox`. The existing cerealmilk-sh app uses `sh.cerealmilk.inbox`. The Superset fork uses `app.cerealmilk.desktop`. No collision, but confirm which is canonical. |

### General
| Item | Context |
|---|---|
| **New GitHub org/account** | Currently logged in as `clippycommits`. For production deploys, authenticate with the Cereal Milk GitHub account. |
| **Vercel team** | Was `eightyx`. Needs new Vercel team for Cereal Milk, or deploy under a personal account. |
| **DNS** | `cerealmilk.sh` domain needs DNS pointing at Vercel. |
| **Commit author** | Git identity in the repo is the placeholder `Clippy <clippy@localhost>`. Before pushing, set real author: `git config user.email "daniel@cerealmilk.sh"`. |
| **env.example placeholder values** | All env values in `.env.example` are placeholders. Real values need to be set in Vercel (or wherever the site is deployed) before going live. |

## Decisions assumed

1. **Auth = removed (option A)** from the marketing site. The download CTA is the primary action; no sign-up gate.
2. **Free, no billing** on the site. Pricing page, preorder page, and waitlist form preserved but repointed. The download-first model matches the app being free and BYO-model.
3. **Download tracking preserved** with renamed env vars. The server-side anonymous download log still fires.
4. **Lifecycle drip preserved** in code, flagged for human confirmation.
5. **Desktop app appId** set to `ai.cerealmilk.inbox` (no collision with `sh.cerealmilk.inbox` or `app.cerealmilk.desktop`).
6. **No new palette/art was provided**, so current colors and assets remain, flagged with `TODO(human)`.

## Verification

- `npm ci && npm run build`: passes
- `npx tsc --noEmit`: clean (0 errors)
- `npm run lint`: 4 pre-existing errors (setState in useEffect), 13 warnings (all pre-existing in consent-analytics.js and unused imports)
- `grep -rInE '80x|eightyx' src public *.md`: **0 hits**
- `grep -ri clerk src`: **0 hits**
- No `@clerk/*` imports remain
- No em dashes introduced in changed copy
