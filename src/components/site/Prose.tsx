// Renders a page's markdown source (see src/lib/markdown.tsx) with studio
// typography. Server component; the same markdown is served verbatim at the
// page's `.md` mirror and in /llms-full.txt.

import { renderMarkdown } from "@/lib/markdown";

export function Prose({ source }: { source: string }) {
  return <div className="x-prose">{renderMarkdown(source)}</div>;
}
