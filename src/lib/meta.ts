// Builds the Metadata object for a studio page from its registry entry, so
// every page carries the same invariants (canonical, OG, Twitter, OG image)
// and a page can't drift from the registry. The OG image URLs resolve to the
// registry-driven generator at src/app/og/ ("/" → /og/home.png, other paths
// map 1:1: /work/x → /og/work/x.png).

import type { Metadata } from "next";
import type { PageEntry } from "./registry";
import { SITE_URL } from "./site";

export function ogImagePath(entry: PageEntry): string {
  return `/og${entry.path === "/" ? "/home" : entry.path}.png`;
}

export function pageMetadata(
  entry: PageEntry,
  opts?: { ogType?: "website" | "article" }
): Metadata {
  const ogType = opts?.ogType ?? "website";
  const image = { url: ogImagePath(entry), width: 1200, height: 630 };
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: entry.path },
    openGraph: {
      type: ogType,
      url: `${SITE_URL}${entry.path}`,
      title: entry.title,
      description: entry.description,
      images: [image],
      ...(ogType === "article"
        ? {
            publishedTime: entry.datePublished,
            modifiedTime: entry.dateModified,
            authors: [`${SITE_URL}/about`],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [image.url],
    },
  };
}
