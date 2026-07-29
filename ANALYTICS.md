# Analytics · cerealmilk.sh

Site-wide web analytics across all surfaces of `cerealmilk.sh`
(landing, `/docs`, `/sentry`). **PostHog** (US cloud) for traffic, funnels,
conversion events, and session replay; **Vercel Speed Insights** for Core Web
Vitals; **Vercel Web Analytics** for cookieless traffic counts (the
platform-side check on PostHog's numbers: it is measured at the edge, so
ad-blockers that drop PostHog do not drop it). Analytics is **on by default**
(no consent banner) with an opt-out
toggle on `/privacy`. Because `/docs` and `/sentry` are reverse-proxied under
the apex, all surfaces are same-origin and share **one** opt-out choice and
**one** dataset.
The signed-in app at `app.cerealmilk.sh` and the Mac app report into the **same
PostHog project**, so the whole journey (first pageview to paying seat) is one
funnel; see "Identity stitching" below.

Everything is inert until a PostHog key is set (step 1, done), the sites run
exactly as before with no key set.

---

## What you need to do (≈10 min, one-time)

### 1. Create the PostHog project and paste the key ✅ DONE

The project lives on PostHog **US cloud** (https://us.posthog.com, the data
region). The live **Project API key** (`phc_…`, a *public* client-side key)
lives in the Vercel env as `NEXT_PUBLIC_POSTHOG_KEY`: the layout injects it
into the page as `window.__CM_POSTHOG_KEY` for the loader, and
`src/lib/download-track.ts` and `src/lib/posthog-server.ts` read it directly.
Both the loader's `UI_HOST` and the `/ingest` reverse proxy in
`next.config.ts` point at the US endpoints (`us.i.posthog.com` /
`us-assets.i.posthog.com`). To rotate the key, update the Vercel env var and
redeploy.

Still optional in PostHog → **Settings → Recordings**: toggle **Record user
sessions ON**
   (session replay is off by default; the code is already configured for it,
   with all form inputs masked).

### 2. Turn on the Vercel products (landing project) ✅ DONE

Project **`cerealmilk-site`**, team `clippycommits-projects`, plan Hobby (that
project owns the apex domain). **Speed Insights** and **Web Analytics** are
both enabled and collecting, and both are free on Hobby.

No dashboard click was needed for either: shipping a production deploy that
imports the package is what activates the product. Web Analytics flipped from
off to on the moment the `@vercel/analytics` deploy went live on 2026-07-29.
Worth knowing, because the dashboard is the *only* way to turn one of these
**off** again: there is no public REST API for the toggle
(`PATCH /v9/projects/:id` rejects a `webAnalytics` property outright).

**How to check state without the dashboard**, since the toggle is invisible
from the CLI: the platform serves the loader only while the product is on, so
`curl -o /dev/null -w '%{http_code}' https://cerealmilk.sh/_vercel/insights/script.js`
returns 200 when Web Analytics is live and 404 when it is not. Same shape for
`/_vercel/speed-insights/script.js`. The authoritative view is
`GET /v9/projects/:id`, where `features.webAnalytics` plus an `enabledAt` on
`webAnalytics` / `speedInsights` tell you the same thing.

---

## How it's built

| Piece | File |
|---|---|
| Shared loader + opt-out plumbing + `window.track()` + `window.setPerson()` | `public/consent-analytics.js` |
| Reverse proxy (`/ingest` → PostHog US) + `skipTrailingSlashRedirect` | `next.config.ts` |
| Loads the script + `<SpeedInsights/>` + `<VercelAnalytics/>` | `src/app/layout.tsx` |
| Vercel Web Analytics, opt-out honored via `beforeSend` | `src/components/site/VercelAnalytics.tsx` |
| Typed event + person helpers (`track()`, `setPerson()`) | `src/lib/analytics.ts` |
| Fire-once-on-mount tracker (for redirect conversions) | `src/components/site/TrackEvent.tsx` |
| Server-side download logging (dmg + exe share it) | `src/lib/download-track.ts`, routes `src/app/download/CerealMilk.dmg/route.ts`, `src/app/download/CerealMilk.exe/route.ts` |
| Server-side lead capture (inquiry, demo, newsletter, waitlist, preorder) | `src/lib/posthog-server.ts`, routes `src/app/api/inquiry/route.ts`, `src/app/api/waitlist/route.ts` |
| Privacy & cookies policy + opt-out toggle | `src/app/privacy/page.tsx`, `src/components/site/AnalyticsOptOut.tsx` |
| Docs injection | `growth-docs/src/components/Head.astro` |
| Sentry injection | `skill-audit/webapp/public/sentry/index.html` (repo `cerealmilk-sh/skill-audit`) |

**One file, three sites.** `consent-analytics.js` lives only in the landing's
`/public` and is loaded from the apex by all three surfaces. Change tracking
once, everywhere updates. (Standalone `*.vercel.app` preview domains don't load
it, a feature: preview traffic never pollutes the data.)

**On by default, opt-out honored.** PostHog loads on every visit: first-party
cookies, autocapture, replay. No banner. The `/privacy` page exposes an
opt-out toggle (`window.__cmAnalytics`) backed by PostHog's own persisted
`opt_out_capturing()`, shared across all apex surfaces. A pre-2026-07-29
banner-era `localStorage['cereal-milk-consent'] = "denied"` is migrated to
that opt-out on first visit, then the legacy key is removed.

**One toggle covers Vercel too.** `<VercelAnalytics/>` reads that same
`window.__cmAnalytics.isOptedOut()` in its `beforeSend` and returns null when
the visitor has opted out, so Web Analytics events are dropped in the browser
before they are sent. That keeps the one-opt-out-choice rule true site-wide.
Two known gaps, both deliberate and both fail-open (they count, rather than
drop, when the answer is unknown):

1. PostHog's opt-out is what holds the state, so a visitor who opted out and
   then started blocking PostHog reads as opted **in** to Vercel.
2. `consent-analytics.js` is `afterInteractive`, so if `<Analytics/>` mounts
   first, `window.__cmAnalytics` is still undefined and that visitor's **first
   pageview** is sent. Later events in the session are gated correctly.

Closing (2) means either delaying the pageview until the loader boots, which
costs real counts on short visits and defeats the point of having a reliable
edge counter, or reading PostHog's `__ph_opt_in_out_*` localStorage key
directly, which couples us to PostHog internals. Neither trade looked worth it
for one anonymous, cookieless, device-identifier-free pageview. Revisit if the
privacy posture tightens.

Speed Insights is deliberately left outside the toggle entirely: it is
anonymous, cookieless performance sampling with no per-visitor data.

---

## The conversion events

Fired via `track(...)` (React) or a `data-track="…"` attribute (any element):

| Event | Where it fires |
|---|---|
| `get_started_cta_clicked` | every Get Cereal Milk pill, header/hero/home-pricing/footer (`data-track`, props `{src}`, plus `plan` on the home pricing cards), pointing at `/download` |
| `dmg_download_clicked` / `exe_download_clicked` | the `/download` interstitial's manual Mac/Windows download links (`data-track`, props `{src}`; client-side click) |
| `dmg_download_requested` / `exe_download_requested` | **server-side**, the `/download/CerealMilk.dmg` and `/download/CerealMilk.exe` route handlers: every GET, client-independent and ad-blocker-proof, anonymous random `distinct_id`, props `{outcome, asset, source, kind, country}`. The ground truth for downloads |
| `buy_cta_clicked` | the `/pricing` Buy buttons (`data-track`, props `{src, plan}`) |
| `demo_cta_clicked` | every Book-a-demo link (`data-track`, props `{src}`) |
| `demo_email_clicked` | the `/demo` email fallback link (`data-track`) |
| `demo_request_submitted` | `/demo` form completed, visitor sent to Cal.com (props `{src, team_size}`) |
| `inquiry_submitted` | `/contact` thank-you render (`TrackEvent` on mount) |
| `newsletter_subscribed` | Field Notes signup succeeds (`source` = placement) |
| `waitlist_joined` | **server-side only**, `/api/waitlist` product-waitlist signups |
| `whatsapp_message_clicked` | the floating founder WhatsApp button (`data-track`) |
| `referral_click` | share links on `/preorder/thanks` (props `{channel}`: email, whatsapp) |
| `preorder_started` / `preorder_submitted` / `preorder_confirmed` | the `/preorder` reservation flow (legacy surfaces since the download-first funnel went live 2026-07-14; still real events while the pages exist) |

PostHog **autocapture** also records all clicks/pageviews, so you get data on
everything else for free. The named ones exist for clean funnels.

**Server-side stages:** `dmg_download_requested` above (no client event by
design), plus **server-side lead capture** (live 2026-07-29, PR #3): the
`/api/inquiry` and `/api/waitlist` routes capture `inquiry_submitted`,
`demo_request_submitted`, `newsletter_subscribed`, `waitlist_joined` and
`preorder_submitted` through `posthog-node` (`src/lib/posthog-server.ts`),
identified by the submitter's email. These fire for every accepted
submission, so lead conversions are counted even when the client-side event
is blocked by an ad-blocker or the form was posted without JS. When the post
carries the visitor's PostHog cookie the route also sends `$identify` with
`$anon_distinct_id`, so the lead and their anonymous browsing history become
one person; with no cookie (PostHog fully blocked) the lead stays keyed by
email alone. Four of those
names also fire client-side (table above): funnels stay accurate because
PostHog counts unique persons per step, but raw trend counts include both
paths, so break down or filter by `$lib` (`web` = client, `posthog-node` =
server) when one path is wanted. Lead form posts also land in the Resend
audience + `WAITLIST_WEBHOOK_URL` with their `source`; the confirmation
email and every nurture step go through `src/lib/drip/` and are auditable in
the Resend dashboard and the daily `/api/cron/drip` tick result
(`{processed, sent}`).

**Add a click event to any CTA** with no code:
```html
<a href="…" data-track="my_event" data-track-props='{"plan":"pro"}'>…</a>
```

---

## Identity stitching (web → sign-in → Mac app, one person)

The point: a named lead's anonymous browsing, their download, their sign-up,
and their in-app usage should all be one PostHog person, keyed by the **Better
Auth userId**. Live since 2026-07-29 (auth server + app ≥ 0.2.14):

1. **`cross_subdomain_cookie: true`** in the loader scopes the PostHog cookie
   to `.cerealmilk.sh` (not host-only), so the anonymous `distinct_id` minted
   on the marketing site rides along with every request to
   `signin.cerealmilk.sh`.
2. **`window.setPerson(props)`, lead enrichment.** The loader runs PostHog
   with `person_profiles: "identified_only"`, so anonymous visitors have no
   person profile at all. When a visitor self-identifies in a form (demo
   request, newsletter, preorder), the form calls `setPerson({ email, name,
   lead_source })` via `src/lib/analytics.ts`, which forwards to
   `posthog.setPersonProperties()`. That call is what upgrades the anonymous
   visitor into a person profile, now carrying their email, while they are
   still a lead. Only fields the visitor actually typed are sent.
3. **Server-side `$identify` at sign-up/sign-in.** The auth server
   (`cerealmilk` repo, `server/lib/analytics.js`) hooks Better Auth's
   `databaseHooks`: `user.create` fires `sign_up_complete` (with `$set` email
   and name) and `session.create` fires `sign_in_complete`, both with
   `distinct_id` = the Better Auth userId. Because of (1) the request carries
   the visitor's anonymous cookie, the server also sends `$identify` with
   `$anon_distinct_id` = that cookie's id, and PostHog merges the whole
   pre-signup journey (pageviews, CTA clicks, `dmg_download_clicked`) into
   the user. Ad-blocker-proof, works for the web flow and for the desktop
   flow (the app signs in through the system browser on the same domain).
4. **The Mac app identifies with the same userId.** After the sign-in
   handoff, `src/telemetry.js` sends its own `$identify` (merging the app's
   random per-install id into the user) and keys every later `app_*` event to
   the Better Auth userId. So web, sign-in, and desktop are one person end to
   end, and per-user behaviour is queryable in PostHog under one profile.

The server-side `dmg_download_requested` event deliberately stays anonymous
(random per-hit id, no cookie): it is the ground-truth download count, not a
person event. Per-person download attribution comes from the merged
client-side journey (`dmg_download_clicked` + the funnel around it).

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
5. `sign_in_complete` (server-side from the auth server on every sign-in,
   keyed by Better Auth userId; the app also fires `app_signed_in`)
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

- On by default with a persistent, honored opt-out on `/privacy`; the policy
  discloses exactly what is collected.
- Server-side download logging (`dmg_download_requested`) is anonymous by
  construction: random per-hit `distinct_id`, `$process_person_profile:
  false`, no cookie, IPs reduced to a salted hash before leaving the process.
- Server-side lead events are identified by the email the visitor typed into
  the form, the same self-identification bar as the client-side `setPerson`.
- US data region; client analytics served first-party via `/ingest`.
- Session replay masks **all** form inputs and any `[data-ph-mask]` element.
- Person profiles only for people who self-identify (a form) or sign in.
- Policy at `/privacy`, linked from the footer.
