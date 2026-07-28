"use client";

// Three quiet, agent-facing controls for content pages: copy the page as clean
// markdown, or hand it to Claude / ChatGPT with a ready-made prompt. The `.md`
// mirror is the same body served at <path>.md and in /llms-full.txt, so what an
// assistant reads is exactly what a human reads, no HTML chrome. Renders fine
// from the server and degrades without JS: the two "Open in…" controls are
// plain links, and the copy button simply does nothing.

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { cx } from "@/components/ui/cx";

export function AgentActions({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const mdUrl = `${SITE_URL}${path}.md`;
  const prompt = `Read ${mdUrl} and help me apply it.`;

  async function copyMarkdown() {
    try {
      // Same-origin .md mirror; the proxy serves it (see src/proxy.ts).
      const res = await fetch(`${path}.md`, {
        headers: { accept: "text/markdown" },
      });
      await navigator.clipboard.writeText(await res.text());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // fetch or clipboard unavailable, stay quiet
    }
  }

  const item =
    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-ink-faint transition-colors hover:bg-panel-2 hover:text-ink";

  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-1 font-mono",
        className
      )}
    >
      <button
        type="button"
        onClick={copyMarkdown}
        className={item}
        title="Copy this page as Markdown"
        aria-label="Copy this page as Markdown"
      >
        {copied ? (
          <Check size={13} strokeWidth={2} />
        ) : (
          <Copy size={13} strokeWidth={2} />
        )}
        {copied ? "Copied" : "Copy as Markdown"}
      </button>
      <a
        href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`}
        target="_blank"
        rel="noopener"
        className={item}
      >
        Open in Claude <span aria-hidden>↗</span>
      </a>
      <a
        href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}
        target="_blank"
        rel="noopener"
        className={item}
      >
        Open in ChatGPT <span aria-hidden>↗</span>
      </a>
    </div>
  );
}
