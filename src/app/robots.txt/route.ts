import { SITE_URL } from "@/lib/site";

// /robots.txt as a route handler (not the metadata API) because we emit lines
// the metadata API cannot: Content-Signal declarations, comments, and a second
// Sitemap for the proxied /docs subtree.
//
// Policy: everything public is open to everyone, including AI crawlers,
// the site exists to be read by answer engines. Only /api/ is disallowed.
// The named groups are belt-and-suspenders: the default allow-all already
// permits them, but an explicit allow is unambiguous, survives any future
// tightening, and reads as an invitation.

export const dynamic = "force-static";

// Every AI crawler and answer-engine agent worth naming, mid-2026.
const AI_CRAWLERS = [
  // OpenAI
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google / Apple / Microsoft
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  // Meta / Amazon / ByteDance
  "meta-externalagent",
  "meta-externalfetcher",
  "FacebookBot",
  "Amazonbot",
  "NovaAct",
  "Bytespider",
  "TikTokSpider",
  // Others
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
  "cohere-training-data-crawler",
  "AI2Bot",
  "CCBot",
  "Diffbot",
  "PanguBot",
  "Timpibot",
  "Webzio-Extended",
  "YouBot",
];

export function GET() {
  const lines: string[] = [
    "# cerealmilk.sh, robots.txt",
    "# Machine-readable site guide: /llms.txt (index) and /llms-full.txt (full content).",
    "# Every content page also has a markdown mirror at <path>.md",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    // Content-Signal (contentsignals.org): search, AI input (grounding/RAG),
    // and AI training are all explicitly welcome.
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "",
    ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, "Allow: /", ""]),
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
