"use client";

// The hero H1, reference anatomy: an IBM Plex Mono display line that types
// itself in, then holds a blinking block cursor; the "AI agents." tail is
// set in Geist Pixel Grid, exactly the face and the split the reference
// gives its own headline tail. An invisible copy of the full text reserves
// the final layout (no reflow while typing) and the typed text paints in an
// absolute overlay. Reduced-motion (and no-JS via SSR) renders the full
// line immediately.

import { useEffect, useState } from "react";

const TYPE_MS = 55;
const START_DELAY_MS = 250;
const PIXEL_TAIL = "AI agents.";

function Segmented({ text, upTo }: { text: string; upTo: number }) {
  const tailStart = text.endsWith(PIXEL_TAIL)
    ? text.length - PIXEL_TAIL.length
    : text.length;
  const shown = text.slice(0, upTo);
  return (
    <>
      {shown.slice(0, tailStart)}
      {shown.length > tailStart && (
        <span style={{ fontFamily: "var(--font-geist-pixel-grid)" }}>
          {shown.slice(tailStart)}
        </span>
      )}
    </>
  );
}

export function TypewriterH1({ text }: { text: string }) {
  // SSR renders the finished line (crawlers and no-JS see the whole H1);
  // typing starts only after hydration, and only if motion is allowed.
  const [count, setCount] = useState(text.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCount(0);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) timer = setTimeout(tick, TYPE_MS);
    };
    timer = setTimeout(tick, START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <h1
      className="relative text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
      style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}
      aria-label={text}
    >
      <span className="invisible" aria-hidden>
        <Segmented text={text} upTo={text.length} />
      </span>
      <span aria-hidden className="absolute inset-0">
        <span>
          <Segmented text={text} upTo={count} />
          {/* Zero net width (-mr cancels ml + w) so the caret can never wrap
              the line when the headline exactly fills the container. */}
          <span className="cm-caret ml-0.5 inline-block h-[1em] w-3 -mr-3.5 translate-y-0.5 bg-current" />
        </span>
      </span>
    </h1>
  );
}
