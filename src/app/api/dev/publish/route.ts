import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const dynamic = "force-dynamic";

// Dev-only "Publish": commits the edited landing copy, pushes it (for history),
// then deploys to Vercel production via the CLI. NEVER runs in production (the
// deployed site is static and has no git tree / CLI anyway). Scoped to
// content.json on purpose: publishing copy never sweeps in unrelated changes.
//
// We deploy via the CLI rather than relying on Vercel's git-push integration so
// publishing works without the GitHub↔Vercel connection. Once that connection is
// added, the push above would also auto-deploy, harmless either way.

const execFileAsync = promisify(execFile);
const CONTENT = "src/components/site/copy-overrides.json";
// The live product domain. This repo's .vercel link points at the "Cereal Milk" project,
// and the cerealmilk team owns it, so we deploy with --scope cerealmilk to project Cereal Milk.
const LIVE_URL = "https://cerealmilk.sh";

async function git(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd: process.cwd(),
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trim();
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Disabled in production", { status: 403 });
  }

  try {
    const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
    await git(["add", "--", CONTENT]);

    // `diff --cached --quiet` exits non-zero (rejects) when content.json has
    // staged changes → commit them. Exit 0 (resolves) → nothing new to commit.
    let committed = false;
    try {
      await git(["diff", "--cached", "--quiet", "--", CONTENT]);
    } catch {
      await git(["commit", "-m", `copy: update landing copy (${new Date().toISOString()})`, "--", CONTENT]);
      committed = true;
    }

    const sha = await git(["rev-parse", "--short", "HEAD"]);

    // Best-effort push for git history (won't fail the publish if it can't push).
    try {
      await execFileAsync("git", ["push", "origin", "HEAD"], {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024,
      });
    } catch {
      /* offline / no upstream, the CLI deploy below is the source of truth */
    }

    // Deploy the working tree to production. Builds remotely (~1–2 min).
    const deploy = await execFileAsync("vercel", ["deploy", "--prod", "--yes", "--scope", "cerealmilk"], {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 50 * 1024 * 1024,
    });
    const deploymentUrl = (deploy.stdout.match(/https?:\/\/[^\s"',]+/) ?? [])[0] ?? null;

    return NextResponse.json({ ok: true, committed, sha, branch, deploymentUrl, liveUrl: LIVE_URL });
  } catch (err) {
    const e = err as { stderr?: string; message?: string };
    return new NextResponse(e.stderr?.toString() || e.message || "Publish failed", { status: 500 });
  }
}
