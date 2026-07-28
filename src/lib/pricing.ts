// Single source of truth for Cereal Milk pricing (see BILLING-MODEL.md in
// product-backend). Two plans, nothing to decipher: Starter for one person,
// Business for a team. Monthly or yearly, per user. Everything that states a
// price (the pricing page, the home page, llms.txt, the content mirrors)
// reads from here so the numbers can never drift.

import { DOWNLOAD_PATH } from "@/lib/site";

export type Plan = {
  id: "starter" | "business";
  name: string;
  /** One line: who it is for. */
  audience: string;
  /** Per user, per month. */
  monthly: number;
  /** Per user, per year (the yearly-billing total). */
  yearly: number;
  popular?: boolean;
  includes: string[];
  cta: { label: string; href: string };
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    audience: "One dealmaker: investors, founders, independents.",
    monthly: 30,
    yearly: 300,
    includes: [
      "WhatsApp in one fast desktop window (LinkedIn and Gmail next)",
      "AI agent beside every chat, on your own model account",
      "Snippets, command palette, one-click Markdown export",
      "Private by default: on-screen reads only",
    ],
    cta: { label: "Start free trial", href: `${DOWNLOAD_PATH}?src=pricing-starter` },
  },
  {
    id: "business",
    name: "Business",
    audience: "Your whole team, on one record.",
    monthly: 40,
    yearly: 396,
    popular: true,
    includes: [
      "Everything in Starter, for every seat",
      "Team workspace: one bill, per-seat invites",
      "Guided team setup on a call",
      "Guided setup and CRM mapping on a call",
    ],
    cta: { label: "Start free trial", href: `${DOWNLOAD_PATH}?src=pricing-business` },
  },
];

/** The two plans by id, for callers that need one plan's numbers. */
export const STARTER = PLANS[0];
export const BUSINESS = PLANS[1];

// The trial is granted at ACCOUNT CREATION, no card: download the app, sign
// in, and the backend auto-grants 7 days of full access (the signup trial in
// product-backend). A 7-day trial is included.
// (user-payer "starter", org-payer "business_org"), so someone who buys
// directly also trials first. TRIAL_NOTE quotes the Starter price for
// surfaces anchored on the Starter number (hero, ribbon).
export const TRIAL_DAYS = 7;
/** The honest trial line: free first, then the real price. */
export const TRIAL_NOTE = `Free for ${TRIAL_DAYS} days, then $${STARTER.monthly} a month`;
/** How the trial actually starts, one line (download page, FAQs, mirrors). */
export const TRIAL_MECHANIC = `Download the app and create your account: your ${TRIAL_DAYS}-day free trial of the full product starts right there, no card. When it ends, pick a plan inside the app.`;

/** The canonical one-line price summary (llms.txt, mirrors, FAQ). */
export const PRICE_LINE = `Two plans, per user: Starter $${STARTER.monthly} a month or $${STARTER.yearly} a year, Business $${BUSINESS.monthly} a month or $${BUSINESS.yearly} a year. Monthly or yearly, cancel anytime. No usage meters. Both plans start with a ${TRIAL_DAYS}-day free trial: download the app, create your account, and the trial starts, no card.`;

// The founding pre-order offer. A reservation, not a charge: no card is taken
// and no payment code runs until self-serve checkout goes live (the dormant
// download page is the entry point). The seat cap is a real commitment, not
// theater: every install is set up personally on a call, so founding
// onboarding capacity is genuinely limited, and the cap is honored by hand
// until checkout automation enforces it.
export const FOUNDING = {
  /** Founding-cohort seat cap, honored by hand. */
  seatCap: 100,
  /** What reserving locks in, one line. */
  lockLine: `Founding pricing locks at today's published rate: Starter $${STARTER.monthly}/user/mo, Business $${BUSINESS.monthly}/user/mo. It never rises for a founding seat.`,
};

/** The headline anchor shown where one number must stand for pricing. */
export const PRICE_ANCHOR = `$${STARTER.monthly}`;
export const PRICE_ANCHOR_UNIT = "/user/mo";
export const PRICE_ANCHOR_LINE = `Starter ${PRICE_ANCHOR} per user per month or $${STARTER.yearly} a year. Business $${BUSINESS.monthly} per user per month or $${BUSINESS.yearly} a year. Cancel anytime.`;
