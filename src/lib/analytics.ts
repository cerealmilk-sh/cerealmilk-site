// Typed wrapper over the global window.track() that public/consent-analytics.js
// installs once PostHog loads (on every visit, unless the visitor has opted
// out on /privacy). Safe to call anywhere: it no-ops on the server and before
// PostHog is up, and never throws into product code.

// The typed events fired via track(). The [data-track] attributes auto-captured
// by consent-analytics.js form the rest of the taxonomy: demo_cta_clicked
// (every Book-a-demo/Book-a-call pill, with {src}), demo_email_clicked (/demo
// email fallback), ribbon_get_app_clicked, whatsapp_message_clicked (the
// floating founder button), get_started_cta_clicked (every Get Cereal Milk pill, with
// {src}, now pointing at /download), and dmg_download_clicked (the /download
// page's DMG button; reinstated 2026-07-14 with the download-first funnel:
// the server-side dmg_download_requested in the DMG route is the ground
// truth, this is the client-side click).
export type AnalyticsEvent =
  | "inquiry_submitted" // /contact brief sent (the primary written lead)
  | "demo_request_submitted" // /demo form completed, visitor sent to Cal.com
  | "newsletter_subscribed" // Breakfast Club signup (any placement)
  | "preorder_started" // first focus on the /preorder reservation form
  | "preorder_submitted" // reservation posted, visitor sent to /preorder/thanks
  | "preorder_confirmed"; // /preorder/thanks rendered (the confirmation view)

export function track(
  event: AnalyticsEvent,
  props?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  window.track?.(event, props);
}

// Lead identification: forwards to window.setPerson(), which the loader wires
// to posthog.setPersonProperties() once PostHog is up. Call it at the moment a
// visitor self-identifies (types an email into a form) with only the fields
// they actually gave us: { email, name?, lead_source }. Because the loader
// runs PostHog with person_profiles: "identified_only", this call is what
// upgrades the anonymous visitor into a person profile; when they later sign
// identified users are merged into the anonymised lead journey
// that same person.
export function setPerson(props: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.setPerson?.(props);
}

declare global {
  interface Window {
    track?: (event: string, props?: Record<string, unknown>) => void;
    setPerson?: (props: Record<string, unknown>) => void;
    __cmAnalytics?: {
      optOut: () => void;
      optIn: () => void;
      isOptedOut: () => boolean;
    };
  }
}
