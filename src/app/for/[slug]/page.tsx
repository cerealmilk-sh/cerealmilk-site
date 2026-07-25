import Link from "next/link";
import { notFound } from "next/navigation";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { breadcrumbNode, graph } from "@/lib/jsonld";
import { cx } from "@/components/ui/cx";
import { BOOK_PATH } from "@/lib/site";
import { BUSINESS, PRICE_ANCHOR, STARTER } from "@/lib/pricing";
import { USE_CASES, findUseCase } from "@/lib/use-cases";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { DotField } from "@/components/site/DotField";
import {
  FeatureGrid,
  PillButton,
  SectionHeading,
} from "@/components/site/vercel-kit";

// The /for/* use-case pages (see src/lib/use-cases.ts): one template, one
// data object per audience. The homepage sells the platform; these pages say
// the same true things in one audience's own language, so every section here
// mirrors a homepage beat (hero → the leaks → the jobs → proof + pricing →
// terminus). Statically generated; each slug has a registry entry and a
// markdown mirror under src/content/.

export const dynamicParams = false;

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = pageByPath(`/for/${slug}`);
  if (!entry) return {};
  return pageMetadata(entry);
}

const QUIET_LINK =
  "font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const uc = findUseCase(slug);
  const entry = pageByPath(`/for/${slug}`);
  if (!uc || !entry) notFound();
  const path = `/for/${uc.slug}`;

  return (
    <SiteShell>
      <JsonLd
        data={graph(
          breadcrumbNode(path, [{ name: uc.metaTitle, path }])
        )}
      />

      {/* 1 · Hero */}
      <section className="relative isolate overflow-hidden">
        <DotField />
        <div className="relative z-10 mx-auto max-w-[1080px] px-6 pb-14 pt-16 sm:pt-24">
          <SectionHeading
            as="h1"
            kicker={uc.kicker}
            title={
              <>
                {uc.h1[0]}
                <br />
                {uc.h1[1]}
              </>
            }
            lede={uc.lede}
          />
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <PillButton
              href={`${BOOK_PATH}?src=for-${uc.slug}`}
              size="lg"
              data-track="demo_cta_clicked"
              data-track-props={JSON.stringify({ src: `for-${uc.slug}` })}
            >
              Book a demo
            </PillButton>
            <PillButton href="/download" variant="secondary" size="lg">
              Get 80x for Mac
            </PillButton>
            <Link href="/pricing" className={cx("px-2 text-[14px]", QUIET_LINK)}>
              See pricing
            </Link>
          </div>
          <p className="mt-8 font-mono text-[13px] text-ink-faint">
            macOS 26 or later · no unofficial APIs · your number stays yours
          </p>
        </div>
      </section>

      {/* 2 · The leaks, in this audience's life */}
      <section aria-labelledby="leaks" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="Where the record goes to die"
            title={<span id="leaks">{uc.leaksTitle}</span>}
            lede={uc.leaksLede}
          />
          <FeatureGrid cols={3} crosshairs className="mt-12">
            {uc.leaks.map((l) => (
              <div key={l.n} className="flex h-full flex-col bg-bg p-8 lg:p-10">
                <p className="font-mono text-[13px] text-ink-faint">{l.n}</p>
                <h3 className="mt-4 text-[18px] leading-[1.25] text-ink">
                  {l.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-dim">
                  {l.body}
                </p>
              </div>
            ))}
          </FeatureGrid>
        </div>
      </section>

      {/* 3 · The jobs */}
      <section aria-labelledby="jobs" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="The chat on the left. The record on the right."
            title={<span id="jobs">One window. One record. No data entry.</span>}
            lede="Nothing to import, nothing to migrate. Open the app, scan a QR code, and the record starts writing itself."
          />
          <FeatureGrid cols={3} className="mt-12">
            {uc.jobs.map((j) => (
              <div key={j.kicker} className="flex h-full flex-col bg-bg p-8 lg:p-10">
                <p className="font-mono text-[13px] text-ink-faint">{j.kicker}</p>
                <h3 className="mt-3 text-[16px] font-medium text-ink">{j.title}</h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-dim">
                  {j.body}
                </p>
              </div>
            ))}
          </FeatureGrid>
        </div>
      </section>

      {/* 4 · Proof + the buying motion */}
      <section aria-labelledby="proof" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <div className="grid gap-px border border-edge bg-edge lg:grid-cols-3">
            <div className="bg-bg p-8 lg:col-span-2 lg:p-10">
              <p className="font-mono text-[13px] text-ink-faint">
                {uc.proofKicker}
              </p>
              <h2 id="proof" className="mt-3 text-[22px] leading-[1.25] text-ink">
                {uc.proofTitle}
              </h2>
              <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-ink-dim">
                {uc.proofBody}{" "}
                <Link href="/security" className={QUIET_LINK}>
                  The full safety model
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col bg-bg p-8 lg:p-10">
              <p className="font-mono text-[13px] text-ink-faint">
                Pricing, published
              </p>
              <p className="x-display mt-3 text-[32px] leading-none text-ink">
                From {PRICE_ANCHOR}
                <span className="text-[15px] text-ink-dim"> /user/mo</span>
              </p>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-dim">
                Starter ${STARTER.monthly}, Business ${BUSINESS.monthly},
                monthly or yearly. Cancel anytime.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PillButton
                  href={`${BOOK_PATH}?src=for-${uc.slug}-proof`}
                  data-track="demo_cta_clicked"
                  data-track-props={JSON.stringify({
                    src: `for-${uc.slug}-proof`,
                  })}
                >
                  Book a demo
                </PillButton>
                <PillButton href="/pricing" variant="secondary">
                  See pricing
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Closer */}
      <section
        aria-label="Book a demo or download"
        className="relative isolate overflow-hidden border-t border-edge"
      >
        <DotField />
        <div className="relative z-10 mx-auto max-w-[1080px] px-6 pb-24 pt-16 sm:pt-20">
          <p className="max-w-[46ch] text-[22px] leading-[1.3] text-ink">
            {uc.closer}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PillButton
              href={`${BOOK_PATH}?src=for-${uc.slug}-footer`}
              size="lg"
              data-track="demo_cta_clicked"
              data-track-props={JSON.stringify({
                src: `for-${uc.slug}-footer`,
              })}
            >
              Book a demo
            </PillButton>
            <PillButton href="/download" variant="secondary" size="lg">
              Get 80x for Mac
            </PillButton>
          </div>
          <p className="mt-6 font-mono text-[13px] text-ink-faint">
            Cancel anytime · Starter {PRICE_ANCHOR}/mo · Business $
            {BUSINESS.monthly}/mo
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
