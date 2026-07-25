import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { readContent } from "@/lib/content";
import { breadcrumbNode, graph } from "@/lib/jsonld";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { Prose } from "@/components/site/Prose";
import { Terminus } from "@/components/site/Terminus";
import { SectionHeading } from "@/components/site/vercel-kit";

// /security: the trust page, and deliberately a long-form read rather than a
// grid of badges. This ICP's first question is "will this get my number
// banned"; the page answers it in prose with the honest limits stated. The
// markdown body of record (src/content/security.md) starts with the registry
// description as its lede; it is stripped here so it renders once.

const entry = pageByPath("/security")!;
export const metadata = pageMetadata(entry);

function stripLede(md: string, lede: string): string {
  return md.startsWith(lede) ? md.slice(lede.length).trimStart() : md;
}

export default function Page() {
  const md = readContent(entry);
  return (
    <SiteShell>
      <JsonLd
        data={graph(
          breadcrumbNode("/security", [
            { name: "Security and privacy", path: "/security" },
          ])
        )}
      />
      <article className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
        <SectionHeading
          as="h1"
          kicker="Security & privacy"
          title="Safe enough for the conversations that matter"
          lede={entry.description}
        />
        {md && (
          <div className="mt-12">
            <Prose source={stripLede(md, entry.description)} />
          </div>
        )}
        <Terminus source="security" path="/security" />
      </article>
    </SiteShell>
  );
}
