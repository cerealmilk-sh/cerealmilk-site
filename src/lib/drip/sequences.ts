// The two lifecycle sequences, as data. Each step has a delay (afterDays, from
// the sequence's anchor), a subject, the body blocks (the renderer adds the
// greeting, sign-off, and unsubscribe footer), and an optional skipIf that lets
// the engine advance past a step without sending it.
//
//   nurture     anchored on signup. Job: get a warm lead to download the app
//               and start the 7-day trial, with the founding seat as the
//               price-lock offer for the convinced. The Day-0 welcome is sent
//               inline by /api/waitlist; this sequence is N1–N6.
//   activation  anchored on account creation (the `converted` lifecycle
//               signal). Job: get a new trial to their first agent moment
//               inside the 7 trial days. Steps skip themselves as the app
//               reports the matching usage signal (see /api/lifecycle), so a
//               fast starter gets fewer emails, not more.
//
// Every claim here is the site's own published claim (src/content/home.md,
// lib/pricing.ts): WhatsApp today, LinkedIn and Gmail next; the agent runs on
// the customer's own model account and reads only the open chat, on request.
// The AI-spend email course was retired 2026-07-29 with the docs site it
// linked to (every chapter URL 404s); its enrolment source in /api/waitlist
// went with it.

import type { Block } from "./email";
import { PREORDER_URL, DOWNLOAD_URL, SECURITY_URL } from "./email";
import { FOUNDING, STARTER, BUSINESS, TRIAL_DAYS } from "@/lib/pricing";
import type { Contact, SequenceId } from "./types";

export interface Step {
  id: string;
  afterDays: number;
  subject: string;
  blocks: Block[];
  // Return true to advance past this step without sending it.
  skipIf?: (c: Contact) => boolean;
}

// The two nurture CTAs: the download (the app is live, the trial is the
// conversion) and the founding pre-order (reservation, no card, price lock).
const download: Block = {
  label: "Download Cereal Milk for Mac or Windows →",
  href: DOWNLOAD_URL,
};
const reserveSeat: Block = {
  label: "Reserve your founding seat →",
  href: PREORDER_URL,
};

const nurture: Step[] = [
  {
    id: "n1-pain",
    afterDays: 2,
    subject: "Where your best deals go to die",
    blocks: [
      "Quick one. The best conversation you had this week probably happened in a WhatsApp thread, and to every AI tool you use, it doesn't exist.",
      "The deck that arrives in a thread about padel. The intro that lands between the small talk. The terms agreed across three apps and closed on a call. That's the real pipeline, and it's invisible to your agents, so a few weeks later someone rebuilds it from memory, or nobody does.",
      "That's the gap Cereal Milk closes: WhatsApp in one fast desktop window with an AI agent beside every chat, running on your own Claude, ChatGPT, or Gemini account. It summarises the thread, pulls out the commitments, and drafts the follow-up for you to send. LinkedIn and Gmail are next.",
      `It's live now, and the full product is free for ${TRIAL_DAYS} days, no card:`,
      download,
      "Where do your deals actually happen: WhatsApp, LinkedIn, email? Hit reply and tell me; it genuinely shapes what we build next.",
    ],
  },
  {
    id: "n2-ban",
    afterDays: 4,
    subject: "Will this get my WhatsApp number banned?",
    blocks: [
      "The first thing people ask me about Cereal Milk: will this get my number banned? Fair question. Your number carries a decade of relationships, and most “WhatsApp AI” tools genuinely put it at risk.",
      "They ride reverse-engineered APIs and scraped sockets, and when WhatsApp notices, it's your number that gets banned. Cereal Milk uses none of it.",
      "Under the hood it's the official web.whatsapp.com running inside a hardened desktop browser shell, so to WhatsApp you look like an ordinary browser. Nothing bulk-sends, automates, or scrapes in the background. The agent's drafts land in the composer, and you always hit send yourself.",
      "Try it on your own number, free for a week, no card:",
      download,
      "Still sceptical? Reply with the sharpest version of the question and I'll answer it straight.",
    ],
  },
  {
    id: "n3-privacy",
    afterDays: 7,
    subject: "An agent that reads one chat, not your life",
    blocks: [
      "Your WhatsApp is your life, not just your deal flow. So the agent in Cereal Milk is built around one rule: it reads only the chat you have open, and only when you ask.",
      "It never enumerates your chats or scrolls history in the background. And it runs on the model account you connect, your own Claude, ChatGPT, Gemini, or OpenAI-compatible endpoint, so what it reads goes to your own provider under your own agreement. Cereal Milk runs no model of its own, and your conversations never flow through servers of ours.",
      "The padel banter, the contact who vents, the thing someone told you in confidence: none of it is the agent's business, so none of it is in reach. That's not a privacy policy, it's how the product is wired.",
      { label: "How the privacy model works →", href: SECURITY_URL },
      "Or just see it on your own machine, free for a week:",
      download,
    ],
  },
  {
    id: "n4-cockpit",
    afterDays: 10,
    subject: "A day in the Cereal Milk cockpit",
    blocks: [
      "Here's what using Cereal Milk actually feels like.",
      "WhatsApp lives in one fast window that never reloads. ⌘K runs everything: switch chats, ask the agent, drop a snippet, export a thread, without touching the mouse. ⌘⇧S turns the open conversation into clean Markdown, ready for your notes, your CRM, or whatever agent you point at it.",
      "The agent sits beside the chat: summarise the thread, pull out the commitments, draft the reply in your voice. Drafts land in the composer, you always hit send. And it speaks MCP, so it can use the tools your stack already exposes (your CRM, your notes, your calendar), with every write staged as a proposal you review.",
      "It's the client a power user would build for themselves. Yours is a download away:",
      download,
    ],
  },
  {
    id: "n5-offer",
    afterDays: 14,
    subject: "Lock your price while we're small",
    blocks: [
      `Cereal Milk is priced simply: Starter $${STARTER.monthly} per user a month or $${STARTER.yearly} a year, Business $${BUSINESS.monthly} a month for teams. Every plan starts with a ${TRIAL_DAYS}-day free trial, no card.`,
      `But if you already know chat is where your work lives, there's a better deal. The founding cohort is capped at ${FOUNDING.seatCap} seats. Reserving one costs nothing today, no card, and locks your pricing at today's published rate for as long as you keep the seat. It never rises for a founding seat, and your install is set up personally on a call with me.`,
      reserveSeat,
      "Or start with the free trial and decide later:",
      download,
      "Either way, reply with whatever's holding you back. I read every one.",
    ],
  },
  {
    id: "n6-breakup",
    afterDays: 21,
    subject: "Should I keep you on the list?",
    blocks: [
      "I don't want to clutter your inbox, so this is the last you'll hear from me unless you'd like otherwise.",
      `If Cereal Milk still sounds useful (WhatsApp in one fast window, an AI agent beside every chat on your own model account, and the deals in your DMs finally within reach of your tools), the whole product is free for ${TRIAL_DAYS} days, no card:`,
      download,
      "And if it's not the right fit, just hit reply and tell me why. Whatever's holding you back genuinely shapes what we build next. Either way, thanks for the time.",
    ],
  },
];

// Activation is paced to the 7-day trial: connections on day 1, the first
// agent moment on day 2, the cockpit on day 4, the honest pricing note the
// day before the trial ends, feedback after. Signal mapping (what the app
// reports via /api/lifecycle → which step goes quiet):
//   whatsapp_connected → A2 skips
//   first_insight (first agent ask) → A3 skips
//   first_sync (first export) → A4 skips
const activation: Step[] = [
  {
    id: "a1-welcome",
    afterDays: 0,
    subject: "You're in: your Cereal Milk trial starts now",
    blocks: [
      `You're in: welcome to Cereal Milk, and thank you. Your account is live and your ${TRIAL_DAYS}-day free trial of the full product started the moment you created it. No card, nothing to cancel.`,
      "If the app isn't on this machine yet, grab it here (Mac and Windows):",
      download,
      "Here's the week in three small steps: connect WhatsApp and your model today, ask the agent one real thing tomorrow, and by the end of the week the deals in your DMs are finally within reach of your tools.",
      "I'll send a couple of short notes to walk you through it. Reply to any of them; they come to my real inbox.",
    ],
  },
  {
    id: "a2-connect",
    afterDays: 1,
    subject: "Two connections and you're live",
    skipIf: (c) => !!c.signals.whatsappConnected,
    blocks: [
      "Once Cereal Milk is open, there are exactly two connections to make, and both take about a minute.",
      "One: scan the WhatsApp QR with your phone, the same way you would for WhatsApp Web. It's the official web client in a hardened shell, so your session stays live in one fast window that never reloads.",
      "Two: connect your model. Claude and ChatGPT use the sign-in you already have; Gemini and OpenAI-compatible endpoints take an API key. That puts the agent beside every chat, running on your own account.",
      "And that's all the setup there is. Nothing syncs anywhere, and the agent reads only the chat you have open, when you ask.",
    ],
  },
  {
    id: "a3-first-ask",
    afterDays: 2,
    subject: "Ask the agent one thing today",
    skipIf: (c) => !!c.signals.firstInsight,
    blocks: [
      "Here's the one action that makes Cereal Milk click. Open the thread that actually matters this week (a live deal, a warm intro, a client going quiet) and ask the agent for the summary.",
      "Watch it read just that thread and hand back the state of play: what was agreed, who owes whom what, and the follow-up drafted in your voice. The draft lands in the composer, so the whole loop is one keystroke, and then you hit send.",
      "That's the moment the product earns its keep: the low-grade dread that something, somewhere, went unanswered starts to go.",
      "If the answer comes back off-key, tell me. Reply with what you asked and what you got, and I'll tune it or show you a better prompt.",
    ],
  },
  {
    id: "a4-cockpit",
    afterDays: 4,
    subject: "⌘K, ⌘⇧S, and the rest of the cockpit",
    skipIf: (c) => !!c.signals.firstSync,
    blocks: [
      "A few keystrokes that turn Cereal Milk from a chat window into a cockpit.",
      "⌘K is the command palette: every action in the app, fuzzy-searched. ⌘⇧S exports the open chat as clean Markdown, ready to paste into your notes, your CRM, or any agent you run. Snippets take variables and land in the composer on any channel, and you still hit send.",
      "And if your stack speaks MCP, add your servers (your CRM, your notes, your calendar) and the agent can use their tools right beside the chat, with every write staged as a proposal you review before anything changes.",
      "Try the export on a thread you'd normally rebuild from memory. That's the habit that compounds.",
    ],
  },
  {
    id: "a5-trial",
    afterDays: 6,
    subject: "Your trial wraps up tomorrow",
    blocks: [
      `An honest heads-up: tomorrow is day ${TRIAL_DAYS}, the last day of your free trial.`,
      `If Cereal Milk has earned its place, keeping it is simple: Starter is $${STARTER.monthly} per user a month or $${STARTER.yearly} a year, Business for teams is $${BUSINESS.monthly} a month. Pick a plan inside the app, monthly or yearly, cancel anytime, no usage meters.`,
      "If you're not sure yet, that's useful too: reply and tell me what's missing, and if you just need more time, say so and I'll extend your trial. I'd rather you decide with a real answer than a countdown.",
    ],
  },
  {
    id: "a6-feedback",
    afterDays: 10,
    subject: "How's Cereal Milk feeling?",
    blocks: [
      "You've had Cereal Milk for a week and a half now, how's it feeling?",
      "Mostly I want to hear what isn't working: the chat the agent misread, the keystroke you reached for that wasn't there, the channel you need next. LinkedIn and Gmail are on the way, and where they land in the queue is genuinely shaped by these replies.",
      "What would make Cereal Milk the first thing you open in the morning? Reply and tell me. I read everything, and the good ones ship.",
    ],
  },
];

export const SEQUENCES: Record<SequenceId, Step[]> = { nurture, activation };
