// The Cereal Milk mark: a pixel bowl of milk catching falling cereal, drawn
// flat on a near-black tile. Three gold cereal squares tumble toward a bowl
// whose rim is a blue stripe over milk-white steps tapering into a gray base.
// Self-contained, no font or image dependency, so it renders identically here,
// as the favicon (src/app/icon.svg), and as the app icon (public/icon-*.png,
// build/icon.icns), all generated from the same geometry by
// scripts/generate-brand-assets.py.
//
// The tile resolves through `--logo-badge` (near-black baked in as fallback);
// the cells keep their hard-coded fills so the mark reads the same on every
// canvas: the dark tile carries the contrast, not the page.
//
// Keep clear space around the tile equal to the width of one cell (brand rule).

const VIEWBOX = 1024;
const GRID_N = 14; // 14x14 cell grid
const CELL = VIEWBOX / GRID_N;

const GOLD = "#c4a86a"; // the cereal
const BLUE = "#318dff"; // the bowl rim
const MILK = "#ededed"; // the milk
const SHADE = "#a1a1a1"; // the bowl base

// Single-cell cereal squares as [col, row].
const SPARKS: readonly (readonly [number, number])[] = [
  [4, 3],
  [7, 2],
  [9, 4],
];

// The bowl as horizontal bars: [col, row, span, fill].
const BARS: readonly (readonly [number, number, number, string])[] = [
  [2, 6, 10, BLUE],
  [2, 7, 10, MILK],
  [3, 8, 8, MILK],
  [4, 9, 6, MILK],
  [5, 10, 4, SHADE],
  [6, 11, 2, SHADE],
];

/**
 * Logo: the square near-black tile with the pixel milk bowl.
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
      <rect width={VIEWBOX} height={VIEWBOX} rx={rx} ry={rx} fill="var(--logo-badge, #0a0a0a)" />
      <g shapeRendering="crispEdges">
        {SPARKS.map(([c, r]) => (
          <rect key={`s${c}-${r}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={GOLD} />
        ))}
        {BARS.map(([c, r, span, fill]) => (
          <rect key={`b${c}-${r}`} x={c * CELL} y={r * CELL} width={span * CELL} height={CELL} fill={fill} />
        ))}
      </g>
    </svg>
  );
}

// The wordmark alphabet: 5×7 bitmap capitals (I is 3 wide), drawn as SVG
// rects so the type is built from the same pixel grid as the bowl: the
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
 * LogoLockup: the bowl tile plus the full CEREALMILK wordmark in bitmap
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
