// Next.js 16 renamed `middleware` → `proxy` (same signature). This hosts Clerk
// and the markdown content negotiation.
//
// Rollout-safe: with NO Clerk keys the proxy is a passthrough (plus the .md
// rewrite), so the live (static) site is unaffected. With BOTH keys set, /get
// (the paid checkout) is protected, an unauthenticated hit bounces to /app
// (the product page), where the "Get 80x" sign-in modal lives. Set BOTH
// CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY together (the
// publishable key ALSO as a Vercel build-time env var).
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { PAGES } from "@/lib/registry";

const CLERK_ENABLED = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

const isProtected = createRouteMatcher(["/get(.*)"]);

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
    pathname.startsWith("/docs") ||
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

const proxy = CLERK_ENABLED
  ? clerkMiddleware(async (auth, req) => {
      const md = mdRewrite(req);
      if (md) return md;
      if (isProtected(req)) {
        await auth.protect({ unauthenticatedUrl: new URL("/app", req.url).toString() });
      }
    })
  : function proxy(req: NextRequest) {
      return mdRewrite(req) ?? NextResponse.next();
    };

export default proxy;

export const config = {
  // Clerk's recommended matcher: skip Next internals + static assets.
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
