import { pageByPath } from "@/lib/registry";
import { pageMarkdown } from "@/lib/mirror";

// The `.md` mirror endpoint. Requests like /work/crm-notes-cleanup.md (or any
// registry page requested with Accept: text/markdown) are rewritten here by
// proxy.ts with the .md suffix stripped; /index.md maps to "/". Serves the
// page's markdown body of record with its registry header: no HTML chrome,
// exactly what an agent wants to read.

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const joined = "/" + (path ?? []).join("/");
  const pagePath = joined === "/index" ? "/" : joined;
  const entry = pageByPath(pagePath);
  const md = entry ? pageMarkdown(entry) : null;
  if (!md) {
    return new Response("Not found. Index of all pages: https://cerealmilk.sh/llms.txt\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  // A rough token budget for the agent about to read this: ~4 characters per
  // token is the standard back-of-envelope for English prose, close enough to
  // let a caller decide whether the page fits its context before fetching it.
  const tokens = Math.ceil(md.length / 4);
  return new Response(md, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokens),
      "x-robots-tag": "noindex", // the canonical page is the HTML one
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
