// Composes the machine-facing markdown for a page: registry title +
// description + canonical URL + dates, then the page's contentFile body.
// Shared by the `.md` mirror route (src/app/api/md/) and /llms-full.txt so
// the two surfaces are byte-identical per page.

import type { PageEntry } from "./registry";
import { readContent } from "./content";
import { SITE_URL } from "./site";

export function pageMarkdown(entry: PageEntry): string | null {
  const body = readContent(entry);
  if (body === null) return null;
  const canonical = `${SITE_URL}${entry.path === "/" ? "/" : entry.path}`;
  const dates =
    entry.datePublished === entry.dateModified
      ? `Published: ${entry.datePublished}`
      : `Published: ${entry.datePublished} · Updated: ${entry.dateModified}`;
  return [
    `# ${entry.title}`,
    "",
    `> ${entry.description}`,
    "",
    `Canonical: ${canonical}`,
    dates,
    "",
    body.trim(),
    "",
  ].join("\n");
}
