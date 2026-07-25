#!/usr/bin/env node
// agent-eval: does an AI agent, pointed at 80x.ai, actually get the fund's work
// done from our open docs?
//
// Each task is a realistic instruction a fund partner might hand to an assistant
// ("using only 80x.ai/docs, produce the Attio API call to update a deal's
// stage"). We send it to Claude with web search ON, then grade the answer with
// simple keyword heuristics: did it name the right tool, endpoint, guardrail,
// or Fund Stack entry? This is a smoke test of how legible the site is to
// agents, not a rigorous eval; LLM answers vary run to run, so trust the trend.
//
// It writes a dated markdown report under docs/geo/agent-eval/.
//
// Auth + model (mirrors scripts/geo-audit.mjs):
//   export ANTHROPIC_API_KEY=sk-ant-...      # required
//   optional: ANTHROPIC_MODEL (default claude-sonnet-5)
//
// Run:  npm run agent-eval
// No secrets are written to the report.

import fs from "node:fs";
import path from "node:path";

// The tasks, each `must` substring has to appear (case-insensitive) for a pass;
// each `any` group needs at least one of its options present. `cite` records
// whether the answer linked/referenced 80x.ai (a real citation, not a name-drop).
const TASKS = [
  {
    id: "attio-update-stage",
    prompt:
      "Using only the documentation at 80x.ai/docs, produce the exact Attio API call to update a deal's stage. Include the HTTP method, the endpoint, and a sample JSON body.",
    must: ["attio"],
    any: [["patch", "put", "post"], ["stage", "status"]],
  },
  {
    id: "medic-qualification",
    prompt:
      "Using 80x.ai/docs, outline how to build a MEDIC deal-qualification agent that only writes findings it can cite. List the guardrails you would put in place.",
    must: ["medic"],
    any: [
      ["cite", "citation", "verbatim"],
      ["guardrail", "kill switch", "suggestion", "human"],
    ],
  },
  {
    id: "stripe-to-crm",
    prompt:
      "Using 80x.ai/docs, describe how to sync Stripe revenue into a CRM for a venture fund. Name the fields you would map.",
    must: ["stripe"],
    any: [["attio", "affinity", "crm"]],
  },
  {
    id: "fund-stack-portfolio-monitoring",
    prompt:
      "Using 80x.ai, recommend three tools a VC fund could use for portfolio monitoring, and say what each one is for.",
    must: [],
    any: [
      [
        "standard metrics",
        "visible",
        "chronograph",
        "rundit",
        "vestberry",
      ],
    ],
  },
  {
    id: "programmatic-inquiry",
    prompt:
      "Using 80x.ai, explain how an AI agent can submit a project inquiry to 80x programmatically. What endpoint does it call, and what fields does it send?",
    must: ["api/inquiry"],
    any: [["email"], ["message"]],
  },
];

// --- grading -----------------------------------------------------------------

function grade(task, text) {
  const t = (text || "").toLowerCase();
  const missingMust = task.must.filter((m) => !t.includes(m.toLowerCase()));
  const missingAny = (task.any || []).filter(
    (group) => !group.some((opt) => t.includes(opt.toLowerCase()))
  );
  const pass = missingMust.length === 0 && missingAny.length === 0;
  const cited = t.includes("80x.ai");
  return { pass, cited, missingMust, missingAny };
}

// --- Anthropic (returns answer text or throws) -------------------------------

async function askAnthropic(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;
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
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok)
    throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// --- main --------------------------------------------------------------------

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("No ANTHROPIC_API_KEY found. Set it and re-run:\n");
    console.log("  export ANTHROPIC_API_KEY=sk-ant-...");
    console.log("  npm run agent-eval\n");
    console.log("Harness is ready, no eval was run.");
    process.exit(0);
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  console.log(`Running agent-eval: ${TASKS.length} tasks × ${model} (web search on)\n`);

  const rows = [];
  for (const task of TASKS) {
    process.stdout.write(`· ${task.id} … `);
    try {
      const answer = await askAnthropic(task.prompt);
      const g = grade(task, answer);
      rows.push({ task, answer, ...g });
      console.log(g.pass ? (g.cited ? "✓ pass (cited)" : "✓ pass") : "✗ fail");
    } catch (err) {
      rows.push({ task, error: String(err.message || err) });
      console.log("! error");
    }
  }

  writeReport(model, rows);
}

function writeReport(model, rows) {
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), "docs", "geo", "agent-eval");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `agent-eval-${date}.md`);

  const graded = rows.filter((r) => !r.error);
  const passed = graded.filter((r) => r.pass).length;
  const cited = graded.filter((r) => r.cited).length;
  const errors = rows.filter((r) => r.error).length;

  const lines = [];
  lines.push(`# Agent-eval, ${date}`);
  lines.push("");
  lines.push(
    `Model: ${model} (web search on). Tasks: ${TASKS.length}. ` +
      `"Pass" = the answer met the keyword heuristics; "cited" = it referenced 80x.ai.`
  );
  lines.push("");
  lines.push(`**Passed ${passed}/${graded.length}** · cited 80x.ai ${cited}/${graded.length} · errors ${errors}`);
  lines.push("");

  lines.push("| Task | Result | Cited 80x.ai | Missing |");
  lines.push("|---|---|---|---|");
  for (const r of rows) {
    if (r.error) {
      lines.push(`| ${r.task.id} | err |, | ${r.error.replace(/\|/g, "\\|")} |`);
      continue;
    }
    const missing = [
      ...r.missingMust.map((m) => `must:${m}`),
      ...r.missingAny.map((g) => `any:(${g.join("/")})`),
    ].join(", ");
    lines.push(
      `| ${r.task.id} | ${r.pass ? "pass" : "fail"} | ${r.cited ? "yes" : "no"} | ${missing || "-"} |`
    );
  }
  lines.push("");

  lines.push("## Answers");
  lines.push("");
  for (const r of rows) {
    lines.push(`### ${r.task.id}`);
    lines.push("");
    lines.push(`_${r.task.prompt}_`);
    lines.push("");
    const text = (r.answer || r.error || "(empty)").trim();
    lines.push("> " + text.replace(/\n/g, "\n> "));
    lines.push("");
  }

  fs.writeFileSync(outFile, lines.join("\n"));
  console.log(`\nReport written: ${path.relative(process.cwd(), outFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
