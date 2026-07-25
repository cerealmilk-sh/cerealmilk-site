import { SITE_URL } from "@/lib/site";

// /openapi.json, an OpenAPI 3.1 description of Cereal Milk's public *action* endpoints,
// so an agent (or any tool that ingests OpenAPI) can discover how to submit an
// inquiry or join the newsletter without scraping the site. Kept in sync by
// hand with the routes it documents:
//   POST/GET /api/inquiry   (src/app/api/inquiry/route.ts)
//   POST     /api/waitlist  (src/app/api/waitlist/route.ts)
//
// Static artifact: `info.version` is a hardcoded date, never `new Date()`.

export const dynamic = "force-static";

export function GET() {
  const doc = {
    openapi: "3.1.0",
    info: {
      title: "Cereal Milk public API",
      version: "2026-07-09",
      description:
        "The public action endpoints on cerealmilk.sh: submit an inquiry (a demo request, a fund pilot, a question) and join The Cereal Milk Field Notes. Cereal Milk is a native Mac app for venture investors that puts WhatsApp, LinkedIn, and Gmail in one window and syncs the conversations you choose to Attio or Affinity. Download the app at https://cerealmilk.sh/download (creating an account starts a 7-day free trial, no card); a walkthrough with the founder can be booked at https://cerealmilk.sh/demo.",
      contact: { name: "Cereal Milk", email: "daniel@cerealmilk.sh", url: `${SITE_URL}/contact` },
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/api/inquiry": {
        get: {
          operationId: "getInquiryContract",
          summary: "Describe the inquiry endpoint",
          description:
            "Returns this endpoint's own contract as JSON, so an agent that hits the URL learns how to POST without reading the docs.",
          responses: {
            "200": {
              description: "The endpoint contract.",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
        post: {
          operationId: "submitInquiry",
          summary: "Send a brief to Cereal Milk",
          description:
            "Emails the brief to the founder, who replies within one business day. Use it to request a demo or a fund pilot, or to ask about the app. The same endpoint the cerealmilk.sh/contact form posts to. Accepts JSON or form-encoded bodies.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Inquiry" },
              },
              "application/x-www-form-urlencoded": {
                schema: { $ref: "#/components/schemas/Inquiry" },
              },
              "multipart/form-data": {
                schema: { $ref: "#/components/schemas/Inquiry" },
              },
            },
          },
          responses: {
            "200": {
              description: "Accepted. JSON callers receive { ok: true }.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { ok: { type: "boolean" } },
                    required: ["ok"],
                  },
                },
              },
            },
            "303": {
              description:
                "Form (non-JSON) callers are redirected to /contact?sent=1.",
            },
            "400": {
              description: "A valid email and a message are both required.",
            },
          },
        },
      },
      "/api/waitlist": {
        post: {
          operationId: "joinNewsletter",
          summary: "Join The Cereal Milk Field Notes",
          description:
            "Adds an email to the Cereal Milk newsletter. One email when something ships: new releases, new capabilities, and field notes from the build. Accepts JSON or form-encoded bodies.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WaitlistSignup" },
              },
              "application/x-www-form-urlencoded": {
                schema: { $ref: "#/components/schemas/WaitlistSignup" },
              },
            },
          },
          responses: {
            "200": {
              description: "Accepted. JSON callers receive { ok: true }.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { ok: { type: "boolean" } },
                    required: ["ok"],
                  },
                },
              },
            },
            "303": {
              description:
                "Form (non-JSON) callers are redirected to /newsletter?subscribed=1.",
            },
            "400": { description: "A valid email is required." },
          },
        },
      },
    },
    components: {
      schemas: {
        Inquiry: {
          type: "object",
          required: ["email", "message"],
          properties: {
            name: { type: "string", description: "The sender's name." },
            email: {
              type: "string",
              format: "email",
              description: "A valid email Cereal Milk can reply to.",
            },
            firm: {
              type: "string",
              description:
                "The fund or firm, and which CRM it runs (Attio or Affinity).",
            },
            message: {
              type: "string",
              description:
                "What the sender needs: the problem and what a good outcome looks like.",
            },
            subscribe: {
              type: "boolean",
              description:
                "Opt in to The Cereal Milk Field Notes newsletter. Never auto-subscribed.",
            },
          },
        },
        WaitlistSignup: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "The email address to subscribe.",
            },
            name: { type: "string", description: "The subscriber's name." },
            source: {
              type: "string",
              description:
                "Where the signup came from (attribution). Defaults to \"waitlist\".",
            },
          },
        },
      },
    },
  };

  return new Response(JSON.stringify(doc, null, 2) + "\n", {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
