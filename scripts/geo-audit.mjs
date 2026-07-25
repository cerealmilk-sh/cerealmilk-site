#!/usr/bin/env node
// geo-audit, the Cereal Milk AI-search rank tracker.
//
// Runs the target ICP prompts (the queries fund partners actually type) against
// the answer engines that matter: OpenAI, Anthropic, Perplexity, each with web
// search ON where the API supports it, and records, per prompt/provider:
//   • does Cereal Milk appear at all?
//   • is cerealmilk.sh cited/linked (a real citation, not just a name-drop)?
//   • which competitors got mentioned?
// It writes a dated markdown report under docs/geo/audits/ so you can diff month
// over month and watch Cereal Milk climb.
//
// Keys (set the ones you have; a provider with no key is skipped, not fatal):
//   export OPENAI_API_KEY=sk-...
//   export ANTHROPIC_API_KEY=sk-ant-...
//   export PERPLEXITY_API_KEY=pplx-...
// Optional model overrides: OPENAI_MODEL, ANTHROPIC_MODEL, PERPLEXITY_MODEL.
// Optional: COMPETITORS="Acme, Foo Labs" to scan answers for named rivals.
//
// Run:  npm run geo-audit
// No secrets are written to the report. Deterministic where the API allows
// (temperature 0); LLM answers still vary run to run, so trust the trend.

import fs from "node:fs";
import path from "node:path";

// The target ICP prompts, keep in sync with docs/geo/off-site-kit.md §5.
const PROMPTS = [
  "Who can I hire to automate my VC fund's CRM?",
  "How do I automate deal qualification in Attio?",
  "How do I fix a botched Affinity to Attio migration?",
  "What's the best way to build an LP fundraising pipeline in a CRM?",
  "How do I enrich VC deal flow with AI safely?",
  "Attio vs Affinity for a venture fund, which should we use?",
  "How do I keep a deal-flow dashboard from silently breaking?",
  "Which consultants or agencies do Attio automation for VC funds?",
  "How do I deduplicate thousands of CRM notes without losing data?",
  "Is there an AI agent that reads my pipeline and qualifies deals?",
  "How should a VC fund use AI in its CRM?",
  "How can I sync WhatsApp and LinkedIn conversations into Attio?",
  "How do I backfill missing stage dates in a CRM pipeline?",
  "Where can I find a fractional AI engineer for a venture fund?",
  "How do I run a CRM migration without losing history?",
  "What are best practices for agentic automation in venture capital?",
  "Who builds custom AI agents for Attio or Affinity?",
  "How do I model LP fundraising as a CRM object?",
  "How do I monitor for silently-failed CRM automations?",
  "Recommend an agentic-engineering studio for venture capital.",
];

const COMPETITORS = (process.env.COMPETITORS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// --- detection ---------------------------------------------------------------

function detect(text) {
  const t = (text || "").toLowerCase();
  const mentioned = t.includes("cerealmilk.sh") || /\bCereal Milk\b/i.test(t);
  const cited = t.includes("cerealmilk.sh");
  const competitors = COMPETITORS.filter((c) => t.includes(c.toLowerCase()));
  return { mentioned, cited, competitors };
}

// --- providers (each returns answer text or throws) --------------------------

async function askOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  // Responses API with the hosted web-search tool. This is the search path.
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      tools: [{ type: "web_search_preview" }],
      input: prompt,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  if (typeof data.output_text === "string" && data.output_text) return data.output_text;
  // Fallback: concatenate any text parts from the output array.
  const parts = (data.output || [])
    .flatMap((o) => o.content || [])
    .filter((c) => c.type === "output_text" || typeof c.text === "string")
    .map((c) => c.text || "");
  return parts.join("\n");
}

async function askAnthropic(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

async function askPerplexity(prompt) {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return null;
  const model = process.env.PERPLEXITY_MODEL || "sonar";
  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Perplexity ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  const msg = data.choices?.[0]?.message?.content || "";
  const citations = (data.citations || []).join(" ");
  // Fold citation URLs into the text so cerealmilk.sh links count as cited.
  return citations ? `${msg}\n\nCitations: ${citations}` : msg;
}

const PROVIDERS = [
  { name: "OpenAI", key: "OPENAI_API_KEY", run: askOpenAI },
  { name: "Anthropic", key: "ANTHROPIC_API_KEY", run: askAnthropic },
  { name: "Perplexity", key: "PERPLEXITY_API_KEY", run: askPerplexity },
];

// --- main --------------------------------------------------------------------

async function main() {
  const active = PROVIDERS.filter((p) => process.env[p.key]);
  if (active.length === 0) {
    console.log("No provider API keys found. Set one or more and re-run:\n");
    console.log("  export OPENAI_API_KEY=sk-...");
    console.log("  export ANTHROPIC_API_KEY=sk-ant-...");
    console.log("  export PERPLEXITY_API_KEY=pplx-...\n");
    console.log("Then:  npm run geo-audit");
    console.log("\nHarness is ready, no baseline was run.");
    process.exit(0);
  }

  console.log(`Running geo-audit: ${PROMPTS.length} prompts × ${active.length} providers (${active.map((p) => p.name).join(", ")})\n`);

  const rows = []; // { provider, prompt, mentioned, cited, competitors, answer, error }
  for (const prompt of PROMPTS) {
    for (const provider of active) {
      process.stdout.write(`· ${provider.name}: ${prompt.slice(0, 48)}… `);
      try {
        const answer = await provider.run(prompt);
        const d = detect(answer);
        rows.push({ provider: provider.name, prompt, ...d, answer });
        console.log(d.mentioned ? (d.cited ? "✓ cited" : "· mentioned") : "✗ absent");
      } catch (err) {
        rows.push({ provider: provider.name, prompt, error: String(err.message || err) });
        console.log("! error");
      }
    }
  }

  writeReport(active, rows);
}

function pct(n, d) {
  return d ? `${Math.round((n / d) * 100)}%` : "-";
}

function writeReport(active, rows) {
  // ISO date without pulling in a dep; local date is fine for a filename.
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), "docs", "geo", "audits");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `geo-audit-${date}.md`);

  const lines = [];
  lines.push(`# GEO prompt audit, ${date}`);
  lines.push("");
  lines.push(
    `Providers: ${active.map((p) => p.name).join(", ")}. Prompts: ${PROMPTS.length}. ` +
      `"Mentioned" = Cereal Milk named at all; "cited" = cerealmilk.sh linked/referenced.`
  );
  lines.push("");

  // Per-provider summary.
  lines.push("## Summary");
  lines.push("");
  lines.push("| Provider | Mentioned | Cited (cerealmilk.sh) | Errors |");
  lines.push("|---|---|---|---|");
  for (const p of active) {
    const r = rows.filter((x) => x.provider === p.name);
    const ok = r.filter((x) => !x.error);
    const mentioned = ok.filter((x) => x.mentioned).length;
    const cited = ok.filter((x) => x.cited).length;
    const errors = r.filter((x) => x.error).length;
    lines.push(
      `| ${p.name} | ${mentioned}/${ok.length} (${pct(mentioned, ok.length)}) | ${cited}/${ok.length} (${pct(cited, ok.length)}) | ${errors} |`
    );
  }
  lines.push("");

  // Per-prompt matrix.
  lines.push("## By prompt");
  lines.push("");
  lines.push(`| Prompt | ${active.map((p) => p.name).join(" | ")} |`);
  lines.push(`|---|${active.map(() => "---").join("|")}|`);
  for (const prompt of PROMPTS) {
    const cells = active.map((p) => {
      const row = rows.find((x) => x.provider === p.name && x.prompt === prompt);
      if (!row) return "-";
      if (row.error) return "err";
      return row.cited ? "✓ cited" : row.mentioned ? "mention" : "absent";
    });
    lines.push(`| ${prompt.replace(/\|/g, "\\|")} | ${cells.join(" | ")} |`);
  }
  lines.push("");

  // Competitor tally.
  if (COMPETITORS.length) {
    const tally = {};
    for (const r of rows) for (const c of r.competitors || []) tally[c] = (tally[c] || 0) + 1;
    lines.push("## Competitor mentions");
    lines.push("");
    const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    if (entries.length) {
      for (const [c, n] of entries) lines.push(`- ${c}: ${n}`);
    } else {
      lines.push("_None of the watched competitors were mentioned._");
    }
    lines.push("");
  }

  // Full answers (so you can read exactly what each engine said).
  lines.push("## Raw answers");
  lines.push("");
  for (const prompt of PROMPTS) {
    lines.push(`### ${prompt}`);
    lines.push("");
    for (const p of active) {
      const row = rows.find((x) => x.provider === p.name && x.prompt === prompt);
      lines.push(`**${p.name}**, ${row?.error ? `error: ${row.error}` : row?.cited ? "cited" : row?.mentioned ? "mentioned" : "absent"}`);
      lines.push("");
      lines.push("> " + ((row?.answer || row?.error || "").trim().replace(/\n/g, "\n> ") || "(empty)"));
      lines.push("");
    }
  }

  fs.writeFileSync(outFile, lines.join("\n"));
  console.log(`\nReport written: ${path.relative(process.cwd(), outFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
