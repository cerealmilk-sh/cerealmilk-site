"use client";

// The Cereal Milk client, as it actually ships. A hand-built facsimile of the real
// Mac app at its current tip: the D47 Linear structure on the D52 Black Glass
// default dark theme (Linear Light in the site's light theme), mirroring
// product-mac-app's IceShell exactly:
//
//   RepoTopBar (44px): back/forward, the channel tabs, the centred command
//     pill ("Search your repository..." + K), privacy lock, the indigo Sync
//     pill, terminal/inspector toggles, settings.
//   RepoStatStrip (34px): the repository's vitals: a 30-day curve with a
//     breathing live head, 14-day capture bars, the 16-week contribution
//     grid, people/conversations/span/disk gauges, the channel mix bar.
//   RepoRail (48px): the icon activity bar: the mark, Messenger, a seam,
//     then Corpus / History / Query, and the Clone shortcut at the foot.
//   The stage: the REAL WhatsApp Web, untouched: the app never repaints chat
//     content, so the depiction keeps WhatsApp's own skin inside the stage.
//   InspectorPanel (300px): CRM / Notes / Insights tabs, the scope bar, the
//     identity block ("Person in Attio"), the property list, the sync row
//     with the Auto pill, and the D49 sharing transcript where lit bubbles
//     share and dimmed ones stay private.
//   IceStatusBar (24px): the minibuffer prompt plus Agent / workspace /
//     zoom / K status items.
//
// Palette hexes come straight from Resources/Themes/black_glass.json and the
// LINEAR-RESKIN-SPEC light table, scoped under .x80-app so the window themes
// with the site. Also here: the plain-WhatsApp "before" facsimile the
// HeroTransform scroller starts from.

import {
  Archive,
  ArrowDownCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCheck,
  Clock,
  Code,
  Contact,
  CornerDownRight,
  CornerUpRight,
  FileText,
  Flag,
  GitBranch,
  Layers,
  Lock,
  Mail,
  MessageCircle,
  MessagesSquare,
  Mic,
  MoreHorizontal,
  MoreVertical,
  PanelBottom,
  PanelRight,
  Phone,
  Plus,
  Search,
  Settings,
  Smile,
  Sparkles,
  SquarePen,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Avatar, cx } from "@/components/ui";

/* ===========================================================================
   Palette: .x80-app themes the window to the app's real defaults. Light is
   Linear Light (D47), dark is Black Glass (D52, black_glass.json verbatim).
   .x80-wa is the WhatsApp facsimile, hardcoded to WhatsApp's own hues in
   both modes: the "before" must read instantly as the app everyone runs.
   =========================================================================== */
export const CMLK_CSS = `
.x80-app {
  --x8-chrome: #F9F8F9;
  --x8-buffer: #FFFFFF;
  --x8-raise: #F4F5F8;
  --x8-well: #F0F1F4;
  --x8-seam: #E9E8EA;
  --x8-ink: #282A30;
  --x8-dim: #6F6E77;
  --x8-faint: #9B9A9F;
  --x8-accent: #5E6AD2;
  --x8-on-accent: #FFFFFF;
  --x8-live: #2E9E63;
  --x8-warn: #A9841E;
  --x8-iris: #7B6FD0;
  --x8-viz1: #3D8FE0;
  --x8-viz2: #3FA573;
  --x8-viz3: #8B7CE8;
  --x8-sheen: transparent;
}
:root[data-theme="dark"] .x80-app {
  --x8-chrome: #09090B;
  --x8-buffer: #101014;
  --x8-raise: #16161B;
  --x8-well: #1D1E24;
  --x8-seam: #1F2025;
  --x8-ink: #F7F8F8;
  --x8-dim: #8A8F98;
  --x8-faint: #5C6066;
  --x8-accent: #5E6AD2;
  --x8-on-accent: #FFFFFF;
  --x8-live: #4CB782;
  --x8-warn: #F2C94C;
  --x8-iris: #9E8CFC;
  --x8-viz1: #4EA7FC;
  --x8-viz2: #4CB782;
  --x8-viz3: #9E8CFC;
  --x8-sheen: rgba(255, 255, 255, 0.16);
}
.x80-wa {
  --wa-chrome: #f0f2f5;
  --wa-panel: #ffffff;
  --wa-bg: #efeae2;
  --wa-ink: #111b21;
  --wa-ink-dim: #54656f;
  --wa-ink-faint: #8696a0;
  --wa-out: #d9fdd3;
  --wa-in: #ffffff;
  --wa-green: #25d366;
  --wa-edge: #e9edef;
}
:root[data-theme="dark"] .x80-wa {
  --wa-chrome: #202c33;
  --wa-panel: #111b21;
  --wa-bg: #0b141a;
  --wa-ink: #e9edef;
  --wa-ink-dim: #aebac1;
  --wa-ink-faint: #8696a0;
  --wa-out: #005c4b;
  --wa-in: #202c33;
  --wa-green: #25d366;
  --wa-edge: #222d34;
}
@keyframes x80-breathe {
  0%, 100% { transform: scale(0.55); opacity: 0.32; }
  50%      { transform: scale(1.35); opacity: 0.08; }
}
.x80-breathe { animation: x80-breathe 2.4s ease-in-out infinite; }
@keyframes x80-flash {
  0%   { box-shadow: 0 0 0 0 rgba(94, 106, 210, 0.55); }
  100% { box-shadow: 0 0 0 8px rgba(94, 106, 210, 0); }
}
.x80-flash { animation: x80-flash 760ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .x80-breathe, .x80-flash { animation: none !important; }
}
`;

/* ===========================================================================
   Shared window furniture
   =========================================================================== */

export function TrafficLights() {
  return (
    <span className="flex items-center gap-[7px]">
      <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
      <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
      <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
    </span>
  );
}

/* ===========================================================================
   The "before": a plain WhatsApp desktop facsimile.
   =========================================================================== */

/** WhatsApp's own window chrome (sans traffic lights, which persist outside). */
export function WaTitlebar() {
  return (
    <div className="flex h-full items-center border-b border-[var(--wa-edge)] bg-[var(--wa-chrome)] pl-[74px]">
      <span className="text-[12px] font-semibold text-[var(--wa-ink-dim)]">
        WhatsApp
      </span>
    </div>
  );
}

const WA_ROWS: {
  name: string;
  preview: string;
  time: string;
  active?: boolean;
  unread?: number;
}[] = [
  {
    name: "Rolf Andersson",
    preview: "btw: Series A deck is final, sending th…",
    time: "22:41",
    active: true,
    unread: 1,
  },
  { name: "Astrid ❤️", preview: "📷 Photo", time: "21:03" },
  {
    name: "LP Group · Fund II",
    preview: "Henrik: minutes from today attached",
    time: "18:26",
    unread: 5,
  },
  {
    name: "Padel lads 🎾",
    preview: "You: indoor pls. my topspin deserves…",
    time: "17:55",
  },
  { name: "Mikael Berg", preview: "🎤 Voice message (0:41)", time: "Mon" },
  {
    name: "Nordic Founders",
    preview: "Sara: warm intro for you both 🤝",
    time: "Mon",
    unread: 12,
  },
];

/** The chat-list sidebar: deals buried between family and padel. */
export function WaChatList() {
  return (
    <div className="flex h-full w-[228px] flex-col border-r border-[var(--wa-edge)] bg-[var(--wa-panel)]">
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <span className="text-[15px] font-bold text-[var(--wa-ink)]">Chats</span>
        <span className="flex items-center gap-2.5 text-[var(--wa-ink-dim)]">
          <SquarePen size={14} strokeWidth={2} />
          <MoreVertical size={14} strokeWidth={2} />
        </span>
      </div>
      <div className="mx-3 mb-2 flex h-7 shrink-0 items-center gap-2 rounded-lg bg-[var(--wa-chrome)] px-2.5 text-[11px] text-[var(--wa-ink-faint)]">
        <Search size={11} strokeWidth={2.25} />
        Search
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {WA_ROWS.map((r) => (
          <div
            key={r.name}
            className={cx(
              "flex items-center gap-2.5 px-3 py-2",
              r.active && "bg-[var(--wa-chrome)]"
            )}
          >
            <Avatar name={r.name} size={34} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12.5px] font-semibold text-[var(--wa-ink)]">
                  {r.name}
                </span>
                <span
                  className={cx(
                    "shrink-0 text-[10px] tabular-nums",
                    r.unread
                      ? "font-semibold text-[var(--wa-green)]"
                      : "text-[var(--wa-ink-faint)]"
                  )}
                >
                  {r.time}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] text-[var(--wa-ink-faint)]">
                  {r.preview}
                </span>
                {r.unread ? (
                  <span className="min-w-[16px] shrink-0 rounded-full bg-[var(--wa-green)] px-1 text-center text-[9px] font-semibold leading-4 text-white">
                    {r.unread}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaBubble({
  side,
  time,
  children,
}: {
  side: "in" | "out";
  time: string;
  children: React.ReactNode;
}) {
  const out = side === "out";
  return (
    <div className={cx("flex", out ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[88%] rounded-lg px-2.5 py-1.5 text-[13px] leading-snug text-[var(--wa-ink)] shadow-card",
          out
            ? "rounded-tr-sm bg-[var(--wa-out)]"
            : "rounded-tl-sm bg-[var(--wa-in)]"
        )}
      >
        {children}
        <span className="ml-2 inline-flex translate-y-[2px] items-center gap-0.5 text-[9.5px] text-[var(--wa-ink-faint)]">
          {time}
          {out && (
            <CheckCheck size={11} strokeWidth={2.25} className="text-[#53bdeb]" />
          )}
        </span>
      </div>
    </div>
  );
}

/** The open conversation, in WhatsApp's own skin. This pane stays WhatsApp
    through the whole transformation: the real app never repaints the web
    view, it frames it. */
export function WaChatPane() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[var(--wa-bg)]">
      <div className="flex items-center gap-2.5 border-b border-[var(--wa-edge)] bg-[var(--wa-chrome)] px-4 py-2">
        <Avatar name="Rolf Andersson" size={30} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[var(--wa-ink)]">
            Rolf Andersson
          </div>
          <div className="mt-0.5 text-[11px] text-[var(--wa-ink-faint)]">online</div>
        </div>
        <span className="flex items-center gap-3.5 text-[var(--wa-ink-dim)]">
          <Video size={16} strokeWidth={2} />
          <Phone size={14} strokeWidth={2} />
          <Search size={14} strokeWidth={2} />
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 py-3">
        <WaBubble side="in" time="21:58">
          padel saturday? courts at 10, enskede
        </WaBubble>
        <WaBubble side="out" time="22:02">
          indoor pls. my topspin deserves witnesses
        </WaBubble>
        <WaBubble side="in" time="22:15">
          Astrid lost her first tooth tonight, tooth fairy negotiations ongoing 🦷
        </WaBubble>
        <div className="my-1 flex items-center justify-center">
          <span className="rounded-lg bg-[var(--wa-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--wa-ink-faint)] shadow-card">
            Fri, Jun 12
          </span>
        </div>
        <WaBubble side="in" time="22:41">
          btw: Series A deck is final, sending the data room link tonight 🚀
        </WaBubble>
      </div>

      <div className="flex items-center gap-2.5 border-t border-[var(--wa-edge)] bg-[var(--wa-chrome)] px-3 py-1.5">
        <Smile size={17} strokeWidth={2} className="shrink-0 text-[var(--wa-ink-dim)]" />
        <Plus size={17} strokeWidth={2} className="shrink-0 text-[var(--wa-ink-dim)]" />
        <span className="flex h-7 min-w-0 flex-1 items-center rounded-lg bg-[var(--wa-panel)] px-3 text-[12px] text-[var(--wa-ink-faint)]">
          Type a message
        </span>
        <Mic size={16} strokeWidth={2} className="shrink-0 text-[var(--wa-ink-dim)]" />
      </div>
    </div>
  );
}

/** The whole plain-WhatsApp window body (list + chat), below its titlebar. */
export function WaBody() {
  return (
    <div className="flex min-h-0 flex-1">
      <WaChatList />
      <WaChatPane />
    </div>
  );
}

/* ===========================================================================
   RepoTopBar: back/forward, channel tabs, the command pill, lock, Sync.
   =========================================================================== */

const ink = { color: "var(--x8-ink)" };
const dim = { color: "var(--x8-dim)" };
const faint = { color: "var(--x8-faint)" };

function ChannelSeat({
  icon,
  label,
  selected = false,
}: {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
}) {
  return (
    <span
      className="flex h-[26px] items-center gap-1.5 rounded px-2"
      style={{
        background: selected ? "var(--x8-raise)" : "transparent",
        color: selected ? "var(--x8-ink)" : "var(--x8-dim)",
      }}
    >
      {icon}
      <span className={cx("text-[11.5px]", selected ? "font-semibold" : "font-medium")}>
        {label}
      </span>
    </span>
  );
}

export function X80TopBar({ syncFlash = false }: { syncFlash?: boolean }) {
  return (
    <div
      className="relative flex h-full items-center gap-2 pl-[74px] pr-3"
      style={{ background: "var(--x8-chrome)", borderBottom: "1px solid var(--x8-seam)" }}
    >
      <span className="flex items-center gap-1" style={faint}>
        <span className="flex h-6 w-6 items-center justify-center opacity-50">
          <ArrowLeft size={12} strokeWidth={2.25} />
        </span>
        <span className="flex h-6 w-6 items-center justify-center">
          <ArrowRight size={12} strokeWidth={2.25} />
        </span>
      </span>

      <span className="flex items-center gap-0.5">
        <ChannelSeat
          selected
          icon={<MessageCircle size={13} strokeWidth={2.25} />}
          label="WhatsApp"
        />
        <ChannelSeat icon={<Contact size={13} strokeWidth={2} />} label="LinkedIn" />
        <ChannelSeat icon={<Mail size={13} strokeWidth={2} />} label="Email" />
      </span>

      {/* The command centre, dead-centre on the window like the real one. */}
      <span className="pointer-events-none absolute left-1/2 hidden h-[28px] w-[340px] -translate-x-1/2 items-center rounded-full pl-2.5 pr-1 lg:flex"
        style={{ background: "var(--x8-buffer)", border: "1px solid var(--x8-seam)" }}
      >
        <Search size={10} strokeWidth={2.25} style={faint} />
        <span className="ml-1.5 flex-1 truncate text-[11.5px]" style={dim}>
          Search your repository, people, commands…
        </span>
        <span
          className="rounded px-[5px] py-[1px] font-mono text-[10px]"
          style={{ ...faint, background: "var(--x8-raise)" }}
        >
          ⌘K
        </span>
        <span className="flex h-6 w-[22px] items-center justify-center" style={dim}>
          <Sparkles size={10} strokeWidth={2} />
        </span>
      </span>

      <span className="flex-1" />

      <span className="flex h-6 w-[26px] items-center justify-center" style={faint}>
        <Lock size={11.5} strokeWidth={2.25} />
      </span>
      <span
        className={cx(
          "flex h-[22px] items-center rounded-full px-3 text-[11.5px] font-semibold",
          syncFlash && "x80-flash"
        )}
        style={{ background: "var(--x8-accent)", color: "var(--x8-on-accent)" }}
      >
        Sync
      </span>
      <span className="flex items-center gap-0.5" style={faint}>
        <span className="flex h-6 w-[26px] items-center justify-center">
          <PanelBottom size={12} strokeWidth={2} />
        </span>
        <span
          className="flex h-6 w-[26px] items-center justify-center rounded"
          style={{ background: "var(--x8-raise)", color: "var(--x8-ink)" }}
        >
          <PanelRight size={12} strokeWidth={2} />
        </span>
        <span className="flex h-6 w-[26px] items-center justify-center">
          <Settings size={12.5} strokeWidth={2} />
        </span>
      </span>
    </div>
  );
}

/* ===========================================================================
   RepoStatStrip: the repository's vitals as a slim instrument cluster.
   =========================================================================== */

const TREND_BARS = [2, 3, 2, 5, 4, 7, 5, 9, 6, 11, 9, 12, 10, 14];
const HEAT = [
  0, 1, 0, 2, 1, 0, 1, 1, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 2, 1, 3, 2,
  4, 1, 2, 1, 0, 2, 3, 1, 2, 4, 2, 3, 1, 2, 5, 3, 2, 1, 3, 2, 4, 3, 1, 2, 3,
  5, 2, 4, 3, 2, 1, 3, 4, 2, 5, 3, 4, 2, 3, 5, 4, 3, 6, 2, 4, 3, 5, 4, 2, 6,
  3, 5, 4, 3, 7, 4, 5, 3, 6, 4, 7, 5, 4, 6, 5, 7, 4, 6, 5, 8, 6, 5, 7, 6, 8,
  7, 5, 8, 6, 9, 7, 8, 6, 9, 8, 7, 9,
];

function StatNumber({
  value,
  label,
  extra,
}: {
  value: string;
  label: string;
  extra?: React.ReactNode;
}) {
  return (
    <>
      <span className="font-mono text-[12px] font-semibold tabular-nums" style={ink}>
        {value}
      </span>
      <span className="font-mono text-[8.5px] font-medium uppercase" style={faint}>
        {label}
      </span>
      {extra}
    </>
  );
}

function StatSeam() {
  return <span className="mx-1 h-[14px] w-px" style={{ background: "var(--x8-seam)" }} />;
}

export function X80StatStrip() {
  return (
    <div
      className="flex h-full items-center gap-3 overflow-hidden px-3"
      style={{ background: "var(--x8-buffer)", borderBottom: "1px solid var(--x8-seam)" }}
    >
      {/* Messages: the 30-day curve with the breathing live head. */}
      <span className="flex items-center gap-1.5">
        <span className="relative h-[12px] w-[36px]">
          <svg viewBox="0 0 36 12" className="h-full w-full" aria-hidden="true">
            <path
              d="M0 11 C 3 10.5, 5 10, 8 9.5 S 14 8.5, 17 7 S 24 5.5, 27 4 S 33 2.5, 35 1.5"
              fill="none"
              stroke="var(--x8-accent)"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.65"
            />
          </svg>
          <span
            className="x80-breathe absolute right-[-2px] top-[-2px] h-[9px] w-[9px] rounded-full"
            style={{ background: "var(--x8-accent)" }}
          />
          <span
            className="absolute right-0 top-0 h-[3px] w-[3px] rounded-full"
            style={{ background: "var(--x8-accent)" }}
          />
        </span>
        <StatNumber
          value="48,112"
          label="messages"
          extra={
            <span className="font-mono text-[9px] font-semibold" style={{ color: "var(--x8-live)" }}>
              +214
            </span>
          }
        />
      </span>

      {/* Captures: fourteen micro bar columns. */}
      <span className="flex items-center gap-1.5">
        <span className="flex h-[12px] items-end gap-[1px]">
          {TREND_BARS.map((v, i) => (
            <span
              key={i}
              className="w-[1.5px] rounded-[0.5px]"
              style={{
                height: `${2.5 + (9.5 * v) / 14}px`,
                background: "var(--x8-viz1)",
                opacity: 0.45 + (0.55 * v) / 14,
              }}
            />
          ))}
        </span>
        <StatNumber value="1,284" label="captures" />
      </span>

      <StatSeam />

      {/* Sixteen weeks of git squares. */}
      <span className="grid grid-flow-col grid-rows-7 gap-[1px]" aria-hidden="true">
        {HEAT.map((v, i) => (
          <span
            key={i}
            className="h-[2.5px] w-[2.5px] rounded-[0.5px]"
            style={
              v === 0
                ? { background: "var(--x8-seam)" }
                : {
                    background: "var(--x8-viz2)",
                    opacity: 0.35 + 0.65 * Math.sqrt(v / 9),
                  }
            }
          />
        ))}
      </span>

      <StatSeam />

      <span className="flex items-center gap-1.5">
        <Users size={11} strokeWidth={2} style={dim} />
        <StatNumber value="236" label="people" />
      </span>
      <span className="hidden items-center gap-1.5 min-[900px]:flex">
        <MessagesSquare size={11} strokeWidth={2} style={dim} />
        <StatNumber value="412" label="conversations" />
      </span>
      <span className="hidden items-center gap-1.5 min-[1000px]:flex">
        <Archive size={11} strokeWidth={2} style={dim} />
        <StatNumber value="48 MB" label="on disk" />
      </span>

      <StatSeam />

      {/* The channel mix bar: the corpus in cross-section. */}
      <span className="flex h-[3px] w-[36px] items-center gap-[1px]">
        <span className="h-full rounded-[1px]" style={{ width: "22px", background: "var(--x8-viz2)", opacity: 0.8 }} />
        <span className="h-full rounded-[1px]" style={{ width: "9px", background: "var(--x8-viz1)", opacity: 0.8 }} />
        <span className="h-full rounded-[1px]" style={{ width: "5px", background: "var(--x8-viz3)", opacity: 0.8 }} />
      </span>
      <span className="hidden items-center gap-1.5 min-[1100px]:flex">
        <MessageCircle size={11} strokeWidth={2} style={dim} />
        <StatNumber value="29,441" label="whatsapp" />
      </span>
    </div>
  );
}

/* ===========================================================================
   RepoRail: the icon activity bar.
   =========================================================================== */

function RailIcon({
  icon,
  selected = false,
  title,
}: {
  icon: React.ReactNode;
  selected?: boolean;
  title: string;
}) {
  return (
    <span
      className="relative flex h-[40px] w-[40px] items-center justify-center rounded"
      title={title}
      style={{
        background: selected ? "var(--x8-raise)" : "transparent",
        color: selected ? "var(--x8-ink)" : "var(--x8-faint)",
      }}
    >
      {icon}
      {selected && (
        <span
          className="absolute left-0 h-[22px] w-[2px] rounded-[1px]"
          style={{ background: "var(--x8-accent)" }}
        />
      )}
    </span>
  );
}

export function X80Rail() {
  return (
    <div
      className="flex h-full w-full flex-col items-center pt-3"
      style={{ background: "var(--x8-chrome)", borderRight: "1px solid var(--x8-seam)" }}
    >
      <span
        className="mb-2 flex h-[26px] w-[26px] items-center justify-center rounded-md font-mono text-[10px] font-bold"
        style={{ background: "#E4F222", color: "#0B0B09" }}
      >
        Cereal Milk
      </span>
      <RailIcon selected title="Messenger" icon={<MessagesSquare size={16} strokeWidth={2} />} />
      <span className="my-1.5 h-px w-[22px]" style={{ background: "var(--x8-seam)" }} />
      <RailIcon title="Corpus" icon={<Layers size={16} strokeWidth={2} />} />
      <RailIcon title="History" icon={<GitBranch size={16} strokeWidth={2} />} />
      <RailIcon title="Query" icon={<Code size={16} strokeWidth={2} />} />
      <span className="flex-1" />
      <span className="pb-3" style={faint}>
        <ArrowDownCircle size={16} strokeWidth={2} />
      </span>
    </div>
  );
}

/* ===========================================================================
   InspectorPanel: CRM tab, scoped to the open chat.
   =========================================================================== */

function InspectorTab({
  icon,
  label,
  selected = false,
}: {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
}) {
  return (
    <span
      className="flex h-6 items-center gap-1.5 rounded px-2 text-[11px] font-medium"
      style={{
        background: selected ? "var(--x8-raise)" : "transparent",
        color: selected ? "var(--x8-ink)" : "var(--x8-faint)",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function PropertyRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[27px] items-center gap-2 px-3.5">
      <span style={faint}>{icon}</span>
      <span className="w-[92px] shrink-0 text-[11.5px]" style={dim}>
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate text-[11.5px]" style={ink}>
        {children}
      </span>
    </div>
  );
}

/** A D49 share bubble: the transcript row wearing its share state. Lit with a
    check = shares to the record; dimmed = stays private, on this machine. */
function ShareBubble({
  mine = false,
  shared = false,
  flash = false,
  children,
}: {
  mine?: boolean;
  shared?: boolean;
  flash?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cx("flex items-center gap-1.5", mine ? "justify-end" : "justify-start")}>
      {!mine && shared && (
        <Check size={10} strokeWidth={3} style={{ color: "var(--x8-accent)" }} />
      )}
      <span
        className={cx(
          "max-w-[85%] rounded-lg px-2 py-1 text-[10.5px] leading-snug",
          mine ? "rounded-br-sm" : "rounded-bl-sm",
          flash && "x80-flash"
        )}
        style={{
          background: shared ? "var(--x8-well)" : "var(--x8-raise)",
          color: shared ? "var(--x8-ink)" : "var(--x8-faint)",
          border: shared ? "1px solid var(--x8-accent)" : "1px solid var(--x8-seam)",
          opacity: shared ? 1 : 0.75,
        }}
      >
        {children}
      </span>
      {mine && shared && (
        <Check size={10} strokeWidth={3} style={{ color: "var(--x8-accent)" }} />
      )}
    </div>
  );
}

export function X80Inspector({ synced }: { synced: boolean }) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ background: "var(--x8-chrome)", borderLeft: "1px solid var(--x8-seam)" }}
    >
      {/* The tab strip: CRM active in a quiet raise well, Linear-style. */}
      <div
        className="flex h-[34px] shrink-0 items-center gap-1 px-2"
        style={{ borderBottom: "1px solid var(--x8-seam)" }}
      >
        <InspectorTab selected icon={<Contact size={11} strokeWidth={2} />} label="CRM" />
        <InspectorTab icon={<FileText size={11} strokeWidth={2} />} label="Notes" />
        <InspectorTab icon={<TrendingUp size={11} strokeWidth={2} />} label="Insights" />
      </div>

      {/* The scope bar: what this section is about. */}
      <div
        className="flex h-[30px] shrink-0 items-center gap-2 px-3"
        style={{ borderBottom: "1px solid var(--x8-seam)" }}
      >
        <Avatar name="Rolf Andersson" size={18} />
        <span className="truncate text-[11.5px] font-semibold" style={ink}>
          Rolf Andersson
        </span>
        <span className="text-[11.5px]" style={faint}>·</span>
        <span className="font-mono text-[10px] font-medium" style={faint}>
          WhatsApp
        </span>
      </div>

      {/* Identity: one identity, once. */}
      <div className="flex shrink-0 items-center gap-2.5 px-3.5 py-2.5">
        <Avatar name="Rolf Andersson" size={30} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold" style={ink}>
            Rolf Andersson
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[10.5px]" style={dim}>
            <BadgeCheck size={10} strokeWidth={2.5} style={{ color: "var(--x8-live)" }} />
            Person in Attio
          </div>
        </div>
        <ArrowUpRight size={12} strokeWidth={2} style={faint} />
        <MoreHorizontal size={13} strokeWidth={2} style={faint} />
      </div>

      <div className="h-px shrink-0" style={{ background: "var(--x8-seam)" }} />

      {/* Properties: one Linear property list. */}
      <div className="shrink-0 py-1">
        <PropertyRow icon={<Flag size={10.5} strokeWidth={2} />} label="Stage">
          <span
            className="rounded-full px-2 py-[1px] text-[10.5px] font-medium"
            style={{ background: "var(--x8-well)", color: "var(--x8-ink)" }}
          >
            Series A
          </span>
        </PropertyRow>
        <PropertyRow icon={<CornerDownRight size={10.5} strokeWidth={2} />} label="Next step">
          <span style={{ color: "var(--x8-warn)" }}>Review data room</span>
        </PropertyRow>
        <PropertyRow icon={<Clock size={10.5} strokeWidth={2} />} label="Last contacted">
          2h ago
        </PropertyRow>
      </div>

      <div className="h-px shrink-0" style={{ background: "var(--x8-seam)" }} />

      {/* Sync: one honest row. Amber = unsynced, green = flowing. */}
      <div className="flex h-[34px] shrink-0 items-center gap-2 px-3.5">
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: synced ? "var(--x8-live)" : "var(--x8-warn)" }}
        />
        <span className="min-w-0 flex-1 truncate text-[11px]" style={dim}>
          {synced ? "14 messages in Attio" : "Not synced to Attio yet"}
        </span>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-medium"
          style={{
            color: "var(--x8-accent)",
            background: "color-mix(in srgb, var(--x8-accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--x8-accent) 35%, transparent)",
          }}
        >
          <Zap size={8} strokeWidth={2.5} fill="currentColor" />
          Auto
        </span>
        <span
          className="rounded px-2.5 py-[3px] text-[11px] font-medium"
          style={{ border: "1px solid var(--x8-seam)", color: "var(--x8-ink)", background: "var(--x8-raise)" }}
        >
          Sync
        </span>
      </div>

      <div className="h-px shrink-0" style={{ background: "var(--x8-seam)" }} />

      {/* Sharing: the transcript IS the picker (D49). */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-medium" style={faint}>
            Sharing
          </span>
          <span className="font-mono text-[10px] tabular-nums" style={faint}>
            {synced ? "1/14" : "0/14"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10.5px]">
          <CornerUpRight size={9.5} strokeWidth={2.5} style={{ color: "var(--x8-live)" }} />
          <span style={dim}>Shares to</span>
          <span className="truncate font-semibold" style={ink}>
            Rolf Andersson
          </span>
          <span style={dim}>in Attio</span>
        </div>
        <div
          className="flex items-center rounded p-0.5 text-[10.5px] font-medium"
          style={{ background: "var(--x8-raise)", border: "1px solid var(--x8-seam)" }}
        >
          <span className="flex-1 rounded px-2 py-[2px] text-center" style={dim}>
            Whole chat
          </span>
          <span
            className="flex-1 rounded px-2 py-[2px] text-center"
            style={{ background: "var(--x8-buffer)", color: "var(--x8-ink)", border: "1px solid var(--x8-seam)" }}
          >
            Pick messages
          </span>
        </div>
        <div
          className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 rounded-md p-2"
          style={{ background: "var(--x8-buffer)", border: "1px solid var(--x8-seam)" }}
        >
          <ShareBubble>padel saturday? courts at 10, enskede</ShareBubble>
          <ShareBubble mine>indoor pls. my topspin deserves witnesses</ShareBubble>
          <ShareBubble shared={synced} flash={synced}>
            btw: Series A deck is final, sending the data room link tonight 🚀
          </ShareBubble>
        </div>
        <div className="flex items-center justify-between gap-2 text-[9.5px]" style={faint}>
          <span className="font-semibold" style={dim}>
            {synced ? "1 of 14 picked" : "0 of 14 picked"}
          </span>
          <span className="truncate">Click a bubble to include it</span>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   IceStatusBar: the minibuffer prompt + status items.
   =========================================================================== */

export function X80StatusBar() {
  return (
    <div
      className="flex h-full items-center gap-2 px-2.5 font-mono text-[10.5px]"
      style={{ background: "var(--x8-chrome)", borderTop: "1px solid var(--x8-seam)", color: "var(--x8-dim)" }}
    >
      <span className="font-semibold" style={{ color: "var(--x8-accent)" }}>$</span>
      <span className="min-w-0 flex-1 truncate" style={faint}>
        command, or ask anything…
      </span>
      <span style={{ color: "var(--x8-iris)" }}>✳ Agent</span>
      <span className="hidden items-center gap-1 sm:flex">
        <span style={{ color: "var(--x8-accent)" }}>◆</span>
        Aurelia Capital
      </span>
      <span className="hidden sm:inline">100%</span>
      <span>⌘K</span>
    </div>
  );
}

/* ===========================================================================
   X80Static: the fully assembled client in one static frame, the fallback for
   small screens, reduced motion, and no-JS. On small screens the Inspector
   stacks below the stage and the rail hides, same trick as the old mockup.
   =========================================================================== */

export function X80Static() {
  return (
    <div
      className="x80-app x80-wa relative overflow-hidden rounded-xl border border-edge-2 shadow-pop"
      style={{ background: "var(--x8-chrome)" }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
        style={{ background: "var(--x8-sheen)" }}
      />
      <div className="absolute left-3.5 top-[15px] z-10">
        <TrafficLights />
      </div>
      <div className="relative h-[44px]">
        <X80TopBar />
      </div>
      <div className="h-[34px]">
        <X80StatStrip />
      </div>
      <div className="flex flex-col md:h-[430px] md:flex-row">
        <div className="hidden w-[48px] shrink-0 sm:block">
          <X80Rail />
        </div>
        <div className="h-[360px] min-w-0 flex-1 md:h-auto">
          <WaChatPane />
        </div>
        <div className="h-[420px] w-full shrink-0 md:h-auto md:w-[300px]">
          <X80Inspector synced />
        </div>
      </div>
      <div className="h-[24px]">
        <X80StatusBar />
      </div>
    </div>
  );
}
