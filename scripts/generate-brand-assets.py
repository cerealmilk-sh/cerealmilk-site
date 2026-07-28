#!/usr/bin/env python3
"""Generate every Cereal Milk brand asset from one geometry definition.

The mark: a pixel bowl of milk catching falling cereal. Flat cells on a 14x14
grid, near-black tile: three gold cereal squares tumbling toward a bowl whose
rim is a blue stripe over milk-white steps that taper into a gray base. No
bevel, no shadow; crisp edges everywhere.

Outputs (paths relative to the repo this script lives in):
  src/app/icon.svg              1024 square SVG favicon
  src/app/apple-icon.png        180  square (iOS applies its own mask)
  src/app/favicon.ico           48+32+16
  public/icon-192.png           PWA
  public/icon-512.png           PWA + rasterized into every OG card
  public/icon-maskable-512.png  PWA maskable (mark shrunk into safe zone)
  public/mask-icon.svg          Safari pinned tab (solid mono silhouette)
  ../cerealmilk/build/icon.png  1024 full-bleed square (electron-builder win)
  ../cerealmilk/build/icon.icns macOS app icon (rounded tile, Big Sur grid)

Needs Pillow (any venv: `python3 -m venv .venv && .venv/bin/pip install pillow`)
and, for the .icns, macOS `iconutil`.
"""

import os
import subprocess
import tempfile

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.normpath(os.path.join(ROOT, "..", "cerealmilk"))

# ---- the one geometry definition -------------------------------------------
# 14x14 cell grid. Cereal squares are single cells; the bowl is horizontal
# bars given as (col, row, span). Both are centered on the canvas as drawn
# (cols 2..12, rows 2..12).
GRID_N = 14

BG = "#0a0a0a"
GOLD = "#c4a86a"  # the cereal
BLUE = "#318dff"  # the bowl rim
MILK = "#ededed"  # the milk
SHADE = "#a1a1a1"  # the bowl base

SPARKS = [(4, 3), (7, 2), (9, 4)]
BARS = [
    (2, 6, 10, BLUE),
    (2, 7, 10, MILK),
    (3, 8, 8, MILK),
    (4, 9, 6, MILK),
    (5, 10, 4, SHADE),
    (6, 11, 2, SHADE),
]


def rgb(hexcol):
    return tuple(int(hexcol[i : i + 2], 16) for i in (1, 3, 5))


# ---- raster renderer ---------------------------------------------------------
def render(size, scale=1.0, ss=4, canvas=None):
    """Render the mark onto a square canvas. `scale` shrinks the grid about
    the center (maskable safe zone, icns tile); `canvas` lets the icns tile
    compose onto a transparent 1024 board."""
    S = size * ss
    img = canvas if canvas is not None else Image.new("RGBA", (S, S), rgb(BG) + (255,))
    cell = S / GRID_N * scale
    o = (img.size[0] - GRID_N * cell) / 2
    d = ImageDraw.Draw(img)
    for c, r in SPARKS:
        d.rectangle([o + c * cell, o + r * cell, o + (c + 1) * cell, o + (r + 1) * cell], fill=rgb(GOLD))
    for c, r, span, col in BARS:
        d.rectangle([o + c * cell, o + r * cell, o + (c + span) * cell, o + (r + 1) * cell], fill=rgb(col))
    if canvas is not None:
        return img
    return img.resize((size, size), Image.LANCZOS)


# ---- SVG emitters ------------------------------------------------------------
def _rects(vb, fill=None):
    cell = vb / GRID_N
    f = lambda v: "%.1f" % v
    out = []
    for c, r in SPARKS:
        out.append(
            f'<rect x="{f(c * cell)}" y="{f(r * cell)}" width="{f(cell)}" height="{f(cell)}" fill="{fill or GOLD}"/>'
        )
    for c, r, span, col in BARS:
        out.append(
            f'<rect x="{f(c * cell)}" y="{f(r * cell)}" width="{f(span * cell)}" height="{f(cell)}" fill="{fill or col}"/>'
        )
    return "".join(out)


def svg_icon(vb=1024):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{vb}" height="{vb}" viewBox="0 0 {vb} {vb}" '
        f'shape-rendering="crispEdges" role="img" aria-label="Cereal Milk">'
        f'<rect width="{vb}" height="{vb}" fill="{BG}"/>'
        f"{_rects(vb)}</svg>"
    )


def svg_mask(vb=1024):
    # Solid silhouette for the Safari pinned-tab mask.
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{vb}" height="{vb}" viewBox="0 0 {vb} {vb}">'
        f'{_rects(vb, fill="#000")}</svg>'
    )


def main():
    site = lambda *p: os.path.join(ROOT, *p)

    with open(site("src", "app", "icon.svg"), "w") as fh:
        fh.write(svg_icon())
    with open(site("public", "mask-icon.svg"), "w") as fh:
        fh.write(svg_mask())

    render(180).convert("RGB").save(site("src", "app", "apple-icon.png"))
    render(192).convert("RGB").save(site("public", "icon-192.png"))
    render(512).convert("RGB").save(site("public", "icon-512.png"))
    # maskable: shrink the mark so it survives the 80% safe-zone crop
    render(512, scale=0.74).convert("RGB").save(site("public", "icon-maskable-512.png"))
    ico = [render(s).convert("RGBA") for s in (48, 32, 16)]
    ico[0].save(site("src", "app", "favicon.ico"), format="ICO", append_images=ico[1:])

    # electron-builder: windows full-bleed square png
    render(1024).convert("RGB").save(os.path.join(APP, "build", "icon.png"))

    # macOS icns: Big Sur grid, an 824px rounded tile centered on a transparent
    # 1024 board, mark scaled to the tile.
    def mac_board(size):
        ss = 4
        S = 1024 * ss
        board = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(board)
        d.rounded_rectangle([100 * ss, 100 * ss, 924 * ss, 924 * ss], radius=185 * ss, fill=rgb(BG) + (255,))
        render(1024, scale=824 / 1024, ss=ss, canvas=board)
        return board.resize((size, size), Image.LANCZOS)

    with tempfile.TemporaryDirectory() as td:
        iset = os.path.join(td, "icon.iconset")
        os.mkdir(iset)
        for pt in (16, 32, 128, 256, 512):
            mac_board(pt).save(os.path.join(iset, f"icon_{pt}x{pt}.png"))
            mac_board(pt * 2).save(os.path.join(iset, f"icon_{pt}x{pt}@2x.png"))
        subprocess.run(
            ["iconutil", "-c", "icns", iset, "-o", os.path.join(APP, "build", "icon.icns")],
            check=True,
        )

    print("brand assets regenerated")


if __name__ == "__main__":
    main()
