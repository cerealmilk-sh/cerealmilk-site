import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

// Dev-only writer for the landing page's marketing copy.
//
// The visual copy editor (CopyEditor.tsx, dev + localhost only) POSTs the copy
// it changed and we merge it into copy-overrides.json, the file <T> reads at
// render (EditableCopy.tsx). NEVER available in production: it writes to the
// source tree, which doesn't exist on the deployed image, and the deployed copy
// is baked at build time anyway.
//
// Body: { changed: { [id]: string }, cleared: string[] }
//   changed  ids whose text now differs from its in-code default → set/replace
//   cleared  ids whose text was reverted to its default → delete any override
// This diff-based shape means the overrides file only ever holds real edits, and
// editing one page never clobbers overrides that belong to another.

const OVERRIDES_PATH = path.join(process.cwd(), "src/components/site/copy-overrides.json");

type Payload = { changed?: Record<string, string>; cleared?: string[] };

function isPayload(v: unknown): v is Payload {
  if (!v || typeof v !== "object") return false;
  const { changed, cleared } = v as Payload;
  if (changed !== undefined) {
    if (typeof changed !== "object" || changed === null || Array.isArray(changed)) return false;
    if (!Object.values(changed).every((s) => typeof s === "string")) return false;
  }
  if (cleared !== undefined) {
    if (!Array.isArray(cleared) || !cleared.every((s) => typeof s === "string")) return false;
  }
  return true;
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Disabled in production", { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  if (!isPayload(body)) {
    return new NextResponse("Expected { changed: {id:string}, cleared: string[] }", {
      status: 400,
    });
  }

  const { changed = {}, cleared = [] } = body;

  let current: Record<string, string> = {};
  try {
    current = JSON.parse(await readFile(OVERRIDES_PATH, "utf8")) as Record<string, string>;
  } catch {
    /* missing or empty file → start fresh */
  }

  const next: Record<string, string> = { ...current };
  for (const [id, text] of Object.entries(changed)) next[id] = text;
  for (const id of cleared) delete next[id];

  // Stable key order keeps the committed diff small and readable.
  const ordered = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));

  try {
    await writeFile(OVERRIDES_PATH, JSON.stringify(ordered, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true, count: Object.keys(ordered).length });
  } catch (err) {
    return new NextResponse(err instanceof Error ? err.message : "Write failed", { status: 500 });
  }
}
