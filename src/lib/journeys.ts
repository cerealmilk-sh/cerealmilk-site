// Curated onward paths, the site's "keep reading" wayfinding. Every content
// page ends in a Terminus; when the page's path has an entry here, the Terminus
// renders these 2-3 hand-picked links ABOVE the conversion block, so no page is
// a dead end.
//
// Curation rule: each stop is a genuine next step, not a generic index dump.
// Keep blurbs to one plain line.

export interface NextStop {
  href: string;
  /** Short mono tag: the KIND of thing this links to. */
  kicker: string;
  title: string;
  /** One plain line on why to go there. */
  blurb: string;
}

export const JOURNEYS: Record<string, NextStop[]> = {
  "/pricing": [
    {
      href: "/preorder",
      kicker: "Pre-order",
      title: "Lock this pricing now",
      blurb: "Reserve a founding seat, no card, and today's rate never rises for you.",
    },
    {
      href: "/demo",
      kicker: "Demo",
      title: "See it on your own pipeline",
      blurb: "30 minutes with the founder, and a pilot scoped if it fits.",
    },
    {
      href: "/security",
      kicker: "Security",
      title: "The safety model",
      blurb: "Why your number and your private threads stay yours.",
    },
  ],
  "/preorder": [
    {
      href: "/security",
      kicker: "Security",
      title: "The safety model",
      blurb: "Why your number and your private threads stay yours.",
    },
    {
      href: "/pricing",
      kicker: "Pricing",
      title: "The numbers you would lock",
      blurb: "Two plans, per user, every number on the page.",
    },
    {
      href: "/demo",
      kicker: "Demo",
      title: "Not ready to reserve?",
      blurb: "See it on your own pipeline first, 30 minutes with the founder.",
    },
  ],
  "/security": [
    {
      href: "/demo",
      kicker: "Demo",
      title: "Ask the hard questions live",
      blurb: "The privacy model, demonstrated on a real pipeline.",
    },
    {
      href: "/download",
      kicker: "Get the app",
      title: "See it on your own Mac",
      blurb: "Get Cereal Milk and watch what it does and does not do.",
    },
    {
      href: "/pricing",
      kicker: "Pricing",
      title: "Published, not hidden",
      blurb: "Two plans, per user, every number on the page.",
    },
  ],
  "/download": [
    {
      href: "/demo",
      kicker: "Demo",
      title: "Rolling out to a team?",
      blurb: "Book a demo and we set the whole team up in a pilot.",
    },
    {
      href: "/security",
      kicker: "Security",
      title: "What it does with your data",
      blurb: "No unofficial APIs, on-screen reads only, server-enforced privacy.",
    },
  ],
  "/about": [
    {
      href: "/",
      kicker: "Product",
      title: "What Cereal Milk is",
      blurb: "The three channels, the CRM inspector, and the privacy gate.",
    },
    {
      href: "/careers",
      kicker: "Careers",
      title: "Two founding roles",
      blurb: "Forward-deployed engineering and developer advocacy.",
    },
    {
      href: "/demo",
      kicker: "Demo",
      title: "Talk to the founder",
      blurb: "30 minutes, no SDR, no script.",
    },
  ],
  "/careers": [
    {
      href: "/about",
      kicker: "Company",
      title: "Where Cereal Milk comes from",
      blurb: "62 projects for 68 funds, productized.",
    },
    {
      href: "/",
      kicker: "Product",
      title: "The product you would work on",
      blurb: "A native Mac app wired to the CRM your deals live in.",
    },
  ],
  "/newsletter": [
    {
      href: "/download",
      kicker: "Get the app",
      title: "Download Cereal Milk for Mac",
      blurb: "Free for 7 days when you create your account. No card.",
    },
    {
      href: "/",
      kicker: "Product",
      title: "What Cereal Milk is",
      blurb: "The messenger built for AI agents.",
    },
  ],
  "/contact": [
    {
      href: "/demo",
      kicker: "Demo",
      title: "Book time instead",
      blurb: "Pick a slot and skip the back-and-forth.",
    },
    {
      href: "/pricing",
      kicker: "Pricing",
      title: "What it costs",
      blurb: "Per-user pricing, published.",
    },
  ],
};

/** The curated next stops for a path, or an empty array when none are set. */
export function nextStops(path: string): NextStop[] {
  return JOURNEYS[path] ?? [];
}
