import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PostHog's ingest/decide endpoints are trailing-slash sensitive.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // cerealmilk.sh/docs is the Cereal Milk Docs site, a separate Vercel project
    // (cerealmilk/Cereal Milk-docs, built with base: '/docs') proxied under this domain.
    // The vercel.app URL is the project's stable production alias. These two
    // rules MUST stay first.
    return [
      { source: "/docs", destination: "https://Cereal Milk-docs.vercel.app/" },
      { source: "/docs/:path*", destination: "https://Cereal Milk-docs.vercel.app/:path*" },
      // cerealmilk.sh/sentry is the Skill Audit app, a separate Vercel project
      // (cerealmilk/skill-audit) served natively under /sentry, proxied here so it
      // lives on the apex domain for SEO. Keep the /sentry prefix on the upstream.
      { source: "/sentry", destination: "https://skill-audit-nine.vercel.app/sentry" },
      { source: "/sentry/:path*", destination: "https://skill-audit-nine.vercel.app/sentry/:path*" },
      // PostHog US ingest proxied under this domain so analytics survive
      // ad-blockers and the client never talks to posthog.com directly.
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  async redirects() {
    return [
      // --- The studio-site sunset (2026-07-09) ------------------------------
      // The site is product-first now; the studio pages (services, work,
      // writing, tools, the Fund Stack directory, videos, the teardown funnel)
      // are archived in git (branch archive/studio-site-2026-07-08, tag
      // studio-site-2026-07-08). Permanent so search equity consolidates on
      // the product pages.
      { source: "/app", destination: "/", permanent: true },
      { source: "/book", destination: "/demo", permanent: true },
      { source: "/services", destination: "/", permanent: true },
      { source: "/services/:slug*", destination: "/", permanent: true },
      { source: "/work", destination: "/about", permanent: true },
      { source: "/work/:slug*", destination: "/about", permanent: true },
      { source: "/writing", destination: "/", permanent: true },
      { source: "/writing/:slug*", destination: "/", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug*", destination: "/", permanent: true },
      { source: "/tools", destination: "/", permanent: true },
      { source: "/tools/:slug*", destination: "/", permanent: true },
      { source: "/stack", destination: "/", permanent: true },
      { source: "/stack.json", destination: "/openapi.json", permanent: true },
      { source: "/stack/:slug*", destination: "/", permanent: true },
      { source: "/videos", destination: "/", permanent: true },
      { source: "/videos/:slug*", destination: "/", permanent: true },
      { source: "/methodology", destination: "/about", permanent: true },
      { source: "/teardown", destination: "/demo", permanent: true },
      { source: "/mcp", destination: "/llms.txt", permanent: true },
      { source: "/prompts", destination: "/llms.txt", permanent: true },

      // --- Dormant product flows --------------------------------------------
      // The Clerk account/checkout/onboarding surfaces are not live yet; send
      // them to the download page. Temporary (307), these come back when
      // self-serve billing turns on.
      { source: "/account", destination: "/download", permanent: false },
      { source: "/get", destination: "/download", permanent: false },
      { source: "/onboard", destination: "/download", permanent: false },
      { source: "/sso-callback", destination: "/download", permanent: false },

      // NOTE: /download/CerealMilk.dmg is deliberately NOT redirected here anymore.
      // It's a route handler (src/app/download/CerealMilk.dmg/route.ts) that logs
      // every hit first-party and then redirects: to /download while
      // self-serve downloads are paused, to the latest release DMG when open
      // (the SELF_SERVE_DOWNLOADS flag in src/lib/site.ts). A config redirect
      // would shadow the route and downloads would go unlogged again.
    ];
  },
  async headers() {
    return [
      // The canonical host is cerealmilk.sh; keep the *.vercel.app deployment URLs
      // (production alias + previews) out of search indexes.
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.*\\.vercel\\.app)" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
