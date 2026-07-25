How 80x keeps your number, your accounts, and your conversations safe: no unofficial APIs, on-screen reads only, you always hit send, and a server-enforced privacy gate on CRM sync. This page states plainly what the app does, what it never does, and where the honest limits are.

## No unofficial APIs

Most "WhatsApp CRM" tools drive your account through a reverse-engineered client: a fake phone or a scripted browser that logs in as you and pulls your message history through an API WhatsApp never published. That is what gets numbers banned.

80x does none of that. Under the hood it is the official WhatsApp Web, LinkedIn, and Gmail running inside Apple's WebKit, the same engine as Safari, pinned to a desktop Safari identity. There is no Baileys, no whatsapp-web.js, no LinkedIn Voyager scraping, and no WhatsApp Business API. To the services you use, 80x is a browser, because under the hood it is one.

## Human-shaped by design

The safety model is behavioral, not just technical. Every risky thing an automation could do, 80x structurally cannot:

- **Nothing happens until you act.** The app reads the open chat only when you ask it to, and reads nothing in the background. It never enumerates your chats or scrolls your history.
- **You always send.** Snippets and AI compose insert text into the composer. The send button is yours. 80x has no code path that sends a message on your behalf.
- **No bulk actions.** No broadcast, no sequence, no scheduled sends, no scraping. One human, one chat, one deliberate action at a time.

## The privacy gate is on the server

Every conversation starts private, including imported history. Sharing is a deliberate act: a whole thread, or a single message. The gate that decides what may reach your CRM is enforced server-side, so even a client bug could not leak a private thread. A private message is refused before a note is ever created: not hidden, not filtered after the fact, refused at the write.

What does sync is exactly what you chose: timestamped, attributed, deduplicated by a sync key so a thread is one clean note in Attio or Affinity rather than thirteen ragged duplicates.

## Your credentials and your data

- You sign in to WhatsApp, LinkedIn, and Gmail directly with each service, inside the webview. 80x never sees or stores those passwords.
- The app authenticates to the 80x backend with a token stored in the macOS Keychain.
- CRM writes go through one audited path, the same contract the 80x browser extension uses, with the privacy gate applied to both.
- Your conversations live where they always did: on your phone and with the services themselves. 80x stores what you chose to sync, and nothing else.

## Distribution you can verify

80x ships as a DMG with Sparkle auto-update over an EdDSA-signed feed, from a public releases repository. [Download it](/download) and the install page walks every step, including the one-time macOS approval; not the Mac App Store, because Apple rejects apps that wrap another company's web service. Prefer to be set up in person? [Book a demo](/demo) and the founder does it with you.

## The honest limits

- Wrapping any web app sits in a terms-of-service gray area. The human-shaped design keeps 80x the lowest-risk client there is, but the claim is low-risk, not zero-risk.
- The on-screen reader rides the official web clients' changing markup, so occasionally a feature needs an update after WhatsApp or LinkedIn redesigns. Auto-update ships those fixes the day they land.

Questions we have not answered here: [contact us](/contact) or [book a demo](/demo) and ask them live.
