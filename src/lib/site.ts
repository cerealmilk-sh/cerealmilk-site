// Single source of truth for the site's public identity. Used by metadata,
// robots.txt, sitemap.xml, JSON-LD structured data, llms.txt, and the feed.
// If the domain moves, change SITE_URL here and everything follows.

export const SITE_URL = "https://cerealmilk.sh";
export const APP_URL = "https://app.cerealmilk.sh";

export const SITE_NAME = "Cereal Milk";

// The canonical entity sentence. Byte-identical everywhere it appears:
// llms.txt blockquote, default meta description, Organization JSON-LD.
// Never paraphrase it (see PRODUCT-SITE-SPEC.md).
export const CANONICAL_SENTENCE =
  "Cereal Milk is a free desktop app that puts WhatsApp, LinkedIn, and Gmail in one window with a real AI agent in the sidebar that runs on your own model.";

// The canonical person sentence: /about lede, ProfilePage, byline bios.
export const PERSON_SENTENCE =
  "Daniel Hull is the founder of Cereal Milk, the company behind the Cereal Milk desktop app for people who live in chat.";

export const SITE_TAGLINE = "A free desktop agent that lives in your chats";

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
export const CAL_BOOKING_URL = "https://cal.com/danieljh/30min";
export const CONTACT_MAILTO =
  "mailto:daniel@cerealmilk.sh?subject=Cereal%20Milk%20demo&body=Hi%20Dan%2C%20I%27d%20like%20to%20see%20Cereal%20Milk.";

// Daniel's WhatsApp, for the floating "Message Daniel" button on every page
// (src/components/site/WhatsAppButton.tsx). Digits only, no "+" or spaces
// (wa.me requirement). Leave CONTACT_WHATSAPP empty to hide the button.
export const CONTACT_WHATSAPP = "447960957063";
export const CONTACT_WHATSAPP_URL = CONTACT_WHATSAPP
  ? `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent("Hi Daniel, ")}`
  : "";

// --- The desktop app ---------------------------------------------------------

// The product now IS the site: the homepage is the product page.
export const PRODUCT_PATH = "/";

// Self-serve downloads are OPEN. The download-first model: the app is free.
export const SELF_SERVE_DOWNLOADS = true;

// Where "Get Cereal Milk" sends people: the download page, then the evergreen DMG.
export const DOWNLOAD_PATH = "/download";
export const DOWNLOAD_URL = "/download/CerealMilk.dmg";

// Public GitHub Releases on the app repo (electron-builder generic provider,
// feeds auto-generated).
// TODO(human): update owner/repo once the Cereal Milk GitHub org + app repo exist.
export const RELEASE_REPO = "TODO-OWNER/TODO-REPO";

// The primary CTA sitewide: "Get Cereal Milk" → the download page.
export const GET_STARTED_LABEL = "Get Cereal Milk";
