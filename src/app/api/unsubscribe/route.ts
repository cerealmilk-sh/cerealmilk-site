import { NextResponse } from "next/server";
import { markUnsubscribed } from "@/lib/drip/engine";
import { hasUnsubSecret, verifyUnsubToken } from "@/lib/drip/unsub";

// One-click unsubscribe for the lifecycle emails. Backs both the visible
// "unsubscribe here" link (GET → confirmation page) and the RFC 8058
// List-Unsubscribe-Post header that Gmail/Yahoo call automatically (POST →
// 200). Marks the Resend contact as unsubscribed; rollout-safe if Resend
// isn't set.
//
// Links are HMAC-signed (`?e=<email>&t=<token>`, see src/lib/drip/unsub.ts).
// With a secret configured, an unsigned or badly-signed request performs no
// action and renders a neutral page, so garbage params can neither
// unsubscribe someone else nor fake a confirmation. With no secret set the
// endpoint keeps the legacy unsigned behavior so old links never break
// before the env var lands.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function unsubscribe(email: string) {
  // Mark the contact unsubscribed in the Resend audience (the mailing list).
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (key && audienceId) {
    try {
      const r = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`,
        {
          method: "PATCH",
          headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
          body: JSON.stringify({ unsubscribed: true }),
        }
      );
      if (!r.ok) console.error("[unsubscribe] resend responded", r.status, await r.text().catch(() => ""));
    } catch (err) {
      console.error("[unsubscribe] failed", err);
    }
  }

  // Also hard-stop any in-flight drip sequence for this contact. Independent of
  // the audience above (and a no-op if the drip store isn't configured).
  await markUnsubscribed(email).catch((err) => console.error("[unsubscribe] drip stop failed", err));
}

/** True when this request is allowed to unsubscribe `email`. */
function authorized(email: string, token: string): boolean {
  if (!EMAIL_RE.test(email)) return false;
  // Legacy mode: no secret configured yet, accept unsigned links.
  if (!hasUnsubSecret()) return true;
  return verifyUnsubToken(email, token);
}

function page(title: string, heading: string, body: string) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#ffffff;color:#1a1a1a;">
<div style="max-width:440px;margin:72px auto;padding:0 24px;text-align:center;">
<svg width="44" height="44" viewBox="0 0 1024 1024" shape-rendering="crispEdges" role="img" aria-label="Cereal Milk" style="display:inline-block;"><rect width="1024" height="1024" rx="164" ry="164" fill="#0a0a0a"/><rect x="292.6" y="219.4" width="73.1" height="73.1" fill="#c4a86a"/><rect x="512.0" y="146.3" width="73.1" height="73.1" fill="#c4a86a"/><rect x="658.3" y="292.6" width="73.1" height="73.1" fill="#c4a86a"/><rect x="146.3" y="438.9" width="731.4" height="73.1" fill="#318dff"/><rect x="146.3" y="512.0" width="731.4" height="73.1" fill="#ededed"/><rect x="219.4" y="585.1" width="585.1" height="73.1" fill="#ededed"/><rect x="292.6" y="658.3" width="438.9" height="73.1" fill="#ededed"/><rect x="365.7" y="731.4" width="292.6" height="73.1" fill="#a1a1a1"/><rect x="438.9" y="804.6" width="146.3" height="73.1" fill="#a1a1a1"/></svg>
<h1 style="margin:24px 0 0;font-size:20px;font-weight:700;letter-spacing:-0.02em;">${heading}</h1>
<p style="margin:10px 0 0;font-size:14.5px;line-height:1.6;color:#42474d;">${body}</p>
</div></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("e") ?? "";
  const token = url.searchParams.get("t") ?? "";

  if (!authorized(email, token)) {
    // Neutral, deliberately non-committal: no action was taken, and we don't
    // confirm or deny anything about the address.
    return page(
      "Unsubscribe",
      "That link didn't work.",
      'This unsubscribe link is invalid or has expired, so nothing was changed. Use the link from a recent email, or write to <a href="mailto:daniel@cerealmilk.sh" style="color:#0064ff;text-decoration:none;">daniel@cerealmilk.sh</a> and we\'ll take you off the list by hand.'
    );
  }

  await unsubscribe(email);
  return page(
    "Unsubscribed",
    "You're unsubscribed.",
    'You won\'t get any more emails from Cereal Milk. Changed your mind? <a href="https://cerealmilk.sh" style="color:#0064ff;text-decoration:none;">Rejoin anytime</a>.'
  );
}

export async function POST(req: Request) {
  // RFC 8058 one-click: the mail client POSTs to the List-Unsubscribe URL (the
  // email and token ride in the query string) with body
  // `List-Unsubscribe=One-Click`.
  const url = new URL(req.url);
  let email = url.searchParams.get("e") ?? "";
  const token = url.searchParams.get("t") ?? "";
  if (!email) {
    try {
      const form = await req.formData();
      email = String(form.get("e") ?? "");
    } catch {
      /* no form body */
    }
  }
  // Unauthorized posts return 200 with no action, neutral to the mail client.
  if (authorized(email, token)) {
    await unsubscribe(email);
  }
  return new NextResponse(null, { status: 200 });
}
