/*
 * cerealmilk.sh, shared consent + analytics loader
 * ------------------------------------------------------------------
 * ONE file, served from the apex (https://cerealmilk.sh/consent-analytics.js) and
 * loaded by every Cereal Milk surface: the landing (Next), /docs (Astro), and
 * /sentry (static). Because /docs and /sentry are reverse-proxied under the
 * apex, all three are same-origin, so a single consent choice in
 * localStorage governs the whole site.
 *
 * What it does:
 *   1. Shows a GDPR consent banner the first time someone visits.
 *   2. Loads PostHog ONLY after "Accept": no cookies, no session replay,
 *      no network calls to PostHog until the visitor opts in. "Decline" is
 *      remembered and nothing loads. After consent, session replay IS
 *      recorded (all form inputs masked), as disclosed in the banner and
 *      in /privacy.
 *   3. Reverse-proxies PostHog through /ingest (configured in the landing's
 *      next.config.ts) so ad-blockers and corporate networks don't drop the
 *      data.
 *   4. Exposes window.track(event, props) for named conversion events, and
 *      auto-fires an event for any element with a [data-track] attribute.
 *
 * SETUP (one edit): paste your PostHog *project* key below. It is a public,
 * client-side key (like a Stripe publishable key), safe to commit. Create a
 * free project at https://us.posthog.com (US cloud, the project's data
 * region). Until the key is replaced, this file is completely inert:
 * no banner, no tracking, the sites behave exactly as before.
 */
(function () {
  "use strict";

  // ---- CONFIG ---------------------------------------------------------------
  var POSTHOG_KEY = "phc_vwBzqqZUjnEEpuqQhMqPgCkaC9iqWokmSWKp4FSH29jW";
  var CONSENT_KEY = "cereal-milk-consent"; // localStorage: "granted" | "denied"
  var UI_HOST = "https://us.posthog.com"; // toolbar/app host (US cloud)
  var PRIVACY_URL = "/privacy";
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

  // A no-op tracker until (and unless) PostHog is actually loaded, so callers
  // can always use window.track(...) without guarding.
  if (!window.track) {
    window.track = function () {};
  }
  // Same deal for window.setPerson(props): a no-op until PostHog is live, so
  // forms can always call it without guarding.
  if (!window.setPerson) {
    window.setPerson = function () {};
  }

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      /* private mode / storage disabled, proceed for this session only */
    }
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
      // Rich, zero-code capture, all still consent-gated and first-party via /ingest:
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

  // ---- Consent banner --------------------------------------------------------
  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-live", "polite");
    wrap.setAttribute("aria-label", "Privacy consent");
    wrap.id = "x-consent";
    wrap.innerHTML =
      '<style>' +
      "#x-consent{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:520px;margin-left:auto;" +
      "font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" +
      "background:#0b0b0c;color:#e9e9ea;border:1px solid rgba(255,255,255,.14);border-radius:16px;" +
      "box-shadow:0 12px 40px rgba(0,0,0,.45);padding:18px 18px 16px;line-height:1.5;" +
      "animation:xci .28s ease both}" +
      "@keyframes xci{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
      "@media (prefers-reduced-motion:reduce){#x-consent{animation:none}}" +
      "#x-consent p{margin:0;font-size:13.5px;color:#c7c7c9}" +
      "#x-consent a{color:#fff;text-decoration:underline;text-underline-offset:2px}" +
      "#x-consent .x-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}" +
      "#x-consent button{font:inherit;font-size:13px;font-weight:600;border-radius:999px;padding:8px 16px;cursor:pointer;border:1px solid transparent}" +
      "#x-consent .x-accept{background:#fff;color:#0b0b0c}" +
      "#x-consent .x-accept:hover{opacity:.9}" +
      "#x-consent .x-decline{background:transparent;color:#e9e9ea;border-color:rgba(255,255,255,.22)}" +
      "#x-consent .x-decline:hover{background:rgba(255,255,255,.08)}" +
      "</style>" +
      "<p><strong style=\"color:#fff;font-weight:600\">A note on privacy.</strong> " +
      "Cereal Milk uses privacy-friendly analytics (including session replays with all form inputs masked) " +
      "to understand how the site is used and improve it. Nothing loads until you choose. " +
      'See the <a href="' + PRIVACY_URL + '">privacy &amp; cookies policy</a>.</p>' +
      '<div class="x-row">' +
      '<button type="button" class="x-accept">Accept</button>' +
      '<button type="button" class="x-decline">Decline</button>' +
      "</div>";

    function dismiss() {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }
    wrap.querySelector(".x-accept").addEventListener("click", function () {
      setConsent("granted");
      dismiss();
      loadPostHog();
    });
    wrap.querySelector(".x-decline").addEventListener("click", function () {
      setConsent("denied");
      dismiss();
    });
    return wrap;
  }

  function showBanner() {
    function mount() {
      if (document.getElementById("x-consent")) return;
      document.body.appendChild(buildBanner());
    }
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount, { once: true });
  }

  // ---- Boot ------------------------------------------------------------------
  var consent = getConsent();
  if (consent === "granted") {
    loadPostHog();
  } else if (consent === "denied") {
    /* respect the prior choice, load nothing */
  } else {
    showBanner();
  }

  // Let other code (e.g. a "privacy settings" link) re-open the banner or
  // change the choice: window.__xConsent.reset() clears and re-prompts.
  window.__xConsent = {
    reset: function () {
      try {
        localStorage.removeItem(CONSENT_KEY);
      } catch (e) {}
      if (window.posthog && window.posthog.opt_out_capturing) {
        try {
          window.posthog.opt_out_capturing();
        } catch (e) {}
      }
      showBanner();
    },
    grant: function () {
      setConsent("granted");
      loadPostHog();
    },
  };
})();
