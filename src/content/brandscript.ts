// The Cereal Milk BrandScript: the StoryBrand (SB7) narrative as data.
// One place to edit the story; the home page renders from here so the copy
// can never fork. Voice rules: concrete, short, second person, zero jargon,
// zero em dashes (house law). The customer is the hero; Cereal Milk is the guide.

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
    who: "Anyone who lives in WhatsApp: founders, dealmakers, operators, friends",
    wants:
      "An AI agent that understands their conversations and acts on them, without giving up their privacy or their API keys.",
  },

  // 2 · Problem: lead with this above the fold. Name the villain.
  problem: {
    villain: "context loss",
    external:
      "Your important conversations live across WhatsApp, LinkedIn, and Gmail. Your AI has no idea what is going on in any of them.",
    internal:
      "The nagging feeling that you are missing something, and the dread of copy-pasting between chat apps and AI tools.",
    philosophical:
      "Your AI should work where you work. Chat is the interface, and your conversations are the context it should already have.",
  },

  // 3 · Guide: empathy first, then authority. Every claim here is true.
  guide: {
    empathy:
      "We know what it is like to keep six chat windows open while feeding context to an AI tab, one message at a time.",
    authority: [
      "Bring your own model: Claude, ChatGPT, Gemini, or any local model. Nothing runs through our servers.",
      "Free and local-first: runs on your machine, credentials never leave your keychain.",
      "Open source tools, not unofficial APIs: the official WhatsApp Web, LinkedIn, and Gmail, with DOM scrapers you can audit.",
    ],
  },

  // 4 · Plan: the path, made obvious and safe.
  plan: {
    product: [
      {
        title: "Download the app",
        body: "One native desktop window with WhatsApp, LinkedIn, and Gmail, and an AI agent sidebar. Free, no account required.",
      },
      {
        title: "Connect your model",
        body: "Sign in with your existing Claude, ChatGPT, or Gemini account, paste an API key, or point it at a local model. Your credentials stay on your machine.",
      },
      {
        title: "Put your agent to work",
        body: "Ask it to summarize conversations, draft replies, search the web, run shell commands, or read and write files. It sees what you see, and acts on your behalf.",
      },
    ] as PlanStep[],
    preorder: [
      {
        title: "Download the app",
        body: "One click, no sign-up, no card. The download page detects your platform.",
      },
      {
        title: "Connect your first model",
        body: "Claude, ChatGPT, or Gemini. Your existing subscription works. API keys and local models work too.",
      },
      {
        title: "Start asking",
        body: "Summarize this thread. Draft a reply. What did I miss? Your agent already has the context.",
      },
    ] as PlanStep[],
    // The agreement plan: the risk-reversal promises, stated next to every ask.
    agreement: [
      "Free, local-first: nothing runs through our servers, and we do not see your data.",
      "Bring your own model: no new subscriptions, no vendor lock-in, no usage limits from us.",
      "Your credentials never leave your machine: they live in your OS keychain.",
    ],
  },

  // 5 · Call to action: one direct CTA, repeated; one transitional, quiet.
  cta: {
    direct: { label: "Get Cereal Milk", href: "/download" } as Cta,
    transitional: { label: "Book a demo", href: "/demo" } as Cta,
  },

  // 6 · Success: paint the after, concretely.
  success: [
    {
      title: "Your agent already has the context",
      body: "Every message you send auto-attaches the open conversation. No copy-paste, no explaining what you are looking at.",
    },
    {
      title: "One window, everything you need",
      body: "WhatsApp, LinkedIn, and Gmail behind icons on the left. Your AI agent in a chat sidebar on the right. No tab switching.",
    },
    {
      title: "You own the stack",
      body: "Your model, your keys, your machine. Free. No monthly fee, no vendor lock-in, no usage caps from us.",
    },
  ],

  // 7 · Failure: the stakes, used sparingly. One beat, not a section of dread.
  failure:
    "The dropped thread. The reply that took three copy-pastes and still missed the context. The AI sitting in another tab, unaware of the conversation you are trying to reference.",

  // The one-liner: the hero. `headline` is the H1 (the concrete category);
  // `subline` is the supporting sub-headline that opens the machine mirror.
  // Iterate here, nowhere else.
  oneLiner: {
    headline: "A desktop agent that knows your chats.",
    subline:
      "WhatsApp, LinkedIn, and Gmail in one window. A real AI agent in the sidebar that runs on your own model, your own keys, your own machine. Free.",
  },
} as const;

export type Brandscript = typeof BRANDSCRIPT;
