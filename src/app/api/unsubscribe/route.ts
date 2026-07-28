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
<svg width="44" height="44" viewBox="0 0 1024 1024" role="img" aria-label="Cereal Milk" style="display:inline-block;"><defs><linearGradient id="cmc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCDCDB"/><stop offset="0.12" stop-color="#DCDCDB"/><stop offset="0.12" stop-color="#ACAAA9"/><stop offset="1" stop-color="#969594"/></linearGradient><filter id="cms" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="9.7" stdDeviation="8.1" flood-color="#000000" flood-opacity="0.55"/></filter></defs><rect width="1024" height="1024" rx="164" ry="164" fill="#151110"/><g filter="url(#cms)"><rect x="426.4" y="156.1" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="156.1" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="426.4" y="246.2" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="246.2" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="336.3" y="336.3" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="426.4" y="336.3" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="336.3" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="606.6" y="336.3" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="246.2" y="426.4" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="336.3" y="426.4" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="426.4" y="426.4" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="426.4" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="606.6" y="426.4" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="696.7" y="426.4" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="246.2" y="516.5" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="336.3" y="516.5" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="426.4" y="516.5" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="516.5" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="606.6" y="516.5" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="696.7" y="516.5" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="246.2" y="606.6" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="336.3" y="606.6" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="426.4" y="606.6" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="606.6" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="606.6" y="606.6" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="696.7" y="606.6" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="246.2" y="696.7" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="336.3" y="696.7" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="426.4" y="696.7" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="696.7" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="606.6" y="696.7" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="696.7" y="696.7" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="246.2" y="786.8" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="336.3" y="786.8" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="426.4" y="786.8" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="516.5" y="786.8" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="606.6" y="786.8" width="81.1" height="81.1" fill="url(#cmc)"/><rect x="696.7" y="786.8" width="81.1" height="81.1" fill="url(#cmc)"/></g></svg>
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
