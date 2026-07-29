# Brand concepts (CER-6 / CER-7)

Working concepts, not final brand. Drafted 2026-07-29 for Linear CER-6
(cerealmilk logo) and CER-7 (clippy profile picture). Nothing in this folder
is wired into the site build or the asset pipeline; it exists for review.

Open `index.html` in a browser to see every concept on light and dark
canvases at real sizes.

## Ground rules these follow

- Built WITH the pixel milk-bowl direction from the `brand/milk-bowl-mark`
  branch, not against it: 14x14 cell grid, flat cells, `crispEdges`,
  near-black tile `#0a0a0a`.
- Palette is the brand token set: cereal gold `#c4a86a`, bowl rim blue
  `#318dff`, milk `#ededed`, bowl base `#a1a1a1`. No lime in any logo.
- Wordmark letters come from the hand-drawn 5x7 bitmap alphabet in
  `src/components/site/Logo.tsx` (on that branch); lockups keep the word at
  0.64 of tile height per `LogoLockup`.

## Files

| File | Concept |
|---|---|
| `logo-a-bowl-lockup.svg` | CER-6 A: canonical bowl tile + CEREALMILK wordmark as one standalone lockup |
| `logo-b-splash-lockup.svg` | CER-6 B: same lockup, milk splash where the cereal lands |
| `logo-c-cm-monogram.svg` | CER-6 C: CM monogram tile over a rim-stripe echo, for tiny lettered contexts |
| `logo-d-wordmark-sparks.svg` | CER-6 D: tile-free wordmark, MILK in gold with falling cereal and blue rim underline |
| `avatar-a-clip-brass.svg` | CER-7 A: gold pixel paperclip on the brand tile |
| `avatar-b-clip-milk.svg` | CER-7 B: paperclip plunging into the milk bowl |
| `avatar-c-clip-spark.svg` | CER-7 C: milk-white paperclip holding one gold cereal square |
| `index.html` | Self-contained preview of all of the above, light + dark, size ramps, circle crops |

Lockup wordmarks fill with `currentColor`, so they render ink-on-light or
milk-on-dark from the surrounding CSS `color`; opened bare they default to
black.

## If a concept wins

Fold the geometry into `scripts/generate-brand-assets.py` and `Logo.tsx`
(plus the hand-mirrored copies listed in the org wiki's brand page), then
delete this folder. Avatars for the clippycommits GitHub account need a PNG
export (GitHub does not take SVG uploads): render at 460x460 or larger.
