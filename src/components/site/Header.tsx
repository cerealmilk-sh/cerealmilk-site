// The global header, reference anatomy: a sticky translucent h-14 bar with a
// hairline bottom, the logo left, then (desktop) a quiet text nav, a hairline
// divider, and the one brand-tinted Download CTA. Mobile gets the hamburger
// panel. Server component except the MobileMenu island.

import Link from "next/link";
import { BOOK_PATH, DOWNLOAD_PATH } from "@/lib/site";
import { DownloadCta } from "./DownloadCta";
import { Logo } from "./Logo";
import { MobileMenu, type MobileMenuGroup } from "./MobileMenu";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "Docs", href: "/docs" },
];

// The mobile panel gets the same destinations plus the company pages the
// desktop bar leaves to the footer.
const MOBILE_GROUPS: MobileMenuGroup[] = [
  {
    label: "Product",
    links: [
      { label: "Download", href: DOWNLOAD_PATH },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Book a demo", href: BOOK_PATH },
    ],
  },
  {
    label: "Who it's for",
    links: [
      { label: "Venture capital", href: "/for/venture-capital" },
      { label: "B2B startups", href: "/for/b2b-startups" },
      { label: "Service providers", href: "/for/service-providers" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex select-none items-center text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none"
              aria-label="80x · home"
            >
              <Logo size={28} />
            </Link>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <nav aria-label="Site" className="flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <DownloadCta href={`${DOWNLOAD_PATH}?src=header`} src="header" size="sm" />
            </div>
          </div>
          <div className="md:hidden">
            <MobileMenu
              groups={MOBILE_GROUPS}
              contactHref="/contact"
              bookHref={`${BOOK_PATH}?src=header`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
