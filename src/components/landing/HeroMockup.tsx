"use client";

// The hero's hand-built facsimile of the real 80x shell: the OFFICIAL
// WhatsApp Web fills the window (native toolbar on top, a chat open), and the
// 80x inspector is docked on the right, a slim section rail (Insights · CRM ·
// Compose · Tools · View) fused to the selected CRM panel. One frame carries the
// whole argument: it's the real WhatsApp Web (your number stays yours), a private
// friendship, one deal-relevant line, a single deliberate share, and the CRM
// context resolving live beside it. On scroll-into-view it plays its one signature
// gesture, once: the "Series A deck" line flashes accent, resolves to "Synced",
// and the CRM panel's status line ticks 0 → 1. Reduced-motion safe.

import { useEffect, useState } from "react";
import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Command,
  Contact,
  Home,
  Lock,
  Mail,
  MessageCircle,
  MessageSquareText,
  PanelRight,
  RotateCw,
  Search,
  Share2,
  SlidersHorizontal,
  Upload,
  Wrench,
} from "lucide-react";
import { Avatar, cx } from "@/components/ui";
import {
  Bubble,
  DayDivider,
  Frame,
  LiveDot,
  useReveal,
} from "@/components/landing/kit";

/* The native macOS toolbar 80x draws around the web view. Exported (with
   SectionRail, ChatPane, CrmPanel) so HeroTransform can assemble the same
   shell piece by piece as the visitor scrolls: one source of truth for what
   the product looks like. */
export function Toolbar() {
  const navBtn = "flex h-7 w-7 items-center justify-center rounded-md text-ink-faint";
  return (
    <div className="flex items-center gap-1 border-b border-edge bg-panel px-2.5 py-1.5">
      <span className={cx(navBtn, "opacity-40")}>
        <ChevronLeft size={15} strokeWidth={2.25} />
      </span>
      <span className={navBtn}>
        <ChevronRight size={15} strokeWidth={2.25} />
      </span>
      <span className={navBtn}>
        <Home size={14} strokeWidth={2.25} />
      </span>
      <span className={navBtn}>
        <RotateCw size={13} strokeWidth={2.25} />
      </span>

      {/* The WhatsApp / LinkedIn / Gmail channel toggle: one window, ⌘1 ⌘2 ⌘3. */}
      <div className="ml-1 flex items-center rounded-md border border-edge bg-bg-2 p-0.5">
        <span className="flex h-6 items-center gap-1 rounded bg-accent px-1.5 text-[10.5px] font-semibold text-white">
          <MessageCircle size={11} strokeWidth={2.5} />
          WhatsApp
        </span>
        <span className="flex h-6 items-center gap-1 rounded px-1.5 text-[10.5px] font-medium text-ink-faint">
          <Briefcase size={11} strokeWidth={2.5} />
          LinkedIn
        </span>
        <span className="flex h-6 items-center gap-1 rounded px-1.5 text-[10.5px] font-medium text-ink-faint">
          <Mail size={11} strokeWidth={2.5} />
          Gmail
        </span>
      </div>

      {/* The address pill, proof it's the real WhatsApp Web. */}
      <div className="mx-2 flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-md bg-bg-2 px-2.5 text-[11px] text-ink-faint">
        <Lock size={10} strokeWidth={2.5} className="shrink-0 text-accent" />
        <span className="truncate">web.whatsapp.com</span>
      </div>

      <span className={navBtn}>
        <Search size={13} strokeWidth={2.25} />
      </span>
      <span className={navBtn}>
        <Lock size={13} strokeWidth={2.25} />
      </span>
      {/* The accent Sync pill. */}
      <span className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-[11.5px] font-semibold text-white">
        <Upload size={12} strokeWidth={2.5} />
        Sync
      </span>
      <span className={cx(navBtn, "ml-0.5")}>
        <Command size={13} strokeWidth={2.25} />
      </span>
      <span className={navBtn}>
        <PanelRight size={14} strokeWidth={2.25} />
      </span>
    </div>
  );
}

const RAIL = [
  { label: "Insights", Icon: BarChart3 },
  { label: "CRM", Icon: Contact },
  { label: "Compose", Icon: MessageSquareText },
  { label: "Tools", Icon: Wrench },
  { label: "View", Icon: SlidersHorizontal },
];

export function SectionRail({ active = "CRM" }: { active?: string }) {
  return (
    <div className="hidden w-[64px] shrink-0 flex-col items-center gap-1.5 border-r border-edge bg-panel pt-2.5 sm:flex">
      <span className="mb-1 text-[9px] font-semibold tracking-[-0.01em] text-accent">80x</span>
      {RAIL.map(({ label, Icon }) => {
        const on = label === active;
        return (
          <span
            key={label}
            className={cx(
              "flex w-[52px] flex-col items-center gap-0.5 rounded-lg py-1.5",
              on ? "bg-accent text-white" : "text-ink-faint"
            )}
          >
            <Icon size={15} strokeWidth={2} />
            <span className="text-[8.5px] font-medium">{label}</span>
          </span>
        );
      })}
    </div>
  );
}

function PrivacySegmented() {
  return (
    <div className="flex items-center rounded-lg border border-edge bg-bg-2 p-0.5 text-[11px] font-medium">
      <span className="rounded-md bg-panel px-2 py-0.5 text-ink shadow-card">Share whole chat</span>
      <span className="rounded-md px-2 py-0.5 text-ink-faint">Pick messages</span>
    </div>
  );
}

export function CrmPanel({ synced }: { synced: boolean }) {
  return (
    <div className="flex w-full shrink-0 flex-col bg-panel md:w-[286px]">
      {/* Connection strip */}
      <div className="flex items-center gap-2 border-b border-edge px-3.5 py-2.5">
        <LiveDot />
        <span className="text-[12.5px] font-medium text-ink">Aurelia Capital</span>
        <span className="ml-auto rounded-full bg-panel-3 px-2 py-[1px] text-[11px] font-medium text-ink-dim">
          Attio
        </span>
      </div>

      <div className="flex flex-col gap-3.5 p-3.5">
        {/* The primary action */}
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-[12.5px] font-semibold text-white"
        >
          <Upload size={13} strokeWidth={2.5} />
          Sync this chat
          <kbd className="ml-auto rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-tight">
            ⌘⇧S
          </kbd>
        </button>

        {/* The chat card, identity · CRM link · privacy · one status line */}
        <div className="rounded-xl border border-edge bg-bg p-3 shadow-card">
          <div className="flex items-center gap-2.5">
            <Avatar name="Rolf Andersson" size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">Rolf Andersson</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-accent">
                <Check12 />
                Linked in Attio · person
              </div>
            </div>
          </div>
          <div className="mt-3">
            <PrivacySegmented />
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-edge pt-2.5 text-[11px] text-ink-faint">
            <Share2 size={11} strokeWidth={2.25} className="text-accent" />
            <span className="tabular-nums">
              <span className={cx("font-semibold", synced ? "text-accent" : "text-ink-dim")}>
                {synced ? 1 : 0} of 14 shared
              </span>{" "}
              · {synced ? 1 : 0} in CRM
            </span>
          </div>
        </div>

        <p className="text-[10.5px] leading-relaxed text-ink-faint">
          Reads only the chat you have open, when you click, never your whole account.
        </p>
      </div>
    </div>
  );
}

/* The dominant pane: the real WhatsApp Web with the one chat open. */
export function ChatPane({ shared }: { shared: boolean }) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      <div className="flex items-center gap-2.5 border-b border-edge bg-panel px-4 py-2.5">
        <Avatar name="Rolf Andersson" size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink">Rolf Andersson</div>
          <div className="mt-0.5 text-[11px] text-ink-faint">online</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-panel-2 px-2 py-[1px] text-[10.5px] font-medium text-ink-dim">
          <Lock size={9} strokeWidth={2.5} className="text-amber" />
          WhatsApp Web
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-hidden px-4 py-3.5">
        <Bubble side="in">padel saturday? courts at 10, enskede</Bubble>
        <Bubble side="out">indoor pls. my topspin deserves witnesses</Bubble>
        <Bubble side="in">Astrid lost her first tooth tonight, tooth fairy negotiations ongoing 🦷</Bubble>
        <DayDivider>Fri, Jun 12</DayDivider>
        <Bubble side="in" ring share={!shared} flash={shared} synced={shared}>
          btw: Series A deck is final, sending the data room link tonight 🚀
        </Bubble>
      </div>
    </div>
  );
}

function Check12() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function HeroMockup() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  // The signature gesture: fire once, shortly after the frame enters view.
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!revealed || shared) return;
    const t = setTimeout(() => setShared(true), 900);
    return () => clearTimeout(t);
  }, [revealed, shared]);

  return (
    <div ref={ref}>
      {/* The Frame is the Vercel-grade window (rounded-xl, edge-2 hairline) and
          restores the Intercom product palette inside, the inbox depiction
          keeps its own look within the frame (spec §6.3). No container bleed:
          the Geist grid stays aligned. */}
      <Frame glow>
        <Toolbar />
        <div className="flex flex-col md:h-[508px] md:flex-row">
          <SectionRail active="CRM" />

          {/* The real WhatsApp Web, the dominant pane. */}
          <ChatPane shared={shared} />

          {/* The 80x inspector, docked on the right. */}
          <div className="border-t border-edge md:border-l md:border-t-0">
            <CrmPanel synced={shared} />
          </div>
        </div>
      </Frame>
    </div>
  );
}
