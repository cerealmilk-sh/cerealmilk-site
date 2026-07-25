// /about, the company story + Dan bio. The lede is PERSON_SENTENCE verbatim
// (used in the /about lede, the ProfilePage description, and the Person
// JSON-LD). The markdown body of record (src/content/about.md) starts with
// the same sentence so the `.md` mirror stands alone; it is stripped here so
// the sentence renders exactly once.

import Image from "next/image";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { readContent } from "@/lib/content";
import { graph, breadcrumbNode, profilePageNode } from "@/lib/jsonld";
import { AUTHOR, PERSON_SENTENCE } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { Prose } from "@/components/site/Prose";
import { Terminus } from "@/components/site/Terminus";
import { SectionHeading } from "@/components/site/vercel-kit";

const entry = pageByPath("/about")!;

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
          profilePageNode(),
          breadcrumbNode("/about", [{ name: "About", path: "/about" }])
        )}
      />
      <article className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
        <Image
          src={AUTHOR.photo}
          alt={AUTHOR.name}
          width={120}
          height={120}
          priority
          className="mb-8 rounded-full border border-edge"
        />
        <SectionHeading
          as="h1"
          kicker="Company"
          title={entry.title}
          lede={PERSON_SENTENCE}
        />
        {md && (
          <div className="mt-12">
            <Prose source={stripLede(md, PERSON_SENTENCE)} />
          </div>
        )}
        <Terminus source="about" path="/about" />
      </article>
    </SiteShell>
  );
}
