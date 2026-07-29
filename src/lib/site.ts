// Single source of truth for the site's public identity. Used by metadata,
// robots.txt, sitemap.xml, JSON-LD structured data, llms.txt, and the feed.
// If the domain moves, change SITE_URL here and everything follows.
//
// Canonical host is the APEX (www.cerealmilk.sh 308s to cerealmilk.sh).

export const SITE_URL = "https://cerealmilk.sh";
export const APP_URL = "https://app.cerealmilk.sh";

export const SITE_NAME = "Cereal Milk";

// The canonical entity sentence. Byte-identical everywhere it appears:
// llms.txt blockquote, default meta description, Organization JSON-LD.
// Never paraphrase it (see PRODUCT-SITE-SPEC.md).
export const CANONICAL_SENTENCE =
  "Cereal Milk is the messenger built for AI agents: a desktop app for Mac and Windows that puts WhatsApp in one fast window with an AI agent beside every chat, running on your own Claude, ChatGPT, Gemini, or OpenAI-compatible account.";

// The canonical person sentence: /about lede, ProfilePage, byline bios.
export const PERSON_SENTENCE =
  "Daniel Hull is the founder of Cereal Milk, the company behind the Cereal Milk desktop app that puts WhatsApp in one fast window with an AI agent beside every chat.";

export const SITE_TAGLINE = "The messenger built for AI agents";

export const AUTHOR = {
  name: "Daniel Hull",
  role: "Founder, Cereal Milk",
  email: "daniel@cerealmilk.sh",
  id: `${SITE_URL}/about#dan`,
  // Optimised square headshot (public/daniel-hull.jpg, 1200x1200). Single source
  // of truth for Dan's photo: the /about portrait, the Person JSON-LD `image`,
  // and OG cards all resolve from here.
  photo: "/daniel-hull.jpg",
} as const;

/** Absolute headshot URL: JSON-LD and OG metadata need a full URL, not a path. */
export const AUTHOR_PHOTO_URL = `${SITE_URL}${AUTHOR.photo}`;
export const AUTHOR_PHOTO_DIM = 1200;

export const GITHUB_ORG_URL = "https://github.com/cerealmilk-sh";

// The founder's YouTube channel (@danieljhull). Kept as an entity `sameAs` on
// the Person/Organization graph (see src/lib/jsonld.ts).
export const YOUTUBE_CHANNEL_ID = "UC1MogjCVseg7rGXwtxrdUww";
export const YOUTUBE_HANDLE = "danieljhull";
export const YOUTUBE_URL = "https://www.youtube.com/@danieljhull";

export const NEWSLETTER_NAME = "The Cereal Milk Field Notes";
export const NEWSLETTER_PITCH =
  "One email when something ships: new releases, new capabilities, and field notes from the build. No spam, unsubscribe anytime.";

// The demo funnel. Every primary CTA on the site points here; the page embeds
// the Cal.com scheduler (see src/app/demo/page.tsx).
export const BOOK_PATH = "/demo";
// The Cal.com booking page the /demo form hands off to (both the JS flow in
// DemoRequestForm and the no-JS form-post redirect in /api/inquiry).
export const CAL_BOOKING_URL =
  "https://cal.com/clippy/30min?overlayCalendar=true";
export const CONTACT_MAILTO =
  "mailto:daniel@cerealmilk.sh?subject=Cereal%20Milk%20demo&body=Hi%20Dan%2C%20I%27d%20like%20to%20see%20Cereal%20Milk%20on%20our%20pipeline.";

// Daniel's WhatsApp, for the floating "Message Daniel" button on every page
// (src/components/site/WhatsAppButton.tsx). Digits only, no "+" or spaces
// (wa.me requirement). Leave CONTACT_WHATSAPP empty to hide the button.
export const CONTACT_WHATSAPP = "14484425660";
export const CONTACT_WHATSAPP_URL = CONTACT_WHATSAPP
  ? `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent("Hi Daniel, ")}`
  : "";

// --- The Mac app -------------------------------------------------------------

// The product now IS the site: the homepage is the product page.
export const PRODUCT_PATH = "/";

// Self-serve downloads are OPEN again (2026-07-14): the funnel is
// download-first (the Raycast model). Get Cereal Milk -> /download -> DMG -> the app
// forces account creation on first run -> the account grants a 7-day
// full-access trial, no card (product-backend signup trial) -> the paywall
// takes over in-app. The evergreen /download/CerealMilk.dmg path is a ROUTE HANDLER
// (src/app/download/CerealMilk.dmg/route.ts) that first-party-logs every hit to the
// backend download log, then 307s to the latest release DMG. Flipping this
// back to false re-routes download intent to the /download page (which would
// then need its call-first copy restored, see git history at 686c754).
export const SELF_SERVE_DOWNLOADS = true;

// Where "Get Cereal Milk" sends people: the download page, then the evergreen DMG.
export const DOWNLOAD_PATH = "/download";
export const DOWNLOAD_URL = "/download/CerealMilk.dmg";

// Published pricing lives in src/lib/pricing.ts (two plans: Starter and
// Business; see BILLING-MODEL.md in product-backend). Import PRICE_LINE /
// PRICE_ANCHOR from there so the numbers can never drift.

// The primary CTA sitewide: "Get Cereal Milk" -> the download page. Buying happens
// INSIDE the app after the 7-day trial (the backend checkout below). The live
// checkout URLs are kept for people who arrive ready to pay (pricing FAQ,
// llms.txt) and for the trial-to-paid path: app.cerealmilk.sh/app/upgrade has live
// billing, renders an in-page sign-up for a cold visitor, and the
// Business checkout creates the team's org and bills per seat.
export const GET_STARTED_LABEL = "Get Cereal Milk";
export const CHECKOUT_URL = `${APP_URL}/app/upgrade?plan=monthly`;
export const BUSINESS_CHECKOUT_URL = `${APP_URL}/app/upgrade?plan=business`;