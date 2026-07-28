# Loop: StoryBrand landing rebuild + pre-order conversion funnel

You are running this prompt on a **self-paced loop** (`/loop` with no interval). Each
firing you make **one meaningful, shippable increment** toward a complete pre-order
funnel for the Cereal Milk product, verify it, record it, and schedule the next pass. You are
not trying to finish in one shot. You are trying to never lose the thread.

---

## 0. Mission

Rebuild the Cereal Milk landing experience around a **StoryBrand (SB7) BrandScript** and stand
up the **complete funnel** that maximises conversion on **pre-orders of the Cereal Milk Mac
app** (the Repository: git-for-your-relationships).

"Complete funnel" means every stage exists, is wired, is measured, and is optimised:
traffic entry → StoryBrand landing → transitional lead capture → pre-order offer →
reservation/checkout → confirmation + onboarding → nurture drip for non-buyers →
referral loop. A visitor can go from cold click to confirmed pre-order without a dead
end, and every step emits an event we can read.

**Definition of done for the whole loop** (all must be true, then STOP):
1. Home page rebuilt to the SB7 structure below, live in prod.
2. A dedicated `/preorder` offer + reservation flow exists and converts (or waitlists
   if Stripe is not live) end to end.
3. Confirmation page + transactional email + multi-step nurture drip all fire.
4. Every funnel step emits a named analytics event; a funnel view is queryable.
5. At least one full round of conversion-optimisation passes (copy, proof, friction,
   scarcity) applied against the checklist in §6, with rationale recorded in state.
6. `pnpm build` (or repo's build) is green and the site is deployed to prod.

When all six hold, call `ScheduleWakeup{ stop: true }` and post a final summary.

---

## 1. Repo, stack, and house rules (READ EVERY TIME — do not deploy without these)

- **Repo:** `~/github/growth-landing` — Next.js App Router, TypeScript. Routes in
  `src/app`, shared logic in `src/lib`, UI in `src/components`, content in
  `src/content`. Push via the **cerealmilk-sh** account.
- **This is the live product domain** (Vercel project `Cereal Milk`, NOT a stray
  growth-landing project). `main` does **NOT** auto-deploy. Ship with:
  `vercel deploy --prod --scope cerealmilk` (build green first). Preview deploys for
  review-before-prod: `vercel deploy --scope cerealmilk`.
- **Deploy-author rule:** deploys must be attributed correctly — confirm the Vercel
  scope/account before promoting to prod.
- **Pricing is single-sourced** in `src/lib/pricing.ts`. Never hardcode a price
  anywhere else. Pre-order/founding pricing must extend that file, not bypass it.
  Current plans: Starter $30/mo · $300/yr, Business $40/mo · $396/yr.
- **NO EM DASHES** anywhere in site copy. Hard rule (AI-slop tell). Replace by role
  with a comma, colon, period, or "to". This applies to everything you write.
- **Existing scaffolding to reuse, not reinvent:** `src/lib/drip/` (email drip),
  `src/lib/journeys.ts`, `src/lib/analytics.ts`, and routes `demo/`, `get/`,
  `onboard/`, `newsletter/`, `pricing/`, `api/`. Inspect these before building new.
- **Analytics:** consent-gated PostHog (US). Use the existing `analytics.ts` facade;
  do not add a second analytics path.
- **Reality check on payments:** genuine paid checkout may be blocked (Stripe live +
  Clerk plans are founder-gated). If real payment capture is not available, ship the
  pre-order as a **reservation/waitlist with an optional deposit stub**, framed as a
  founding pre-order, and leave a clean seam to switch on real capture later. Record
  which mode you shipped in state. Do not fake a charge.

---

## 2. StoryBrand BrandScript (the strategy this loop implements)

Implement the landing narrative in this exact order. Every section on the page maps to
one SB7 beat. Keep copy concrete, short, second-person, zero jargon, zero em dashes.

**1. Character (the hero = the customer, not us).**
A relationship-driven professional (VC, founder, dealmaker) whose net worth *is* their
network. They *want*: to never drop a relationship and to close on the strength of who
they know.

**2. Problem (lead with this above the fold).**
- *External:* Their relationships are scattered across LinkedIn, Gmail, and WhatsApp.
  Context is lost, follow-ups are dropped, threads go cold.
- *Internal:* The nagging fear of forgetting who they owe a reply, the low-grade shame
  of feeling disorganised at the exact moments that matter.
- *Philosophical:* Hard-won relationships should not rot in silos. Your network is too
  valuable to leave to memory and luck.
- *Villain (name it):* the silo. Digital amnesia. The scattered inbox.

**3. Guide (Cereal Milk = the guide, shown with empathy + authority).**
- *Empathy:* We know what it costs to lose a deal because a thread went quiet.
- *Authority:* Trusted across 68 funds. On-device and private by default. The
  Repository: git for your relationships.

**4. Plan (make the path feel obvious and safe).**
Product plan, 3 steps: **Connect your accounts → Cereal Milk builds your Repository → Never
drop a relationship again.**
Pre-order plan, 3 steps: **Reserve your seat → Lock founding pricing → Get first
access at launch.**
Include an agreement plan (the risk-reversal promises: private by default, cancel
anytime before charge, your data is exportable).

**5. Call to Action.**
- *Direct (one primary, repeated):* **Pre-order Cereal Milk** → `/preorder`.
- *Transitional (for the not-yet-ready):* Watch the 90-second demo / Read the docs /
  See the Repository. One transitional CTA, not five.

**6. Success (paint the after).**
Every relationship remembered. Nothing dropped. Deals that close because you followed
up first. Calm, total control of your network.

**7. Failure (the stakes, used sparingly).**
Dropped threads. The intro you forgot to make. The deal that went to whoever replied.
Your network quietly rotting while you are busy.

**One-liner** (hero headline candidate, iterate on it):
"Your network is your net worth. Stop letting it rot in silos."

---

## 3. Funnel architecture (what "complete" looks like)

Build and wire each stage. Reuse existing routes where they already exist.

| Stage | Route / asset | Job | Primary event |
|---|---|---|---|
| Entry | organic/GEO, docs, outbound | land the click | `landing_view` |
| StoryBrand landing | `/` (rebuild) | problem → plan → CTA | `cta_click` |
| Transitional capture | demo modal / `/demo` / lead magnet | capture the not-ready | `lead_capture` |
| Pre-order offer | `/preorder` (new) | founding offer + scarcity + guarantee | `preorder_view` |
| Reservation / checkout | `/preorder` action or `/get` | reserve seat (deposit or waitlist) | `preorder_start` / `preorder_submit` |
| Confirmation | `/preorder/thanks` (new) | confirm + set expectations + referral ask | `preorder_confirmed` |
| Transactional email | `src/lib/drip/` | receipt + what-happens-next | `email_sent` |
| Nurture drip | `src/lib/drip/` | convert non-buyers over N days | `drip_step` |
| Referral loop | confirmation + email | founding members invite peers | `referral_click` |

Cross-cutting: a persistent scarcity/urgency element for the founding cohort (limited
founding seats or a founding-price deadline), a risk-reversal guarantee block, and
social proof (68 funds, testimonials when `testimonials.ts` is populated).

---

## 4. Per-iteration protocol (do this EVERY firing)

1. **Orient.** Read `prompts/.loop/preorder-funnel.state.md` (create it on first run
   from the template in §7). It is the single source of truth for progress. Also
   `git status` and `git log --oneline -5` to see what the last pass and other
   sessions did. The tree is shared, so never assume it is clean.
2. **Select ONE next action.** Pick the highest-value *unblocked* item from the
   milestone backlog in §5. One increment per firing. Prefer finishing a started
   milestone over opening a new one.
3. **Implement.** Make the change. Match surrounding code style. Keep copy on-brand
   (§1, §2). Extend `pricing.ts` for any pricing; use the `analytics.ts` facade for
   any event; use `drip/` for any email.
4. **Verify.** Build (`pnpm build` or the repo's script). For UI/flow changes, drive
   the actual flow (use the `run`/`verify` skills or a preview deploy) and confirm the
   event fires. Do not mark a step done on "it should work".
5. **Ship.** Commit on a branch (never straight to a dirty shared `main`; branch,
   commit with the Co-Authored-By trailer, and only merge/deploy when green). Deploy
   preview or prod per §1. Confirm the deploy.
6. **Record.** Update the state file: move the item to Done with a one-line result +
   commit SHA, note any new blocker, refresh "Next up". This is what makes the loop
   resumable.
7. **Decide.** If all six done-conditions in §0 hold, STOP via
   `ScheduleWakeup{ stop: true }` with a final summary. Otherwise schedule the next
   pass: `ScheduleWakeup{ delaySeconds: 1200, prompt: <this exact /loop input>,
   reason: "<what the next pass will tackle>" }`. If you kicked off a background
   build/deploy the harness can track, a longer fallback is fine.

**Never** do more than one milestone per firing even if you have time. Small, verified,
recorded increments beat big unverified ones. If blocked (e.g. needs founder Stripe
access), record the blocker, do the best adjacent unblocked work, and note it.

---

## 5. Milestone backlog (ordered; respect dependencies)

Work top-down; later items may depend on earlier ones. Split any item that is too big
for one firing into sub-steps and track them in state.

- **M0 — Recon.** Read the current `/`, `demo`, `get`, `onboard`, `newsletter`
  routes, `journeys.ts`, `drip/`, `analytics.ts`, `pricing.ts`. Write a short "current
  vs target" gap note into state. No code change this pass.
- **M1 — BrandScript lock.** Turn §2 into a committed content module (e.g.
  `src/content/brandscript.ts` or MDX) that the home page reads. One place to edit the
  narrative.
- **M2 — Home rebuild.** Rebuild `/` to the SB7 section order. Problem above the fold,
  one repeated direct CTA to `/preorder`, one transitional CTA, plan (3 steps), proof
  (68 funds), success, stakes, guarantee, footer CTA.
- **M3 — Pre-order offer page.** New `/preorder`: founding offer, what you get,
  founding pricing (via `pricing.ts`), scarcity element, risk-reversal guarantee,
  FAQ that kills objections.
- **M4 — Reservation/checkout flow.** Wire the pre-order action. Real capture if
  available, else reservation/waitlist with deposit stub. Validate, handle errors,
  store the lead. Record which mode shipped.
- **M5 — Confirmation.** `/preorder/thanks`: confirm, set expectations, referral ask.
- **M6 — Transactional + nurture email.** Receipt/next-steps email via `drip/`, plus a
  multi-step nurture sequence for non-buyers who captured as leads.
- **M7 — Analytics + funnel view.** Ensure every event in §3 fires through
  `analytics.ts`; document/create a funnel definition so drop-off is queryable.
- **M8 — Conversion optimisation pass.** Run the whole funnel against §6. Apply the
  highest-leverage fixes (headline, proof placement, friction removal, scarcity,
  guarantee clarity). Record each change and its rationale.
- **M9 — Final verification + prod deploy + STOP.** Full build green, flow driven end
  to end, prod deploy confirmed, state closed out, then stop.

---

## 6. Conversion checklist (the "maximise conversion" substance — apply in M8, spot-check always)

- **Clarity over cleverness.** A stranger grasps what Cereal Milk is and what to do in 5s.
- **One primary action.** The direct CTA (Pre-order) is the same words everywhere and
  repeats down the page. Transitional CTA is visually secondary.
- **Problem before product.** The visitor sees their own pain named before our
  features.
- **Proof near every ask.** 68 funds, on-device/private, testimonials when available,
  sit beside CTAs, not in a lonely logo strip.
- **Friction audit.** Minimum fields on the reservation form. No account required to
  start a pre-order. Show price, terms, and "what happens next" before the click.
- **Scarcity/urgency that is true.** Founding-seat cap or founding-price deadline,
  never fabricated.
- **Risk reversal.** Private by default, cancel before charge, exportable data, stated
  plainly next to the CTA.
- **Objection killers.** FAQ answers the real hesitations (privacy, price, lock-in,
  "is it live yet", Mac-only).
- **Speed + a11y + mobile.** LCP fast, works one-handed on a phone, keyboard reachable.
- **Measure it.** Each step has an event; you can see where people fall out.

---

## 7. State file template (`prompts/.loop/preorder-funnel.state.md`)

Create on first run, update every firing. This is how the loop survives context resets.

```md
# Pre-order funnel loop — state

Updated: <date>  ·  Mode shipped: <real-checkout | reservation/waitlist | tbd>

## Done
- [Mx] <what> — <result> — <commit sha / deploy url>

## In progress
- [Mx] <what> — <sub-steps left>

## Next up
- [Mx] <the single next action>

## Blockers
- <blocker> — <who/what unblocks it (e.g. founder Stripe access)>

## Decisions / rationale
- <copy or funnel decision + why> 

## Done-conditions (§0)
- [ ] 1 home SB7 live  [ ] 2 preorder flow converts  [ ] 3 emails fire
- [ ] 4 events+funnel  [ ] 5 optimisation pass  [ ] 6 build green + prod deploy
```

---

## 8. Guardrails

- One verified, recorded increment per firing. Resumability beats speed.
- Never hardcode prices; never add a second analytics or email path; never ship em
  dashes; never push straight to a dirty shared `main`.
- Do not fabricate charges, scarcity, or testimonials.
- If real payment capture is blocked, ship reservation mode and leave the seam. Record
  it. Do not stall the whole loop on a founder-only dependency.
- Confirm the Vercel scope before any prod deploy. Verify asset actually deployed.
- When the six done-conditions in §0 all hold: STOP. Do not loop forever polishing.
