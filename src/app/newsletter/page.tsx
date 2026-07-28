// /newsletter, the canonical Field Notes landing and the site-wide capture
// target. The form sits high on the page; the /api/waitlist form-post flow
// redirects back here with ?subscribed=1 or ?error=email, rendered by the
// SubscribeNotice client island (in <Suspense>, so the page stays static).
// No Terminus, the page IS the form; a quiet Book-a-call line closes it.
// The markdown body of record (src/content/newsletter.md) starts with the
// registry description as its lede; it is stripped here so it renders once.

import { Suspense } from "react";
import Link from "next/link";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { readContent } from "@/lib/content";
import { graph, breadcrumbNode } from "@/lib/jsonld";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { Prose } from "@/components/site/Prose";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { Crosshair, SectionHeading } from "@/components/site/vercel-kit";
import { SubscribeNotice } from "./SubscribeNotice";

const entry = pageByPath("/newsletter")!;

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
          breadcrumbNode("/newsletter", [
            { name: "Newsletter", path: "/newsletter" },
          ])
        )}
      />
      <article className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
        <SectionHeading
          as="h1"
          kicker="Newsletter"
          title={entry.title}
          lede={entry.description}
        />

        <Suspense fallback={null}>
          <SubscribeNotice />
        </Suspense>

        <div className="relative mt-10 border border-edge bg-bg p-6 sm:p-8">
          <Crosshair position="tl" />
          <Crosshair position="br" />
          <NewsletterForm source="newsletter-page" />
        </div>

        {md && (
          <div className="mt-12">
            <Prose source={stripLede(md, entry.description)} />
          </div>
        )}

        <p className="mt-16 border-t border-edge pt-6 text-[14px] text-ink-dim">
          Rather see it live?{" "}
          <Link
            href="/demo?src=newsletter"
            className="font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint"
          >
            Book a demo
          </Link>
          .
        </p>
      </article>
    </SiteShell>
  );
}
