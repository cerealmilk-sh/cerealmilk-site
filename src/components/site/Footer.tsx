// The global footer, reference anatomy: a hairline top, then a four-track
// grid: the brand column (logo, social icons, the © line) and three link
// columns (Company / Resources / Legal). External links carry a small ↗.
// The independence disclaimer stays as a quiet bottom line; it is copy the
// site must ship regardless of skin.

import Link from "next/link";
import { GITHUB_ORG_URL, SITE_NAME, YOUTUBE_URL } from "@/lib/site";
import { Logo } from "./Logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Download", href: "/download" },
      { label: "Book a demo", href: "/demo" },
      { label: "llms.txt", href: "/llms.txt" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Security", href: "/security" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

function ExternalArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="h-2.5 w-2.5 text-muted-foreground transition-colors group-hover:text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
    </svg>
  );
}

const SOCIALS: { label: string; href: string; d: string }[] = [
  {
    label: "GitHub",
    href: GITHUB_ORG_URL,
    // Simple mark: the octocat silhouette (Simple Icons path).
    d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    label: "YouTube",
    href: YOUTUBE_URL,
    d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:gap-x-20">
          <div className="col-span-2 flex flex-col gap-6 md:col-span-1">
            <Link
              href="/"
              aria-label="80x · home"
              className="inline-block w-fit text-foreground transition-colors hover:text-foreground/80"
            >
              <Logo size={30} />
            </Link>
            <div className="-ml-2 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  rel="noopener"
                  aria-label={s.label}
                  className="p-1 text-muted-foreground transition-colors hover:text-foreground sm:p-2"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 {SITE_NAME}. All rights reserved.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">{col.title}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) =>
                  link.href.startsWith("http") ||
                  link.href.startsWith("mailto:") ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        rel="noopener"
                        className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                        <ExternalArrow />
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <p className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
            80x is an independent product. It runs the official WhatsApp Web,
            LinkedIn, and Gmail inside a native macOS app and is not affiliated
            with, endorsed by, or sponsored by WhatsApp, Meta, LinkedIn,
            Microsoft, Google, Attio, or Affinity. Your conversations stay
            private until you choose to share them.
          </p>
        </div>
      </div>
    </footer>
  );
}
