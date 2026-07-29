import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { GeistPixelGrid } from "geist/font/pixel";
import "./globals.css";

// Typography (the reference system): Inter carries the body, IBM Plex Mono
// carries the hero display line, kickers, and code, and Geist Pixel Grid
// (OFL) carries only the hero headline's "agent." tail. globals.css
// re-points --font-sans/--font-mono to these variables.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

import {
  CANONICAL_SENTENCE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import { graph, rootNodes } from "@/lib/jsonld";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { JsonLd } from "@/components/site/JsonLd";
import { CopyEditor } from "@/components/site/CopyEditor";
import { VercelAnalytics } from "@/components/site/VercelAnalytics";

// cerealmilk.sh, the product site. This layout carries the site-wide identity:
// the canonical entity sentence as the default description, the Organization +
// WebSite + Person JSON-LD graph on every page. Pages
// override title/description per-page; the desktop app product graph lives ONLY
// on the homepage (the product page), see src/app/page.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}, ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: CANONICAL_SENTENCE,
  applicationName: SITE_NAME,
  authors: [{ name: "Daniel Hull", url: `${SITE_URL}/about` }],
  creator: "Daniel Hull",
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME}, ${SITE_TAGLINE}`,
    description: CANONICAL_SENTENCE,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}, ${SITE_TAGLINE}`,
    description: CANONICAL_SENTENCE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  category: "technology",
  // Branding: the canonical Cereal Milk mark. Next auto-links
  // src/app/{favicon.ico,icon.svg,apple-icon.png} by file convention. We
  // deliberately DON'T set metadata.icons here, since doing so suppresses that
  // auto-detection.
  manifest: "/manifest.webmanifest",
};

// Explicit (matches Next's default emission) so mobile layout at 390px can
// never regress to desktop-width rendering, see VERCEL-GEIST-SPEC.md §8(d).
// theme-color tracks the page background per scheme so the mobile URL bar blends
// with the monochrome canvas.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`h-full ${inter.variable} ${ibmPlexMono.variable} ${GeistPixelGrid.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Organization + WebSite + Person, the entity graph every page links back to. */}
        <JsonLd data={graph(...rootNodes())} />
        {/* Safari pinned-tab mask (monochrome mark; the tab tints it the brand color).
            The .ico/.svg/apple icons are auto-linked from src/app by file convention. */}
        <link rel="mask-icon" href="/mask-icon.svg" color="#151110" />
      </head>
      <body className="h-dvh overflow-hidden bg-bg text-ink antialiased">
        {children}
        {/* Site-wide floating "chat with the founder" WhatsApp button, on every
            page, including /app and the legacy flows that skip SiteShell. Wrapped
            in .studio so the panel/edge/ink tokens resolve to the studio skin
            everywhere. */}
        <div className="studio">
          <WhatsAppButton />
        </div>
        {/* Dev-only, localhost-only visual copy editor. Returns null in a
            production build and off-localhost, so nothing ships to visitors.
            See CopyEditor.tsx + EditableCopy.tsx + api/dev/*. */}
        <CopyEditor />
        {/* Analytics (PostHog, on by default with a /privacy opt-out), shared
            same-origin across all apex surfaces. Inert until a key is set.
            See public/consent-analytics.js + ANALYTICS.md. */}
        {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__CM_POSTHOG_KEY=${JSON.stringify(process.env.NEXT_PUBLIC_POSTHOG_KEY)};`,
            }}
          />
        ) : null}
        <Script src="/consent-analytics.js" strategy="afterInteractive" />
        {/* Core Web Vitals per route, feeds SEO. */}
        <SpeedInsights />
        {/* Vercel Web Analytics: cookieless traffic, first-party via
            /_vercel/insights. Honors the same /privacy opt-out as PostHog. */}
        <VercelAnalytics />
      </body>
    </html>
  );
}
