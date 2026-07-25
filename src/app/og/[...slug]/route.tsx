import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pageByPath, type PageEntry } from "@/lib/registry";
import { AUTHOR, SITE_TAGLINE } from "@/lib/site";

// Registry-driven OG images: /og/home.png → "/", /og/work/x.png → "/work/x".
// Referenced by every page's metadata via src/lib/meta.ts (ogImagePath).
// Static Geist TTFs live in _fonts/ (satori cannot consume the variable
// woff2s the site itself uses). Template per VERCEL-GEIST-SPEC.md §6.11:
// pure black, Geist white wordmark, hairline rule.

export const runtime = "nodejs";

const BG = "#000000";
const INK = "#fafafa";
const INK_DIM = "#a1a1a1";
const EDGE = "#1f1f1f";

function resolveEntry(slug: string[]): PageEntry | undefined {
  if (!slug?.length) return undefined;
  const parts = [...slug];
  const last = parts[parts.length - 1];
  if (!last.endsWith(".png")) return undefined;
  parts[parts.length - 1] = last.slice(0, -".png".length);
  const path = "/" + parts.join("/");
  return pageByPath(path === "/home" ? "/" : path);
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await ctx.params;
  const entry = resolveEntry(slug);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  const [regular, semibold, markPng] = await Promise.all([
    readFile(join(process.cwd(), "src/app/og/_fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "src/app/og/_fonts/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/icon-512.png")),
  ]);
  // The brand mark (lime "80x") as a data URI, so every share card carries the
  // real logo instead of a plain text wordmark.
  const mark = `data:image/png;base64,${markPng.toString("base64")}`;

  // The founder-facing pages (/about, /careers, the demo funnel) get Dan's
  // face in the card footer instead of the tagline, so the share preview on
  // LinkedIn/X/Slack carries the person behind the founder-led motion. Other
  // sections keep the tagline.
  const isPost = entry.section === "company" || entry.section === "book";
  let face: string | null = null;
  if (isPost) {
    const buf = await readFile(join(process.cwd(), "public/daniel-hull-og.jpg"));
    face = `data:image/jpeg;base64,${buf.toString("base64")}`;
  }

  const label =
    entry.section === "home"
      ? "80x"
      : entry.section === "product"
        ? "Product"
        : entry.section === "book"
          ? "Book a demo"
          : entry.section.charAt(0).toUpperCase() + entry.section.slice(1);
  const titleSize = entry.title.length > 55 ? 54 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BG,
          padding: "64px 72px",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders to a static raster; next/image is not available here */}
          <img
            src={mark}
            alt="80x"
            width={72}
            height={72}
            style={{ borderRadius: 16 }}
          />
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: INK_DIM,
            }}
          >
            {label}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              maxWidth: 1000,
            }}
          >
            {entry.title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${EDGE}`,
            paddingTop: 28,
          }}
        >
          {isPost && face ? (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- satori renders to a static raster; next/image is not available here */}
              <img
                src={face}
                alt=""
                width={64}
                height={64}
                style={{ borderRadius: 64, border: `1px solid ${EDGE}` }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 26, fontWeight: 600, color: INK }}>
                  {AUTHOR.name}
                </div>
                <div style={{ fontSize: 22, color: INK_DIM }}>{AUTHOR.role}</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 26, color: INK_DIM }}>{SITE_TAGLINE}</div>
          )}
          <div style={{ fontSize: 26, fontWeight: 600, color: INK }}>80x.ai</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
      headers: {
        "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
