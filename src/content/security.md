How Cereal Milk keeps your number, your accounts, and your conversations safe: no unofficial APIs, on-screen reads only, you always hit send, and an AI agent that runs on your own model account. This page states plainly what the app does, what it never does, and where the honest limits are.

## No unofficial APIs

Most "WhatsApp CRM" tools drive your account through a reverse-engineered client: a fake phone or a scripted browser that logs in as you and pulls your message history through an API WhatsApp never published. That is what gets numbers banned.

Cereal Milk does none of that. Under the hood it is the official WhatsApp Web running inside a hardened desktop browser shell, pinned to a standard desktop browser identity; LinkedIn and Gmail follow the same design as they ship. There is no Baileys, no whatsapp-web.js, no LinkedIn Voyager scraping, and no WhatsApp Business API. To the services you use, Cereal Milk is a browser, because under the hood it is one.

## Human-shaped by design

The safety model is behavioral, not just technical. Every risky thing an automation could do, Cereal Milk structurally cannot:

- **Nothing happens until you act.** The app reads the open chat only when you ask it to, and reads nothing in the background. It never enumerates your chats or scrolls your history.
- **You always send.** Snippets and AI compose insert text into the composer. The send button is yours. Cereal Milk has no code path that sends a message on your behalf.
- **No bulk actions.** No broadcast, no sequence, no scheduled sends, no scraping. One human, one chat, one deliberate action at a time.

## The agent runs on your account, not ours

Every conversation stays yours. The AI agent beside your chats runs on the model account you connect, Claude, ChatGPT, Gemini, or any OpenAI-compatible endpoint, so what it reads is covered by your own agreement with that provider. It reads only the chat you have open, and only when you ask; it never enumerates your chats or scrolls history in the background. Its writes are staged as proposals you review, and drafts land in the composer for you to send.

What leaves the app is exactly what you chose: a thread exported as clean Markdown in one click, or a tool call the agent proposed and you approved.

## Your credentials and your data

- You sign in to WhatsApp, LinkedIn, and Gmail directly with each service, inside the webview. Cereal Milk never sees or stores those passwords.
- The app authenticates to the Cereal Milk backend with a token stored in the macOS Keychain.
- Agent tool calls go through one audited path: MCP, with writes staged as proposals you review before anything changes.
- Your conversations live where they always did: on your phone and with the services themselves. Cereal Milk's servers store your account identity, and nothing else.

## Distribution you can verify

Cereal Milk ships as a signed, notarized Mac DMG and a Windows installer, with auto-update over a checksummed feed from a public releases repository. [Download it](/download) and the install page walks every step, including the one-time macOS approval; not the Mac App Store, because Apple rejects apps that wrap another company's web service. Prefer to be set up in person? [Book a demo](/demo) and the founder does it with you.

## Does Cereal Milk train AI on my data?

No. Cereal Milk has no model of its own to train. The agent runs on the model account you bring, Claude, ChatGPT, Gemini, or any OpenAI-compatible endpoint, so your messages are covered by your own agreement with that provider. Your conversations stay on your machine and with the services themselves.

## The honest limits

- Wrapping any web app sits in a terms-of-service gray area. The human-shaped design keeps Cereal Milk the lowest-risk client there is, but the claim is low-risk, not zero-risk.
- The on-screen reader rides the official web clients' changing markup, so occasionally a feature needs an update after WhatsApp or LinkedIn redesigns. Auto-update ships those fixes the day they land.

Questions we have not answered here: [contact us](/contact) or [book a demo](/demo) and ask them live.
