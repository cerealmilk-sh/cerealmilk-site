// The two lifecycle sequences, as data. Each step has a delay (afterDays, from
// the sequence's anchor), a subject, the body blocks (the renderer adds the
// greeting, sign-off, and unsubscribe footer), and an optional skipIf that lets
// the engine advance past a step without sending it.
//
//   nurture     anchored on waitlist signup. Job: convert a warm lead into a
//               pre-order, or keep them warm until their wave opens. The Day-0
//               welcome is sent inline by /api/waitlist; this sequence is N1–N6.
//   activation  anchored on purchase. Job: get a paying customer to their first
//               synced thread. Steps skip themselves as the Mac app reports the
//               matching usage signal (see /api/lifecycle), so a fast starter
//               gets fewer emails, not more.

import type { Block } from "./email";
import { PREORDER_URL, DOWNLOAD_URL, AI_SPEND_COURSE_URL } from "./email";
import { FOUNDING, STARTER } from "@/lib/pricing";
import type { Contact, SequenceId } from "./types";

const ch = (slug: string) => `${AI_SPEND_COURSE_URL}/${slug}/`;

export interface Step {
  id: string;
  afterDays: number;
  subject: string;
  blocks: Block[];
  // Return true to advance past this step without sending it.
  skipIf?: (c: Contact) => boolean;
}

// The nurture CTA: the founding pre-order (reservation, no card). Replaced the
// old "claim your seat" link; replaced with /download 2026-07-25.
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
      "Quick one. The best conversation you had this week probably happened in a WhatsApp thread or a LinkedIn DM, and there's no record of it anywhere.",
      "The deck that arrives in a thread about padel. The warm intro that lands in a LinkedIn message. Terms hashed out across two apps, between the small talk. None of it reaches your CRM, so a few weeks later you're rebuilding the relationship from memory.",
      "That's the gap Cereal Milk closes: it runs the real WhatsApp Web and LinkedIn in one native Mac window and files the lines that matter to Attio or Affinity, only the ones you pick.",
      "Where do your deals actually happen: WhatsApp, LinkedIn, both? Hit reply and tell me; it genuinely shapes what we build next.",
    ],
  },
  {
    id: "n2-ban",
    afterDays: 4,
    subject: "Will this get my WhatsApp number banned?",
    blocks: [
      "The first thing people ask me about Cereal Milk: will this get my number or LinkedIn account banned? Fair question: most “WhatsApp CRM” tools absolutely will.",
      "They bolt onto a reverse-engineered API: Baileys, whatsapp-web.js, LinkedIn Voyager scraping. That's what gets accounts banned. Cereal Milk uses none of it.",
      "Under the hood it's the official web.whatsapp.com and linkedin.com/messaging running inside Apple's WebKit, the same engine as Safari. To WhatsApp and LinkedIn, you're just a person on the web client. Nothing automates, bulk-sends, or scrapes in the background, and you always hit send yourself.",
      "If you'd rather not wait for the next wave, you can reserve a founding seat now: no card, no charge, and your pricing locks at today's published rate.",
      reserveSeat,
    ],
  },
  {
    id: "n3-privacy",
    afterDays: 7,
    subject: "Some conversations were never meant for the record",
    blocks: [
      "Most CRM tools ask you to trust a toggle. Cereal Milk makes the separation a fact of the system.",
      "Every thread is born private. You share a whole conversation as the record, or surface a single line, and the other twelve messages never move. The sync gate lives on the server, so even if a sync ran this instant, a private message would be refused before it left your Mac.",
      "Your padel banter, the contact who vents, the thing someone told you in confidence: the noise stays with you, and only the signal you choose ever leaves. That's not a privacy policy, it's how the product is wired.",
      "When you're ready, your seat is here:",
      reserveSeat,
    ],
  },
  {
    id: "n4-cockpit",
    afterDays: 10,
    subject: "A day in the Cereal Milk cockpit",
    blocks: [
      "Here's what using Cereal Milk actually feels like.",
      "WhatsApp and LinkedIn live in one window, flip between them with ⌘1 and ⌘2, both sessions stay live. A command palette on ⌘K runs everything: sync a thread, drop a snippet, export a chat as a deal note, jump to a contact, without touching the mouse.",
      "Sync a conversation and Cereal Milk reads it back as a relationship: who leads, who gets the last word, the tone, and how much has actually reached your CRM. A native inspector docks beside the chat showing who you're talking to and their CRM record, so you file the line that matters in one keystroke: no tab-switch, no “I'll log it later.”",
      "It's the client a power user would build for themselves. Want yours set up first?",
      reserveSeat,
    ],
  },
  {
    id: "n5-offer",
    afterDays: 14,
    subject: "Want to skip the line?",
    // No hard pre-order push for people who aren't on macOS yet.
    skipIf: (c) => c.segment === "non_mac",
    blocks: [
      "We're onboarding new teams in waves, and I'll email you the moment your seat opens. But if you'd rather not wait at the back, you don't have to.",
      `The founding cohort is capped at ${FOUNDING.seatCap} seats, and founding seats are onboarded first, in the order they reserved. Reserving costs nothing today (no card) and locks your pricing at the published rate, from $${STARTER.monthly} per user per month. It never rises for a founding seat.`,
      reserveSeat,
      "Or just reply with whatever's holding you back. I read every one.",
    ],
  },
  {
    id: "n6-breakup",
    afterDays: 21,
    subject: "Should I keep you on the list?",
    blocks: [
      "I don't want to clutter your inbox, so this is the last you'll hear from me unless you'd like otherwise.",
      "If Cereal Milk still sounds useful (running WhatsApp and LinkedIn from one native window, with your deals finally reaching the CRM), the founding offer is one form and no card: your seat reserved, your pricing locked, first access when your wave opens.",
      reserveSeat,
      "And if it's not the right fit, just hit reply and tell me why. Whatever's holding you back genuinely shapes what we build next. Either way, thanks for the time.",
    ],
  },
];

const activation: Step[] = [
  {
    id: "a1-welcome",
    afterDays: 0,
    subject: "You're in, let's get Cereal Milk set up",
    blocks: [
      "You're in: welcome to Cereal Milk, and thank you. I'm genuinely glad you're here.",
      "First step is the app itself: download it, drag it to Applications, and create your account. That account starts your 7-day free trial of the full product, no card.",
      { label: "Download Cereal Milk →", href: DOWNLOAD_URL },
      "Over the next few days I'll send a couple of short notes to get you to your first synced thread. Prefer a call? Reply and we'll find a time, and your private Slack channel with the founders is the fastest way to reach us.",
    ],
  },
  {
    id: "a2-connect",
    afterDays: 1,
    subject: "Step 1: connect WhatsApp & LinkedIn",
    skipIf: (c) => !!(c.signals.whatsappConnected && c.signals.linkedinConnected),
    blocks: [
      "Once Cereal Milk is open, the first thing to do is connect your two channels.",
      "Scan the WhatsApp Web QR the way you would in a browser, and sign in to LinkedIn in the next tab. Both sessions stay live in the background, so from then on you flip between them with ⌘1 and ⌘2 without anything reloading.",
      "That's all the channel setup there is, and nothing syncs anywhere yet. Everything stays private until you say so.",
    ],
  },
  {
    id: "a3-crm",
    afterDays: 3,
    subject: "Step 2: link Attio or Affinity",
    skipIf: (c) => !!c.signals.crmLinked,
    blocks: [
      "Now point Cereal Milk at your CRM. Pick Attio or Affinity as the record of choice for your workspace. You can switch later and history re-syncs.",
      "Once it's linked, the inspector beside each chat shows the matching contact and how it matched, so you always know who you're talking to without leaving the thread. A matching phone, email, or LinkedIn profile links in one click; a fuzzy name is only ever suggested, never filed on a stranger.",
      "Stuck on the mapping? That's exactly what your Slack channel is for, reply here too and I'll jump in.",
    ],
  },
  {
    id: "a4-first-sync",
    afterDays: 5,
    subject: "Share your first thread (the 2-minute version)",
    skipIf: (c) => !!c.signals.firstSync,
    blocks: [
      "Here's the one action that makes Cereal Milk click: share your first thread.",
      "Open a conversation that actually matters (a live deal, a warm intro) and hit Sync (or ⌘K → Sync). It files to the matching contact as a clean, timestamped note in your CRM's own voice, deduped so a thread is one note, not thirteen ragged copies. Want to share just one line instead? You can: the rest never moves.",
      "Do it once and the value is obvious. If anything's in the way, reply here or drop it in your Slack channel and we'll sort it in minutes.",
    ],
  },
  {
    id: "a5-habit",
    afterDays: 10,
    subject: "How's Cereal Milk feeling?",
    blocks: [
      "You've had Cereal Milk for a week or so now, how's it feeling?",
      "If it's earning its place, the next step is just letting it run: flip your active threads to Shared and every new message files itself, hands-off. And the relationship insights get sharper the more you sync: who leads, the tone, how much has reached the CRM.",
      "Mostly, though, I want to hear what isn't working. Reply to this, or tell me in your Slack channel: what would make Cereal Milk a daily driver for you? Every bit of it shapes what we ship next.",
    ],
  },
];

// ── AI-spend course ──────────────────────────────────────────────────────────
// A five-day email version of the docs course "Optimize Your Fund's AI Spend"
// (cerealmilk.sh/docs/learn/ai-spend). Anchored on signup. Day 1 is sent inline by
// /api/waitlist the moment someone joins (COURSE_DAY1 below), so it works with
// only RESEND_API_KEY; days 2–5 are this sequence and need the drip store on.
// Eight chapters, folded into five mornings: 1 · the reframe, 2 · the two
// biggest levers, 3 · two more, 4 · the runaway-cost guardrail, 5 · ROI + policy.

// Day 1, sent inline at signup (not part of the timed sequence). Exported so the
// waitlist route and the sequence keep every course email's copy in one file.
export const COURSE_DAY1: { subject: string; blocks: Block[] } = {
  subject: "Day 1: what your fund's AI actually costs",
  blocks: [
    "Welcome. You're in. Over the next five mornings I'll send you the whole Optimize Your Fund's AI Spend course, one short lesson a day. Each one ends with a link to the full chapter if you want to go deeper, and you can reply to any of them; they come to my real inbox.",
    "Today's reframe is the one everything else rests on: an AI bill is not a subscription. It is token volume times price, summed over every call your fund makes, and it arrives on three separate meters. Model usage, billed per token. Software seats, billed per person. And human time to build and check the work, which never shows up on any invoice and is usually the largest cost of all.",
    "The unit that makes all three legible is cost per fund workflow: what it costs to screen one deal, capture one meeting note, or prep one LP call. Hold that number in your head and the rest of the week is just five ways to lower it, and one way to prove the lowering was worth it.",
    { label: "Read Chapter 1: What AI actually costs →", href: ch("what-ai-actually-costs") },
    "One question before tomorrow: which AI line item worries you most right now? Hit reply and tell me. It genuinely shapes which lesson I expand. See you in the morning.",
  ],
};

const course: Step[] = [
  {
    id: "c2-levers",
    afterDays: 1,
    subject: "Day 2: the two biggest levers on the bill",
    blocks: [
      "Yesterday was the reframe: cost per workflow. Today, the two levers that move it the most. Both are structural. You set them once and they pay out on every call after.",
      "One: right-size the model. Providers sell a range, from small-and-cheap to frontier-and-expensive, and the spread is roughly five times on the same task. Route each job to the cheapest model that clears its quality bar, and let only the hard few escalate to a bigger one. That automatic version is called a cascade. It is usually the single largest saving in a model bill.",
      "Two: cache the fixed prefix. If you send the same thesis, rubric, or instructions on every call, prompt caching re-reads that block at roughly a tenth of the normal price. The catch: it breaks the instant anything inside the cached block changes, so your variable content has to go last.",
      { label: "Chapter 2: Right-size the model →", href: ch("right-size-the-model") },
      { label: "Chapter 3: Cache the fixed prefix →", href: ch("cache-the-fixed-prefix") },
      "Which of your workflows sends the same big prompt every time? That one is your caching win. Tomorrow: two more levers, both about paying less for the exact same work.",
    ],
  },
  {
    id: "c3-efficiency",
    afterDays: 2,
    subject: "Day 3: two ways to pay less for the same work",
    blocks: [
      "Two more levers today. Neither changes the answer you get, only what you pay for it.",
      "Three: batch the work nobody is waiting on. Overnight re-scoring, bulk enrichment, drafting a stack of reports, none of it needs an instant reply. Send it to a provider's batch queue and it is commonly half price. The only thing you trade is immediacy, so keep anything live, like meeting prep, out of it.",
      "Four: shrink the input, retrieve, don't stuff. A million-token context is billed as a million tokens on every single call. Instead of pasting an entire data room into the prompt, retrieve the handful of relevant pages and send only those. That is what embeddings are for, and it is the difference between a bill that scales with your archive and one that scales with the question.",
      { label: "Chapter 4: Batch non-urgent work →", href: ch("batch-non-urgent-work") },
      { label: "Chapter 5: Shrink the input →", href: ch("shrink-the-input") },
      "Not sure which of your jobs are safe to batch? Reply and describe one, happy to help you sort it. Tomorrow: the line item that runs up the nastiest surprise bills.",
    ],
  },
  {
    id: "c4-agent-loop",
    afterDays: 3,
    subject: "Day 4: the line item that surprises people",
    blocks: [
      "Today's lesson is the one that saves people from an ugly invoice.",
      "An autonomous agent doesn't make one call. It loops: call the model, run a tool, feed the result back, and go again until it decides it's done. A single task can quietly cost twenty times one call, and a loop that gets stuck can run all night. The fix isn't to avoid agents. It's to put a ceiling on them: a hard cap on steps and on spend per run, so one runaway job fails small instead of eating the month.",
      "That cap is the whole difference between an agent you can leave running in production and one you can't. And it's a setting, not a hire.",
      { label: "Chapter 6: Put a ceiling on the agent loop →", href: ch("control-the-agent-loop") },
      "Last one tomorrow: how to prove any of this actually paid off, and how to turn the week into a one-page policy that sticks.",
    ],
  },
  {
    id: "c5-roi-policy",
    afterDays: 4,
    subject: "Day 5: prove the ROI, then set the policy",
    blocks: [
      "Last one. You now know what AI costs and five ways to spend less on it. Two things left: proving it's worth it, and making it stick.",
      "Measure ROI honestly. Most AI pilots show no measurable return: not because the tools don't work, but because nobody set a baseline. Pick one workflow. Measure the hours it took before, count the fully-loaded cost after (tokens, seats, and the human time to check the output), and compare: hours returned against true cost. If it's positive, scale it. If it isn't, you've learned that cheaply.",
      "Then write the one-page policy: audit your seats, decide buy-versus-build for each workflow, set caps that are actually enforced, and put the bill on the calendar once a month. That page is what keeps cost tied to value after the novelty wears off.",
      { label: "Chapter 7: Measure the ROI →", href: ch("measure-the-roi") },
      { label: "Chapter 8: Your fund's AI-spend policy →", href: ch("your-fund-ai-spend-policy") },
      "That's the course. If you draft an AI-spend policy off the back of it, send it over. I'll give you honest notes. And if there's one fund workflow you want to get right first, tell me about it; that's exactly the kind of thing I build at Cereal Milk. Thanks for reading along this week.",
    ],
  },
];

export const SEQUENCES: Record<SequenceId, Step[]> = { nurture, activation, course };
