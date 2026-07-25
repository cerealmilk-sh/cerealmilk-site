// A small, deterministic Markdown renderer for studio content pages.
//
// Content pages author their body ONCE as a colocated .md file (see
// src/content/). The same source renders as styled HTML here AND is served
// verbatim at the page's `.md` mirror and inside /llms-full.txt, so the human
// page and the machine page can never drift. Deliberately a subset: if a page
// needs more than this, it should be a hand-written JSX page (like the
// original Scout essay) with a hand-maintained markdown mirror.
//
// Supported: ## h2 / ### h3 (with stable slug ids), paragraphs, - and 1.
// lists, > blockquotes, ``` code fences, | tables |, ![images](src) on their
// own line, **bold**, *italic*, `code`, [links](href).

import React from "react";
import Link from "next/link";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_[\]()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// --- inline markdown ---------------------------------------------------------

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(INLINE_RE);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const external = /^https?:\/\//.test(href) && !href.startsWith("https://cerealmilk.sh");
      return external ? (
        <a key={key} href={href} rel="noopener">
          {label}
        </a>
      ) : (
        <Link key={key} href={href.replace(/^https:\/\/Cereal Milk\.ai/, "")}>
          {label}
        </Link>
      );
    }
    return part;
  });
}

// --- block markdown ----------------------------------------------------------

type Block =
  | { kind: "h2" | "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "quote"; lines: string[] }
  | { kind: "code"; lang: string; lines: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "img"; alt: string; src: string };

export function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push({ kind: "code", lang, lines: code });
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ kind: "quote", lines: quote });
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, "").trim());
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
    if (img) {
      blocks.push({ kind: "img", alt: img[1], src: img[2] });
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const parseRow = (row: string) =>
        row
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const header = parseRow(tableLines[0]);
      const rows = tableLines
        .slice(1)
        .filter((r) => !/^\|[\s:-|]+\|$/.test(r.replace(/\s/g, "")))
        .map(parseRow);
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    // Paragraph, join consecutive plain lines.
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{2,3} |[-*] |\d+\. |> |\||```|!\[)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }

  return blocks;
}

export function renderMarkdown(md: string): React.ReactNode {
  const blocks = parseBlocks(md);
  return blocks.map((block, bi) => {
    const key = `b${bi}`;
    switch (block.kind) {
      case "h2": {
        const id = slugify(block.text);
        return (
          <h2 key={key} id={id}>
            {renderInline(block.text, key)}
          </h2>
        );
      }
      case "h3": {
        const id = slugify(block.text);
        return (
          <h3 key={key} id={id}>
            {renderInline(block.text, key)}
          </h3>
        );
      }
      case "p":
        return <p key={key}>{renderInline(block.text, key)}</p>;
      case "ul":
        return (
          <ul key={key}>
            {block.items.map((item, li) => (
              <li key={li}>{renderInline(item, `${key}-${li}`)}</li>
            ))}
          </ul>
        );
      case "ol":
        return (
          <ol key={key}>
            {block.items.map((item, li) => (
              <li key={li}>{renderInline(item, `${key}-${li}`)}</li>
            ))}
          </ol>
        );
      case "quote":
        return (
          <blockquote key={key}>
            {block.lines.map((l, li) => (
              <p key={li}>{renderInline(l, `${key}-${li}`)}</p>
            ))}
          </blockquote>
        );
      case "code":
        return (
          <pre key={key} data-lang={block.lang || undefined}>
            <code>{block.lines.join("\n")}</code>
          </pre>
        );
      case "img":
        // Plain <img>: diagram dimensions vary and the sources are local SVGs,
        // so next/image buys nothing here.
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={block.src}
            alt={block.alt}
            loading="lazy"
            // bg-white in BOTH themes: the diagram SVGs are transparent with
            // dark strokes and would vanish on a dark background.
            className="my-6 w-full rounded-2xl border border-edge bg-white p-2"
          />
        );
      case "table":
        return (
          <table key={key}>
            <thead>
              <tr>
                {block.header.map((h, hi) => (
                  <th key={hi}>{renderInline(h, `${key}-h${hi}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell, `${key}-${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  });
}
