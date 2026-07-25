"use client";

// The one client island in the Vercel kit: a quiet copy-to-clipboard button
// for MonoSnippet / CodeWindow. Renders fine from the server and degrades
// gracefully without JS (the button simply does nothing).

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cx } from "@/components/ui/cx";

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, stay quiet
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy to clipboard"
      title="Copy"
      className={cx(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-panel-2 hover:text-ink",
        className
      )}
    >
      {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
    </button>
  );
}
