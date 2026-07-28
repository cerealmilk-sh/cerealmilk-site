#!/usr/bin/env node
// Price-drift guard (W-14). src/lib/pricing.ts is the single source of truth
// for every published price; code interpolates from it, but the markdown
// mirrors under src/content/ (and content.json) cannot. This script fails the
// build when any dollar literal anywhere under src/ is not one of the
// canonical plan numbers, so a price change in pricing.ts forces the mirrors
// to be updated in the same commit, and a stray retired price ($29, $9,
// $108, $12,000...) can never creep back in.
//
// Wired into `npm run build` (prebuild) and runnable alone:
//   node scripts/check-pricing.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const PRICING = join(ROOT, "src/lib/pricing.ts");

// --- the canonical numbers, parsed from pricing.ts -------------------------
const pricingSource = readFileSync(PRICING, "utf8");
const nums = new Set();
for (const m of pricingSource.matchAll(/\b(?:monthly|yearly):\s*(\d+(?:\.\d+)?)/g)) {
  nums.add(Number(m[1]));
}
if (nums.size === 0) {
  console.error("check-pricing: could not parse any plan numbers from src/lib/pricing.ts");
  process.exit(1);
}

// --- scan ------------------------------------------------------------------
const EXTS = new Set([".ts", ".tsx", ".md", ".mdx", ".json"]);
const SKIP_DIRS = new Set(["node_modules", ".next"]);
// $ followed by a number, e.g. $30, $12,000, $9.99. Template syntax like
// `${x}` or `$${x}` never matches (no digit after the $).
const PRICE_RE = /\$(\d[\d,]*(?:\.\d+)?)/g;

const failures = [];

function scanFile(file) {
  if (file === PRICING) return; // the source of truth defines the numbers
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(PRICE_RE)) {
      const value = Number(m[1].replaceAll(",", ""));
      if (!nums.has(value)) {
        failures.push(`${relative(ROOT, file)}:${i + 1}: ${m[0]} (allowed: ${[...nums].map((n) => `$${n}`).join(", ")})`);
      }
    }
  });
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (EXTS.has(full.slice(full.lastIndexOf(".")))) scanFile(full);
  }
}

walk(SRC);

if (failures.length) {
  console.error("check-pricing: price literals outside src/lib/pricing.ts drifted from the canonical plans:\n");
  for (const f of failures) console.error("  " + f);
  console.error("\nFix the copy (or, if pricing really changed, change src/lib/pricing.ts AND every mirror).");
  process.exit(1);
}
console.log(`check-pricing: OK (every price literal under src/ matches pricing.ts: ${[...nums].map((n) => `$${n}`).join(", ")})`);
