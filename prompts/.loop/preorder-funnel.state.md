# Pre-order funnel loop — state · COMPLETE 2026-07-14

Updated: 2026-07-14  ·  Mode shipped: reservation/waitlist (no card, no charge; seam = dormant /get Clerk lane, switch-on documented in pricing.ts FOUNDING comment)

LOOP FINISHED: all six §0 done-conditions hold. Stopped via ScheduleWakeup{stop:true}.

## Done
- [M0] Recon + gap note (prior pass)
- [M1] BrandScript: src/content/brandscript.ts, SB7 as data — 6905b28
- [M2] Home rebuilt to SB7, primary CTA Pre-order 80x → /preorder, transitional Book a demo; mirrors synced — 57c3af3
- [M3] /preorder founding-offer page (plan, price-lock via pricing.ts FOUNDING: 100-seat cap, agreement, FAQ + JSON-LD; registry + preorder.md + journeys) — 0954ca5
- [M4] Reservation flow: PreorderForm → /api/waitlist source=preorder + plan; honeypot; preorder_started/submitted events; verified local (200/303/JSON, lead logged w/ plan) + prod probe — 0954ca5
- [M5] /preorder/thanks (expectations + referral ask, referral_click) + confirmation email through shared drip transport — 0954ca5
- [M6] Nurture repointed at /preorder (N5's unpayable /onboard offer replaced with founding offer), enrollment re-enabled for product waitlist, markPreordered stops nurture without starting activation; prod has KV_REST_API_* + RESEND_* so live — 1ab89c5
- [M7] preorder_confirmed via TrackEvent on thanks; ANALYTICS.md rewritten: full event table + 7-step queryable funnel + transitional demo funnel + server-side stages — f4e7930
- [M8] Conversion pass w/ rationale: header primary pill → Pre-order (demo = secondary pill), ribbon = site-wide scarcity element (seat cap single-sourced), /pricing Buy CTAs (dead /get lane) → /preorder?plan= with form preselect, 68-funds proof beside the /preorder ask, dead /#use-cases anchor restored; unverifiable proof claim caught and removed pre-ship — 84b99e1
- [M9] Final verify: build green, lint 0 errors, all deploys promoted + verified on 80x.ai (home, /preorder, /pricing, ribbon, header), main pushed (84b99e1), cron confirmed (vercel.json: /api/cron/drip daily 15:00 UTC), REAL end-to-end reservation fired on prod for dan@80x.ai (plan=business, {"ok":true}) → confirmation email sent to Dan's inbox as live proof.

## Done-conditions (§0) — ALL MET
- [x] 1 home SB7 live in prod
- [x] 2 /preorder converts end to end (reservation mode)
- [x] 3 emails fire (confirmation verified live to dan@80x.ai; nurture enrolled at signup, daily cron)
- [x] 4 every step evented + funnel definition in ANALYTICS.md ("The pre-order funnel")
- [x] 5 optimisation pass applied with rationale (M8)
- [x] 6 build green + prod deployed

## Blockers / handoff to Dan
- Real payment capture still founder-gated (Stripe live + Clerk plans). When it opens: wire /preorder to the /get Clerk lane (per-plan slugs; PlanCheckoutButton still speaks the old single-plan model) and flip reservation → checkout.
- The 100-seat founding cap (pricing.ts FOUNDING.seatCap) is honored BY HAND: track reservations in the Resend audience / webhook and close the offer at 100. Change the number in one place if desired.
- dan@80x.ai is now a real reservation in the store (converted=true) from the M9 live test; confirmation email in your inbox is the proof. Delete from the Resend audience if unwanted.
- Build the PostHog funnel from ANALYTICS.md ("The pre-order funnel", 7 steps) in the UI (needs dashboard login).
- testimonials.ts still empty; proof is 68-funds only until client sign-offs land.

## Decisions / rationale (for the record)
- Scarcity = 100 founding seats, real because onboarding is personal; never a fake countdown.
- /demo kept as transitional CTA everywhere; demo funnel intact beside the pre-order funnel.
- One lead/email path (api/waitlist + drip transport), one analytics path (PostHog facade + data-track), prices single-sourced (FOUNDING extends pricing.ts).
- markPreordered ≠ markConverted: reservation ends nurture but activation waits for real setup.
