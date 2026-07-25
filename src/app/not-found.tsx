import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { PillButton, SectionHeading } from "@/components/site/vercel-kit";

// The branded 404 (W-16): full site chrome instead of Next's bare default,
// with the shortest routes back into the funnel. Statically rendered.

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const QUIET_LINK =
  "font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-[880px] px-6 py-24 sm:py-32">
        <SectionHeading
          as="h1"
          kicker="404"
          title="This page doesn't exist"
          lede="The address may have changed when the site did, or the link was wrong to begin with. Everything worth reading is one step away."
        />
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PillButton href="/" size="lg">
            Go to the homepage
          </PillButton>
          <PillButton href="/demo" variant="secondary" size="lg">
            Book a demo
          </PillButton>
        </div>
        <p className="mt-8 text-[14px] leading-relaxed text-ink-dim">
          Or head to{" "}
          <Link href="/pricing" className={QUIET_LINK}>
            pricing
          </Link>
          ,{" "}
          <Link href="/docs" className={QUIET_LINK}>
            the docs
          </Link>
          , or{" "}
          <Link href="/contact" className={QUIET_LINK}>
            contact us
          </Link>{" "}
          and we&apos;ll point you right.
        </p>
      </div>
    </SiteShell>
  );
}
