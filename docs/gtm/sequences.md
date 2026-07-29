# Cereal Milk · Full lifecycle email copy

Every email below is sent in the founder's voice, from
`Daniel Hull at Cereal Milk` with reply-to `daniel@cerealmilk.sh`. The renderer
automatically prepends the greeting (`Hi {first name},` or `Hey,`) and appends
the sign-off (`Cheers, / Daniel / Founder, Cereal Milk`) and a one-click
unsubscribe footer (omitted on the transactional acks). Those are omitted here
to keep the copy readable. Links are shown as **[label](url)**. Prices render
from `src/lib/pricing.ts` at send time; the numbers below are today's.

Source of truth: `src/lib/drip/sequences.ts` (drips),
`src/app/api/waitlist/route.ts` (Day-0 welcomes + preorder confirmation), and
`src/app/api/inquiry/route.ts` (inquiry/demo acks). Rewritten 2026-07-29 to the
"messenger built for AI agents" positioning (WhatsApp today, LinkedIn and Gmail
next, agent on your own model account); the old WhatsApp+LinkedIn/CRM-sync copy
and the five-email AI-spend course (dead `/docs` links) were retired the same
day.

---

## Day 0 · Product welcome (inline on product signup)

**Subject:** Welcome to Cereal Milk (start here)

I'm Daniel, founder of Cereal Milk. Thanks for signing up. It genuinely means a
lot.

Cereal Milk is the messenger built for AI agents: WhatsApp in one fast desktop
window with an AI agent beside every chat, running on your own Claude, ChatGPT,
Gemini, or OpenAI-compatible account. It summarises threads, pulls out
commitments, and drafts replies you send yourself. LinkedIn and Gmail are next.

The good news: there's nothing to wait for. The app is live for Mac and
Windows, and creating your account starts a free 7-day trial of the full
product, no card.

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

And if Cereal Milk isn't the right fit, just hit reply and tell me why.
Whatever's holding you back genuinely shapes what we build next.

## Day 0 · Field Notes welcome (inline on newsletter signup)

**Subject:** You're on The Cereal Milk Field Notes

I'm Daniel, founder of Cereal Milk. We make the Cereal Milk desktop app: the
messenger built for AI agents. It puts WhatsApp in one fast window, with an AI
agent beside every chat that runs on your own model account. LinkedIn and Gmail
are next.

You'll get one email when something new ships: a new release, a new capability,
or a field note from the build. No schedule, no filler: if nothing shipped, you
hear nothing.

In the meantime: how funds run it is at cerealmilk.sh/for/venture-capital, and
pricing is published in full at cerealmilk.sh/pricing.

**[See Cereal Milk on your own pipeline →](https://cerealmilk.sh/demo)**

And if the conversations that pay you happen somewhere Cereal Milk doesn't
reach yet, hit reply and tell me. I read everything.

## Day 0 · Pre-order confirmation (inline on /preorder reservation)

**Subject:** Your Cereal Milk founding seat is reserved

I'm Daniel, founder of Cereal Milk. Your founding seat is reserved: no charge
was made, and none will be until your seat is set up and you decide to keep it.

You locked the {Starter $30/user/mo or $300/yr · Business $40/user/mo or
$396/yr} plan at today's published rate. It never rises for a founding seat,
and you can switch plans before setup.

What happens next: founding installs are set up first, personally, on a call
with me. You'll get an email from me shortly with a link to pick your setup
time. We do install, accounts, and your agent's model connection together in
about 30 minutes, and it's free to try after the call either way.

No need to wait for the call to look around: the app is live for Mac and
Windows at cerealmilk.sh/download, and creating your account starts a free
7-day trial, no card.

Change your mind anytime before setup: just reply to this email and the
reservation is gone, no questions.

And if someone you trade deals with should be in the founding cohort too, send
them cerealmilk.sh/preorder. Seats are capped at 100, and a forward from you
beats anything I could write.

---

## Nurture (N1–N6), anchor: signup

### N1 · Day +2 · Where your best deals go to die

Quick one. The best conversation you had this week probably happened in a
WhatsApp thread, and to every AI tool you use, it doesn't exist.

The deck that arrives in a thread about padel. The intro that lands between the
small talk. The terms agreed across three apps and closed on a call. That's the
real pipeline, and it's invisible to your agents, so a few weeks later someone
rebuilds it from memory, or nobody does.

That's the gap Cereal Milk closes: WhatsApp in one fast desktop window with an
AI agent beside every chat, running on your own Claude, ChatGPT, or Gemini
account. It summarises the thread, pulls out the commitments, and drafts the
follow-up for you to send. LinkedIn and Gmail are next.

It's live now, and the full product is free for 7 days, no card:

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

Where do your deals actually happen: WhatsApp, LinkedIn, email? Hit reply and
tell me; it genuinely shapes what we build next.

### N2 · Day +4 · Will this get my WhatsApp number banned?

The first thing people ask me about Cereal Milk: will this get my number
banned? Fair question. Your number carries a decade of relationships, and most
"WhatsApp AI" tools genuinely put it at risk.

They ride reverse-engineered APIs and scraped sockets, and when WhatsApp
notices, it's your number that gets banned. Cereal Milk uses none of it.

Under the hood it's the official web.whatsapp.com running inside a hardened
desktop browser shell, so to WhatsApp you look like an ordinary browser.
Nothing bulk-sends, automates, or scrapes in the background. The agent's drafts
land in the composer, and you always hit send yourself.

Try it on your own number, free for a week, no card:

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

Still sceptical? Reply with the sharpest version of the question and I'll
answer it straight.

### N3 · Day +7 · An agent that reads one chat, not your life

Your WhatsApp is your life, not just your deal flow. So the agent in Cereal
Milk is built around one rule: it reads only the chat you have open, and only
when you ask.

It never enumerates your chats or scrolls history in the background. And it
runs on the model account you connect, your own Claude, ChatGPT, Gemini, or
OpenAI-compatible endpoint, so what it reads goes to your own provider under
your own agreement. Cereal Milk runs no model of its own, and your
conversations never flow through servers of ours.

The padel banter, the contact who vents, the thing someone told you in
confidence: none of it is the agent's business, so none of it is in reach.
That's not a privacy policy, it's how the product is wired.

**[How the privacy model works →](https://cerealmilk.sh/security)**

Or just see it on your own machine, free for a week:

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

### N4 · Day +10 · A day in the Cereal Milk cockpit

Here's what using Cereal Milk actually feels like.

WhatsApp lives in one fast window that never reloads. ⌘K runs everything:
switch chats, ask the agent, drop a snippet, export a thread, without touching
the mouse. ⌘⇧S turns the open conversation into clean Markdown, ready for your
notes, your CRM, or whatever agent you point at it.

The agent sits beside the chat: summarise the thread, pull out the commitments,
draft the reply in your voice. Drafts land in the composer, you always hit
send. And it speaks MCP, so it can use the tools your stack already exposes
(your CRM, your notes, your calendar), with every write staged as a proposal
you review.

It's the client a power user would build for themselves. Yours is a download
away:

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

### N5 · Day +14 · Lock your price while we're small

Cereal Milk is priced simply: Starter $30 per user a month or $300 a year,
Business $40 a month for teams. Every plan starts with a 7-day free trial, no
card.

But if you already know chat is where your work lives, there's a better deal.
The founding cohort is capped at 100 seats. Reserving one costs nothing today,
no card, and locks your pricing at today's published rate for as long as you
keep the seat. It never rises for a founding seat, and your install is set up
personally on a call with me.

**[Reserve your founding seat →](https://cerealmilk.sh/preorder)**

Or start with the free trial and decide later:

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

Either way, reply with whatever's holding you back. I read every one.

### N6 · Day +21 · Should I keep you on the list?

I don't want to clutter your inbox, so this is the last you'll hear from me
unless you'd like otherwise.

If Cereal Milk still sounds useful (WhatsApp in one fast window, an AI agent
beside every chat on your own model account, and the deals in your DMs finally
within reach of your tools), the whole product is free for 7 days, no card:

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

And if it's not the right fit, just hit reply and tell me why. Whatever's
holding you back genuinely shapes what we build next. Either way, thanks for
the time.

---

## Activation (A1–A6), anchor: account creation (`converted`)

### A1 · Day +0 · You're in: your Cereal Milk trial starts now

You're in: welcome to Cereal Milk, and thank you. Your account is live and your
7-day free trial of the full product started the moment you created it. No
card, nothing to cancel.

If the app isn't on this machine yet, grab it here (Mac and Windows):

**[Download Cereal Milk for Mac or Windows →](https://cerealmilk.sh/download)**

Here's the week in three small steps: connect WhatsApp and your model today,
ask the agent one real thing tomorrow, and by the end of the week the deals in
your DMs are finally within reach of your tools.

I'll send a couple of short notes to walk you through it. Reply to any of
them; they come to my real inbox.

### A2 · Day +1 · Two connections and you're live *(skips if `whatsapp_connected`)*

Once Cereal Milk is open, there are exactly two connections to make, and both
take about a minute.

One: scan the WhatsApp QR with your phone, the same way you would for WhatsApp
Web. It's the official web client in a hardened shell, so your session stays
live in one fast window that never reloads.

Two: connect your model. Claude and ChatGPT use the sign-in you already have;
Gemini and OpenAI-compatible endpoints take an API key. That puts the agent
beside every chat, running on your own account.

And that's all the setup there is. Nothing syncs anywhere, and the agent reads
only the chat you have open, when you ask.

### A3 · Day +2 · Ask the agent one thing today *(skips if `first_insight`)*

Here's the one action that makes Cereal Milk click. Open the thread that
actually matters this week (a live deal, a warm intro, a client going quiet)
and ask the agent for the summary.

Watch it read just that thread and hand back the state of play: what was
agreed, who owes whom what, and the follow-up drafted in your voice. The draft
lands in the composer, so the whole loop is one keystroke, and then you hit
send.

That's the moment the product earns its keep: the low-grade dread that
something, somewhere, went unanswered starts to go.

If the answer comes back off-key, tell me. Reply with what you asked and what
you got, and I'll tune it or show you a better prompt.

### A4 · Day +4 · ⌘K, ⌘⇧S, and the rest of the cockpit *(skips if `first_sync`)*

A few keystrokes that turn Cereal Milk from a chat window into a cockpit.

⌘K is the command palette: every action in the app, fuzzy-searched. ⌘⇧S
exports the open chat as clean Markdown, ready to paste into your notes, your
CRM, or any agent you run. Snippets take variables and land in the composer on
any channel, and you still hit send.

And if your stack speaks MCP, add your servers (your CRM, your notes, your
calendar) and the agent can use their tools right beside the chat, with every
write staged as a proposal you review before anything changes.

Try the export on a thread you'd normally rebuild from memory. That's the
habit that compounds.

### A5 · Day +6 · Your trial wraps up tomorrow

An honest heads-up: tomorrow is day 7, the last day of your free trial.

If Cereal Milk has earned its place, keeping it is simple: Starter is $30 per
user a month or $300 a year, Business for teams is $40 a month. Pick a plan
inside the app, monthly or yearly, cancel anytime, no usage meters.

If you're not sure yet, that's useful too: reply and tell me what's missing,
and if you just need more time, say so and I'll extend your trial. I'd rather
you decide with a real answer than a countdown.

### A6 · Day +10 · How's Cereal Milk feeling?

You've had Cereal Milk for a week and a half now, how's it feeling?

Mostly I want to hear what isn't working: the chat the agent misread, the
keystroke you reached for that wasn't there, the channel you need next.
LinkedIn and Gmail are on the way, and where they land in the queue is
genuinely shaped by these replies.

What would make Cereal Milk the first thing you open in the morning? Reply and
tell me. I read everything, and the good ones ship.

---

## Transactional acks (inline from /api/inquiry, no unsubscribe footer)

### Demo request ack

**Subject:** Your Cereal Milk demo: pick a time

Got your demo request, thank you. It's 30 minutes on a screen-share with me, on
your own pipeline: bring the threads where your deals actually happen and we'll
put an agent next to them live.

If you haven't picked a slot yet (or the calendar didn't load), here's the
direct link:

**[Book your 30 minutes →](https://cal.com/danieljh/30min)**

Anything you want the demo to cover, just reply to this email; it comes
straight to my real inbox.

### Contact inquiry ack

**Subject:** Got your message

Thanks for writing in. Your message landed in my real inbox (no ticket queue
here), and I reply personally within one business day.

If it's time-sensitive, reply to this email with URGENT in the subject and
I'll get to it first.
