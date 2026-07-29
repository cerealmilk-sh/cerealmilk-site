# Cereal Milk · Marketing broadcasts (The Breakfast Club)

Ready-to-send one-off emails for The Breakfast Club list, in the same voice and
format as the lifecycle emails: plain-text-first, founder-signed, one idea per
email, reply-forward. Broadcasts are sent through Resend Broadcasts to the
audience (`RESEND_AUDIENCE_ID`), which needs the full-access API key; until
that lands these are copy, not code.

Sending checklist, every time:

- From: `Daniel Hull at Cereal Milk <daniel@updates.cerealmilk.sh>` (or the
  verified apex until the updates. subdomain is verified). Reply-to
  `daniel@cerealmilk.sh`.
- Resend Broadcasts injects unsubscribe handling; keep the footer line and use
  the `{{{RESEND_UNSUBSCRIBE_URL}}}` merge tag in both parts.
- The Breakfast Club promise is "one email when something ships, no filler". If
  the broadcast doesn't announce something real, don't send it.
- No em dashes. Prices come from `src/lib/pricing.ts`; check before sending.

---

## B1 · Launch: Cereal Milk is live

**Subject:** Cereal Milk is live for Mac and Windows
**Preheader:** WhatsApp in one fast window, an AI agent beside every chat, free for 7 days.

Hey,

Something real shipped: Cereal Milk is live, for Mac and Windows.

If you're new to it, Cereal Milk is the messenger built for AI agents. Your
deals happen in chat, and chat is the one surface your AI tools can't touch.
Cereal Milk fixes that: WhatsApp in one fast desktop window, an AI agent beside
every chat that summarises the thread, pulls out the commitments, and drafts
the follow-up for you to send. LinkedIn and Gmail are next.

Three things worth knowing:

It runs on your own model account: Claude, ChatGPT, Gemini, or any
OpenAI-compatible endpoint. We run no model of our own, and your conversations
never flow through servers of ours.

It won't risk your number: the official WhatsApp Web in a hardened desktop
shell, no reverse-engineered APIs, and you always hit send yourself.

It exports anything: ⌘⇧S turns the open thread into clean Markdown for your
notes, your CRM, or whatever agent you point at it.

The full product is free for 7 days, no card: download it, create your
account, and the trial starts.

Download for Mac or Windows: https://cerealmilk.sh/download

Rolling out a team, or want a walkthrough first? Book 30 minutes on your own
pipeline: https://cerealmilk.sh/demo

Cheers,
Daniel
Founder, Cereal Milk

You're in The Breakfast Club, the Cereal Milk list at cerealmilk.sh. If you'd rather not
hear from me, unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

## B2 · Release notes (template)

**Subject:** Cereal Milk {version}: {the headline capability, in plain words}
**Preheader:** {One sentence: what you can do today that you couldn't last week.}

Hey,

Something new shipped, so you're hearing from me.

{One short paragraph: the headline change, written as what it does for the
reader, not what we built. Lead with the moment they'd notice it: "the agent
now...", "⌘K now...", "threads now...".}

{Two or three more items, one line each, same rule: verb first, user first.}

{If the release changes a promise (privacy, pricing, channels): state it
plainly in its own paragraph. Never bury it.}

The app updates itself within a few hours; to get it now, {menu path or
download link}. New here? The full product is free for 7 days, no card:
https://cerealmilk.sh/download

{One closing line inviting a reply about the change itself, e.g. "First thing
you asked the agent after updating? Tell me, I read everything."}

Cheers,
Daniel
Founder, Cereal Milk

You're in The Breakfast Club, the Cereal Milk list at cerealmilk.sh. If you'd rather not
hear from me, unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

## B3 · Win-back: since you last looked

For the segment that signed up but never downloaded (or went quiet before the
first agent moment). Send sparingly, and only when there is genuinely news.

**Subject:** Cereal Milk grew up since you last looked
**Preheader:** The agent got sharper, and the trial is still free.

Hey,

You signed up for Cereal Milk a while back and then life happened, so here's
the honest 30-second catch-up.

Cereal Milk is the messenger built for AI agents: WhatsApp in one fast desktop
window, an agent beside every chat that summarises threads, pulls out
commitments, and drafts replies in your voice, on your own Claude, ChatGPT, or
Gemini account. Since you last looked it's gotten faster, the export cleaner,
and the agent speaks MCP, so it can use your CRM, notes, and calendar tools
right beside the chat. LinkedIn and Gmail are next.

What hasn't changed: it reads only the chat you have open, when you ask, and
it never touches an unofficial API, so your number stays yours.

The full product is still free for 7 days, no card:

Download for Mac or Windows: https://cerealmilk.sh/download

And if you looked and walked away for a reason, I'd genuinely like to know
what it was. Hit reply, one line is plenty.

Cheers,
Daniel
Founder, Cereal Milk

You're in The Breakfast Club, the Cereal Milk list at cerealmilk.sh. If you'd rather not
hear from me, unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}
