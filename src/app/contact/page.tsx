// /contact: the written-inquiry path, built to be filled by a human OR by a
// browsing AI agent. A single-step, server-rendered native <form> that posts to
// /api/inquiry: every field has a real label, name, and autocomplete, it works
// with JavaScript disabled, and there is no captcha between the user and a
// person. The markdown body of record (src/content/contact.md) starts with the
// registry description as its lede; it is stripped here so it renders once.

import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { readContent } from "@/lib/content";
import { graph, breadcrumbNode, contactPageNode } from "@/lib/jsonld";
import { AUTHOR } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { Prose } from "@/components/site/Prose";
import { Terminus } from "@/components/site/Terminus";
import { Crosshair, SectionHeading } from "@/components/site/vercel-kit";
import { TrackEvent } from "@/components/site/TrackEvent";
import { mintInquiryToken } from "@/lib/inquiry-guard";

const entry = pageByPath("/contact")!;
export const metadata = pageMetadata(entry);

// Geist form furniture (VERCEL-GEIST-SPEC.md §3/§4): 14px labels, bordered
// rounded-md inputs on the page bg, quiet focus border, pill submit.
const FIELD =
  "mt-2 h-10 w-full rounded-md border border-edge-2 bg-transparent px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-faint";
const LABEL = "block text-[14px] font-medium text-ink";

function stripLede(md: string, lede: string): string {
  return md.startsWith(lede) ? md.slice(lede.length).trimStart() : md;
}

const ERRORS: Record<string, string> = {
  email: "Please enter a valid work email so we can reply.",
  message: "Please add a short message so we know what you need.",
  "1": "Something went wrong sending that. Email daniel@80x.ai directly and it will get through.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const md = readContent(entry);
  const errorMsg = error ? ERRORS[error] ?? ERRORS["1"] : null;

  return (
    <SiteShell>
      <JsonLd
        data={graph(
          contactPageNode(),
          breadcrumbNode("/contact", [{ name: "Contact", path: "/contact" }])
        )}
      />
      <article className="mx-auto max-w-[46rem] px-6 py-16 sm:py-24">
        <SectionHeading
          as="h1"
          kicker="Contact"
          title={entry.title}
          lede={entry.description}
        />

        {sent ? (
          <div
            role="status"
            className="mt-10 border border-edge bg-bg p-6 sm:p-8"
          >
            {/* Record the lead the moment the thank-you state renders (the form
                posts and redirects to /contact?sent=1). */}
            <TrackEvent event="inquiry_submitted" />
            <h2 className="text-[20px] leading-[1.3] text-ink">
              Thanks. Your message is on its way to Daniel.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">
              You will get a reply from {AUTHOR.email} within one business day,
              usually sooner. If it is urgent, email that address directly.
            </p>
          </div>
        ) : (
          <div className="relative mt-10 border border-edge bg-bg p-6 sm:p-8">
            <Crosshair position="tl" />
            <Crosshair position="br" />
            {errorMsg && (
              <p
                role="alert"
                className="mb-5 rounded-md border border-danger/40 bg-danger/5 px-4 py-3 text-[13.5px] text-danger"
              >
                {errorMsg}
              </p>
            )}
            <form method="post" action="/api/inquiry" className="grid gap-5">
              {/* Signed form token (see src/lib/inquiry-guard.ts): the page is
                  rendered per request, so every visitor gets a fresh one. Bots
                  that POST the API blind, or instantly, fail its checks. */}
              <input type="hidden" name="ft" value={mintInquiryToken()} />
              {/* Honeypot: off-screen, hidden from assistive tech and from
                  form-filling agents; scripts fill it and get silently dropped. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-0">
                <label htmlFor="company_website">Company website</label>
                <input
                  id="company_website"
                  name="company_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={LABEL}>
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={FIELD}
                    placeholder="Jane Partner"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={LABEL}>
                    Work email <span className="text-ink-faint">(required)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={FIELD}
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="firm" className={LABEL}>
                  Company or firm
                </label>
                <input
                  id="firm"
                  name="firm"
                  type="text"
                  autoComplete="organization"
                  className={FIELD}
                  placeholder="Company name, and Attio or Affinity (solo is fine too)"
                />
              </div>

              <div>
                <label htmlFor="message" className={LABEL}>
                  What do you need?{" "}
                  <span className="text-ink-faint">(required)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className={`${FIELD} h-auto py-2.5 leading-relaxed`}
                  placeholder="A demo, a pilot for the team, a question about the app, or something else. A couple of lines is plenty."
                />
              </div>

              <label
                htmlFor="subscribe"
                className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-dim"
              >
                <input
                  id="subscribe"
                  name="subscribe"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                />
                <span>
                  Also send me The 80x Field Notes, one email when new guides or
                  tools ship. Optional, unsubscribe anytime.
                </span>
              </label>

              <div>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-dim"
                >
                  Send it to Daniel
                </button>
                <p className="mt-4 text-[13px] text-ink-dim">
                  Goes straight to the founder. Replies from {AUTHOR.email}{" "}
                  within one business day. Prefer email? Write to{" "}
                  <a
                    href={`mailto:${AUTHOR.email}`}
                    className="font-medium text-ink underline decoration-edge-2 underline-offset-4 transition-colors hover:decoration-ink-faint"
                  >
                    {AUTHOR.email}
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        )}

        {md && (
          <div className="mt-14">
            <Prose source={stripLede(md, entry.description)} />
          </div>
        )}

        <Terminus source="contact" path="/contact" />
      </article>
    </SiteShell>
  );
}
