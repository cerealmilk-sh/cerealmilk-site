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
<svg width="44" height="44" viewBox="0 0 1024 1024" role="img" aria-label="Cereal Milk" style="display:inline-block;"><rect width="1024" height="1024" rx="164" ry="164" fill="#E4F222"/><g transform="matrix(0.438519,0,0,-0.438519,116.4563,667.6741)" fill="#0B0B09"><g transform="translate(0,0)"><path d="M300 -16Q182 -16 110.0 37.5Q38 91 38 194Q38 263 76.0 311.5Q114 360 179 381Q129 400 98.0 437.5Q67 475 67 530Q67 587 96.0 631.5Q125 676 177.5 701.0Q230 726 300 726Q370 726 422.5 701.0Q475 676 504.0 631.5Q533 587 533 530Q533 475 502.0 437.5Q471 400 420 381Q486 360 524.0 312.0Q562 264 562 194Q562 91 490.0 37.5Q418 -16 300 -16ZM300 438Q339 438 362.5 458.5Q386 479 386 521Q386 558 362.5 579.0Q339 600 300 600Q261 600 237.5 579.0Q214 558 214 521Q214 479 237.5 458.5Q261 438 300 438ZM300 110Q348 110 382.0 132.5Q416 155 416 208Q416 259 385.5 288.0Q355 317 300 317Q245 317 214.5 288.0Q184 259 184 208Q184 155 218.0 132.5Q252 110 300 110Z"/></g><g transform="translate(600,0)"><path d="M300 -16Q220 -16 162.5 29.0Q105 74 74.5 157.0Q44 240 44 354Q44 469 74.5 552.5Q105 636 162.5 681.0Q220 726 300 726Q380 726 437.5 681.0Q495 636 525.5 552.5Q556 469 556 354Q556 240 525.5 157.0Q495 74 437.5 29.0Q380 -16 300 -16ZM190 354Q190 291 199 243L368 562Q341 600 300 600Q248 600 219.0 538.5Q190 477 190 354ZM300 110Q352 110 381.0 171.0Q410 232 410 354Q410 418 401 467L232 148Q259 110 300 110Z"/></g><g transform="translate(1200,0)"><path d="M34 0 224 274 42 536H190L300 367L409 536H557L378 274L566 0H419L300 183L182 0Z"/></g></g></svg>
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
