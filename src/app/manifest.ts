import type { MetadataRoute } from "next";
import { CANONICAL_SENTENCE, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// PWA manifest, served at /manifest.webmanifest and linked from the root
// layout. The brand lime (#E4F222) is the splash/app theme; the in-browser
// theme-color (the mobile URL bar) tracks the page background instead and is
// set per color-scheme in layout.tsx's viewport export. Icons all derive from
// the canonical mark (see public/icon-*.png, generated from src/app/icon.svg).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}, ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: CANONICAL_SENTENCE,
    start_url: "/",
    display: "standalone",
    background_color: "#E4F222",
    theme_color: "#E4F222",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
