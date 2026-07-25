// JSON-LD builders for the site. One @graph of Organization + WebSite +
// Person is emitted by the root layout on every page; each page adds its own
// typed nodes with these helpers (SoftwareApplication, FAQPage, JobPosting…),
// linked back to the shared @ids. The product SoftwareApplication node renders
// ONLY on the homepage (the product page), not on every route.

import {
  AUTHOR,
  AUTHOR_PHOTO_DIM,
  AUTHOR_PHOTO_URL,
  CANONICAL_SENTENCE,
  GITHUB_ORG_URL,
  PERSON_SENTENCE,
  SITE_NAME,
  SITE_URL,
  YOUTUBE_URL,
} from "./site";

export const ORG_ID = `${SITE_URL}/#org`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = AUTHOR.id;

type Node = Record<string, unknown>;

export function graph(...nodes: Node[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Organization + WebSite + Person, the root graph on every page. */
export function rootNodes(): Node[] {
  return [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      description: CANONICAL_SENTENCE,
      email: AUTHOR.email,
      founder: { "@id": PERSON_ID },
      // Entity corroboration. Add LinkedIn/Crunchbase/X URLs here as those
      // profiles go live, see docs/geo/off-site-kit.md.
      sameAs: [GITHUB_ORG_URL, YOUTUBE_URL],
      areaServed: "Worldwide",
      // How to reach 80x, stated in the graph so a model can describe the path,
      // not just find a form. Mirrors the /contact page and llms.txt.
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: AUTHOR.email,
        url: `${SITE_URL}/demo`,
        availableLanguage: "en",
      },
      knowsAbout: [
        "venture capital",
        "B2B sales",
        "professional services",
        "WhatsApp",
        "LinkedIn",
        "Attio",
        "Affinity",
        "CRM",
        "macOS",
      ],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: CANONICAL_SENTENCE,
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: AUTHOR.name,
      jobTitle: AUTHOR.role,
      description: PERSON_SENTENCE,
      image: {
        "@type": "ImageObject",
        url: AUTHOR_PHOTO_URL,
        width: AUTHOR_PHOTO_DIM,
        height: AUTHOR_PHOTO_DIM,
      },
      worksFor: { "@id": ORG_ID },
      url: `${SITE_URL}/about`,
      sameAs: [GITHUB_ORG_URL, YOUTUBE_URL],
    },
  ];
}

export function serviceNode(opts: {
  path: string;
  name: string;
  description: string;
}): Node {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}${opts.path}#service`,
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    provider: { "@id": ORG_ID },
    serviceType: "Agentic engineering",
    areaServed: "Worldwide",
  };
}

export function collectionNode(opts: {
  path: string;
  name: string;
  description: string;
  items: { url: string; name: string }[];
}): Node {
  return {
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${opts.path}`,
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
        name: item.name,
      })),
    },
  };
}

export function articleNode(opts: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  type?: "Article" | "BlogPosting";
}): Node {
  return {
    "@type": opts.type ?? "Article",
    "@id": `${SITE_URL}${opts.path}#article`,
    headline: opts.headline,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: `${SITE_URL}${opts.path}`,
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/**
 * A VideoObject for a /videos/<slug> page. `contentUrl`/`embedUrl` point at
 * YouTube (the media lives there); `url` is the on-site watch page. Authored by
 * the Person, published by the Organization, so the video corroborates the same
 * entity graph as everything else on the site.
 */
export function videoObjectNode(opts: {
  path: string;
  name: string;
  description: string;
  uploadDate: string;
  thumbnailUrl: string;
  embedUrl: string;
  watchUrl: string;
}): Node {
  return {
    "@type": "VideoObject",
    "@id": `${SITE_URL}${opts.path}#video`,
    name: opts.name,
    description: opts.description,
    thumbnailUrl: opts.thumbnailUrl,
    uploadDate: opts.uploadDate,
    contentUrl: opts.watchUrl,
    embedUrl: opts.embedUrl,
    url: `${SITE_URL}${opts.path}`,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function breadcrumbNode(
  pagePath: string,
  crumbs: { name: string; path: string }[]
): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}${pagePath}#breadcrumbs`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function faqNode(
  pagePath: string,
  items: { q: string; a: string }[]
): Node {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${pagePath}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function contactPageNode(): Node {
  return {
    "@type": "ContactPage",
    "@id": `${SITE_URL}/contact#contact`,
    url: `${SITE_URL}/contact`,
    name: "Contact 80x",
    description:
      "Contact 80x about the Mac app, team pilots, or press. Daniel replies from daniel@80x.ai within one business day.",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    mainEntity: { "@id": ORG_ID },
  };
}

export function profilePageNode(): Node {
  return {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/about#profile`,
    url: `${SITE_URL}/about`,
    name: "About 80x",
    description: PERSON_SENTENCE,
    mainEntity: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/**
 * A JobPosting for a role on the /careers page. Google Jobs requires
 * `title`, `description` (HTML allowed), `datePosted`, and `hiringOrganization`;
 * for remote roles it wants `jobLocationType: "TELECOMMUTE"`; since we accept
 * applicants worldwide we omit `applicantLocationRequirements` (Google expects a
 * real country there, so "worldwide" is expressed by omission, not an invalid
 * Country named "Worldwide"). No `baseSalary` is emitted, better to omit it
 * than to publish a made-up number.
 */
export function jobPostingNode(opts: {
  /** Anchor id fragment on /careers, e.g. "forward-deployed-agentic-engineer". */
  id: string;
  title: string;
  /** Plain-text or lightly-HTML description of the role. */
  description: string;
  datePosted: string;
  employmentType?: string;
}): Node {
  return {
    "@type": "JobPosting",
    "@id": `${SITE_URL}/careers#${opts.id}`,
    title: opts.title,
    description: opts.description,
    datePosted: opts.datePosted,
    employmentType: opts.employmentType ?? "FULL_TIME",
    hiringOrganization: { "@id": ORG_ID },
    jobLocationType: "TELECOMMUTE",
    directApply: false,
    url: `${SITE_URL}/careers#${opts.id}`,
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function softwareAppNode(opts: {
  path: string;
  name: string;
  description: string;
  category: string;
  operatingSystem?: string;
  price?: string;
  priceCurrency?: string;
  /**
   * The published plans (name + per-user monthly price). When given, wins
   * over the single `price`; each becomes an Offer pointing at /pricing.
   */
  offers?: { name: string; price: number; priceCurrency?: string }[];
  featureList?: string[];
}): Node {
  const offers = opts.offers?.length
    ? opts.offers.map((o) => ({
        "@type": "Offer",
        name: o.name,
        price: String(o.price),
        priceCurrency: o.priceCurrency ?? "USD",
        // Per user per month; UnitPriceSpecification is heavier than search
        // engines need, so the cadence is stated in the description.
        description: `${o.name} plan, per user per month, billed monthly or yearly.`,
        url: `${SITE_URL}/pricing`,
        availability: "https://schema.org/OnlineOnly",
      }))
    : opts.price
      ? {
          "@type": "Offer",
          price: opts.price,
          priceCurrency: opts.priceCurrency ?? "USD",
          availability: "https://schema.org/OnlineOnly",
        }
      : undefined;
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}${opts.path}#software`,
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    applicationCategory: opts.category,
    ...(opts.operatingSystem ? { operatingSystem: opts.operatingSystem } : {}),
    ...(opts.featureList ? { featureList: opts.featureList } : {}),
    ...(offers ? { offers } : {}),
    publisher: { "@id": ORG_ID },
  };
}
