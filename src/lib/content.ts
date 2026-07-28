// Reads the markdown source of record for a registry page. All callers are
// statically rendered (build-time), so plain fs reads of repo files are safe,
// nothing here runs per-request in production.

import fs from "node:fs";
import path from "node:path";
import type { PageEntry } from "./registry";

export function readContent(entry: PageEntry): string | null {
  if (entry.contentBody) return entry.contentBody;
  if (!entry.contentFile) return null;
  const abs = path.join(process.cwd(), entry.contentFile);
  try {
    return fs.readFileSync(abs, "utf8");
  } catch {
    // Tolerant on purpose: a missing file must not take down unrelated
    // machine surfaces. scripts/check-content.mjs asserts completeness in CI.
    console.warn(`[content] missing markdown source: ${entry.contentFile}`);
    return null;
  }
}
