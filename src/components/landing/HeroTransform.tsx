"use client";

// The transformation scroller below the hero text. The window starts as the
// plain WhatsApp desktop app everyone already runs, and scrolling assembles
// the Cereal Milk client around it, live: the native toolbar drops in, the chat list
// compresses into the Cereal Milk section rail, the same chat reskins from WhatsApp
// to the product, the CRM inspector docks on the right, and finally the one
// deal-relevant line files itself to Attio. The point is to let a visitor
// FEEL what they get: their exact app, wrapped, then filed.
//
// Mechanics: the track is a tall block; the stage pins below the sticky site
// header and every layer is scrubbed from one scroll-progress number, read
// with getBoundingClientRect on a rAF loop (the page scrolls inside
// SiteShell's own scroll container, so window scroll events are useless
// here; rect reads are container-agnostic). The loop only runs while the
// track intersects the viewport. Scrubbing is fully reversible.
//
// Fallbacks: small screens and prefers-reduced-motion get X80Static (the
// assembled end state); the server also renders progress = 1, so no-JS
// visitors see the finished product, never a bare WhatsApp.

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cx } from "@/components/ui";
import { Frame, LANDING_CSS } from "@/components/landing/kit";
import {
  ChatPane,
  CrmPanel,
  SectionRail,
  Toolbar,
} from "@/components/landing/HeroMockup";
import {
  TrafficLights,
  WaChatList,
  WaChatPane,
  WaTitlebar,
  CMLK_CSS,
  X80Static,
} from "@/components/landing/CerealMilkShell";

/* --- scrub math ---------------------------------------------------------- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Height of the sticky site header the stage pins beneath. */
const HEADER_OFFSET = 64;

/** The three beats, driven by the same progress the layers scrub from. */
const STEPS = [
  {
    label: "The WhatsApp you have",
    caption:
      "This is where your deals already happen: a normal WhatsApp window. The Series A deck sits between padel and the tooth fairy, and none of it reaches your CRM.",
  },
  {
    label: "Wrapped in Cereal Milk",
    caption:
      "Cereal Milk assembles around it: the same official WhatsApp Web, now in a native Mac shell, LinkedIn and Gmail one tab away, your Attio record docked beside the chat.",
  },
  {
    label: "Filed to the record",
    caption:
      "One keystroke files the line that matters to the record. The padel plans and the tooth fairy stay private, always.",
  },
];
/** Progress span each step's underline fills across. */
const SEGMENTS = [0, 0.3, 0.7, 1];

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/* prefers-reduced-motion as an external store; the server snapshot says
   "no preference" so SSR renders the scroller and reduced-motion users swap
   to the static frame on hydration. */
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getReduced = () => window.matchMedia(REDUCED_MQ).matches;
const getReducedServer = () => false;

/* ===========================================================================
   The scroller.
   =========================================================================== */

export function HeroTransform() {
  const trackRef = useRef<HTMLDivElement>(null);
  // 1 = fully assembled: what the server renders and no-JS visitors keep.
  const [p, setP] = useState(1);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    getReduced,
    getReducedServer
  );

  useIsoLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    let running = false;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      // The stage pins when the track's top reaches the header and unpins
      // when its bottom reaches the viewport bottom.
      const travel = rect.height - window.innerHeight + HEADER_OFFSET;
      const next = travel > 0 ? clamp01((HEADER_OFFSET - rect.top) / travel) : 1;
      setP((prev) => (Math.abs(prev - next) > 0.0015 ? next : prev));
    };
    const tick = () => {
      measure();
      if (running) raf = requestAnimationFrame(tick);
    };

    measure(); // sync before first paint, no assembled-state flash at the top
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "240px 0px" }
    );
    io.observe(el);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  // One progress number fans out into staggered layer scrubs.
  const tChrome = smooth(ramp(p, 0.06, 0.3)); // Cereal Milk toolbar drops in
  const tRail = smooth(ramp(p, 0.16, 0.44)); // chat list compresses into the rail
  const tSkin = smooth(ramp(p, 0.26, 0.54)); // the chat reskins to the product
  const tPanel = smooth(ramp(p, 0.42, 0.68)); // the CRM inspector docks
  const synced = p > 0.82; // the keystroke fires
  const stage = p < 0.2 ? 0 : p < 0.7 ? 1 : 2;

  return (
    <section aria-label="From WhatsApp to Cereal Milk">
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS + CMLK_CSS }} />

      {/* Small screens + reduced motion: the assembled client, no theatre. */}
      <div
        className={cx(
          "mx-auto max-w-[1080px] px-6 pb-16",
          reduced ? "block" : "md:hidden"
        )}
      >
        <X80Static />
      </div>

      {!reduced && (
        <div ref={trackRef} className="relative hidden h-[280vh] md:block">
          <div
            className="sticky flex flex-col items-center justify-center px-6"
            style={{
              top: HEADER_OFFSET,
              height: `calc(100dvh - ${HEADER_OFFSET}px)`,
            }}
          >
            <div className="w-full max-w-[1080px]">
              <Frame glow className="x80-wa">
                {/* Chrome: WhatsApp's titlebar crossfades into the Cereal Milk toolbar. */}
                <div className="relative">
                  <div
                    style={{
                      opacity: tChrome,
                      transform: `translateY(${(1 - tChrome) * -8}px)`,
                    }}
                  >
                    <Toolbar />
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ opacity: 1 - tChrome }}
                  >
                    <div className="absolute left-3.5 top-[15px] z-10">
                      <TrafficLights />
                    </div>
                    <WaTitlebar />
                  </div>
                </div>

                {/* Body height adapts so frame + captions always fit the
                    pinned area: chrome ~41px + caption block ~160px + gaps
                    ≈ 290px on top of the header offset. */}
                <div
                  className="flex"
                  style={{ height: "clamp(380px, calc(100dvh - 354px), 508px)" }}
                >
                  {/* Left: the chat list compresses into the Cereal Milk section rail. */}
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{ width: lerp(228, 64, tRail) }}
                  >
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{ opacity: 1 - tRail }}
                    >
                      <WaChatList />
                    </div>
                    <div
                      className="absolute inset-y-0 left-0 flex"
                      style={{ opacity: tRail }}
                    >
                      <SectionRail active="CRM" />
                    </div>
                  </div>

                  {/* Centre: the same chat, reskinned from WhatsApp to Cereal Milk. */}
                  <div className="relative min-w-0 flex-1">
                    <div className="absolute inset-0" style={{ opacity: 1 - tSkin }}>
                      <WaChatPane />
                    </div>
                    <div className="absolute inset-0 flex" style={{ opacity: tSkin }}>
                      <ChatPane shared={synced} />
                    </div>
                  </div>

                  {/* Right: the CRM inspector docks. */}
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{ width: Math.round(286 * tPanel), opacity: tPanel }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-[286px] border-l border-edge"
                      style={{ transform: `translateX(${(1 - tPanel) * 32}px)` }}
                    >
                      <CrmPanel synced={synced} />
                    </div>
                  </div>
                </div>
              </Frame>
            </div>

            {/* The three beats, scrubbed by the same progress. */}
            <div className="mt-7 w-full max-w-[760px]">
              <div className="flex items-start justify-center gap-8">
                {STEPS.map((s, i) => (
                  <div key={s.label} className="flex flex-col items-center gap-1.5">
                    <span
                      className={cx(
                        "font-mono text-[12px] transition-colors duration-300",
                        stage === i ? "text-ink" : "text-ink-faint"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")} · {s.label}
                    </span>
                    <span className="h-[2px] w-24 overflow-hidden rounded-full bg-edge">
                      <span
                        className="block h-full bg-accent"
                        style={{
                          width: `${ramp(p, SEGMENTS[i], SEGMENTS[i + 1]) * 100}%`,
                        }}
                      />
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative mt-4 h-14 text-center">
                {STEPS.map((s, i) => (
                  <p
                    key={s.label}
                    className={cx(
                      "absolute inset-x-0 top-0 mx-auto max-w-[62ch] text-[14px] leading-relaxed text-ink-dim transition-opacity duration-300",
                      stage === i ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {s.caption}
                  </p>
                ))}
              </div>
              <div
                className="text-center font-mono text-[12px] text-ink-faint"
                style={{ opacity: 1 - ramp(p, 0.02, 0.1) }}
                aria-hidden="true"
              >
                keep scrolling ↓
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
