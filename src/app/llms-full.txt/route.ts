import { CANONICAL_SENTENCE, SITE_URL } from "@/lib/site";
import { PAGES } from "@/lib/registry";
import { pageMarkdown } from "@/lib/mirror";

// /llms-full.txt: the entire studio corpus in one file, per llmstxt.org:
// every registry page's markdown body of record, concatenated in registry
// order with canonical URLs and dates. The proxied /docs subtree has its own
// full file at /docs/llms-full.txt (linked from /llms.txt).

export const dynamic = "force-static";

export function GET() {
  const sections = PAGES.map(pageMarkdown).filter(
    (s): s is string => s !== null
  );
  const out = [
    "# Cereal Milk · full site content",
    "",
    `> ${CANONICAL_SENTENCE}`,
    "",
    `Index: ${SITE_URL}/llms.txt`,
    "",
    "---",
    "",
    sections.join("\n---\n\n"),
  ].join("\n");
  return new Response(out, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
