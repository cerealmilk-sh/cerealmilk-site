import Link from "next/link";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { faqNode, graph, softwareAppNode } from "@/lib/jsonld";
import { BOOK_PATH, DOWNLOAD_PATH } from "@/lib/site";
import { BRANDSCRIPT } from "@/content/brandscript";
import {
  BUSINESS,
  PLANS,
  PRICE_ANCHOR,
  PRICE_LINE,
  STARTER,
  TRIAL_DAYS,
} from "@/lib/pricing";
import { JsonLd } from "@/components/site/JsonLd";
import { T } from "@/components/site/EditableCopy";
import { SiteShell } from "@/components/site/SiteShell";
import { DownloadCta } from "@/components/site/DownloadCta";
import { TypewriterH1 } from "@/components/landing/TypewriterH1";
import { WorkspaceDemo } from "@/components/landing/WorkspaceDemo";

// The product homepage, a section-for-section build of the reference layout
// (superset.sh) carrying Cereal Milk copy: hero (mono typewriter H1 + two buttons +
// the product frame + chips) -> four alternating feature rows, each beside a
// floating dark mock window -> the proof band (real numbers in the logo-wall
// slot; Cereal Milk has no customer logos or testimonials and invents none) -> the
// two-column FAQ (sticky title left, accordion right) -> "Try Cereal Milk now." with
// one download button. The funnel is DOWNLOAD-FIRST (the Raycast model,
// 2026-07-14): every download CTA points at /download; the app forces account
// creation on first run and the account grants a 7-day full-access trial, no
// card, so buying happens in-app after the trial. Prices are single-sourced
// in src/lib/pricing.ts and live in the FAQ + /pricing. Deeper story, safety,
// and feature depth live on /security, /pricing, and the /for/* pages.

const entry = pageByPath("/")!;
export const metadata = {
  ...pageMetadata(entry),
  title: { absolute: `Cereal Milk · ${entry.title}` },
};

const QUIET_LINK =
  "font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground";

const HERO_HREF = `${DOWNLOAD_PATH}?src=hero`;
const FOOTER_HREF = `${DOWNLOAD_PATH}?src=home-footer`;

// --- FAQ: the handful that actually blocks a purchase --------------------------
const HOME_FAQ: { q: string; a: string; aNode?: React.ReactNode }[] = [
  {
    q: "Is this a native Mac app?",
    a: "Yes, and a Windows app too. Cereal Milk is a real, keyboard-first desktop app, not just another browser tab. It runs the official WhatsApp Web, LinkedIn, and Gmail in one window with a command palette, snippets, and an AI agent beside every chat.",
  },
  {
    q: "What do AI agents get out of it?",
    a: "Reach. Your deals happen in chat, and chat is the one surface your agents cannot touch. Cereal Milk puts an AI agent beside every conversation and exports any thread as clean Markdown in one click, so the agent can summarise the thread, pull out the commitments, draft the follow-up, or brief you before the call. It runs on your own Claude, ChatGPT, Gemini, or OpenAI-compatible account.",
  },
  {
    q: "Does Cereal Milk work with MCP and my other AI tools?",
    a: "Yes. Cereal Milk has a built-in agent that works alongside you, and it speaks MCP, the Model Context Protocol. Add the servers your stack already exposes, your CRM, your notes, your calendar, with one command, and the agent can use their tools while it works. It stays hands-off by design: its writes are staged as proposals you review, every tool call is logged, and nothing changes anywhere until you approve it.",
  },
  {
    q: "How does Cereal Milk connect to my accounts?",
    a: "Cereal Milk runs the official WhatsApp Web, LinkedIn, and Gmail inside a hardened desktop browser shell, so to those services it looks like an ordinary browser. It never bulk-sends, automates, or scrapes; you always hit send yourself, and the agent reads only the chat you have open, when you ask. Nothing ever acts as you in the background.",
  },
  {
    q: "Does it read my messages?",
    a: "Only the chat you have open, and only when you ask. It never enumerates your chats or scrolls history in the background. The agent runs on the model account you connect, so what it reads goes to your own provider and nowhere else. Everything else stays on your machine.",
    aNode: (
      <>
        Only the chat you have open, and only when you ask. It never enumerates
        your chats or scrolls history in the background. The agent runs on the
        model account you connect, so what it reads goes to your own provider
        and nowhere else. More on the{" "}
        <Link href="/security" className={QUIET_LINK}>
          security page
        </Link>
        .
      </>
    ),
  },
  {
    q: "How do I get started?",
    a: `Download the app and create your account: your ${TRIAL_DAYS}-day free trial of the full product starts right there, no card. When it ends, pick a plan inside the app.`,
    aNode: (
      <>
        <Link href={`${DOWNLOAD_PATH}?src=home-faq`} className={QUIET_LINK}>
          Download the app
        </Link>{" "}
        and create your account: your {TRIAL_DAYS}-day free trial of the full
        product starts right there, no card. When it ends, pick a plan inside
        the app.
      </>
    ),
  },
  {
    q: "How does pricing work?",
    a: PRICE_LINE,
    aNode: (
      <>
        Two plans, per user: Starter at {PRICE_ANCHOR} a month or ${STARTER.yearly} a
        year, Business at ${BUSINESS.monthly} a month or ${BUSINESS.yearly} a year.
        Both plans start with a {TRIAL_DAYS}-day free trial. Monthly or yearly, cancel
        anytime, no usage meters. Full detail on the{" "}
        <Link href="/pricing" className={QUIET_LINK}>
          pricing page
        </Link>
        .
      </>
    ),
  },
  {
    q: "Is there a Windows version?",
    a: "Yes. Cereal Milk ships for Mac and Windows. The download page detects your platform and starts the right installer automatically, so the same button works for everyone.",
  },
  {
    q: "Is Cereal Milk a unified inbox?",
    a: "Yes, in one window rather than one merged list. Cereal Milk keeps WhatsApp, LinkedIn, and Gmail signed in side by side, one keystroke apart, with an AI agent beside every chat. Sessions stay live, notifications land in one place, and you never juggle browser tabs again.",
  },
  {
    q: "Is Cereal Milk like Superhuman, but for WhatsApp and LinkedIn?",
    a: "That is a fair shorthand. Cereal Milk brings the keyboard-first, one-window discipline of a fast email client to WhatsApp, LinkedIn, and Gmail together, and adds an AI agent beside every chat, running on your own model account. Superhuman speeds up email; Cereal Milk covers the channels where your deals actually happen.",
  },
  {
    q: "Does the AI agent work in LinkedIn messages too?",
    a: "Yes. The agent sits beside every chat in the window, LinkedIn DMs and email included. Ask it to summarise a thread, pull out commitments, or draft a reply; drafts are typed into the composer and you always hit send yourself. It runs on your own Claude, ChatGPT, Gemini, or OpenAI-compatible account.",
  },
  {
    q: "How does Cereal Milk help me triage a full inbox?",
    a: "One window shows every channel, so triage happens in one pass instead of three apps. Notifications land in one place, you see who is waiting on you and who went quiet, and the agent summarises any thread and pulls out the commitments before you reply.",
  },
];

// --- small presentational bits ---------------------------------------------------

/** The traffic-light row every floating mock window opens with. */
function Lights() {
  return (
    <div className="flex gap-1.5">
      <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <div className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

/** One feature row: kicker + headline + lede beside a floating mock window
    on a faint dot-grid canvas; `flip` swaps the columns on desktop. */
function FeatureRow({
  id,
  kicker,
  title,
  lede,
  visual,
  flip,
}: {
  id: string;
  kicker: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className={`space-y-6 ${flip ? "lg:order-2" : "lg:order-1"}`}>
        <div className="space-y-4">
          <span className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
            {kicker}
          </span>
          <h3
            id={id}
            className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            {title}
          </h3>
        </div>
        <p className="max-w-[500px] text-base leading-relaxed text-muted-foreground sm:text-lg">
          {lede}
        </p>
      </div>
      <div className={flip ? "lg:order-1" : "lg:order-2"}>
        <div className="relative min-h-[300px] w-full overflow-hidden lg:aspect-4/3">
          <div className="pointer-events-none absolute inset-0 h-full w-full opacity-30 mix-blend-screen">
            <div className="x-dotgrid size-full" />
          </div>
          <div className="relative z-10 flex h-full w-full items-center justify-start p-4 sm:justify-center sm:p-6">
            {visual}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- the four floating feature windows -----------------------------------------

/** 1 · Channels: the channel switcher (the real ⌘1/⌘2/⌘3 vocabulary). */
function ChannelsWindow() {
  const rows = [
    { name: "WhatsApp", key: "⌘1", live: "2 unread" },
    { name: "LinkedIn", key: "⌘2", live: "1 unread" },
    { name: "Gmail", key: "⌘3", live: "" },
  ];
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a]/90 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#2a2a2a]/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Lights />
          <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
            Cereal Milk
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <span className="text-xs">one window</span>
        </div>
      </div>
      <div className="border-b border-white/5 px-3 py-2">
        <div className="flex items-center gap-2 rounded px-2 py-1.5 text-white/60">
          <span className="text-sm">New chat</span>
          <span className="ml-auto text-xs text-white/30">⌘N</span>
        </div>
      </div>
      <div className="py-2">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3 px-4 py-2">
            <span className="flex w-5 items-center justify-center font-mono text-[10px] text-white/40">
              {r.key}
            </span>
            <span className="text-sm text-white/80">{r.name}</span>
            {r.live && (
              <span className="ml-auto text-xs text-white/30">{r.live}</span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-2 text-white/40">
          <span className="text-xs">Sessions stay live (3)</span>
        </div>
      </div>
    </div>
  );
}

/** 2 · One keystroke: the sync moment as a log. */
function KeystrokeWindow() {
  return (
    <div className="w-full min-w-[420px] max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a]/90 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#2a2a2a]/80 px-4 py-3">
        <Lights />
        <span className="ml-2 font-mono text-xs text-white/40">
          Riva · Series A · WhatsApp
        </span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed">
        <div className="text-white/80">
          <span className="text-white/30">❯</span>{" "}
          <span className="text-brand-light">⌘⇧S</span> export this chat
        </div>
        <div className="mt-3 space-y-1.5 text-white/60">
          <div className="flex items-center gap-2">
            <span className="select-none font-mono text-brand-light">⠋</span>
            <span>Exporting the open conversation…</span>
          </div>
          <div className="ml-5 text-white/40">→ agent context: riva-series-a</div>
          <div className="ml-5 text-white/40">→ privacy: 1 message withheld</div>
          <div className="ml-5 text-white/40">→ clean Markdown, ready for your agent</div>
        </div>
        <div className="mt-3 text-emerald-300/90">✓ exported · nothing else moved</div>
      </div>
      <div className="border-t border-white/5 p-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#2a2a2a]/60 px-3 py-1.5">
          <span className="text-xs text-white/30">❯</span>
          <span className="flex-1 text-xs text-white/50">
            Type a reply, you always hit send yourself
          </span>
          <div className="flex items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] text-white/40">
              ⌘
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] text-white/40">
              ↵
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 3 · Your stack: the agent's MCP tool menu beside the export options. */
function CrmWindow() {
  const targets = [
    { name: "Markdown export", hint: "⌘O", note: "any thread, one click" },
    { name: "Your CRM (MCP)", hint: "", note: "proposals you review" },
    { name: "Notes and calendar (MCP)", hint: "", note: "same review flow" },
    { name: "Contact card", hint: "", note: "" },
  ];
  return (
    <div className="relative w-full max-w-sm">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a]/90 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/5 bg-[#2a2a2a]/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <Lights />
            <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
              Cereal Milk
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/50">
            <span className="text-xs">riva-series-a</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-white/5 px-2.5 py-1.5">
            <span className="text-xs text-white/30">Search records…</span>
          </div>
          <div className="inline-flex items-stretch">
            <button className="flex items-center gap-2 rounded-l-md border border-r-0 border-white/10 bg-[#2a2a2a] px-3 py-1.5 text-white/90">
              <span className="text-xs font-medium">File to</span>
            </button>
            <button className="flex items-center rounded-r-md border border-white/10 bg-[#2a2a2a] px-2 text-xs text-white/90">
              ▾
            </button>
          </div>
        </div>
        <div className="py-2">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 text-xs text-white/90">
            <span>Riva · Series A</span>
            <span className="ml-auto text-[10px] text-white/40">stage: Diligence</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/60">
            <span>Meridian · LP group</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/60">
            <span>Atlas follow-up</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-6 top-[104px] z-10 w-48 overflow-hidden rounded-md border border-white/10 bg-[#1e1e1e] py-2 shadow-2xl sm:-right-10">
        {targets.map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-between px-3 py-1.5 text-white/80"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">{t.name}</span>
            </div>
            {t.hint ? (
              <span className="text-[10px] text-white/40">{t.hint}</span>
            ) : t.note ? (
              <span className="text-[10px] text-white/30">{t.note}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 4 · The privacy gate as a diff: refused lines red, filed lines green. */
function GateWindow() {
  const lines: {
    n: string;
    text: string;
    tone?: "add" | "del";
  }[] = [
    { n: "1", text: 'thread "Padel Sunday" · private' },
    { n: "-", text: "gate REFUSED · nothing written", tone: "del" },
    { n: "2", text: 'thread "Family" · private' },
    { n: "-", text: "gate REFUSED · nothing written", tone: "del" },
    { n: "3", text: 'thread "Riva Series A" · shared' },
    { n: "+", text: "gate PASSED · note filed to the record", tone: "add" },
    { n: "+", text: "export ready · markdown, one click", tone: "add" },
  ];
  return (
    <div className="w-full min-w-[420px] max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a]/90 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#2a2a2a]/80 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-xs text-white/60">privacy-gate.log</span>
        </div>
        <div className="mx-2 flex items-center gap-2">
          <button className="whitespace-nowrap rounded bg-white/5 px-2 py-1 text-xs text-white/60">
            Live
          </button>
          <button className="rounded px-2 py-1 text-xs text-white/40">History</button>
        </div>
      </div>
      <div className="font-mono text-xs">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`flex ${
              l.tone === "del"
                ? "bg-red-500/10"
                : l.tone === "add"
                  ? "bg-green-500/10"
                  : ""
            }`}
          >
            <span
              className={`w-8 select-none pr-2 text-right ${
                l.tone === "del"
                  ? "text-red-400/60"
                  : l.tone === "add"
                    ? "text-green-400/60"
                    : "text-white/20"
              }`}
            >
              {l.n}
            </span>
            <span
              className={`flex-1 px-2 py-0.5 ${
                l.tone === "del"
                  ? "text-red-300/90"
                  : l.tone === "add"
                    ? "text-green-300/90"
                    : "text-white/60"
              }`}
            >
              {l.text}
            </span>
          </div>
        ))}
        <div className="px-2 py-2 text-white/30">
          on your model account: the agent reads only the chat you have open
        </div>
      </div>
    </div>
  );
}

// --- page ----------------------------------------------------------------------
export default function Page() {
  return (
    <SiteShell>
      <JsonLd
        data={graph(
          softwareAppNode({
            path: "/",
            name: "Cereal Milk",
            description: entry.description,
            category: "BusinessApplication",
            operatingSystem: "macOS 12.0 or later (Apple Silicon), Windows 10 or later",
            offers: PLANS.map((p) => ({ name: p.name, price: p.monthly })),
            featureList: [
              "WhatsApp, LinkedIn, and Gmail in one desktop window on Mac and Windows",
              "AI agent beside every chat, on your own Claude, ChatGPT, Gemini, or OpenAI-compatible account",
              "MCP support with review-before-write proposals",
              "Command palette, snippets, and one-click Markdown export of any thread",
            ],
          }),
          faqNode("/", HOME_FAQ)
        )}
      />

      {/* 1 · Hero: the typewriter H1, the light sub, two buttons, then the
          product frame and its chips. */}
      <div className="flex flex-col items-center overflow-hidden pt-24 sm:pt-32 lg:pt-40">
        <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-[30px]">
          <div className="flex flex-col items-center text-center">
            <div className="space-y-4 sm:space-y-6">
              <TypewriterH1 text={BRANDSCRIPT.oneLiner.headline} />
              <p className="mx-auto max-w-4xl text-base font-light text-muted-foreground sm:text-xl">
                <T id="hero.subline">{BRANDSCRIPT.oneLiner.subline}</T>
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-4">
              <DownloadCta href={HERO_HREF} src="hero" />
              <Link
                href={`${BOOK_PATH}?src=hero`}
                data-track="demo_cta_clicked"
                data-track-props='{"src":"hero-transitional"}'
                className="flex items-center gap-2 border border-border bg-background px-4 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted sm:px-6 sm:py-3 sm:text-base"
              >
                Book a demo
              </Link>
            </div>
          </div>
          <WorkspaceDemo />
        </div>
      </div>

      {/* 2 · Proof, in the reference's logo-wall slot: real numbers in the
          same bordered-cell vocabulary. Cereal Milk has no customer logos or public
          testimonials, and this page invents none. */}
      <section aria-labelledby="proof" className="overflow-hidden bg-background py-6 sm:py-12 md:py-18">
        <div className="mx-auto max-w-7xl">
          <h2
            id="proof"
            className="mb-4 px-4 text-center text-base font-semibold text-foreground sm:mb-8 sm:text-xl"
          >
            <T id="proof.title">Built inside the deal flow of 68 venture funds and firms</T>
          </h2>
          <div className="flex flex-col items-center justify-center gap-2.5 px-4 sm:flex-row sm:gap-3.5">
            {[
              { value: "68", label: "funds and firms behind the practice" },
              { value: "3", label: "channels your agents can finally reach" },
              { value: "1", label: "keystroke exports a chat your agent can act on" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex h-24 w-full max-w-[320px] items-center justify-center gap-4 whitespace-nowrap rounded-[2px] border border-foreground/[0.1] bg-foreground/[0.03] px-6 opacity-90 transition-all duration-200 hover:opacity-100 sm:w-[300px]"
              >
                <span className="font-mono text-3xl font-medium text-foreground">
                  {s.value}
                </span>
                <span className="whitespace-normal text-left text-xs leading-snug text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · Feature rows: four alternating promises, each beside a floating
          dark window showing the real behavior. */}
      <section className="relative px-8 py-24 lg:px-[30px]">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-32">
            <FeatureRow
              id="feature-channels"
              kicker="One Window"
              title={<T id="feat.channels.title">Run every channel in one window</T>}
              lede={
                <T id="feat.channels.lede">
                  WhatsApp, LinkedIn, and Gmail stay live in one desktop app on
                  Mac and Windows. Switch on a keystroke; nothing reloads, nothing
                  drops, and one place pings you when a founder replies.
                </T>
              }
              visual={<ChannelsWindow />}
            />
            <FeatureRow
              id="feature-file"
              kicker="One Keystroke"
              title={<T id="feat.file.title">Export a chat in one keystroke</T>}
              lede={
                <T id="feat.file.lede">
                  Hit the shortcut and the open conversation is exported as clean
                  Markdown, ready for your agent, your notes, or your CRM. Nothing
                  is bulk-scraped and nothing leaves the app by accident.
                </T>
              }
              visual={<KeystrokeWindow />}
              flip
            />
            <FeatureRow
              id="feature-crm"
              kicker="Your Stack"
              title={<T id="feat.crm.title">Works with the stack you already run</T>}
              lede={
                <T id="feat.crm.lede">
                  The agent speaks MCP, the Model Context Protocol. Add the
                  servers your tools already expose, your CRM, your notes, your
                  calendar, and the agent can use them beside your chats. No new
                  system of record, no migration.
                </T>
              }
              visual={<CrmWindow />}
            />
            <FeatureRow
              id="feature-privacy"
              kicker="Privacy Gate"
              title={
                <T id="feat.privacy.title">Private by default</T>
              }
              lede={
                <T id="feat.privacy.lede">
                  Every thread stays yours. The agent reads only the chat you
                  have open, when you ask, and it runs on the model account you
                  connect, so your conversations never flow through servers of
                  ours. You always hit send yourself.
                </T>
              }
              visual={<GateWindow />}
              flip
            />
          </div>
        </div>
      </section>

      {/* 4 · FAQ: sticky title left, accordion right. Pricing lives here and
          on /pricing; the buy happens in-app after the trial. */}
      <section aria-labelledby="faq" className="relative px-8 py-24 lg:px-[30px]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-[1fr_1.5fr] xl:gap-20">
            <div className="xl:sticky xl:top-24 xl:self-start">
              <h2
                id="faq"
                className="text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-4xl xl:text-5xl"
              >
                Frequently
                <br />
                asked questions
              </h2>
            </div>
            <div>
              <div className="w-full">
                {HOME_FAQ.map((f, i) => (
                  <details key={f.q} className="group border-b border-border">
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between py-6 text-left outline-none [&::-webkit-details-marker]:hidden">
                      <span className="pr-4 text-base font-medium text-foreground sm:text-lg">
                        <T id={`faq.${i}.q`}>{f.q}</T>
                      </span>
                      <svg
                        aria-hidden
                        viewBox="0 0 16 16"
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m4 6 4 4 4-4" />
                      </svg>
                    </summary>
                    <p className="pb-6 pr-8 text-base leading-relaxed text-muted-foreground">
                      {f.aNode ?? <T id={`faq.${i}.a`}>{f.a}</T>}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Final CTA: one line, one button. */}
      <section aria-label="Get Cereal Milk" className="relative px-8 py-32 lg:px-[30px]">
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
          <h2 className="mb-8 text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-4xl xl:text-5xl">
            <T id="cta.title">Try Cereal Milk now.</T>
          </h2>
          <div>
            <DownloadCta href={FOOTER_HREF} src="home-footer" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
