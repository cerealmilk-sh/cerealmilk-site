// The studio page frame: `.studio` skin (the Vercel/Geist palette + Geist
// type, see globals.css), its own scroll container (the body is
// overflow-hidden site-wide), the global Header/Footer, and a skip link.
// Every studio page renders inside one of these; /app and the product flows
// keep their original self-contained chrome.

import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio bcl-scroll h-dvh overflow-x-hidden overflow-y-auto bg-bg text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
