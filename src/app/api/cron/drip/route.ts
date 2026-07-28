import { NextResponse } from "next/server";
import { tick } from "@/lib/drip/engine";

// Daily drip cron. Vercel Cron calls this on the schedule in vercel.json and, if
// CRON_SECRET is set, sends `Authorization: Bearer <CRON_SECRET>` automatically,
// so we require that header and the endpoint isn't publicly runnable. Any other
// scheduler (GitHub Action, uptime pinger, Fly machine) works the same way: hit
// this URL with the bearer token once a day.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // unconfigured → not runnable, by design
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await tick();
  console.log("[drip] cron tick", result);
  return NextResponse.json({ ok: true, ...result });
}

export const GET = run;
export const POST = run; // allow a manual POST trigger with the same secret
