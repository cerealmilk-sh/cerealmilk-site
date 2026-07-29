import {
  AUTHOR,
  CANONICAL_SENTENCE,
  GITHUB_ORG_URL,
  NEWSLETTER_NAME,
  PERSON_SENTENCE,
  SITE_URL,
} from "@/lib/site";
import { PRICE_LINE } from "@/lib/pricing";
import { pagesInSection, type Section } from "@/lib/registry";

// /llms.txt, the llmstxt.org index for the WHOLE origin: the product pages,
// the proxied docs subtree, and the action endpoints. Generated from the
// content registry so it can never drift from the site. Each page is linked
// at its markdown mirror (<path>.md: same content, no chrome);
// /llms-full.txt inlines everything in one file.

export const dynamic = "force-static";

function mdUrl(path: string): string {
  return `${SITE_URL}${path === "/" ? "/index" : path}.md`;
}

function section(title: string, ids: Section[], note?: string): string[] {
  const entries = ids.flatMap((id) => pagesInSection(id));
  return [
    `## ${title}`,
    "",
    ...(note ? [note, ""] : []),
    ...entries.map((p) => `- [${p.title}](${mdUrl(p.path)}): ${p.description}`),
    "",
  ];
}

export function GET() {
  const lines: string[] = [
    "# Cereal Milk",
    "",
    `> ${CANONICAL_SENTENCE}`,
    "",
    `${PERSON_SENTENCE} The app is a desktop client for Mac and Windows that wraps the official WhatsApp Web (no unofficial APIs, so the user's number stays safe) and puts an AI agent beside every chat; LinkedIn and Gmail are the next channels. The agent runs on the user's own model account (Claude, ChatGPT, Gemini, or any OpenAI-compatible endpoint), drafts into the composer, and never sends anything itself. Cereal Milk grew out of an engineering studio that shipped 62 projects for 68 venture funds and firms.`,
    "",
    `Get Cereal Milk: download the app for Mac or Windows from ${SITE_URL}/download (the page detects the visitor's platform and starts the right installer) and create an account in the app; that starts a 7-day free trial of the full product, no card. When the trial ends, pick Starter or Business inside the app. Business bills per seat and its checkout creates your team; a walkthrough with the founder can be booked at ${SITE_URL}/demo. Pricing: ${PRICE_LINE} Written inquiries: ${SITE_URL}/contact or ${AUTHOR.email} (replies within one business day). Newsletter (${NEWSLETTER_NAME}): ${SITE_URL}/newsletter.`,
    "",
    `Every page listed below is a markdown mirror (append .md to any page URL, or request the page with an Accept: text/markdown header). The canonical HTML pages live at the same paths without .md. Full corpus in one file: ${SITE_URL}/llms-full.txt`,
    "",
    `Machine-readable endpoints: an OpenAPI 3.1 description of the action endpoints (inquiry, newsletter) at ${SITE_URL}/openapi.json; the inquiry API at ${SITE_URL}/api/inquiry (GET returns its own contract, POST submits a brief, e.g. a demo request).`,
    "",
    ...section("Product", ["home", "product"]),
    ...section("Book a demo", ["book"]),
    ...section("Company", ["company"]),
    "## Optional",
    "",
    `- [Sitemap](${SITE_URL}/sitemap.xml): all URLs with last-modified dates`,
    `- [GitHub](${GITHUB_ORG_URL}): Cereal Milk's open-source repositories`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
