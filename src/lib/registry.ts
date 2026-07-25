// The content registry, one typed list of every page on the site. It feeds
// sitemap.ts, /llms.txt, /llms-full.txt, and the per-page `.md` mirrors, so
// adding a page is one registry entry + one route directory and every machine
// surface updates together (see PRODUCT-SITE-SPEC.md).
//
// Dates are hardcoded ISO strings on purpose: lastmod must only move when the
// content actually changes, never on rebuild (no `new Date()`).
//
// `contentFile` points at the page's markdown source under src/content/,
// the body of record for content pages, and a faithful hand-maintained mirror
// for structured pages (home, pricing). It is what `.md` mirrors and
// llms-full.txt serve.

import { BUSINESS, STARTER } from "./pricing";

export type Section = "home" | "product" | "company" | "book";

export interface PageEntry {
  /** Route path, leading slash, no trailing slash (except "/"). */
  path: string;
  /** Page title without the "· Cereal Milk" template suffix. */
  title: string;
  /** Answer-style meta description (~155 chars). */
  description: string;
  section: Section;
  datePublished: string;
  dateModified: string;
  /** Markdown source under the repo root (src/content/…). */
  contentFile?: string;
  /** Generated markdown body; mutually exclusive with contentFile. */
  contentBody?: string;
  /** Sitemap priority (default 0.6). */
  priority?: number;
}

const D = "2026-07-09"; // launch date of the product site

export const PAGES: PageEntry[] = [
  {
    path: "/",
    // The homepage category line, so the meta <title>, the OG card, and the
    // llms.txt home entry all carry one story. Since 2026-07-21 the homepage
    // leads with the AI-agent positioning (chat becomes a record agents can
    // act on); SITE_TAGLINE stays the platform-wide descriptor on the OG card
    // footer and the default title for other pages.
    title: "The messenger built for AI agents",
    description:
      "The messenger built for AI agents. Cereal Milk puts WhatsApp, LinkedIn, and Gmail in one native Mac window, files the conversations you choose to Attio or Affinity, and turns your chats into a record your agents can act on. Download it and try the full product free for 7 days, no card; from $30 a month after.",
    section: "home",
    datePublished: D,
    dateModified: "2026-07-21",
    contentFile: "src/content/home.md",
    priority: 1,
  },

  // --- Use cases (the /for/* layer, see src/lib/use-cases.ts) -------------------
  {
    path: "/for/venture-capital",
    title: "Cereal Milk for venture capital",
    description:
      "The deal messenger for venture capital: WhatsApp, LinkedIn, and Gmail in one Mac window, with the Attio or Affinity record live beside every chat. Private by default.",
    section: "product",
    datePublished: D,
    dateModified: D,
    contentFile: "src/content/for-venture-capital.md",
    priority: 0.9,
  },
  {
    path: "/for/b2b-startups",
    title: "Cereal Milk for B2B startups",
    description:
      "Founder-led sales finally has a system of record: WhatsApp, LinkedIn, and Gmail in one Mac window, every lead and every promise filed to Attio or Affinity.",
    section: "product",
    datePublished: D,
    dateModified: D,
    contentFile: "src/content/for-b2b-startups.md",
    priority: 0.9,
  },
  {
    path: "/for/service-providers",
    title: "Cereal Milk for service providers",
    description:
      "For agencies, consultancies, recruiters, and brokers: every client channel in one Mac window, scope and referrals filed to Attio or Affinity, private by default.",
    section: "product",
    datePublished: D,
    dateModified: D,
    contentFile: "src/content/for-service-providers.md",
    priority: 0.9,
  },

  // --- Product -----------------------------------------------------------------
  {
    path: "/pricing",
    title: "Pricing",
    description: `Two plans, per user: Starter $${STARTER.monthly} a month or $${STARTER.yearly} a year, Business $${BUSINESS.monthly} a month or $${BUSINESS.yearly} a year. Monthly or yearly, cancel anytime, no usage meters. Both plans start with a 7-day free trial, no card.`,
    section: "product",
    datePublished: D,
    dateModified: "2026-07-14",
    contentFile: "src/content/pricing.md",
    priority: 0.9,
  },
  {
    path: "/security",
    title: "Security and privacy",
    description:
      "How Cereal Milk keeps your number, your accounts, and your conversations safe: no unofficial APIs, on-screen reads only, you always hit send, and a server-enforced privacy gate on CRM sync.",
    section: "product",
    datePublished: D,
    dateModified: D,
    contentFile: "src/content/security.md",
    priority: 0.8,
  },
  {
    path: "/download",
    title: "Download Cereal Milk for Mac and Windows",
    description:
      "Download Cereal Milk for Mac or Windows: WhatsApp in one fast window with an AI agent beside every chat, running on your own Claude, ChatGPT, Gemini, or OpenAI-compatible account. Free, no card. The page detects your platform and starts the right installer automatically.",
    section: "product",
    datePublished: "2026-06-11",
    dateModified: "2026-07-23",
    contentFile: "src/content/download.md",
    priority: 0.9,
  },

  // --- Book a demo ---------------------------------------------------------------
  {
    path: "/preorder",
    title: "Pre-order Cereal Milk",
    description:
      "Reserve a founding seat for Cereal Milk: no card, no charge at reservation. Lock today's published pricing, get first access when your wave opens, set up personally with the founder.",
    section: "book",
    datePublished: "2026-07-14",
    dateModified: "2026-07-14",
    contentFile: "src/content/preorder.md",
    priority: 0.9,
  },
  {
    path: "/demo",
    title: "Book a demo",
    description:
      "Book a 30-minute demo of Cereal Milk. On a screen-share, Dan walks you through the app on a live pipeline: WhatsApp, LinkedIn, and Gmail syncing into Attio or Affinity. Or send a brief by email.",
    section: "book",
    datePublished: D,
    dateModified: D,
    contentFile: "src/content/demo.md",
    priority: 0.9,
  },
  {
    path: "/contact",
    title: "Contact Cereal Milk",
    description:
      "Contact Cereal Milk about the Mac app, team pilots, or press. Send a short brief and Daniel replies from daniel@cerealmilk.sh within one business day.",
    section: "book",
    datePublished: "2026-07-02",
    dateModified: D,
    contentFile: "src/content/contact.md",
    priority: 0.7,
  },

  // --- Company -------------------------------------------------------------------
  {
    path: "/about",
    title: "About",
    description:
      "Daniel Hull is the founder of Cereal Milk, the company behind the Cereal Milk Mac app for people who close in chat. Cereal Milk grew out of an engineering studio that shipped 62 projects for 68 funds and firms.",
    section: "company",
    datePublished: "2026-07-02",
    dateModified: D,
    contentFile: "src/content/about.md",
    priority: 0.7,
  },
  {
    path: "/careers",
    title: "Careers at Cereal Milk",
    description:
      "Cereal Milk is hiring two founding roles: a Forward-Deployed Agentic Engineer and a Developer Advocate. Remote, worldwide, building the communication platform for people who close in chat.",
    section: "company",
    datePublished: "2026-07-03",
    dateModified: D,
    contentFile: "src/content/careers.md",
    priority: 0.6,
  },
  {
    path: "/newsletter",
    title: "The Cereal Milk Field Notes",
    description:
      "The Cereal Milk Field Notes is one email when something ships from Cereal Milk: new releases, new capabilities, and field notes from the build. No spam, unsubscribe anytime.",
    section: "company",
    datePublished: "2026-07-02",
    dateModified: D,
    contentFile: "src/content/newsletter.md",
    priority: 0.5,
  },
];

export function pageByPath(path: string): PageEntry | undefined {
  return PAGES.find((p) => p.path === path);
}

export function pagesInSection(section: Section): PageEntry[] {
  return PAGES.filter((p) => p.section === section);
}
