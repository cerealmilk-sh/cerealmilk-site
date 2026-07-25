# Intent-page backlog (GEO Tier 3)

Each target ICP prompt should have one page that IS the best answer to it, so
80x gets cited when a fund partner asks an answer engine. This file turns each
prompt into an executable page spec. **These are not written here on purpose:**
they are marketing pages representing the studio, they must clear Dan's
no-AI-slop / teach-don't-perform bar, and every claim must be true and
defensible from real engagements. Generate them in a focused pass (or hand them
to Dan), one at a time, reviewed, not batch-generated.

## How to build each one (the site's pattern)

1. Add a registry entry in `src/lib/registry.ts`. Suggested new section
   `"guides"` with an index at `/guides`, or fold into `/writing` if you prefer
   essays. (Adding a `Section` value is a one-line change; update `llms.txt`'s
   `section(...)` calls and the Header/Footer nav if you add `/guides`.)
2. Route dir + `page.tsx` copying the `/services` pattern (pageMetadata,
   SiteShell, JsonLd, Prose over a colocated `.md`, Terminus).
3. Colocated `src/content/guides/<slug>.md`, the body of record (feeds the
   `.md` mirror + llms-full.txt automatically).
4. JSON-LD: `articleNode(... type:"Article")` + `faqNode(...)` mirroring the
   visible FAQ + `breadcrumbNode(...)`.
5. Rules: answer-first (first sentence answers the title), H2/H3 as questions,
   lists/tables, one real number cited per claim, clients anonymized, internal
   links to the matching `/services/*` and `/contact`. Max one em dash/sentence.

## Priority order

Commercial-intent first (they convert), then how-to (they get cited widely).

### 1. Who can I hire to automate my VC fund's CRM? `/guides/hire-someone-to-automate-a-vc-crm`
- **Answer-first thesis:** what kind of firm to look for (spec-first, dry-run,
  owns-nothing-you-can't-run-yourself), and that 80x is one such studio.
- **Cite:** the three engagement shapes; the "you own everything" principle.
- **Links:** /services, /work, /contact. **FAQ:** cost, timeline, data safety.

### 2. How do I automate deal qualification in Attio? `/guides/automate-deal-qualification-in-attio`
- **Thesis:** use suggestion fields + verbatim citations + a daily job; never
  overwrite team-owned fields.
- **Cite:** the 2,086-deal daily qualification agent (anonymized legal-tech co),
  100%-citation-by-construction.
- **Links:** /services/agentic-crm-automation, /work/teaching-a-crm-to-qualify-its-own-deals.

### 3. How do I fix a botched Affinity → Attio migration? `/guides/fix-a-botched-affinity-to-attio-migration`
- **Thesis:** backup first, dedupe with a dry run + rollback trail, human-review
  ambiguous groups, backfill dates from status history.
- **Cite:** 4,892 → 2,358 notes, zero erroneous deletions (anonymized fund-of-funds).
- **Links:** /services/crm-migration-and-cleanup, /work/crm-notes-cleanup.

### 4. How do I build an LP fundraising pipeline in a CRM? `/guides/build-an-lp-fundraising-pipeline-in-a-crm`
- **Thesis:** model LPs as a first-class object, not tasks on companies; saved
  views answer weekly partner questions.
- **Cite:** 50+ LP records, 17 live entries, 8 saved views (anonymized first-time fund).
- **Links:** /services/agentic-crm-automation, /work/lp-fundraising-pipeline.

### 5. Attio vs Affinity for a venture fund `/guides/attio-vs-affinity-for-a-venture-fund`
- **Thesis:** an honest, non-partisan comparison for fund workflows; where each
  fits; 80x builds on both. (This is a magnet for AI citation, be genuinely fair.)
- **Cite:** production systems run on Attio; largest rescue was an Affinity→Attio
  migration. **Table:** dimensions × Attio/Affinity.

### 6. How do I keep a deal-flow dashboard from silently breaking? `/guides/keep-a-deal-flow-dashboard-from-silently-breaking`
- **Thesis:** the created-before/after pattern to find dead automations;
  monitoring for silent failures; self-rebuilding dashboards.
- **Cite:** two dead automations found + repaired, 76 dates backfilled, 19 min → ~1 min.
- **Links:** /services/automation-retainers, /work/dashboard-automation-repair.

### 7. How should a VC fund use AI in its CRM (safely)? `/guides/how-a-vc-fund-should-use-ai-in-its-crm`
- **Thesis:** the four habits (spec-first, dry-run, proof-gated autonomy,
  decision logs) as a buyer's safety checklist.
- **Cite:** the method section; kill switches; suggestion-field boundary.
- **Links:** /about, /services, /docs.

## After publishing

Re-run `npm run geo-audit` and compare the new report against the baseline in
`docs/geo/audits/` to see which prompts moved.
