// The Cereal Milk BrandScript: the StoryBrand (SB7) narrative for the pre-order
// funnel, as data. One place to edit the story; the home page and /preorder
// render from here so the copy can never fork. Voice rules: concrete, short,
// second person, zero jargon, zero em dashes (house law). The customer is the
// hero; Cereal Milk is the guide.

export interface PlanStep {
  title: string;
  body: string;
}

export interface Cta {
  label: string;
  href: string;
}

export const BRANDSCRIPT = {
  // 1 · Character: the hero is the customer, never us.
  character: {
    who: "A relationship-driven dealmaker: VC, founder, operator",
    wants:
      "To never drop a relationship, and to close on the strength of who they know.",
  },

  // 2 · Problem: lead with this above the fold. Name the villain.
  problem: {
    villain: "the silo",
    external:
      "The deals that make a fund happen in chat: sourcing in DMs, diligence in group threads, LPs on WhatsApp. None of it reaches the CRM.",
    internal:
      "The nagging fear that a founder is waiting on a reply you forgot you owe.",
    philosophical:
      "Your best deals should leave a record. A fund runs on who it knows, and that is too valuable to leave to memory and luck.",
  },

  // 3 · Guide: empathy first, then authority. Every claim here is true.
  guide: {
    empathy:
      "We know what a quiet thread costs: the deal that closed with whoever answered first.",
    authority: [
      "Built by the team that ran deal-ops engineering for 68 venture funds and firms",
      "No unofficial APIs: the official clients, your number stays yours",
      "Private by default, enforced on the server, your data exportable",
    ],
  },

  // 4 · Plan: the path, made obvious and safe.
  plan: {
    product: [
      {
        title: "Connect your accounts",
        body: "WhatsApp, LinkedIn, and Gmail in one native Mac window. Nothing to import, nothing to migrate.",
      },
      {
        title: "Cereal Milk builds your Repository",
        body: "Every conversation you choose, filed into one private, searchable record of your network. Git for your relationships.",
      },
      {
        title: "Never drop a relationship again",
        body: "Who is waiting on you, who went quiet, and the context behind every thread, one keystroke away.",
      },
    ] as PlanStep[],
    preorder: [
      {
        title: "Reserve your seat",
        body: "One form, no card, two minutes. You are reserving a founding seat, not paying today.",
      },
      {
        title: "Lock founding pricing",
        body: "Your price is the published price on the day you reserve. It never rises for you.",
      },
      {
        title: "Get first access at launch",
        body: "Founding seats are set up first, on a call with the founder, before general availability.",
      },
    ] as PlanStep[],
    // The agreement plan: the risk-reversal promises, stated next to every ask.
    agreement: [
      "Private by default: every thread starts closed, and the gate is enforced on the server.",
      "No charge at reservation, and you can cancel anytime before your seat is set up.",
      "Your data stays yours: on your Mac, exportable in one click, never resold.",
    ],
  },

  // 5 · Call to action: one direct CTA, repeated; one transitional, quiet.
  cta: {
    direct: { label: "Pre-order Cereal Milk", href: "/preorder" } as Cta,
    transitional: { label: "Book a demo", href: "/demo" } as Cta,
  },

  // 6 · Success: paint the after, concretely.
  success: [
    {
      title: "Every relationship remembered",
      body: "The whole history of who you know, searchable in one place, on your machine.",
    },
    {
      title: "Nothing dropped",
      body: "You see who is waiting on you before they chase you. Follow-ups happen while they still matter.",
    },
    {
      title: "You reply first, so you close",
      body: "Deals go to whoever answers. With the context one keystroke away, that is you.",
    },
  ],

  // 7 · Failure: the stakes, used sparingly. One beat, not a section of dread.
  failure:
    "The dropped thread. The intro you forgot to make. The deal that went to whoever replied first. A fund's real pipeline, walking out the door in someone's phone.",

  // The one-liner: the hero. `headline` is the H1 (the concrete category);
  // `subline` is the supporting sub-headline that opens the machine mirror.
  // Iterate here, nowhere else.
  oneLiner: {
    headline: "The messenger built for AI agents.",
    subline:
      "WhatsApp, LinkedIn, and Gmail in one desktop window, on Mac and Windows. An AI agent beside every chat, running on your own model account.",
  },
} as const;

export type Brandscript = typeof BRANDSCRIPT;