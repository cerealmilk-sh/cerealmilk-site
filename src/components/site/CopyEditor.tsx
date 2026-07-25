"use client";

import { useCallback, useEffect, useState } from "react";

// Dev-only, localhost-only visual copy editor.
//
// Mounted once in the root layout. In a production build `process.env.NODE_ENV`
// is inlined to "production" and the component returns null before any hook that
// matters, so nothing ships to visitors. At runtime it also refuses to show
// unless the host is localhost, belt-and-suspenders for `next start` on a laptop.
//
// How it works: it never re-renders the page's copy itself. It finds every
// `[data-copy-id]` span (rendered by <T> in EditableCopy.tsx), toggles them
// contentEditable, and lets you type directly on the real layout. Save diffs each
// span's text against its data-copy-default and POSTs the changes to
// /api/dev/landing-content, which rewrites copy-overrides.json. Next's fast
// refresh then reloads the page from the new overrides. Publish commits the
// overrides file and deploys production via /api/dev/publish.

const IS_PROD = process.env.NODE_ENV === "production";
const EDIT_KEY = "Cereal Milk:copy-editing"; // survive the fast-refresh reload after Save

type Status = { kind: "idle" | "busy" | "ok" | "err"; msg: string; url?: string };

export function CopyEditor() {
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });

  // Gate to localhost after mount (avoids SSR/window issues and prod exposure).
  useEffect(() => {
    if (IS_PROD) return;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      // Intentional: gate the overlay on the post-hydration host so it never
      // renders during SSR or for real visitors. This one-time flip is the
      // correct place for it, hence the rule opt-out.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      if (sessionStorage.getItem(EDIT_KEY) === "1") setEditing(true);
    }
  }, []);

  // Toggle contentEditable on every editable span and reflect edit mode in the DOM.
  useEffect(() => {
    if (!mounted) return;
    const nodes = document.querySelectorAll<HTMLElement>("[data-copy-id]");
    nodes.forEach((n) => {
      if (editing) {
        n.setAttribute("contenteditable", "plaintext-only");
        n.dataset.copyEditable = "on";
      } else {
        n.removeAttribute("contenteditable");
        delete n.dataset.copyEditable;
      }
    });
    document.body.classList.toggle("copy-editing", editing);
    sessionStorage.setItem(EDIT_KEY, editing ? "1" : "0");

    if (!editing) return;

    // In edit mode, a click inside an editable that also sits inside a link or
    // button must place the caret, not navigate. Intercept in the capture phase.
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const editable = t?.closest?.("[data-copy-id]");
      if (!editable) return;
      const actionable = t?.closest?.("a,button");
      if (actionable && actionable.contains(editable)) {
        e.preventDefault();
        e.stopPropagation();
        (editable as HTMLElement).focus();
      }
    };
    const onInput = () => setDirty(true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("input", onInput, true);
    };
  }, [editing, mounted]);

  const collect = useCallback(() => {
    const changed: Record<string, string> = {};
    const cleared: string[] = [];
    document.querySelectorAll<HTMLElement>("[data-copy-id]").forEach((n) => {
      const id = n.getAttribute("data-copy-id");
      if (!id) return;
      const def = (n.getAttribute("data-copy-default") ?? "").trim();
      const cur = (n.textContent ?? "").replace(/\s+/g, " ").trim();
      if (cur && cur !== def) changed[id] = cur;
      else cleared.push(id); // reverted to default → drop any existing override
    });
    return { changed, cleared };
  }, []);

  const save = useCallback(async () => {
    setStatus({ kind: "busy", msg: "Saving…" });
    try {
      const res = await fetch("/api/dev/landing-content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(collect()),
      });
      if (!res.ok) throw new Error(await res.text());
      const { count } = (await res.json()) as { count: number };
      setDirty(false);
      setStatus({
        kind: "ok",
        msg: `Saved. ${count} override${count === 1 ? "" : "s"} on file. Reloading…`,
      });
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Save failed" });
    }
  }, [collect]);

  const publish = useCallback(async () => {
    if (dirty && !confirm("You have unsaved edits. Publish will deploy the last SAVED copy. Continue?")) {
      return;
    }
    setStatus({ kind: "busy", msg: "Publishing… building on Vercel (~1–2 min)…" });
    try {
      const res = await fetch("/api/dev/publish", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { liveUrl?: string; committed?: boolean };
      setStatus({
        kind: "ok",
        msg: data.committed ? "Published to cerealmilk.sh." : "Nothing new to publish.",
        url: data.liveUrl,
      });
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Publish failed" });
    }
  }, [dirty]);

  if (!mounted) return null;

  const color =
    status.kind === "err" ? "#ef4444" : status.kind === "ok" ? "#16a34a" : "#8a8f98";

  return (
    <div
      className="studio"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 2147483000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        fontFamily: "var(--font-ibm-plex-mono, ui-monospace, monospace)",
      }}
    >
      <style>{`
        body.copy-editing [data-copy-editable="on"] {
          outline: 1px dashed rgba(228,242,34,.7);
          outline-offset: 2px;
          border-radius: 2px;
          cursor: text;
          transition: background .1s;
        }
        body.copy-editing [data-copy-editable="on"]:hover { background: rgba(228,242,34,.10); }
        body.copy-editing [data-copy-editable="on"]:focus {
          outline: 2px solid rgba(228,242,34,1);
          background: rgba(228,242,34,.14);
        }
      `}</style>

      {editing && (status.msg || dirty) && (
        <div
          style={{
            maxWidth: 320,
            background: "#0b0b09",
            color,
            border: "1px solid #26262b",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            lineHeight: 1.4,
            boxShadow: "0 8px 30px rgba(0,0,0,.4)",
          }}
        >
          {status.msg || (dirty ? "Unsaved edits" : "")}
          {status.url && (
            <>
              {" "}
              <a href={status.url} target="_blank" rel="noreferrer" style={{ color: "#E4F222" }}>
                open →
              </a>
            </>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 6,
          background: "#0b0b09",
          border: "1px solid #26262b",
          borderRadius: 999,
          padding: 6,
          boxShadow: "0 8px 30px rgba(0,0,0,.4)",
        }}
      >
        {editing ? (
          <>
            <Btn onClick={save} disabled={status.kind === "busy"}>
              Save
            </Btn>
            <Btn onClick={publish} disabled={status.kind === "busy"} accent>
              Publish → cerealmilk.sh
            </Btn>
            <Btn onClick={() => setEditing(false)} ghost>
              Done
            </Btn>
          </>
        ) : (
          <Btn onClick={() => setEditing(true)} accent>
            Edit copy
          </Btn>
        )}
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  accent,
  ghost,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
  ghost?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: "none",
        border: ghost ? "1px solid #26262b" : "none",
        background: accent ? "#E4F222" : ghost ? "transparent" : "#1c1c20",
        color: accent ? "#0b0b09" : "#ededed",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 600,
        padding: "7px 14px",
        borderRadius: 999,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
