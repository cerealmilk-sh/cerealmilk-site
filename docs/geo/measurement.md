# Measuring AI search (GEO) for Cereal Milk

Two complementary signals. Check both monthly.

## 1. Prompt side: are the engines recommending/citing Cereal Milk?

Run the audit harness:

```bash
export PERPLEXITY_API_KEY=pplx-...   # any subset of the three
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
npm run geo-audit
```

It runs the 20 ICP prompts (see `off-site-kit.md` §5) against each engine with
web search on and writes `docs/geo/audits/geo-audit-<date>.md`: a per-provider
mention/citation rate, a per-prompt matrix, and the full answers. Diff each new
report against the previous month to see Cereal Milk climb. Optionally set
`COMPETITORS="Foo, Bar"` to tally who else the engines name.

**What good looks like:** "mentioned" rate rising first, then "cited (cerealmilk.sh)"
rate rising as the off-site corroboration lands. Commercial-intent prompts
(#1, #8, #17, #20) matter most.

## 2. Server side: are the AI crawlers and referrals arriving?

No new infra needed; read what Vercel already collects.

- **AI crawler hits**: in Vercel → the `Cereal Milk` project → Logs (or a log drain),
  filter request user-agents for: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`,
  `ClaudeBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`,
  `Google-Extended`, `Bytespider`, `Amazonbot`. Rising crawl of `/llms.txt`,
  the `.md` mirrors, and `/contact` means the machine surfaces are working.
  (`robots.txt` already welcomes these agents by name.)
- **AI referrals**: filter referrers / check Vercel Web Analytics for
  `chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`. A referral
  is a human who clicked through from an AI answer, the conversion path.

If you later want durable, queryable history instead of ephemeral logs, add a
Vercel log drain to a store you own, or a tiny edge counter, but only once the
volume justifies it. Shipping edge logging into the request hot path for
low-traffic ephemeral logs is not worth it yet, so it was deliberately not done.

## The loop

`geo-audit` (are we recommended?) + crawler/referral logs (are they arriving?)
→ the gaps point at the next off-site actions in `off-site-kit.md` and the next
intent page in `intent-pages.md`.
