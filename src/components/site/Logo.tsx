// The 80x studio mark (brand pack "1c"): the real Geist Mono Bold "80x"
// outlined to paths, ink (#0B0B09) on the brand lime (#E4F222). Self-contained,
// no font dependency, no network request: so it renders identically here, as
// the favicon (src/app/icon.svg), and as the app icon (public/icon-*.png), all
// generated from the same source. The two fills resolve through CSS custom
// properties (`--logo-badge` / `--logo-ink`) with the canonical lime/ink baked
// in as fallbacks, so the mark inverts to hold contrast on the yellow studio
// canvas (black badge, lime glyphs) while staying the classic lime badge on the
// black dark canvas and everywhere the vars are unset (favicon, OG, /app).
//
// Keep clear space around the mark equal to the height of the "0" (brand rule).

const VIEWBOX = 1024;

// The glyph block: "80x" in Geist Mono Bold, outlined. The matrix flips the
// font's y-up outlines into SVG space and centers the block in the artboard.
const GLYPHS = (
  <g
    transform="matrix(0.438519,0,0,-0.438519,116.4563,667.6741)"
    fill="var(--logo-ink, #0B0B09)"
  >
    <g transform="translate(0,0)">
      <path d="M300 -16Q182 -16 110.0 37.5Q38 91 38 194Q38 263 76.0 311.5Q114 360 179 381Q129 400 98.0 437.5Q67 475 67 530Q67 587 96.0 631.5Q125 676 177.5 701.0Q230 726 300 726Q370 726 422.5 701.0Q475 676 504.0 631.5Q533 587 533 530Q533 475 502.0 437.5Q471 400 420 381Q486 360 524.0 312.0Q562 264 562 194Q562 91 490.0 37.5Q418 -16 300 -16ZM300 438Q339 438 362.5 458.5Q386 479 386 521Q386 558 362.5 579.0Q339 600 300 600Q261 600 237.5 579.0Q214 558 214 521Q214 479 237.5 458.5Q261 438 300 438ZM300 110Q348 110 382.0 132.5Q416 155 416 208Q416 259 385.5 288.0Q355 317 300 317Q245 317 214.5 288.0Q184 259 184 208Q184 155 218.0 132.5Q252 110 300 110Z" />
    </g>
    <g transform="translate(600,0)">
      <path d="M300 -16Q220 -16 162.5 29.0Q105 74 74.5 157.0Q44 240 44 354Q44 469 74.5 552.5Q105 636 162.5 681.0Q220 726 300 726Q380 726 437.5 681.0Q495 636 525.5 552.5Q556 469 556 354Q556 240 525.5 157.0Q495 74 437.5 29.0Q380 -16 300 -16ZM190 354Q190 291 199 243L368 562Q341 600 300 600Q248 600 219.0 538.5Q190 477 190 354ZM300 110Q352 110 381.0 171.0Q410 232 410 354Q410 418 401 467L232 148Q259 110 300 110Z" />
    </g>
    <g transform="translate(1200,0)">
      <path d="M34 0 224 274 42 536H190L300 367L409 536H557L378 274L566 0H419L300 183L182 0Z" />
    </g>
  </g>
);

/**
 * Logo: the square lime "80x" badge. This IS the wordmark (the mark spells
 * "80x"), so it stands alone in the header, footer, and mobile menu.
 *
 * @param size    edge length in px (default 30)
 * @param radius  corner rounding as a fraction of the edge (default 0.16, a
 *                crisp rounded square; pass 0 for the true-square favicon look)
 */
export function Logo({
  size = 30,
  radius = 0.16,
  className,
  title = "80x",
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
      role="img"
      aria-label={title}
      className={className}
      style={{ display: "block" }}
    >
      <rect width={VIEWBOX} height={VIEWBOX} rx={rx} ry={rx} fill="var(--logo-badge, #E4F222)" />
      {GLYPHS}
    </svg>
  );
}
