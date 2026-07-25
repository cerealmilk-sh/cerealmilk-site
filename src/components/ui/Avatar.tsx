"use client";

import { useState } from "react";
import { cx } from "@/components/ui/cx";

/** Initials from a name: "Tomas Eklund" → "TE", "Priya" → "PR". Indexes by
    code point (spread), not UTF-16 unit: WhatsApp names carry emoji, and a
    lone surrogate half from `"🎾"[0]` survives neither HTML serialization nor
    hydration. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return [...parts[0]].slice(0, 2).join("").toUpperCase();
  return ([...parts[0]][0] + [...parts[parts.length - 1]][0]).toUpperCase();
}

// A stable hue per name. Saturation + lightness come from theme vars
// (`--bc-av-bg` / `--bc-av-fg`), so the same avatar reads as a soft pastel in
// light mode and a muted chip in dark mode. Intercom's friendly colored
// initials, themed for free.
function hueOf(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

/**
 * Avatar: a real profile picture when `src` is given, otherwise a soft initials
 * circle (Intercom's colored-initials look). WhatsApp profile-picture URLs are
 * transient/signed and can expire or be hotlink-blocked, so the initials circle
 * stays underneath as the base layer and an image load error falls straight back
 * to it (the `onError` flip is load-bearing, not decorative).
 */
export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  /** Remote avatar URL; falls back to initials on empty/null or load error. */
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const hue = hueOf(name);
  // Track WHICH src failed to load, not a bare boolean, so a new src is innocent
  // until proven broken with no effect/reset needed (a stale WhatsApp URL that
  // 404s falls back to initials; the next, fresh URL renders again).
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImg = !!src && failedSrc !== src;

  return (
    <span
      aria-hidden="true"
      className={cx(
        "flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: `hsl(${hue} var(--bc-av-bg))`,
        color: `hsl(${hue} var(--bc-av-fg))`,
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatar (pps.whatsapp.net); next/image's optimizer can't sign these transient URLs
        <img
          src={src as string}
          alt=""
          width={size}
          height={size}
          onError={() => setFailedSrc(src ?? null)}
          className="h-full w-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
