// Next.js 16 renamed `middleware` -> `proxy` (same signature).
// Hosts the markdown content negotiation for all registry pages.

import { NextResponse, type NextRequest } from "next/server";
import { PAGES } from "@/lib/registry";

// --- markdown mirrors ---------------------------------------------------------
// Every registry page is also served as clean markdown (see src/app/api/md/):
//   1. explicit suffix, GET /work/crm-notes-cleanup.md
//   2. content negotiation. GET /work/crm-notes-cleanup with
//      Accept: text/markdown
// Proxied subtrees (/docs, /sentry) handle their own formats and are skipped.

const STUDIO_PATHS = new Set(PAGES.map((p) => p.path));

function mdRewrite(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/sentry") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return null;
  }

  if (pathname.endsWith(".md")) {
    const base = pathname.slice(0, -".md".length) || "/index";
    const url = req.nextUrl.clone();
    url.pathname = `/api/md${base === "/" ? "/index" : base}`;
    return NextResponse.rewrite(url);
  }

  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/markdown")) {
    const page = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
    if (STUDIO_PATHS.has(page)) {
      const url = req.nextUrl.clone();
      url.pathname = `/api/md${page === "/" ? "/index" : page}`;
      const res = NextResponse.rewrite(url);
      res.headers.set("vary", "Accept");
      return res;
    }
  }

  return null;
}

export default function proxy(req: NextRequest) {
  return mdRewrite(req) ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
