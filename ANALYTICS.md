# Analytics · cerealmilk.sh

Site-wide, consent-gated web analytics across all three surfaces of `cerealmilk.sh`
(landing, `/docs`, `/sentry`). **PostHog** (US cloud) for traffic, funnels,
conversion events, and session replay; **Vercel Speed Insights** for Core Web
Vitals. Because `/docs` and `/sentry` are reverse-proxied under the apex, all
three are same-origin and share **one** consent choice and **one** dataset.
The signed-in app at `app.cerealmilk.sh` and the Mac app report into the **same
PostHog project**, so the whole journey (first pageview to paying seat) is one
funnel; see "Identity stitching" below.

Everything is inert until a PostHog key is set (step 1, done), the sites run
exactly as before with no key set.

---

## What you need to do (≈10 min, one-time)

### 1. Create the PostHog project and paste the key ✅ DONE

The project lives on PostHog **US cloud** (https://us.posthog.com, the data
region). The live **Project API key** (`phc_…`, a *public* client-side key,
safe to commit) is already set in **`public/consent-analytics.js`**, and both
the loader's `UI_HOST` and the `/ingest` reverse proxy in `next.config.ts` point
at the US endpoints (`us.i.posthog.com` / `us-assets.i.posthog.com`). To rotate
the key, edit `POSTHOG_KEY` in that file (and the fallback in
`src/lib/download-track.ts`).

Still optional in PostHog → **Settings → Recordings**: toggle **Record user
sessions ON**
   (session replay is off by default; the code is already configured for it,
   with all form inputs masked).

### 2. Turn on the Vercel products (landing project)

In the **`Cereal Milk`** Vercel project dashboard (team `cerealmilk`; that project owns
the apex domain):
- **Speed Insights** tab → Enable. (The `<SpeedInsights/>` component is already
  in `layout.tsx`; the dashboard toggle starts collection.)

That's it. Deploy, accept the banner on the live site, and data flows.

---

## How it's built

| Piece | File |
|---|---|
| Shared loader + consent banner + `window.track()` + `window.setPerson()` | `public/consent-analytics.js` |
| Reverse proxy (`/ingest` → PostHog US) + `skipTrailingSlashRedirect` | `next.config.ts` |
| Loads the script + `<SpeedInsights/>` | `src/app/layout.tsx` |
| Typed event + person helpers (`track()`, `setPerson()`) | `src/lib/analytics.ts` |
| Fire-once-on-mount tracker (for redirect conversions) | `src/components/site/TrackEvent.tsx` |
| Server-side download logging (dmg + exe share it) | `src/lib/download-track.ts`, routes `src/app/download/CerealMilk.dmg/route.ts`, `src/app/download/CerealMilk.exe/route.ts` |
| Privacy & cookies policy + "change choice" button | `src/app/privacy/page.tsx`, `src/components/site/ConsentReset.tsx` |
| Docs injection | `growth-docs/src/components/Head.astro` |
| Sentry injection | `skill-audit/webapp/public/sentry/index.html` (repo `cerealmilk-sh/skill-audit`) |

**One file, three sites.** `consent-analytics.js` lives only in the landing's
`/public` and is loaded from the apex by all three surfaces. Change tracking
once, everywhere updates. (Standalone `*.vercel.app` preview domains don't load
it, a feature: preview traffic never pollutes the data.)

**Consent.** First visit shows a banner. **Accept** → PostHog loads, sets
first-party cookies, starts replay. **Decline** (or ignore) → nothing loads,
no cookies, no requests. Choice stored in `localStorage['cereal-milk-consent']` and
shared across all three surfaces. Withdraw/change any time on `/privacy`.

---

## The conversion events

Fired via `track(...)` (React) or a `data-track="…"` attribute (any element):

| Event | Where it fires |
|---|---|
| `get_started_cta_clicked` | every Get Cereal Milk pill, header/hero/home-pricing/footer (`data-track`, props `{src}`, plus `plan` on the home pricing cards), pointing at `/download` |
| `dmg_download_clicked` / `exe_download_clicked` | the `/download` interstitial's manual Mac/Windows download links (`data-track`, props `{src}`; client-side click, consent-gated) |
| `dmg_download_requested` / `exe_download_requested` | **server-side**, the `/download/CerealMilk.dmg` and `/download/CerealMilk.exe` route handlers: every GET, consent-independent and ad-blocker-proof, anonymous random `distinct_id`, props `{outcome, asset, source, kind, country}`. The ground truth for downloads |
| `buy_cta_clicked` | the `/pricing` Buy buttons (`data-track`, props `{src, plan}`) |
| `demo_cta_clicked` | every Book-a-demo link (`data-track`, props `{src}`) |
| `demo_email_clicked` | the `/demo` email fallback link (`data-track`) |
| `demo_request_submitted` | `/demo` form completed, visitor sent to Cal.com (props `{src, team_size}`) |
| `inquiry_submitted` | `/contact` thank-you render (`TrackEvent` on mount) |
| `newsletter_subscribed` | Field Notes signup succeeds (`source` = placement) |
| `whatsapp_message_clicked` | the floating founder WhatsApp button (`data-track`) |
| `referral_click` | share links on `/preorder/thanks` (props `{channel}`: email, whatsapp) |
| `preorder_started` / `preorder_submitted` / `preorder_confirmed` | the `/preorder` reservation flow (legacy surfaces since the download-first funnel went live 2026-07-14; still real events while the pages exist) |

PostHog **autocapture** also records all clicks/pageviews, so you get data on
everything else for free. The named ones exist for clean funnels.

**Server-side stages** (no client event by design; one analytics path only):
`dmg_download_requested` above, plus lead capture: form posts land in the
Resend audience + `WAITLIST_WEBHOOK_URL` with their `source`; the confirmation
email and every nurture step go through `src/lib/drip/` and are auditable in
the Resend dashboard and the daily `/api/cron/drip` tick result
(`{processed, sent}`).

**Add a click event to any CTA** with no code:
```html
<a href="…" data-track="my_event" data-track-props='{"plan":"pro"}'>…</a>
```

---

## Identity stitching (web → app → Mac app, one person)

The point: a named lead's anonymous browsing, their trial, and their paid seat
should all be one PostHog person. Three pieces make that happen:

1. **`cross_subdomain_cookie: true`** in the loader scopes the PostHog cookie
   to `.cerealmilk.sh` (not host-only), so the anonymous `distinct_id` minted on the
   marketing site is the same one the signed-in app at `app.cerealmilk.sh` sees.
2. **`window.setPerson(props)`, lead enrichment.** The loader runs PostHog
   with `person_profiles: "identified_only"`, so anonymous visitors have no
   person profile at all. When a visitor self-identifies in a form (demo
   request, newsletter, preorder), the form calls `setPerson({ email, name,
   lead_source })` via `src/lib/analytics.ts`, which forwards to
   `posthog.setPersonProperties()`. That call is what upgrades the anonymous
   visitor into a person profile, now carrying their email, while they are
   still a lead. Only fields the visitor actually typed are sent.
3. **`identify()` on sign-in.** The app's PostHogProvider calls
   `identify(userId, { email, name })` when someone signs in at
   `app.cerealmilk.sh`. Because of (1) the pre-signup journey and the signed-in
   session share a `distinct_id`, so PostHog merges them, and because of (2)
   the merged person already carries the lead properties. The Mac app
   identifies with the **same Better Auth userId** (fetched via `/api/app/me`), so
   web, app, and desktop are one person end to end.

---

## UTM tagging (do this for every link you post)

Analytics is only as good as attribution. Tag every outbound link, LinkedIn
posts, newsletter, DMs, directory submissions, so you know what actually works.
PostHog reads UTMs automatically.

```
https://cerealmilk.sh/writing/<post>?utm_source=linkedin&utm_medium=social&utm_campaign=fieldnotes-2026-07
```
- `utm_source`: where it's posted (linkedin, x, newsletter, hn, reddit)
- `utm_medium`: social | email | referral | paid
- `utm_campaign`: the specific push (e.g. `stack-launch`, `fieldnotes-jul`)

Keep names lowercase and consistent. PostHog groups by exact string.

---

## The download-first funnel (the canonical one)

The Raycast-model funnel, live since 2026-07-14: try the product first, pay
inside it. One step per stage, so drop-off is queryable end to end:

1. `$pageview` where `$pathname = /` (landing view)
2. `get_started_cta_clicked` (intent; break down by `src` to compare
   header vs hero vs pricing vs footer)
3. `$pageview` where `$pathname = /download` (offer view; also reachable
   direct, so step 2 is optional-match)
4. `dmg_download_clicked` / `exe_download_clicked` (client click) and/or the
   server-side `dmg_download_requested` / `exe_download_requested` (the ground
   truth; includes bookmark/curl/email traffic the button never sees, and the
   interstitial's auto-download, which fires through the same file routes)
5. `sign_in_complete` (in-app, same PostHog project, after the forced sign-in)
6. `trial_started` (server-side, the backend's automatic 7-day signup grant)
7. `billing_event` / `subscription_active` (the purchase)

The demo path is its own smaller funnel: `demo_cta_clicked` →
`$pageview /demo` → `demo_request_submitted`. Compare the two funnels' entry
rates to see how traffic splits between download-now and talk-first.

**Legacy: the pre-order funnel.** Before the download-first flip the canonical
funnel was `preorder_cta_clicked` → `/preorder` pageview → `preorder_started`
→ `preorder_submitted` → `preorder_confirmed` → `referral_click`.
`preorder_cta_clicked` no longer fires (the CTAs became Get Cereal Milk), but the
`/preorder` pages and their events still exist for inbound links; treat that
funnel as historical.

## Other insights worth keeping

1. **Top landing pages by conversion**, not just by traffic, filter pageviews
   by `$pathname`, break down by whether the session later converted.
2. **Referrer / UTM breakdown** → which channels bring people who convert.
3. **Session replays** filtered to sessions that viewed `/download` but did
   not fire `dmg_download_clicked`, watch where high-intent visitors drop.
4. **`dmg_download_requested` with `outcome = "paused"`**: blocked demand
   while self-serve downloads are switched off.

---

## Privacy posture

- Consent-first: nothing client-side runs without opt-in (GDPR-appropriate).
- The one server-side event (`dmg_download_requested`) is anonymous by
  construction: random per-hit `distinct_id`, `$process_person_profile:
  false`, no cookie, IPs reduced to a salted hash before leaving the process.
- US data region; client analytics served first-party via `/ingest`.
- Session replay masks **all** form inputs and any `[data-ph-mask]` element.
- Person profiles only for people who self-identify (a form) or sign in.
- Policy at `/privacy`, linked from the banner and the footer.
