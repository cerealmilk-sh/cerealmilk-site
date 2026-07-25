// The /for/* use-case layer (the Wispr Flow model): the homepage sells the
// platform, industry-agnostic; each use-case page sells the same product in
// one audience's own language. One typed list drives the routes, the home
// "who runs Cereal Milk" cards, the footer column, and the registry entries, so
// adding an audience is one object here + one thin page.tsx + one markdown
// mirror.
//
// Voice rules (same as the homepage): Superhuman/Linear register, short
// declaratives, outcomes over mechanisms, no em dashes. Every claim must be
// true of the shipping app; the audiences differ, the product does not.

export interface UseCaseLeak {
  n: string;
  title: string;
  body: string;
}

export interface UseCaseJob {
  kicker: string;
  title: string;
  body: string;
}

export interface UseCase {
  slug: string;
  /** Short label for nav, cards, and footer ("Venture capital"). */
  label: string;
  /** Registry title (becomes "<title> · Cereal Milk"). */
  metaTitle: string;
  /** Registry meta description (~155 chars). */
  metaDescription: string;
  /** The card teaser on the homepage. */
  teaser: string;
  kicker: string;
  /** Two hero lines, rendered with a break between them. */
  h1: [string, string];
  lede: string;
  /** Where the record goes to die, in this audience's life. */
  leaks: UseCaseLeak[];
  leaksTitle: string;
  leaksLede: string;
  /** The three load-bearing jobs, in this audience's language. */
  jobs: UseCaseJob[];
  /** The credibility block. */
  proofKicker: string;
  proofTitle: string;
  proofBody: string;
  /** The closing line above the final CTAs. */
  closer: string;
}

export const USE_CASES: UseCase[] = [
  {
    slug: "venture-capital",
    label: "Venture capital",
    metaTitle: "Cereal Milk for venture capital",
    metaDescription:
      "The deal messenger for venture capital: WhatsApp, LinkedIn, and Gmail in one Mac window, with the Attio or Affinity record live beside every chat. Private by default.",
    teaser:
      "Sourcing in DMs, diligence in group chats, LPs on WhatsApp. Every conversation a deal moves through, filed to the pipeline.",
    kicker: "Cereal Milk for venture capital",
    h1: ["The deal messenger", "for venture capital."],
    lede: "Sourcing happens in DMs. Diligence happens in group chats. LPs live on WhatsApp. Cereal Milk puts every channel a deal moves through in one keyboard-first Mac window, with the Attio or Affinity record live beside every chat, and every deal on the record.",
    leaksTitle: "Your best deals have no record",
    leaksLede:
      "The deals that make a fund are hashed out in chat. None of it reaches the CRM.",
    leaks: [
      {
        n: "01",
        title: "The deck in the padel thread",
        body: "Read, replied to, never filed. Six weeks later it is forty scrolls up, between weekend plans and a tooth-fairy update.",
      },
      {
        n: "02",
        title: "The intro in a LinkedIn DM",
        body: "The intro that converts lands in a DM, not your inbox. No integration sees it. To your CRM, the relationship does not exist.",
      },
      {
        n: "03",
        title: "The terms agreed across three apps",
        body: "Half in WhatsApp, half in email, closed on a call. Someone rebuilds it from memory. Or nobody does.",
      },
    ],
    jobs: [
      {
        kicker: "One window",
        title: "Every channel a deal moves through",
        body: "The official WhatsApp Web, LinkedIn, and Gmail, natively. The founder, the co-investor, and the LP are one keystroke apart.",
      },
      {
        kicker: "The inspector",
        title: "Full context before you type",
        body: "Deal stage, owner, next step, live beside the chat. Read and edit the record without leaving the conversation.",
      },
      {
        kicker: "Selective sync",
        title: "The deal note writes itself",
        body: "A thread or a single line, filed to the right record in one keystroke. Deduplicated, timestamped, written once.",
      },
    ],
    proofKicker: "Built from inside the workflow",
    proofTitle: "Born in venture. Still deepest here.",
    proofBody:
      "Cereal Milk was built by the team that ran deal-ops engineering for 68 venture funds and firms, from first-time managers to long-established multi-stage firms. Deployed across the fund, every partner's WhatsApp, LinkedIn, and Gmail files to one clean CRM: intros stop dying in someone's DMs, and “who knows this founder” has one true answer.",
    closer:
      "Your competition is still scrolling for the deck. Close the tabs. Open the cockpit.",
  },
  {
    slug: "b2b-startups",
    label: "B2B startups",
    metaTitle: "Cereal Milk for B2B startups",
    metaDescription:
      "Founder-led sales finally has a system of record: WhatsApp, LinkedIn, and Gmail in one Mac window, every lead and every promise filed to Attio or Affinity.",
    teaser:
      "Founder-led sales lives in WhatsApp and LinkedIn. Every lead, every promise, and every investor thread, on the record.",
    kicker: "Cereal Milk for B2B startups",
    h1: ["Founder-led sales finally has", "a system of record."],
    lede: "Your best pipeline is in WhatsApp threads and LinkedIn DMs, not your CRM. Cereal Milk puts every channel a prospect moves through in one keyboard-first Mac window, files the lines that matter to Attio or Affinity, and keeps every promise you make on the record.",
    leaksTitle: "Your pipeline is forty scrolls up",
    leaksLede:
      "The revenue that keeps a startup alive is closed in chat. None of it reaches the CRM.",
    leaks: [
      {
        n: "01",
        title: "The lead that came in warm",
        body: "A friend of a customer, straight into your LinkedIn DMs. You replied in nine minutes. Then the launch happened, and the thread sank.",
      },
      {
        n: "02",
        title: "The pricing agreed at midnight",
        body: "A number, a nod, and a rocket emoji in WhatsApp. Nothing in the CRM, nothing in the contract, and two versions of the story by renewal.",
      },
      {
        n: "03",
        title: "The investor who said keep me posted",
        body: "The next round is built on threads like this one, scattered across three channels and owed an update nobody scheduled.",
      },
    ],
    jobs: [
      {
        kicker: "One window",
        title: "Every channel a prospect moves through",
        body: "The official WhatsApp Web, LinkedIn, and Gmail, natively. The prospect, the customer, and the investor are one keystroke apart.",
      },
      {
        kicker: "The inspector",
        title: "Full context before you type",
        body: "Stage, owner, next step, live beside the chat. Update the deal without ever opening the CRM tab.",
      },
      {
        kicker: "Selective sync",
        title: "The deal note writes itself",
        body: "The pricing thread, the objection, the verbal yes: filed to the right record in one keystroke, deduplicated and timestamped.",
      },
    ],
    proofKicker: "Proven where deals move fastest",
    proofTitle: "The machine that keeps a fund's pipeline true",
    proofBody:
      "Cereal Milk was built by the team that ran deal-ops engineering for 68 venture funds and firms. The same machine now keeps a startup's pipeline true: founder-led sales, fundraising threads, and customer relationships filed to one clean CRM, without anyone doing data entry.",
    closer:
      "Your next customer is already in your DMs. Close the tabs. Open the cockpit.",
  },
  {
    slug: "service-providers",
    label: "Service providers",
    metaTitle: "Cereal Milk for service providers",
    metaDescription:
      "For agencies, consultancies, recruiters, and brokers: every client channel in one Mac window, scope and referrals filed to Attio or Affinity, private by default.",
    teaser:
      "Clients buy in chat and stay in chat. Scope, renewals, and referrals, filed to the relationship instead of your memory.",
    kicker: "Cereal Milk for service providers",
    h1: ["Clients don't email you.", "They text you."],
    lede: "Agencies, consultancies, recruiters, brokers: the work is sold in WhatsApp and kept alive in DMs. Cereal Milk puts every client channel in one keyboard-first Mac window and files scope, decisions, and referrals to Attio or Affinity, so the relationship has a record the whole firm can stand on.",
    leaksTitle: "The whole engagement lives in one thread",
    leaksLede:
      "The conversations that pay the firm are hashed out in chat. None of it reaches the record.",
    leaks: [
      {
        n: "01",
        title: "The scope agreed at 11pm",
        body: "Three bullet points in WhatsApp and a thumbs-up. Six weeks later, it is the whole disagreement.",
      },
      {
        n: "02",
        title: "The referral in a DM",
        body: "Your best client introduces your next one, in a thread only you can see. To the firm, that pipeline does not exist.",
      },
      {
        n: "03",
        title: "The client who went quiet",
        body: "No reply in three weeks and nobody noticed, because nothing was watching the channel where the relationship actually lives.",
      },
    ],
    jobs: [
      {
        kicker: "One window",
        title: "Every channel a client moves through",
        body: "The official WhatsApp Web, LinkedIn, and Gmail, natively. The client, the referral, and the prospect are one keystroke apart.",
      },
      {
        kicker: "The inspector",
        title: "Full context before you type",
        body: "Engagement, owner, next step, live beside the chat. Read and edit the record without leaving the conversation.",
      },
      {
        kicker: "Selective sync",
        title: "The paper trail writes itself",
        body: "The scope, the approval, the line that settles a dispute: filed to the right record in one keystroke, deduplicated and timestamped.",
      },
    ],
    proofKicker: "Private by default",
    proofTitle: "Client confidences stay confidential",
    proofBody:
      "Every thread is born private and stays that way until you decide otherwise. You file the scope line; the venting about their board never moves. The privacy gate is enforced on the server, so a private message cannot sync by accident, by cron, or by bulk action.",
    closer:
      "Your next engagement is already in your messages. Close the tabs. Open the cockpit.",
  },
];

// Named findUseCase (not useCaseBySlug) so the "use" prefix doesn't trip the
// React hooks lint in the async server component that calls it.
export function findUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
