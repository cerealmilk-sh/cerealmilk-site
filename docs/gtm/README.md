# Cereal Milk · GTM & Lifecycle Email System

> Moved here from the standalone GTM repo (now archived) on 2026-06-20 so
> the GTM docs live alongside the code they describe (`src/lib/drip/*`).
> `sequences.md` is **derived** from `src/lib/drip/sequences.ts`, keep it in
> sync when the copy in code changes. `broadcasts.md` holds the one-off
> marketing emails for the Field Notes list.
>
> **Rewritten 2026-07-29** to the shipped product ("the messenger built for AI
> agents": WhatsApp today, LinkedIn and Gmail next, agent on the customer's own
> model account, Mac and Windows, $30/$40 pricing, 7-day trial at account
> creation). The old WhatsApp+LinkedIn/CRM-sync copy and the five-email
> AI-spend course (its `/docs` chapter links 404 since the docs site was
> removed 2026-07-28) were retired the same day.

A reference for the lifecycle-email ("drip") motion built into the cerealmilk.sh
app. This doc set is **documentation only**, the code lives in `src/lib/drip/`
and the `/api/{waitlist,inquiry,cron/drip,lifecycle,unsubscribe}` routes.

> **Status 2026-07-29:** inline sends (welcomes, preorder confirmation,
> inquiry/demo acks) are LIVE in production with `RESEND_API_KEY` +
> `WAITLIST_EMAIL_FROM` set. The timed drip needs the Upstash store
> (`UPSTASH_*`), and activation additionally needs something to POST
> `converted` to `/api/lifecycle`. See §7.

---

## 1. The GTM motion in one picture

```
   Visitor on cerealmilk.sh
   ├── newsletter form ──► POST /api/waitlist ──► Field Notes welcome (no drip)
   ├── /contact · /demo ─► POST /api/inquiry ──► brief to Daniel + ack to sender
   ├── product signup ───► POST /api/waitlist ──► product welcome + NURTURE
   └── /preorder ────────► POST /api/waitlist ──► confirmation, converted=true
                                                   (nurture never starts/stops)

   NURTURE (N1–N6, daily cron), job: download + trial
     +2 pain · +4 ban objection · +7 privacy · +10 cockpit
     +14 founding-seat offer · +21 breakup

   account created (app/auth server POSTs {"type":"converted"})
                        │
                        ▼
   ACTIVATION (A1–A6, daily cron), job: first agent moment inside the trial
     +0 welcome/trial · +1 connect (skips: whatsapp_connected)
     +2 first ask (skips: first_insight) · +4 cockpit (skips: first_sync)
     +6 trial-ends note · +10 feedback
```

**Why this shape.** The app is GA: the conversion is a download plus an
account, not a waitlist seat. Nurture exists to move a warm lead to the trial
(and offer the founding price-lock to the convinced); activation exists to get
a new trial to the moment the product sells itself, the first agent answer on
a real thread, inside the 7 trial days. Steps go quiet as the app reports real
usage, so a fast starter gets fewer emails.

---

## 2. Product context (what we're selling)

- **Product:** desktop app, Mac and Windows. WhatsApp in one fast window with
  an AI agent beside every chat, running on the customer's own model account
  (Claude, ChatGPT, Gemini, or any OpenAI-compatible endpoint). ⌘K palette,
  ⌘⇧S Markdown export, snippets, MCP support. LinkedIn and Gmail are next.
- **Privacy line (load-bearing in every email):** the agent reads only the
  open chat, on request; no unofficial APIs; drafts land in the composer and
  the user always hits send; no Cereal Milk servers in the message path.
- **ICP:** founders, investors, dealmakers whose deals happen in chat. Venture
  is the deepest wedge (`/for/venture-capital`).
- **Pricing** (from `src/lib/pricing.ts`, never hardcode): Starter $30/user/mo
  or $300/yr; Business $40/user/mo or $396/yr; 7-day free trial at account
  creation, no card. Founding seat: reservation, no card, price locked, cap
  100, personal setup call.
- **Conversion events:** product signup → nurture; account creation
  (`converted` via `/api/lifecycle`) → activation.

---

## 3. The sequences

Plain-text-first, founder voice (signed "Daniel, Founder, Cereal Milk"), from
`Clippy @ Cereal Milk`, reply-to `clippy@cerealmilk.sh`, each with a
one-click unsubscribe footer (RFC 8058 headers included; transactional acks
carry neither). The renderer turns one set of "blocks" into both a
`text/plain` part and a minimal mirrored HTML part.

### Suppression / control rules

| Condition | Effect |
|---|---|
| **Unsubscribe** | Hard stop on everything. |
| **Converted (account created)** | Ends nurture; starts activation. |
| **Replied to a drip** | Pause both sequences (hand to a human). |
| **Usage signal** | The matching activation step skips itself. |
| **Frequency cap** | At most **one** drip email per contact per day. |

### 3a. Nurture, anchor: signup

*(Day-0 welcome is sent inline by `/api/waitlist`; this is N1–N6, sent by cron.)*

| # | Day | Subject | Job |
|---|-----|---------|-----|
| N1 | +2 | Where your best deals go to die | Agitate the pain; ask a reply |
| N2 | +4 | Will this get my WhatsApp number banned? | Kill the #1 objection |
| N3 | +7 | An agent that reads one chat, not your life | Differentiate on privacy |
| N4 | +10 | A day in the Cereal Milk cockpit | Show the product |
| N5 | +14 | Lock your price while we're small | The founding offer |
| N6 | +21 | Should I keep you on the list? | Breakup / list hygiene |

### 3b. Activation, anchor: account creation (`converted`)

| # | Day | Subject | Skips if |
|---|-----|---------|----------|
| A1 | +0 | You're in: your Cereal Milk trial starts now | (never; sent instantly) |
| A2 | +1 | Two connections and you're live | `whatsapp_connected` |
| A3 | +2 | Ask the agent one thing today | `first_insight` |
| A4 | +4 | ⌘K, ⌘⇧S, and the rest of the cockpit | `first_sync` |
| A5 | +6 | Your trial wraps up tomorrow | (never; the honest pricing note) |
| A6 | +10 | How's Cereal Milk feeling? | (never; feedback ask) |

> Full copy for every email, including the Day-0 welcomes, the preorder
> confirmation, and the inquiry/demo acks, is in [`sequences.md`](sequences.md).
> One-off marketing broadcasts live in [`broadcasts.md`](broadcasts.md).

---

## 4. Architecture (where the code lives)

```
src/lib/drip/
  types.ts       Contact + SequenceState shapes; freshContact()
  email.ts       Transport + render (text+html from "blocks") + config (FROM, URLs)
  store.ts       Upstash Redis over REST: rollout-safe, no-ops if unset
  sequences.ts   The two sequences AS DATA (timing, subjects, copy, skipIf)
  engine.ts      processContact(), the one place that sends/persists/suppresses;
                 plus tick() (cron) and the mutators
  unsub.ts       HMAC-signed unsubscribe links (UNSUBSCRIBE_SECRET)

src/app/api/
  waitlist/route.ts        welcomes + preorder confirmation + enrollment
  inquiry/route.ts         brief to Daniel + transactional ack to the sender
  cron/drip/route.ts       GET/POST → tick(); requires Authorization: Bearer CRON_SECRET
  lifecycle/route.ts       POST signals (converted / replied / usage); x-lifecycle-secret
  unsubscribe/route.ts     signed one-click unsubscribe, also hard-stops the drip

vercel.json                Vercel Cron → /api/cron/drip daily at 15:00 UTC
.env.example               All env vars documented
```

**Data model**: one `Contact` JSON record per email in Redis
(`drip:c:{email}`), plus a Redis set `drip:active` the cron iterates. A contact
holds: segment, per-sequence state (`startedAt`, next `step`, `sentAt`,
`done`), lifecycle flags (`converted` / `unsubscribed` / `replied`), usage
`signals`, and `lastDripAt` (the frequency cap). Contacts written before
2026-07-29 may carry a retired `course` sequence; the engine ignores it.

---

## 5. The signals the system consumes

`POST /api/lifecycle` with header `x-lifecycle-secret: <LIFECYCLE_INGEST_SECRET>`
and body `{ "type": "...", "email": "you@co.com", "name"?: "Jane" }`:

| `type` | Meaning | Effect |
|---|---|---|
| `converted` | account created (trial started) | stop nurture, start activation |
| `replied` | replied to a drip | pause both sequences |
| `unsubscribed` | opted out | hard stop |
| `whatsapp_connected` | scanned the WhatsApp QR | A2 skips |
| `first_insight` | first agent ask on a thread | A3 skips |
| `first_sync` | first thread export | A4 skips |
| `linkedin_connected` | reserved (channel not shipped) | recorded only |
| `crm_linked` | reserved (MCP/CRM step) | recorded only |

---

## 6. Turning it on (operator runbook)

Everything is rollout-safe: each unset var disables its slice and nothing else.

1. **Sender** (LIVE): `RESEND_API_KEY` (send-only is enough for lifecycle) and
   `WAITLIST_EMAIL_FROM="Clippy @ Cereal Milk <clippy@cerealmilk.sh>"` (the
   value live in prod; the display name was shortened after Gmail truncated
   the longer one). When `updates.cerealmilk.sh` is verified in Resend, flip
   FROM to `clippy@updates.cerealmilk.sh` (env change only).
2. **Store**: create an Upstash Redis DB and set `UPSTASH_REDIS_REST_URL` +
   `UPSTASH_REDIS_REST_TOKEN` (the Vercel Marketplace `KV_REST_API_*` names
   work too). Until then the drip is inert and welcomes still send.
3. **Cron** (LIVE): `CRON_SECRET` set; Vercel Cron hits `/api/cron/drip` daily.
4. **Conversion signal**: have the auth server (or the app) POST
   `{"type":"converted","email":…}` with the `x-lifecycle-secret` header on
   account creation. Nothing emits this yet; activation waits on it.
5. **Usage signals**: have the app POST `whatsapp_connected` /
   `first_insight` / `first_sync` the same way.
6. **Audience + broadcasts**: needs the full-access Resend key; create the
   Field Notes audience, set `RESEND_AUDIENCE_ID`, and send `broadcasts.md`
   content through Resend Broadcasts.

Manual cron trigger (smoke test):

```bash
curl -X POST https://cerealmilk.sh/api/cron/drip \
  -H "Authorization: Bearer $CRON_SECRET"
# → {"ok":true,"enabled":true,"processed":N,"sent":M}   (enabled:false = no store)
```

---

## 7. Gaps & things to verify before full go-live

- **Drip store unset.** `UPSTASH_*` not in Vercel env yet: nurture/activation
  are enrolled-but-inert. Welcomes, confirmations, and acks send regardless.
- **No conversion emitter.** Nothing POSTs `converted` yet; the natural home
  is the auth server's sign-up hook (Better Auth `databaseHooks`, same place
  the PostHog identify runs). Until then activation never starts.
- **No usage-signal emitters.** The app doesn't POST `whatsapp_connected` /
  `first_insight` / `first_sync` yet, so A2–A4 will send rather than skip.
  Acceptable, they read fine as reminders, but wire them for the quiet-skip
  behavior.
- **Audience blocked on the full-access Resend key.** The production key is
  send-only: contacts are not being added to a Resend audience
  (`RESEND_AUDIENCE_ID` unset), so broadcasts have no list yet. Leads are
  still captured in PostHog (`newsletter_subscribed` etc.) and the Vercel
  function logs.
- **updates.cerealmilk.sh not verified.** Lifecycle mail sends from the
  verified apex meanwhile; add the subdomain in Resend + its DNS at Namecheap,
  then flip `WAITLIST_EMAIL_FROM`.
- **Segment not captured.** Everyone defaults to `mac`; harmless now that the
  app ships for Mac and Windows.

---

## 8. Possible next steps

- Wire the three usage signals in the app (one POST each) for quiet-skips.
- A/B the N5 founding-offer subject and the A5 trial-note timing.
- A re-engagement sequence for trials that lapsed (needs `last_active`).
- Dashboard: enrolled, sent, reply rate, nurture→trial conversion, activation
  completion (PostHog events already capture the top of the funnel).

---

*Source of truth is the code in `cerealmilk-site`; this doc set describes it.*
