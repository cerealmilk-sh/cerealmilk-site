// /careers, the hiring page: two founding roles, how we work, and how
// to apply. Each role carries a JobPosting node (Google Jobs eligible) whose
// @id fragment matches the section's anchor, so /careers#<slug> deep-links the
// role. The markdown body of record is src/content/careers.md, a hand-
// maintained mirror of this page for the .md route and llms-full.txt.

import Link from "next/link";
import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { graph, breadcrumbNode, jobPostingNode } from "@/lib/jsonld";
import { AUTHOR } from "@/lib/site";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { AgentActions } from "@/components/site/agent-actions";
import { Terminus } from "@/components/site/Terminus";
import {
  SectionHeading,
  FeatureGrid,
  FeatureCell,
  PillButton,
} from "@/components/site/vercel-kit";

const entry = pageByPath("/careers")!;
export const metadata = pageMetadata(entry);

const POSTED = "2026-07-03";

// How we work, the four things a candidate should know before applying.
const HOW = [
  {
    name: "Remote and async",
    detail:
      "We're distributed and write things down. Clear writing is a first-class skill here, not a nice-to-have.",
  },
  {
    name: "Customer data is sacred",
    detail:
      "The app sits beside live pipelines worth real money. Privacy by architecture, dry runs, and no silent failures are the standard, not the exception.",
  },
  {
    name: "We publish",
    detail:
      "The methods, the docs, and the reusable parts ship in the open. Your name goes on the work.",
  },
  {
    name: "AI in the loop, humans on the hook",
    detail:
      "We use Claude and agents heavily, but a person signs off on anything that touches a customer's data.",
  },
] as const;

type Role = {
  id: string;
  title: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  profile: string[];
};

const ROLES: Role[] = [
  {
    id: "forward-deployed-agentic-engineer",
    title: "Forward-Deployed Agentic Engineer",
    location: "Remote · Worldwide",
    type: "Full-time · Founding role",
    summary:
      "Sit with a venture fund and make its Cereal Milk deployment succeed: the pilot setup, the CRM mapping, the automations around it, and the product improvements each rollout demands.",
    responsibilities: [
      "Run supported paid pilots: workspace setup, Attio and Affinity mapping, team onboarding.",
      "Build the integration and automation edges each fund needs, and generalize the good ones into the product.",
      "Work across the stack: Swift on the Mac app's edges, TypeScript on the backend, the Claude API, MCP, and the Attio, Affinity, and Stripe APIs.",
      "Write the spec and the safety rails before anything touches a customer's live CRM.",
    ],
    profile: [
      "You've shipped production software with LLMs in the loop, not demos.",
      "You're comfortable owning a customer relationship, not just a codebase.",
      "You treat other people's live data as sacred, and reach for dry runs and rollback trails by instinct.",
      "Bonus: you've worked in or around venture capital, or lived inside a CRM.",
    ],
  },
  {
    id: "developer-advocate",
    title: "Developer Advocate (Docs & Open Source)",
    location: "Remote · Worldwide",
    type: "Full-time · Founding role",
    summary:
      "Own Cereal Milk's open surface area: the documentation, the Field Notes, the open-source tools, the videos. This is the content engine that brings funds to the product, and you'd run it.",
    responsibilities: [
      "Turn real deployments into clear, teachable documentation a non-engineer partner at a fund can actually follow.",
      "Ship small open-source tools that make the docs runnable.",
      "Write the Field Notes and script the videos that put Cereal Milk in front of funds.",
      "Instrument what works: you'll live in the analytics and the AI-search audits and tell us what to build next.",
    ],
    profile: [
      "You write clearly enough to teach a fund partner something technical without dumbing it down.",
      "You can read and ship code. You don't need an engineer to publish a working example.",
      "You have a portfolio of technical writing, developer relations, or open-source work.",
      "Bonus: you know Attio, Affinity, Claude, or the VC workflow firsthand.",
    ],
  },
];

// A prefilled application mailto for a role.
function applyHref(role: Role): string {
  const subject = `Cereal Milk · application: ${role.title}`;
  const body = `Hi Daniel,\n\nI'd like to apply for the ${role.title} role.\n\nOne thing I've shipped that I'm proud of:\n\n`;
  return `mailto:${AUTHOR.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

// A plain-text JobPosting description, built from the same copy the page shows.
function jobDescription(role: Role): string {
  return [
    role.summary,
    "What you'll do: " + role.responsibilities.join(" "),
    "You might be a fit if: " + role.profile.join(" "),
  ].join("\n\n");
}

export default function Page() {
  return (
    <SiteShell>
      <JsonLd
        data={graph(
          ...ROLES.map((r) =>
            jobPostingNode({
              id: r.id,
              title: r.title,
              description: jobDescription(r),
              datePosted: POSTED,
            })
          ),
          breadcrumbNode("/careers", [{ name: "Careers", path: "/careers" }])
        )}
      />

      {/* Lede */}
      <header className="mx-auto max-w-[1080px] px-6 pb-16 pt-20 sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-edge-2 px-3 py-1 font-mono text-[12px] text-ink-dim">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#22c55e" }}
          />
          We&rsquo;re hiring: 2 open roles
        </span>
        <div className="mt-6">
          <SectionHeading
            as="h1"
            kicker="Careers"
            title="Build the messenger built for AI agents"
            lede="Cereal Milk is hiring two founding roles. We build the messenger built for AI agents: a desktop app for Mac and Windows that puts WhatsApp in one fast window with an AI agent beside every chat. Born in venture capital, deployed anywhere deals live in chat. Both roles are remote and report to the founder."
          />
        </div>
        <AgentActions path="/careers" className="mt-6" />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {ROLES.map((r) => (
            <a
              key={r.id}
              href={`#${r.id}`}
              className="inline-flex h-8 items-center rounded-full border border-edge-2 px-4 text-[13px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-panel-2"
            >
              {r.title}
            </a>
          ))}
        </div>
      </header>

      {/* Why Cereal Milk / how we work */}
      <section aria-labelledby="how-heading" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="Why Cereal Milk"
            title={<span id="how-heading">A small team, a live product, an open body of work</span>}
            lede="Cereal Milk grew out of an engineering studio that shipped 62 projects for 68 venture funds, so the product was built inside the exact workflows it sells into. Funds are deployed by hand and the methods ship in the open. You'd be one of the first hires: real scope from day one, a direct line to the founder, and your name on the work."
          />
          <FeatureGrid cols={2} className="mt-10">
            {HOW.map((h) => (
              <FeatureCell key={h.name} title={h.name}>
                {h.detail}
              </FeatureCell>
            ))}
          </FeatureGrid>
        </div>
      </section>

      {/* Open roles */}
      <section aria-labelledby="roles-heading" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <SectionHeading
            kicker="Open roles"
            title={<span id="roles-heading">Two founding roles</span>}
          />
          <div className="mt-12 flex flex-col gap-px border border-edge bg-edge">
            {ROLES.map((role) => (
              <article
                key={role.id}
                id={role.id}
                className="scroll-mt-24 bg-bg p-8 sm:p-10 lg:p-12"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                  {/* Left rail: title, meta, apply */}
                  <div className="lg:w-[19rem] lg:shrink-0">
                    <h3 className="text-[22px] font-medium leading-tight text-ink">
                      {role.title}
                    </h3>
                    <p className="mt-3 font-mono text-[13px] text-ink-faint">
                      {role.location}
                    </p>
                    <p className="font-mono text-[13px] text-ink-faint">
                      {role.type}
                    </p>
                    <p className="mt-5 text-[15px] leading-relaxed text-ink-dim">
                      {role.summary}
                    </p>
                    <PillButton
                      href={applyHref(role)}
                      size="sm"
                      className="mt-6"
                    >
                      Apply for this role
                    </PillButton>
                  </div>

                  {/* Right: responsibilities + profile */}
                  <div className="flex-1 space-y-8">
                    <div>
                      <p className="font-mono text-[13px] text-ink-faint">
                        What you&rsquo;ll do
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {role.responsibilities.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-[15px] leading-relaxed text-ink-dim"
                          >
                            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-mono text-[13px] text-ink-faint">
                        You might be a fit if you
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {role.profile.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-[15px] leading-relaxed text-ink-dim"
                          >
                            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How to apply */}
      <section aria-labelledby="apply-heading" className="border-t border-edge">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:py-24">
          <div className="max-w-[46rem]">
            <SectionHeading
              kicker="How to apply"
              title={<span id="apply-heading">Send a note, not a cover letter</span>}
              lede="Email Daniel with which role fits you and one thing you've shipped that you're proud of: a repo, a piece of writing, an automation, anything real. The founder reads every one and replies personally."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <PillButton
                href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent(
                  "Cereal Milk · application"
                )}`}
              >
                Email {AUTHOR.email}
              </PillButton>
              <PillButton href="/contact" variant="secondary">
                Not sure you fit? Say hello
              </PillButton>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-6 pb-20">
        <div className="max-w-[46rem]">
          <Terminus source="careers" path="/careers" />
        </div>
      </div>
    </SiteShell>
  );
}
