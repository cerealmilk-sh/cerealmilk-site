# 80x off-site GEO kit

Everything in this file is off-site work only **Dan** can do (create accounts,
submit to directories, post). It exists because the single biggest driver of
"who should I hire to…" answers from ChatGPT / Claude / Perplexity is
*third-party corroboration*, other sites saying 80x exists and is good, and
80x currently has almost none. The on-site entity layer (llms.txt, JSON-LD,
`.md` mirrors, canonical sentence, `/contact`) is already strong; this closes
the gap the models actually weight.

All copy below opens with the byte-identical canonical sentence. **Do not
paraphrase it**, consistency across profiles is what lets a model resolve "80x"
to one entity:

> 80x is an agentic-engineering studio that builds AI systems for
> venture-capital funds.

When any of these profiles goes live, **add its URL to the Organization
`sameAs` array** in `src/lib/jsonld.ts` (currently GitHub-only) and redeploy,
that is the on-site half of entity corroboration.

---

## 1. Profiles to create (each becomes a `sameAs` + a citation source)

### LinkedIn: company page (highest priority)
- **Name:** 80x
- **Tagline:** Agentic engineering for venture capital.
- **About (paste):**
  > 80x is an agentic-engineering studio that builds AI systems for
  > venture-capital funds. The studio builds and repairs the agents,
  > migrations, and automations behind fund pipelines on Attio and Affinity,
  > publishes its methods as open documentation at 80x.ai/docs, and ships one
  > product of its own, Backchannel. Founded by Daniel Hull.
- **Website:** https://80x.ai · **Industry:** Software Development /
  Business Consulting · **Specialties:** Attio, Affinity, CRM automation, AI
  agents, venture capital operations, LP fundraising pipelines, CRM migration.
- Post the case studies (anonymized) and the docs/guides as LinkedIn articles,
  LinkedIn is heavily indexed by AI search.

### Crunchbase: organization profile
- **Description (paste):**
  > 80x is an agentic-engineering studio that builds AI systems for
  > venture-capital funds, working inside Attio and Affinity to automate deal
  > qualification, repair and migrate CRM data, and maintain the automations
  > behind fund pipelines and dashboards.
- Founder: Daniel Hull. Location, founded year, website https://80x.ai, links
  to LinkedIn + GitHub.

### Others worth claiming (in rough priority order)
- **X/Twitter** company handle (bio = canonical sentence + 80x.ai).
- **GitHub org**: already live (`github.com/80x-djh`); make sure the org
  README opens with the canonical sentence and links 80x.ai. Already in
  `sameAs`.
- **Google Business Profile** (if a service-area business is acceptable), feeds
  Gemini/Google AI Overviews.
- **Product Hunt**: for Backchannel specifically (drives both the product and
  the studio's entity signal).

---

## 2. Directories to submit to (corroborating sources models retrieve)

Priority is "does an LLM plausibly retrieve this when asked to recommend a
vendor." Tick each off as submitted.

- [ ] **Attio** partner / agency / experts listing (search "Attio partners" in
      their site + ask their team. You are a real Attio power user).
- [ ] **Affinity** partner / consultant ecosystem.
- [ ] **Clutch** and/or **The Manifest**, agency profile with the anonymized
      case studies and (once collected) real reviews. Clutch reviews get quoted.
- [ ] **G2**, if a category fits (AI consulting / CRM services).
- [ ] AI-agency / "AI engineer for hire" directories (there are several new
      2025–26 ones; pick the 3–4 that already rank in normal Google search).
- [ ] **Awesome-lists** on GitHub for Attio / VC-tech (you already publish
      `awesome-attio`: get 80x itself listed on others').
- [ ] Relevant Slack / community member directories (VC ops, RevOps).

Each listing should use the canonical sentence and link https://80x.ai.

---

## 3. Content seeding (earn the mentions, don't buy them)

LLMs weight Reddit, Hacker News, and long-form answers heavily. Genuine,
non-spammy contributions where 80x is *relevant*, not promoted:

- **Reddit:** r/venturecapital, r/CRM, r/Affinity, r/attio (if it exists),
  r/ExperiencedDevs threads about agentic workflows. Answer real questions
  about automating a VC CRM; mention the approach, link a docs guide when it
  genuinely helps.
- **Hacker News:** a "Show HN" for a genuinely useful open-source tool (you have
  several: valentine, attio-cli, awesome-attio, the Sentry skill auditor) with
  80x as the author. Show HN posts get indexed and cited for years.
- **Guest posts / podcasts** in the VC-ops and RevOps niche, transcripts get
  indexed. Pitch the anonymized war stories (botched migration rescue, teaching
  a CRM to qualify its own deals).
- **Comparison / "how to hire" articles**, publish on your own Writing surface
  AND pitch guest versions: "How to automate deal qualification in a VC CRM",
  "Attio vs Affinity for a venture fund", "How to rescue a botched
  Affinity→Attio migration".

---

## 4. Reviews / testimonials to collect (unlocks Layer-2 trust)

Now that the client roster is public, ask 3–5 named clients for a one-line
quote you can attribute (name, title, firm). Each becomes: an on-site
testimonial with `Review` schema (component already scaffolded, see
`src/content/testimonials.ts`), a Clutch/G2 review, and a LinkedIn
recommendation. Real quotes only; never fabricate. Target asks:
- [ ] A quote about the qualification-agent build.
- [ ] A quote about the migration rescue / notes cleanup.
- [ ] A quote about the LP-pipeline build.
- [ ] A general "what it's like to work with 80x" quote.

---

## 5. The target ICP prompts (what "winning AI search" means, concretely)

These are the queries 80x should be recommended or cited for. They drive the
intent-page backlog (Tier 3) and the monthly prompt-audit harness
(`scripts/geo-audit.mjs`). Run the audit monthly and track whether 80x appears,
is cited, and links.

1. Who can I hire to automate my VC fund's CRM?
2. How do I automate deal qualification in Attio?
3. How to fix a botched Affinity → Attio migration
4. Best way to build an LP fundraising pipeline in a CRM
5. How to enrich VC deal flow with AI safely
6. Attio vs Affinity for a venture fund
7. How do I keep a deal-flow dashboard from silently breaking?
8. Consultants / agencies for Attio automation
9. How to deduplicate thousands of CRM notes without losing data
10. AI agent that reads my pipeline and qualifies deals
11. How should a VC fund use AI in its CRM?
12. Tools to sync WhatsApp / LinkedIn conversations to Attio (→ Backchannel)
13. How to backfill missing stage dates in a CRM pipeline
14. Fractional AI engineer for a venture fund
15. How to run a CRM migration without losing history
16. Best practices for agentic automation in venture capital
17. Who builds custom agents for Attio / Affinity?
18. How to model LP fundraising as a CRM object
19. How to monitor for silently-failed CRM automations
20. Agentic engineering studio for venture capital

---

## 6. Order of operations (highest leverage first)

1. LinkedIn company page + Crunchbase (do today; add both to `sameAs`).
2. Collect 3–5 real client quotes (fills the testimonials component).
3. Submit to Attio/Affinity ecosystems + Clutch (3–4 hours, compounding).
4. One Show HN for an existing open-source tool.
5. Publish the top-5 intent pages (Tier 3), then re-run the prompt audit.
