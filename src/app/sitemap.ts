import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PAGES } from "@/lib/registry";

// /sitemap.xml: generated from the content registry, so every studio page is
// listed the moment it gets a registry entry. lastModified comes from the
// entry's hardcoded dateModified (never new Date(): lastmod only moves when
// content actually changes). The /docs subtree has its own sitemap
// (/docs/sitemap-index.xml), referenced from robots.txt.
//
// /privacy and /terms are deliberately NOT registry pages (self-contained
// legal pages, no md mirror), so they are appended here by hand; bump the
// dates when the policies change.
const LEGAL_PAGES = [
  { path: "/privacy", lastModified: "2026-07-12" },
  { path: "/terms", lastModified: "2026-07-09" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({
      url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
      lastModified: p.dateModified,
      changeFrequency: p.path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: p.priority ?? 0.6,
    })),
    ...LEGAL_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: p.lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
