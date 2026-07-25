// Email transport + rendering for the lifecycle sequences (and the waitlist
// welcome). Plain-text-first: every send is a multipart message whose text part
// is the real note and whose html part mirrors it 1:1 with no template, just a
// system font, so it still reads as a personal email while letting a CTA be a
// real link. Rollout-safe: with no RESEND_API_KEY it logs and reports false,
// never throws.

import { SITE_URL } from "@/lib/site";
import { unsubUrlFor } from "./unsub";
import type { SequenceId } from "./types";

// One canonical host for every email link, the same apex origin the rest of
// the site uses (sitemap, robots, JSON-LD). Imported from lib/site so links can
// never drift onto a different host; if the domain moves, it changes there once.
export const SITE_ORIGIN = SITE_URL;
export const DOWNLOAD_URL = `${SITE_ORIGIN}/download`;
export const PREORDER_URL = `${SITE_ORIGIN}/preorder`;
// The AI-spend course lives on the docs site (served under /docs via the apex
// proxy). Every course email links its chapters back here.
export const AI_SPEND_COURSE_URL = `${SITE_ORIGIN}/docs/learn/ai-spend`;

// From a Resend-verified sending domain; replies route to the real inbox. Both
// overridable via env, no code change (same vars the welcome email already used).
const FROM = process.env.WAITLIST_EMAIL_FROM || "Daniel Hull <daniel@updates.cerealmilk.sh>";
const REPLY_TO = process.env.WAITLIST_EMAIL_REPLY_TO || "daniel@cerealmilk.sh";

// A block is either a paragraph (string) or a CTA link line. Steps describe
// their body as blocks; the renderer turns the same blocks into both text and
// html, so the two parts can never drift.
export type Block = string | { label: string; href: string };

function isLink(b: Block): b is { label: string; href: string } {
  return typeof b !== "string";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface RenderCtx {
  firstName?: string;
  unsubUrl: string;
  sequence: SequenceId | "welcome";
}

function greeting(firstName?: string) {
  return firstName ? `Hi ${firstName},` : "Hey,";
}

// The footer adapts to who's getting the mail: a waitlist subscriber vs. a
// paying customer in onboarding. Unsub link is always present.
function footerLine(ctx: RenderCtx) {
  if (ctx.sequence === "course")
    return "You signed up for the free Optimize Your Fund's AI Spend email course at cerealmilk.sh.";
  return ctx.sequence === "activation"
    ? "You're getting this because you signed up for Cereal Milk."
    : "You're on the Cereal Milk waitlist at cerealmilk.sh.";
}

export function renderText(blocks: Block[], ctx: RenderCtx): string {
  const lines: string[] = [greeting(ctx.firstName), ""];
  for (const b of blocks) {
    if (isLink(b)) {
      // Bare URL on its own line: clients auto-link it, and it keeps the text
      // part looking like a note, not a marketing email.
      lines.push(b.href);
    } else {
      lines.push(b);
    }
    lines.push("");
  }
  lines.push("Cheers,", "Daniel", "Founder, Cereal Milk", "");
  lines.push(`${footerLine(ctx)} If you'd rather not hear from me, unsubscribe: ${ctx.unsubUrl}`);
  return lines.join("\n");
}

export function renderHtml(blocks: Block[], ctx: RenderCtx): string {
  const p = "margin:0 0 16px;font-size:15px;line-height:1.62;color:#1a1a1a;";
  const body = blocks
    .map((b) =>
      isLink(b)
        ? `  <p style="${p}"><a href="${b.href}" style="color:#0064ff;font-weight:600;text-decoration:none;">${esc(b.label)}</a></p>`
        : `  <p style="${p}">${esc(b)}</p>`
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <p style="${p}">${esc(greeting(ctx.firstName))}</p>
${body}
  <p style="${p}">Cheers,<br>Daniel<br>Founder, Cereal Milk</p>
  <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">${esc(footerLine(ctx))} If you'd rather not hear from me, <a href="${ctx.unsubUrl}" style="color:#6b7280;">unsubscribe here</a>.</p>
</body>
</html>`;
}

export function firstNameOf(name?: string) {
  return (name ?? "").split(/\s+/).filter(Boolean)[0] || undefined;
}

interface SendArgs {
  to: string;
  subject: string;
  blocks: Block[];
  firstName?: string;
  sequence: SequenceId | "welcome";
}

// The single Resend send path used by the welcome email and every drip step.
// Returns true on a 2xx, false otherwise (caller decides whether to record the
// step as sent). Best-effort: never throws.
export async function sendEmail({ to, subject, blocks, firstName, sequence }: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[drip] RESEND_API_KEY unset, would send "${subject}" to ${to}`);
    return false;
  }
  const unsubUrl = unsubUrlFor(to);
  const ctx: RenderCtx = { firstName, unsubUrl, sequence };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        reply_to: REPLY_TO,
        to: [to],
        subject,
        text: renderText(blocks, ctx),
        html: renderHtml(blocks, ctx),
        // RFC 8058 one-click unsubscribe, keeps Gmail/Yahoo happy; the visible
        // link in the footer works too.
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>, <mailto:${REPLY_TO}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    if (!r.ok) {
      console.error("[drip] resend responded", r.status, await r.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[drip] send failed", err);
    return false;
  }
}
