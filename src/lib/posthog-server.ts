import { PostHog } from "posthog-node";

// Shared server-side PostHog client for API route event capture.
// Uses the same project key as the client-side setup in consent-analytics.js.
// Guards against a missing key: returns null so callers can skip capture
// without breaking the request.

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let _client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (!KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, " +
          "this causes events to be silently missed. " +
          "This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured"
      );
    }
    return null;
  }
  if (!_client) {
    _client = new PostHog(KEY, {
      host: HOST,
      flushAt: 1,
      flushInterval: 0,
    });
    if (process.env.NODE_ENV === "development") {
      _client.debug(true);
    }
  }
  return _client;
}
