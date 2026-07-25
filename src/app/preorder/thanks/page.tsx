import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { DotField } from "@/components/site/DotField";
import { SectionHeading } from "@/components/site/vercel-kit";
import { TrackEvent } from "@/components/site/TrackEvent";
import { SITE_URL } from "@/lib/site";

// /preorder/thanks, the reservation confirmation. Three jobs: confirm the
// seat is held, set expectations (what happens next, in order), and make the
// one referral ask while goodwill is highest. Not indexed: you only land here
// by reserving.

export const metadata: Metadata = {
  title: "Your founding seat is reserved",
  description: "Your 80x founding seat is reserved. Here is what happens next.",
  alternates: { canonical: "/preorder/thanks" },
  robots: { index: false, follow: false },
};

const QUIET_LINK =
  "font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint";

const NEXT_STEPS = [
  {
    title: "Right now",
    body: "A confirmation email is on its way from Daniel, the founder. If it is not in your inbox in a few minutes, check spam once, then reply to anything from 80x and a human sorts it out.",
  },
  {
    title: "When your wave opens",
    body: "You get a personal email, not an automated blast, with a link to pick your setup call. Founding seats are onboarded first, in the order they reserved.",
  },
  {
    title: "On the setup call",
    body: "Install, accounts connected, CRM mapped, done with you in about 30 minutes. Your trial starts there, and billing only ever starts on the plan you locked, after the trial, if you keep the seat.",
  },
];

const SHARE_TEXT =
  "I just reserved a founding seat for 80x, the Mac app that puts WhatsApp, LinkedIn, and Gmail in one window and files the threads that matter to your CRM. No card to reserve:";
const SHARE_URL = `${SITE_URL}/preorder?src=referral`;

export default function Page() {
  return (
    <SiteShell>
      <TrackEvent event="preorder_confirmed" />
      <section className="relative isolate overflow-hidden">
        <DotField />
        <div className="relative z-10 mx-auto max-w-[46rem] px-6 pb-24 pt-16 sm:pt-24">
          <SectionHeading
            as="h1"
            kicker="Reserved"
            title="Your founding seat is held"
            lede="No charge was made and none will be until your seat is set up and you decide to keep it. Here is exactly what happens next."
          />

          <ol className="mt-12 space-y-8">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="font-mono text-[13px] leading-[1.6] text-ink-faint">
                  0{i + 1}
                </span>
                <div>
                  <h2 className="text-[16px] font-medium text-ink">{s.title}</h2>
                  <p className="mt-2 max-w-[58ch] text-[14.5px] leading-relaxed text-ink-dim">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-14 border border-edge bg-bg p-6 sm:p-8">
            <p className="font-mono text-[13px] text-ink-faint">
              One ask, while you wait
            </p>
            <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-ink-dim">
              Founding seats are capped, and the fastest way to get 80x into
              your world is the person you already trade deals with. If one
              name came to mind, send them the link.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  "Worth a look: 80x"
                )}&body=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`}
                className={QUIET_LINK}
                data-track="referral_click"
                data-track-props='{"channel":"email"}'
              >
                Share by email
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${SHARE_TEXT} ${SHARE_URL}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={QUIET_LINK}
                data-track="referral_click"
                data-track-props='{"channel":"whatsapp"}'
              >
                Share on WhatsApp
              </a>
            </div>
          </div>

          <p className="mt-10 text-[14px] leading-relaxed text-ink-dim">
            While you wait: read{" "}
            <Link href="/security" className={QUIET_LINK}>
              how the privacy model works
            </Link>{" "}
            or{" "}
            <Link href="/docs" className={QUIET_LINK}>
              the docs
            </Link>
            . Change your mind? Reply to the confirmation email and the
            reservation is gone, no questions.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
