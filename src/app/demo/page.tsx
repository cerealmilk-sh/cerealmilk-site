import Link from "next/link";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { graph, breadcrumbNode } from "@/lib/jsonld";
import { AUTHOR } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { DemoRequestForm } from "@/components/site/DemoRequestForm";
import { Crosshair, SectionHeading } from "@/components/site/vercel-kit";

// /demo, the conversion page. Form first, calendar second (the standard B2B
// demo flow): a three-field form posts the lead to /api/inquiry, then the
// visitor lands on the booking page with name and email prefilled. The ?src=
// param on inbound links is attribution only and is read client-side in
// DemoRequestForm, so the page stays static.
//
// Funnel shape, deliberate:
//   The form sits beside the headline, not below the argument. Anyone who
//   arrived already convinced can convert without scrolling; the reasons are
//   underneath for anyone who is not.
//   Three fields. Every extra one costs completions, and anything else worth
//   knowing surfaces on the call itself.
//   One primary action on the page. The only other path offered is the
//   self-serve trial, a faster route to the same product rather than a
//   competing capture, so it sits last.
//   The objections that actually stop a booking (do I have to install first,
//   who is on the call, is this a pitch) are answered here rather than in a
//   reply to an email nobody sends.

const entry = pageByPath("/demo")!;

export const metadata = pageMetadata(entry);

const QUIET_LINK =
  "font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint";

// Beside the headline: the three facts that decide whether someone books.
const PROMISES = [
  "30 minutes on a screen-share. No deck.",
  "You talk to the founder, not a sales rep.",
  "If Cereal Milk is not right for you, you will hear that on the call.",
];

const AGENDA = [
  "The app on your real messages: WhatsApp in one fast window, with the AI agent beside every chat.",
  "The privacy model: what the agent reads, what it never touches, and how drafts stay yours to send.",
  "Rollout and plans. Pricing is published, so the call confirms fit, not the number.",
];

const FAQ = [
  {
    q: "Do I need to install anything first?",
    a: "No. The screen-share runs from our side. If you would rather drive it yourself, Cereal Milk runs on Mac and Windows and the trial is free for 7 days.",
  },
  {
    q: "Who is on the call?",
    a: "Daniel Hull, the founder. There is no qualification call before the real one.",
  },
  {
    q: "Is this a sales pitch?",
    a: "Pricing is published, so there is nothing to negotiate. It is a working session on your own messages, and you decide afterwards.",
  },
];

export default function Page() {
  return (
    <SiteShell>
      <JsonLd
        data={graph(
          breadcrumbNode("/demo", [{ name: "Book a demo", path: "/demo" }])
        )}
      />
      <article className="mx-auto max-w-[64rem] px-6 py-16 sm:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-16">
          <div>
            <SectionHeading
              as="h1"
              kicker="Book a demo"
              title="See Cereal Milk on your own messages"
              lede="Bring the conversations you actually work in and we will put an agent next to them live."
            />
            <ul className="mt-8 space-y-3">
              {PROMISES.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15px] leading-relaxed text-ink-dim"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[10px] h-px w-3 shrink-0 bg-edge-2"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative border border-edge bg-bg p-6 sm:p-8">
            <Crosshair position="tl" />
            <Crosshair position="br" />
            <DemoRequestForm />
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-edge pt-10 sm:grid-cols-2 sm:gap-16">
          <div>
            <h2 className="text-[14px] font-medium text-ink">
              What the demo covers
            </h2>
            <ul className="mt-3 space-y-2">
              {AGENDA.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-relaxed text-ink-dim"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[9px] h-px w-3 shrink-0 bg-edge-2"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[14px] font-medium text-ink">Before you book</h2>
            <dl className="mt-3 space-y-4">
              {FAQ.map(({ q, a }) => (
                <div key={q}>
                  <dt className="text-[14px] font-medium text-ink">{q}</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-ink-dim">
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <aside className="mt-16 border-t border-edge pt-10">
          <h2 className="text-[24px] leading-[1.2] text-ink">
            Rather not sit through a call?
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim">
            Cereal Milk is live for Mac and Windows. Create your account in the
            app and the full product is free for 7 days, no card.
          </p>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-dim">
            <Link
              href="/download"
              data-track="demo_download_clicked"
              className={QUIET_LINK}
            >
              Download Cereal Milk
            </Link>{" "}
            or write to{" "}
            <a
              href={`mailto:${AUTHOR.email}`}
              data-track="demo_email_clicked"
              className={QUIET_LINK}
            >
              {AUTHOR.email}
            </a>{" "}
            and Dan replies with times within a day.
          </p>
        </aside>
      </article>
    </SiteShell>
  );
}
