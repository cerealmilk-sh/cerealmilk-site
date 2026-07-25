# Cereal Milk · GTM & Lifecycle Email System

> Moved here from the standalone `Cereal Milk-gtm` repo (now archived) on 2026-06-20 so
> the GTM docs live alongside the code they describe (`src/lib/drip/*`).
> `sequences.md` is **derived** from `src/lib/drip/sequences.ts`, keep it in sync
> when the copy in code changes.

A reference for the lifecycle-email ("drip") motion built into this Cereal Milk landing
app. This doc set is **documentation only**, the code lives in `src/lib/drip/`
and the `/api/{cron/drip,lifecycle,webhooks/clerk}` routes. Use it to review the
strategy, the email copy, and the wiring, then to operate or extend the system.

> **Status:** built, type-checks and builds clean, **not yet turned on.** It's
> rollout-safe, inert until the env vars below are set. See
> [§7 Gaps & before go-live](#7-gaps--things-to-verify-before-go-live).

---

## 1. The GTM motion in one picture

```
                         ┌─────────────────────────────────────────────┐
   Visitor               │                 cerealmilk.sh                      │
   ───────►  "Request access" (waitlist)  ─────────────┐               │
                         └─────────────────────────────│───────────────┘
                                                        ▼
                                            POST /api/waitlist
                                          ┌───────────────────────┐
                                          │ • Day-0 welcome email  │  (inline, instant)
                                          │ • enroll in NURTURE    │
                                          └───────────┬───────────┘
                                                      ▼
                       NURTURE drip (N1–N6, daily cron)  ── converts? ──► /onboard
                       +2  pain                                            (Clerk → Stripe)
                       +4  "will my number get banned?"                         │
                       +7  privacy / discretion                                 │ purchase
                       +10 a day in the cockpit                                 ▼
                       +14 the offer (skip the line)            POST /api/webhooks/clerk
                       +21 breakup / last call                       "converted"
                                                                          │
                            (nurture stops on convert) ◄─────────────────┤
                                                                          ▼
                       ACTIVATION drip (A1–A5, daily cron)  anchored on purchase
                       +0  you're in, download
                       +1  connect WhatsApp & LinkedIn   ◄── skips itself as the
                       +3  link Attio / Affinity             Mac app reports each
                       +5  share your first thread           usage signal via
                       +10 how's it feeling? (feedback)      POST /api/lifecycle
```

**Why this shape.** Cereal Milk captures a warm, high-intent waitlist (founders,
investors, dealmakers who live in WhatsApp/LinkedIn DMs) but, before this, only
emailed them **once**. The nurture drip turns that silence into a sequence that
either converts a lead to a pre-order or keeps them warm until their wave opens.
The activation drip is the higher-leverage half: for a paid app, getting a buyer
to their **first synced thread** matters more than any nurture email.

---

## 2. Product context (what we're selling)

- **Product:** native Mac app. WhatsApp Web + LinkedIn messaging in one window,
  syncs the threads you choose to **Attio or Affinity**, command palette (⌘K),
  channel flip (⌘1/⌘2), relationship insights, **private by default**.
- **ICP:** founders, investors, dealmakers whose deals happen in WhatsApp &
  LinkedIn DMs and who run Attio/Affinity. macOS 26+.
- **Pricing:** $29/mo, or $9/mo billed yearly ($108).
- **Conversion event:** `/onboard` → Clerk sign-in → Stripe checkout (pay the
  first year up front = skip the line + priority setup, founder Slack,
  white-glove CRM mapping).
- **Top differentiators** (the angles the drips lean on): no unofficial API (no
  ban risk), private-by-default with a server-enforced sync gate, and a
  keyboard-first "cockpit."

---

## 3. The two sequences

Plain-text-first, founder voice (signed "Daniel, Founder, Cereal Milk"), each with a
one-click unsubscribe footer. The renderer turns one set of "blocks" into both a
`text/plain` part and a minimal mirrored HTML part, so a CTA can be a real link
without the email looking like a designed template.

### Suppression / control rules

| Condition | Effect |
|---|---|
| **Unsubscribe** | Hard stop on everything. |
| **Converted (purchase)** | Ends nurture; starts activation. |
| **Replied to a drip** | Pause both sequences (hand to a human). |
| **Usage signal** | The matching activation step skips itself. |
| **Frequency cap** | At most **one** drip email per contact per day. |

### 3a. Nurture, anchor: waitlist signup

*(Day-0 welcome is sent inline by `/api/waitlist`; this is N1–N6, sent by cron.)*

| # | Day | Subject | Job |
|---|-----|---------|-----|
| N1 | +2 | Where your best deals go to die | Agitate the pain; ask a reply |
| N2 | +4 | Will this get my WhatsApp number banned? | Kill the #1 objection |
| N3 | +7 | Some conversations were never meant for the record | Differentiate on privacy |
| N4 | +10 | A day in the Cereal Milk cockpit | Show the product |
| N5 | +14 | Want to skip the line? | The pre-order offer |
| N6 | +21 | Should I keep you on the list? | Breakup / list hygiene |

### 3b. Activation, anchor: purchase

Steps **skip** when the Mac app reports the matching signal (see §5), so a fast
starter receives fewer emails.

| # | Day | Subject | Skips if |
|---|-----|---------|----------|
| A1 | +0 | You're in, let's get Cereal Milk set up | (never; sent instantly on purchase) |
| A2 | +1 | Step 1: connect WhatsApp & LinkedIn | `whatsappConnected && linkedinConnected` |
| A3 | +3 | Step 2: link Attio or Affinity | `crmLinked` |
| A4 | +5 | Share your first thread (the 2-minute version) | `firstSync` |
| A5 | +10 | How's Cereal Milk feeling? | (never; feedback ask) |

> Full copy for every email is in [`copy/sequences.md`](copy/sequences.md).

---

## 4. Architecture (where the code lives)

All in `cereal-milk-site`:

```
src/lib/drip/
  types.ts       Contact + SequenceState shapes; freshContact()
  email.ts       Transport + render (text+html from "blocks") + config (FROM, URLs)
  store.ts       Upstash Redis over REST: rollout-safe, no-ops if unset
  sequences.ts   The two sequences AS DATA (timing, subjects, copy, skipIf)
  engine.ts      processContact(), the one place that sends/persists/suppresses;
                 plus tick() (cron) and the mutators

src/app/api/
  waitlist/route.ts        (modified) welcome email + enroll in nurture
  cron/drip/route.ts       GET/POST → tick(); requires Authorization: Bearer CRON_SECRET
  lifecycle/route.ts       POST signals (converted / replied / usage); x-lifecycle-secret
  webhooks/clerk/route.ts  Svix-verified Clerk Billing webhook → "converted"
  unsubscribe/route.ts     (modified) also hard-stops the drip

vercel.json                Vercel Cron → /api/cron/drip daily at 15:00 UTC
.env.example               All env vars documented
```

**Data model**: one `Contact` JSON record per email in Redis
(`drip:c:{email}`), plus a Redis set `drip:active` the cron iterates (so it never
scans the keyspace). A contact holds: segment, the per-sequence state
(`startedAt`, next `step`, `sentAt` map, `done`), the lifecycle flags
(`converted` / `unsubscribed` / `replied`), the usage `signals`, and
`lastDripAt` (the frequency cap).

**Engine logic**, `processContact()` is the heart: for each live sequence
(activation before nurture), it applies suppression, then walks forward,
skipping `skipIf` steps for free, sending the first **due** step, or waiting,
sends at most one email, persists, and adds/removes the contact from the active
set. The daily `tick()` just loads the active set and runs it on each.

---

## 5. The signals the system consumes

`POST /api/lifecycle` with header `x-lifecycle-secret: <LIFECYCLE_INGEST_SECRET>`
and body `{ "type": "...", "email": "you@co.com", "name"?: "Jane" }`:

| `type` | Meaning | Effect |
|---|---|---|
| `converted` | purchased | stop nurture, start activation (also fired by the Clerk webhook) |
| `replied` | replied to a drip | pause both sequences |
| `unsubscribed` | opted out | hard stop |
| `whatsapp_connected` | connected WhatsApp | activation A2 may skip |
| `linkedin_connected` | connected LinkedIn | activation A2 may skip |
| `crm_linked` | linked Attio/Affinity | activation A3 skips |
| `first_sync` | first thread synced | activation A4 skips |
| `first_insight` | first insight viewed | (reserved) |

---

## 6. Turning it on (operator runbook)

Everything is rollout-safe: with `UPSTASH_*` unset the drip is inert and the
welcome email + site work unchanged.

1. **Store**: create an Upstash Redis DB (or Vercel KV) and set
   `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
2. **Cron**: set `CRON_SECRET` (any long random string). Vercel Cron
   (`vercel.json`) sends it as `Authorization: Bearer <CRON_SECRET>`
   automatically. Other schedulers work the same way.
3. **Purchase signal**: point a Clerk Billing webhook at
   `/api/webhooks/clerk` and set `CLERK_WEBHOOK_SECRET` (the `whsec_…` signing
   secret). Subscribe to the subscription events.
4. **Usage signals**: have the Mac app `POST /api/lifecycle` with
   `LIFECYCLE_INGEST_SECRET`.
5. **Email sender**: `RESEND_API_KEY` (already used by the welcome email);
   optionally override `WAITLIST_EMAIL_FROM` / `WAITLIST_EMAIL_REPLY_TO`.

Manual cron trigger (smoke test):

```bash
curl -X POST https://cerealmilk.sh/api/cron/drip \
  -H "Authorization: Bearer $CRON_SECRET"
# → {"ok":true,"enabled":true,"processed":N,"sent":M}
```

---

## 7. Gaps & things to verify before go-live

- **Clerk webhook event names/payload.** The handler matches
  `subscription(item).(created|active|updated)` and searches the payload
  defensively for an email, **not confirmed against a live Clerk dashboard.**
  Send a real test event and adjust if needed.
- **Activation depends on not-yet-emitted signals.** Until the Clerk webhook
  fires `converted` and the Mac app posts usage signals, the activation track
  won't start. Endpoints are ready; the app side needs wiring.
- **Segment not captured.** The signup form doesn't yet capture macOS-vs-not, so
  everyone defaults to `mac` and N5 (the pre-order push) goes to all. Add a
  field if you want the non-mac track to diverge.

---

## 8. Possible next steps

- A/B test the N5 offer subject + the breakup timing.
- Capture the macOS segment and give non-mac signups a "we'll ping you when it's
  ready" track instead of the pre-order push.
- Add a re-engagement sequence for converted users who go quiet (needs
  `last_active` from the app).
- Dashboard/metrics: enrolled, sent, reply rate, nurture→pre-order conversion,
  activation completion.

---

*Generated as a review artifact for the Cereal Milk GTM build. Source of truth is the
code in `cereal-milk-site`.*
