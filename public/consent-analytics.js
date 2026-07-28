/*
 * cerealmilk.sh, shared analytics loader
 * ------------------------------------------------------------------
 * ONE file, served from the apex (https://cerealmilk.sh/consent-analytics.js)
 * and loaded by every Cereal Milk surface. All surfaces are same-origin under
 * the apex, so they share one dataset and one opt-out choice.
 *
 * What it does:
 *   1. Loads PostHog on every visit (no consent banner; analytics is on by
 *      default). Session replay is recorded with all form inputs masked, as
 *      disclosed in /privacy.
 *   2. Honors an opt-out: /privacy exposes a toggle wired to
 *      window.__cmAnalytics, which uses PostHog's own persisted
 *      opt_out_capturing() so the choice sticks across visits.
 *   3. Reverse-proxies PostHog through /ingest (configured in the landing's
 *      next.config.ts) so ad-blockers and corporate networks don't drop the
 *      data.
 *   4. Exposes window.track(event, props) for named conversion events, and
 *      auto-fires an event for any element with a [data-track] attribute.
 *
 * SETUP: the layout injects window.__CM_POSTHOG_KEY from
 * NEXT_PUBLIC_POSTHOG_KEY (a public client-side key, like a Stripe
 * publishable key). No key = this file is completely inert.
 */
(function () {
  "use strict";

  // ---- CONFIG ---------------------------------------------------------------
  var POSTHOG_KEY = window.__CM_POSTHOG_KEY || ""; // injected by the layout from NEXT_PUBLIC_POSTHOG_KEY; empty = analytics off
  var LEGACY_CONSENT_KEY = "cereal-milk-consent"; // pre-2026-07-29 banner choice, migrated below
  var UI_HOST = "https://us.posthog.com"; // toolbar/app host (US cloud)
  // --------------------------------------------------------------------------

  // Bail out entirely if the key hasn't been set yet, or on non-browser / bot
  // contexts. Keeps the sites fully functional with zero analytics until ready.
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!POSTHOG_KEY || POSTHOG_KEY.indexOf("REPLACE_ME") !== -1) {
    // Not an error, just not configured yet.
    if (window.console && console.info) {
      console.info("[Cereal Milk analytics] PostHog key not set, analytics disabled.");
    }
    return;
  }

  // A no-op tracker until PostHog is actually loaded, so callers can always
  // use window.track(...) without guarding.
  if (!window.track) {
    window.track = function () {};
  }
  // Same deal for window.setPerson(props): a no-op until PostHog is live, so
  // forms can always call it without guarding.
  if (!window.setPerson) {
    window.setPerson = function () {};
  }

  // ---- PostHog ---------------------------------------------------------------
  // Standard PostHog array-stub loader, pointed at the /ingest reverse proxy.
  function loadPostHog() {
    if (window.posthog && window.posthog.__loaded) return;

    !(function (t, e) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1]));
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.crossOrigin = "anonymous"),
            (p.async = !0),
            (p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js"),
            (o = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, o);
          var u = e;
          for (
            void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
              u.people = u.people || [],
              u.toString = function (t) {
                var e = "posthog";
                return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
              },
              u.people.toString = function () {
                return u.toString(1) + ".people (stub)";
              },
              p =
                "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(
                  " "
                ),
              r = 0;
            r < p.length;
            r++
          )
            g(u, p[r]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
    })(document, window.posthog || []);

    // The reverse-proxy path. next.config.ts maps:
    //   /ingest/static/*  -> us-assets.i.posthog.com/static/*  (array.js loader)
    //   /ingest/*         -> us.i.posthog.com/*                (events, decide)
    // The stub above rewrites ".i.posthog.com" -> "-assets.i.posthog.com" for
    // the asset host; with a relative "/ingest" that transform is a no-op, so
    // array.js is fetched from /ingest/static/array.js as intended.
    window.posthog.init(POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: UI_HOST,
      defaults: "2025-05-24",
      person_profiles: "identified_only",
      capture_pageview: "history_change", // SPA-safe (Next App Router pushState)
      capture_pageleave: true,
      autocapture: true,
      // Rich, zero-code capture, all first-party via /ingest:
      capture_heatmaps: true, // click / scroll / rageclick maps for every page
      capture_dead_clicks: true, // clicks on non-interactive elements = UX friction signal
      capture_exceptions: true, // JS error tracking on the live site (PostHog Error Tracking)
      capture_performance: { web_vitals: true, network_timing: true }, // Core Web Vitals into PostHog
      persistence: "localStorage+cookie",
      // Cookie scoped to .cerealmilk.sh (not host-only) so the anonymous distinct_id is
      // shared with the signed-in app at app.cerealmilk.sh. When a visitor later signs
      // in there, posthog.identify(clerkUserId) merges this pre-signup journey
      // into their identified person, one profile end to end.
      cross_subdomain_cookie: true,
      disable_session_recording: false,
      session_recording: {
        // Never record what people type into forms, mask all inputs.
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
      loaded: function (ph) {
        // Swap the no-op tracker for the real one now that PostHog is live.
        window.track = function (event, props) {
          try {
            ph.capture(event, props || {});
          } catch (e) {
            /* never let analytics throw into product code */
          }
        };
        // Lead identification: attaches person properties (email, name) to
        // the visitor's anonymous profile when they self-identify in a form
        // (demo request, newsletter, preorder). With person_profiles set to
        // "identified_only" above, THIS call is what upgrades an anonymous
        // lead into a person profile. When that visitor later signs in at
        // app.cerealmilk.sh, the Clerk identify() there merges this named lead
        // journey into one person end to end.
        window.setPerson = function (props) {
          try {
            ph.setPersonProperties(props || {});
          } catch (e) {
            /* never let analytics throw into product code */
          }
        };
      },
    });
  }

  // ---- Named events + [data-track] delegation --------------------------------
  // Any element (even server-rendered, no React needed) can fire an event:
  //   <a href="mailto:…" data-track="book_email_clicked">Email Dan</a>
  // Optional payload via data-track-props='{"plan":"pro"}'.
  document.addEventListener(
    "click",
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest("[data-track]") : null;
      if (!el) return;
      var name = el.getAttribute("data-track");
      if (!name) return;
      var props = {};
      var raw = el.getAttribute("data-track-props");
      if (raw) {
        try {
          props = JSON.parse(raw);
        } catch (err) {
          /* ignore malformed payloads */
        }
      }
      if (window.track) window.track(name, props);
    },
    true
  );

  // ---- Boot ------------------------------------------------------------------
  loadPostHog();

  // Migrate the old banner-era choice: a stored "denied" becomes a persisted
  // PostHog opt-out (kept by PostHog itself in localStorage/cookie), then the
  // legacy key is dropped either way.
  try {
    var legacy = localStorage.getItem(LEGACY_CONSENT_KEY);
    if (legacy === "denied") {
      window.posthog.opt_out_capturing();
    }
    if (legacy !== null) {
      localStorage.removeItem(LEGACY_CONSENT_KEY);
    }
  } catch (e) {
    /* private mode / storage disabled */
  }

  // The /privacy opt-out toggle. PostHog persists the choice itself via
  // opt_out_capturing / opt_in_capturing, so no extra storage is needed.
  window.__cmAnalytics = {
    optOut: function () {
      try {
        window.posthog.opt_out_capturing();
      } catch (e) {}
    },
    optIn: function () {
      try {
        window.posthog.opt_in_capturing();
      } catch (e) {}
    },
    isOptedOut: function () {
      try {
        return !!(
          window.posthog &&
          window.posthog.has_opted_out_capturing &&
          window.posthog.has_opted_out_capturing()
        );
      } catch (e) {
        return false;
      }
    },
  };
})();
