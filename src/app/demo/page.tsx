import Link from "next/link";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { graph, breadcrumbNode } from "@/lib/jsonld";
import { AUTHOR, NEWSLETTER_NAME } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { DemoRequestForm } from "@/components/site/DemoRequestForm";
import { Crosshair, SectionHeading } from "@/components/site/vercel-kit";

// /demo, the conversion page. Form first, calendar second (the standard B2B
// demo flow): a four-field form posts the lead to /api/inquiry, then the
// visitor lands on the Cal.com booking page with name and email prefilled.
// The ?src= param on inbound links is attribution only and is read
// client-side in DemoRequestForm, so the page stays static. No Terminus: the
// secondary capture is the bordered Field Notes block at the end.

const entry = pageByPath("/demo")!;

export const metadata = pageMetadata(entry);

const QUIET_LINK =
  "font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint";

const AGENDA = [
  "The app on a live pipeline: WhatsApp, LinkedIn, and Gmail in one window, filing to Attio or Affinity.",
  "The privacy model: what syncs, what is never read, and how the server-enforced gate works.",
  "Rollout and plans. Pricing is published, so the call confirms fit, not the number.",
];

export default function Page() {
  return (
    <SiteShell>
      <JsonLd
        data={graph(
          breadcrumbNode("/demo", [{ name: "Book a demo", path: "/demo" }])
        )}
      />
      <article className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
        <SectionHeading
          as="h1"
          kicker="Book a demo"
          title="See Cereal Milk on your own pipeline"
          lede="30 minutes on a screen-share with Daniel Hull, the founder. Tell us who you are, pick a time, and come with questions. If Cereal Milk is not right for you, he will say so on the call."
        />

        <div className="relative mt-10 border border-edge bg-bg p-6 sm:p-8">
          <Crosshair position="tl" />
          <Crosshair position="br" />
          <DemoRequestForm />
        </div>

        <div className="mt-10">
          <h2 className="text-[14px] font-medium text-ink">
            What the demo covers
          </h2>
          <ul className="mt-3 space-y-2">
            {AGENDA.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[14px] leading-relaxed text-ink-dim"
              >
                <span aria-hidden="true" className="mt-[9px] h-px w-3 shrink-0 bg-edge-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-mono text-[12.5px] text-ink-faint">
            Cereal Milk is a Mac app · requires macOS 12 or later (Apple Silicon)
          </p>
        </div>

        <p className="mt-8 text-[13px] leading-relaxed text-ink-dim">
          Prefer email? Write to{" "}
          <a
            href={`mailto:${AUTHOR.email}`}
            data-track="demo_email_clicked"
            className={QUIET_LINK}
          >
            {AUTHOR.email}
          </a>{" "}
          and Dan replies with times within a day. Or read about{" "}
          <Link href="/download" className={QUIET_LINK}>
            getting Cereal Milk for Mac
          </Link>{" "}
          first.
        </p>

        <aside
          aria-label="Newsletter signup"
          className="mt-20 border-t border-edge pt-10"
        >
          <p className="font-mono text-[13px] text-ink-faint">
            {NEWSLETTER_NAME}
          </p>
          <h2 className="mt-3 text-[24px] leading-[1.2] text-ink">
            Not ready to talk? Get the Field Notes instead.
          </h2>
          <div className="mt-5">
            <NewsletterForm source="demo" />
          </div>
        </aside>
      </article>
    </SiteShell>
  );
}
