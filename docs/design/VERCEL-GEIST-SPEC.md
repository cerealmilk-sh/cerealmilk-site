# VERCEL-GEIST-SPEC: the Cereal Milk web presence design system (2026-07-02)

This is the **single source of truth** for the Vercel/Next.js-style revamp of
cerealmilk.sh (the `~/cereal-milk-site` Next.js site) and cerealmilk.sh/docs (the `~/Cereal Milk-docs`
Astro/Starlight site). Every agent working on the revamp reads this file first
and treats it as the contract. The goal: a visitor should think "this could be
a Vercel property": the same restraint, the same grid discipline, the same
typography: while every word of copy, every URL, and every machine surface
stays exactly as it is today.

Reference material: Vercel's AI SDK marketing page (ai-sdk.dev / vercel.com/ai),
the Vercel Resources mega-menu, and nextjs.org/docs. Geist is the design
language: https://vercel.com/geist.

---

## 1. Design philosophy (what makes it "Vercel")

1. **Pure black, hairline grid.** Marketing surfaces are `#000`. Structure comes
   from 1px hairline borders that bound content into cells: not from cards,
   shadows, or background tints. Sections are separated by full-width
   hairlines; feature grids are collapsed-border cells; the content column can
   draw vertical hairlines at its edges.
2. **Crosshair markers.** Small `+` glyphs sit at grid intersections /
   section-cell corners (decorative, `aria-hidden`). Use sparingly: one or two
   per section, at real grid intersections.
3. **Typography carries the brand.** Geist Sans everywhere; Geist Mono for
   labels, kickers, filenames, table-cells, badges, and anything "technical".
   Headlines are semibold (600) with tight tracking, never black/800 weight.
4. **Monochrome first, blue on purpose.** Text is white→gray ramp. The only
   chromatic color on a page: the Geist blue for links/active states, and
   syntax-highlight pink/green/violet inside code windows. Buttons are
   white-on-black (dark) / black-on-white (light) pills.
5. **Left-aligned, generous, calm.** Hero and section headers are left-aligned.
   Vertical padding is generous (96–160px). No decorative gradients, no glows,
   no rounded-2xl soft-UI cards on marketing pages.
6. **Everything looks engineered.** `$ npm i`-style mono snippets, code windows
   with traffic-light dots, `[NEW]`-style mono badges, bordered kbd chips.

## 2. Color tokens

The landing site themes through `--cm-*` indirection variables mapped to
Tailwind tokens in `@theme` (see §6 gotchas). Re-point values; keep the
architecture. **Dark is the default theme** (first visit with no stored
preference = dark).

### Dark (default): the marketing look
| Token (bc) | Value | Geist role |
|---|---|---|
| `--cm-bg` | `#000000` | page background |
| `--cm-bg-2` | `#0a0a0a` | raised background (code windows, wells) |
| `--cm-panel` | `#0a0a0a` | surface |
| `--cm-panel-2` | `#111111` | surface hover / inset |
| `--cm-panel-3` | `#1a1a1a` | strongest surface |
| `--cm-panel-hover` | `#111111` | hover fill |
| `--cm-edge` | `#1f1f1f` | structural hairlines (section/grid) |
| `--cm-edge-2` | `#333333` | interactive borders (inputs, secondary buttons, code windows) |
| `--cm-ink` | `#ededed` | primary text |
| `--cm-ink-dim` | `#a1a1a1` | secondary text (ledes, body) |
| `--cm-ink-faint` | `#6f6f6f` | tertiary (labels, captions) |
| `--cm-ink-ghost` | `#3f3f3f` | disabled / line numbers / crosshairs |
| `--cm-accent` | `#ffffff` | primary action (white pill) |
| `--cm-accent-bright` | `#ffffff` |, |
| `--cm-accent-dim` | `#cccccc` | pressed pill |
| `--cm-accent-deep` | `#1a1a1a` | tinted fill |
| `--cm-accent-ink` | `#000000` | text on primary pill |
| `--cm-blue` (NEW) | `#52a8ff` | links, active nav/sidebar states |
| `--cm-blue-dim` (NEW) | `#0070f3` | blue fills / focus ring base |
| `--cm-danger` | `#e5484d` | errors |

Heading color may go brighter than ink: `#fafafa` is fine for h1/h2 (use
`text-white`-adjacent utility or the ink token; do not invent more grays).

### Light (mirror: kept for the theme toggle)
bg `#ffffff`, bg-2 `#fafafa`, panel `#fafafa`, panel-2 `#f2f2f2`, panel-3
`#ebebeb`, panel-hover `#f5f5f5`, edge `#eaeaea`, edge-2 `#d4d4d4`,
ink `#171717`, ink-dim `#666666`, ink-faint `#999999`, ink-ghost `#d4d4d4`,
accent `#171717` (black pill), accent-dim `#000`, accent-deep `#f2f2f2`,
accent-ink `#ffffff`, blue `#0070f3`, blue-dim `#0070f3`.

Expose the new blue as Tailwind utilities by adding `--color-blue:
var(--cm-blue)` / `--color-blue-dim: var(--cm-blue-dim)` to the `@theme` block
AND to the `.studio` re-declaration block (see §6.2).

### Code / syntax palette (hand-tokenized spans inside CodeWindow)
window bg `#0a0a0a`, border `#333`, line numbers `#494949`,
keyword/import `#ff4e8b` (pink), string `#62c073` (green), function/call
`#bf7af0` (violet), property/param `#79c0ff` (only when needed), plain
`#ededed`, comment `#666`. Traffic dots: `#ff5f57` `#febc2e` `#28c840`.
No syntax-highlighting library: snippets are static JSX with spans.

## 3. Typography

- **Families:** Geist Sans (`--font-geist-sans`, already loaded via the `geist`
  package in `layout.tsx`) for ALL text; Geist Mono (`--font-geist-mono`) for
  code/labels. The `.studio` skin must re-point `--font-sans` and
  `--font-display` to Geist Sans (replacing Inter/General Sans). If nothing
  else uses Inter/General Sans afterwards, remove their loading from
  `layout.tsx` (saves ~100KB of fonts).
- **Hero h1:** `clamp(2.75rem, 6vw, 4.5rem)` (44→72px), weight 600, tracking
  `-0.035em`, line-height 1.06, color `#fafafa`/ink.
- **Section h2:** 36–44px, weight 600, tracking `-0.03em`, line-height 1.1.
- **h3 / cell titles:** 20–24px, weight 600, tracking `-0.02em`.
- **Lede:** 18–20px, line-height 1.6, ink-dim.
- **Body:** 16px / 1.65, ink-dim; `strong` in ink.
- **Mono label / kicker:** 13–14px Geist Mono, ink-faint, sentence case or
  Capitalized Words (NOT uppercase-tracked. Vercel doesn't shout).
- **Buttons:** 14px, weight 500.
- **Never** use font weights above 600 for headings. Never letter-space body.

## 4. Components (landing: `src/components/site/vercel-kit.tsx`: NEW, owned by the foundation agent)

All server components unless noted. Page agents import from here. They do NOT
hand-roll their own versions.

- **`PillButton`**: `rounded-full`, h-10 (md) / h-12 (lg), px-5/px-6, text-sm
  font-medium. `primary`: `bg-accent text-accent-ink hover:bg-accent-dim`
  (white pill in dark). `secondary`: `border border-edge-2 text-ink
  bg-transparent hover:bg-panel-2 hover:border-ink-faint`. Renders `<Link>` or
  `<a>` by href.
- **`MonoSnippet`**, the `$ npm i ai` affordance: rounded-full,
  `border border-edge-2`, h-12, px-6, Geist Mono 14px, `$` in ink-faint,
  command in ink, optional copy icon (client island OK, graceful without JS).
- **`CodeWindow`**: rounded-xl (12px), `border border-edge-2`, bg `#0a0a0a`
  (`bg-bg-2`). Header row: three 10px traffic dots left, filename centered in
  mono ink-dim 13px. Body: mono 13.5px/1.7, line-number gutter in ghost,
  hand-tokenized spans per §2 syntax palette.
- **`SectionHeading`**: optional mono kicker (13px ink-faint), h2 per §3,
  optional lede (ink-dim, max-w-xl). Left-aligned.
- **`FeatureGrid` / `FeatureCell`**, collapsed-border cell grid: grid with
  `gap-px bg-edge` and `bg-bg` cells, or borders on cells, cells pad p-8/p-10.
  Cell: title (16px, weight 500, ink, or mono 14px for "index-style" cells),
  blurb 14px ink-dim leading-relaxed. Optional `+` crosshair at the grid's
  outer corners.
- **`Crosshair`**: `aria-hidden` 16×16 `+` glyph, 1px strokes, ghost color,
  absolutely positioned at a corner (`-top-2 -left-2` style offsets).
- **`Badge`**, `[NEW]`-style: mono 11px, px-1.5 py-0.5, border border-edge-2,
  rounded (4px), ink-dim.
- **`TabRow`**: static bordered strip of mono cells (like Vercel's Text /
  Speech / Transcription grid): collapsed 1px borders, mono 13px, px-6 py-4,
  first/active cell `bg-panel-2 text-ink`, rest ink-dim.
- **`Kbd`**: bordered chip, mono 12px, rounded-md, bg-panel-2, border-edge-2
  (restyle existing `ui/Kbd.tsx` to this).

## 5. Site chrome (landing)

### 5.1 Header: replicate Vercel's exactly
- Sticky, h-16, `bg-bg` **opaque** (no translucent blur), `border-b
  border-edge`.
- Container: `max-w-[1080px] mx-auto px-6` (this container width is THE
  container for the whole site).
- Left: `Cereal Milk` wordmark (Geist 600, 18px, tracking -0.02em). No logo redesign.
- Nav (14px, ink-dim → hover ink, gap-6): `Services ⌄` `Tools ⌄` `Resources ⌄`
  `Work` `Docs`. Chevron 10px, rotates 180° when open.
- Right: ThemeToggle (quiet icon button) · `Contact` **secondary pill** (h-8)
  · `Book a call` **primary white pill** (h-8, `?src=header` preserved).

### 5.2 The mega-menu, the format Dan loves (screenshot: Vercel Resources)
- **Full-width panel**: `absolute inset-x-0 top-full` relative to the header
  (header is sticky ⇒ positioned ⇒ the panel's containing block), `bg-bg`,
  `border-b border-edge`, py-10. Content inside the same `max-w-[1080px] px-6`
  container, `grid grid-cols-3 gap-8`.
- **Column format**: small gray group label (14px, ink-faint, mb-4), then
  stacked LARGE links: **24px, weight 500, ink (near-white), leading ~1.15,
  py-2.5 block**, hover → ink-dim transition. External links get a trailing
  `↗` (14px, ink-faint).
- **Interaction**: CSS-only, each nav item is a `group` div that is *static*
  (not relative) so the panel anchors to the header; panel is a DOM child of
  the group ⇒ pointer over the panel keeps `group-hover` alive; `pt` bridge so
  the pointer never crosses a dead gap. Also open on `:focus-within`. Give each
  panel an `id` (`menu-services`, `menu-tools`, `menu-resources`) and add a
  `:target`-based open rule so `/#menu-tools` shows the panel (screenshot
  verification + deep-linkable, harmless in prod).
- **Menu contents** (every current nav destination stays reachable):
  - **Product ⌄** → col "Product": Download (/download), Pricing (/pricing),
    Security (/security), Live demo (/demo).
  - **Solutions ⌄** → col "For": Venture capital (/for/venture-capital),
    B2B startups (/for/b2b-startups), Service providers (/for/service-providers).
  - **Resources ⌄** → col "Learn": Docs (/docs), Newsletter (/newsletter);
    col "Company": About (/about), Careers (/careers), Contact (/contact).
- Mobile: hamburger (client island fine) opening a full-screen black panel
  with the same groups (group label + large links). Replace the current
  scrolling-row nav.

### 5.3 Footer
Vercel-style: `border-t border-edge`, bg-bg, py-16. Container grid: 4–5
columns of links: column heading 14px ink, links 14px ink-dim → hover ink,
leading-8. Keep every existing footer link and the Field Notes subscribe block
(restyle: 14px input `bg-transparent border border-edge-2 rounded-md h-10` +
primary pill submit). Bottom row: `Cereal Milk` mark, © line, theme toggle.

### 5.4 Page-end CTA (`Terminus.tsx`)
Keep the component API; restyle as a bordered section (hairline top) with h2 +
primary/secondary pill pair.

## 6. Landing implementation notes & gotchas (READ CAREFULLY)

1. **`globals.css` is UN-layered**, any bare element selector there beats
   every Tailwind utility. Never add broad rules like `button { color: … }`.
2. **`@theme` tokens resolve at `:root`**, the `.studio` class re-points
   `--cm-*` AND re-declares the `--color-*` mappings (existing pattern at the
   bottom of globals.css). Any NEW token (e.g. `--color-blue`) must be added in
   BOTH places.
3. The **base (non-`.studio`) palette** is the Intercom-style product skin used
   by `/app` internals (HeroMockup inbox), the dev editor, and product flows.
   Retune its DARK variant toward Geist blacks (#0b0b0d→#000-ish is fine) but
   do not break the inbox mockup's legibility; the mockup depicts the product
   and may keep its own look inside its frame.
4. **The body is `overflow-hidden`**; studio pages scroll inside `SiteShell`'s
   own scroll container. Keep that architecture.
5. **Theme default flips to dark**: in `src/lib/theme.ts`, stored preference
   wins; otherwise default **dark** (drop the OS-light fallback). Also honor a
   `?theme=light|dark` URL param (apply, don't persist), used for screenshot
   verification and harmless in prod. Keep `readTheme`'s fallback in sync.
6. **Homepage keeps `title.absolute`** (root segment ignores the title
   template).
7. **Copy freeze**: no copy changes anywhere. The canonical sentence
   "Cereal Milk is an agentic-engineering studio that builds AI systems for
   venture-capital funds." stays byte-identical. Do not touch
   `src/lib/registry.ts`, `src/lib/site.ts`, `src/lib/meta.ts`,
   `src/lib/jsonld.ts`, `src/content/**`, `src/app/api/**`, `next.config.ts`,
   drip sequences, or any `route.ts`. Do not bump registry dates. Presentational
   glyphs (`$`, `↗`, `+`, `[NEW]` chrome) are fine; new marketing claims are not.
8. **Anonymization stays** (case studies never name clients).
9. Icons: lucide-react stays. Focus-visible rings stay (retune ring color to
   blue-dim). `prefers-reduced-motion` support stays.
10. Do NOT run `next build` / dev servers from page agents, a dedicated build
    stage follows.
11. If an OG-image route exists (`src/app/og/**`: check), restyle its template
    to black bg + Geist white wordmark; if none, skip.
12. `/account /get /onboard /sso-callback` are redirected to `/download` in
    next.config, leave their components untouched (dead surfaces).

## 7. Docs site (~/Cereal Milk-docs): nextjs.org/docs replica

- **Fonts**: Geist Sans + Geist Mono, self-hosted: copy the variable woff2
  files from `~/cereal-milk-site/node_modules/geist/dist/fonts/**` into
  `~/Cereal Milk-docs/public/fonts/`, declare `@font-face` in `src/styles/custom.css`
  with URLs under `/docs/fonts/…` (the site is served under base `/docs`).
  Replace Inter/General Sans usage entirely.
- **Palette**: same §2 tokens. Dark: bg #000, sidebar/current-page link in
  Geist blue `#52a8ff`; content links blue (no underline; underline on hover);
  headings #fafafa semibold tight; body #dcdcdc→#a1a1a1 ramp; hairlines
  #1f1f1f / #333. Light mirror per §2. Map through Starlight's `--sl-color-*`
  custom properties + the existing `--x-*` token layer (course components
  depend on `--x-*`, keep every existing `--x-*` variable defined).
- **Header**: black, hairline bottom; wordmark `Cereal Milk` (+ `/ Docs` separator
  style welcome); search input as a dark rounded field with a bordered `⌘K`
  kbd chip; `HeaderCta` = white pill (`Book a call`) + secondary pill.
- **Sidebar**: section labels 14px #ededed weight 600; links 14px #a1a1a1;
  active = blue text (no pill, replace the current ink-pill style).
  Right rail "On this page": 13–14px, active blue.
- **Content**: tables hairline-rows only with small gray uppercase headers
  (keep); code blocks `#0a0a0a` bordered `#2e2e2e` rounded-lg; inline
  code/kbd as bordered chips; ASCII-diagram blocks stay quieter (existing
  treatment, retuned to new grays); blockquotes/asides restyled to bordered
  hairline cards, blue accent for note-type asides.
- **Course components** (`src/components/course/*`, uncommitted WIP): keep
  functional; their CSS block in custom.css must keep working (progress bar,
  quiz states, pill nav), retune colors to this spec.
- **EmailCapture**: input + white pill button, per §5.3 style. Keep the form
  action and hidden `source=docs` field EXACTLY as-is.
- Add a tiny inline script in `src/components/Head.astro` honoring
  `?theme=light|dark` (sets `data-theme` on documentElement, not persisted),
  for screenshot verification; Starlight's own toggle continues to work.
- **Do not** touch content prose (`src/content/**`), astro.config.mjs (fonts
  go through custom.css so no config change is needed), `site.config.mjs`, or
  the Pagefind setup. Pagefind UI must remain styled/usable.
- Build with `npm run build` from `~/Cereal Milk-docs` (expects 47 pages with the WIP
  learn content present).

## 8. Verification bar

A page passes when: (a) it could sit on vercel.com without looking foreign,
pure black, hairline grid, Geist type, white pill CTAs, mono labels; (b) no
trace of the old skins remains on marketing surfaces (no Intercom blue
`#0064ff/#318dff` outside the /app product mockup, no Inter/General Sans, no
soft-shadow rounded-2xl cards); (c) light theme is a clean Geist-light mirror
(via `?theme=light`); (d) nothing functional broke (nav, menus incl.
`:target` fallback, forms, theme toggle, mobile layout at 390px); (e) builds
pass; (f) `git diff` shows zero copy/metadata/registry/API changes.
