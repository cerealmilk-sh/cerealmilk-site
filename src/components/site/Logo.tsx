// The Cereal Milk mark: a gable-top milk carton built from beveled "keycap"
// pixel cells, silver on a near-black tile — the Superset icon language
// (superset.sh) with a carton in place of their {()} glyph. Self-contained,
// no font or image dependency, so it renders identically here, as the favicon
// (src/app/icon.svg), and as the app icon (public/icon-*.png, build/icon.icns),
// all generated from the same geometry by scripts/generate-brand-assets.py.
//
// The tile resolves through `--logo-badge` (near-black baked in as fallback);
// the cells keep their hard-coded silver gradient so the mark reads the same
// on every canvas — the dark tile carries the contrast, not the page.
//
// Keep clear space around the tile equal to the width of one cell (brand rule).

const VIEWBOX = 1024;
const CELL = VIEWBOX * 0.088; // cell pitch
const GROUT = CELL * 0.1; // gap between cells
const TILE = CELL - GROUT; // visible keycap size

// 6x8 grid: fin (2x2) -> stepped shoulder -> body. A gable-top milk carton.
const GRID = [
  "..##..",
  "..##..",
  ".####.",
  "######",
  "######",
  "######",
  "######",
  "######",
];

const OX = (VIEWBOX - (GRID[0].length * CELL - GROUT)) / 2;
const OY = (VIEWBOX - (GRID.length * CELL - GROUT)) / 2;

const CELLS = GRID.flatMap((row, r) =>
  [...row].flatMap((ch, c) => (ch === "#" ? [[c, r] as const] : [])),
);

/**
 * Logo: the square near-black tile with the pixel milk carton.
 *
 * @param size    edge length in px (default 30)
 * @param radius  corner rounding as a fraction of the edge (default 0.16, a
 *                crisp rounded square; pass 0 for the true-square favicon look)
 */
export function Logo({
  size = 30,
  radius = 0.16,
  className,
  title = "Cereal Milk",
}: {
  size?: number;
  radius?: number;
  className?: string;
  title?: string;
}) {
  const rx = VIEWBOX * radius;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="cm-cell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCDCDB" />
          <stop offset="0.12" stopColor="#DCDCDB" />
          <stop offset="0.12" stopColor="#ACAAA9" />
          <stop offset="1" stopColor="#969594" />
        </linearGradient>
        <filter id="cm-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy={TILE * 0.12}
            stdDeviation={TILE * 0.1}
            floodColor="#000000"
            floodOpacity="0.55"
          />
        </filter>
      </defs>
      <rect width={VIEWBOX} height={VIEWBOX} rx={rx} ry={rx} fill="var(--logo-badge, #151110)" />
      <g filter="url(#cm-shadow)">
        {CELLS.map(([c, r]) => (
          <rect
            key={`${c}-${r}`}
            x={OX + c * CELL}
            y={OY + r * CELL}
            width={TILE}
            height={TILE}
            fill="url(#cm-cell)"
          />
        ))}
      </g>
    </svg>
  );
}

// The wordmark alphabet: 5×7 bitmap capitals (I is 3 wide), drawn as SVG
// rects so the type is built from the same pixel grid as the carton — the
// chunky Superset nav treatment, with no font dependency. One column of
// tracking between glyphs.
const PIXEL_GLYPHS: Record<string, string[]> = {
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  I: ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
};

const WORD = "CEREALMILK";

const { rects: WORD_RECTS, width: WORD_W } = (() => {
  const rects: { x: number; y: number; w: number }[] = [];
  let gx = 0;
  for (const ch of WORD) {
    const glyph = PIXEL_GLYPHS[ch];
    glyph.forEach((row, y) => {
      for (let x = 0; x < row.length; ) {
        if (row[x] !== "#") {
          x++;
          continue;
        }
        let w = 1;
        while (row[x + w] === "#") w++;
        rects.push({ x: gx + x, y, w });
        x += w;
      }
    });
    gx += glyph[0].length + 1;
  }
  return { rects, width: gx - 1 };
})();

/**
 * LogoLockup: the carton tile plus the full CEREALMILK wordmark in bitmap
 * capitals. Inherits text color from the wrapping link.
 */
export function LogoLockup({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const h = size * 0.64;
  return (
    <span className={`inline-flex select-none items-center gap-2.5 ${className ?? ""}`}>
      <Logo size={size} title="" />
      <svg
        aria-hidden
        width={(h * WORD_W) / 7}
        height={h}
        viewBox={`0 0 ${WORD_W} 7`}
        shapeRendering="crispEdges"
        fill="currentColor"
        style={{ display: "block" }}
      >
        {WORD_RECTS.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={1} />
        ))}
      </svg>
    </span>
  );
}
