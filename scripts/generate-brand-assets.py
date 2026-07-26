#!/usr/bin/env python3
"""Generate every Cereal Milk brand asset from one geometry definition.

The mark: a gable-top milk carton built from beveled "keycap" pixel cells,
silver on near-black — the Superset icon language (superset.sh) with a carton
in place of their {()} glyph. Cell style is sampled from their apple-touch
icon: bg #151110, bevel #DCDCDB, body gradient #ACAAA9 -> #969594, tight
drop shadow.

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
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.normpath(os.path.join(ROOT, "..", "cerealmilk"))

# ---- the one geometry definition -------------------------------------------
# 6x8 grid; '#' is a cell. Fin (2x2) -> stepped shoulder -> body: a gable-top
# milk carton.
GRID = """
..##..
..##..
.####.
######
######
######
######
######
""".strip().splitlines()

CELLS = [(c, r) for r, row in enumerate(GRID) for c, ch in enumerate(row) if ch == "#"]
GRID_W, GRID_H = len(GRID[0]), len(GRID)

BG = "#151110"
BEVEL = "#DCDCDB"
GRAD_TOP = "#ACAAA9"
GRAD_BOT = "#969594"
BEVEL_FRAC = 0.12  # bevel strip as a fraction of tile height (hard grad stop)
GROUT_FRAC = 0.10  # gap between cells as a fraction of the cell pitch
CELL_FRAC = 0.088  # cell pitch as a fraction of the canvas edge


def rgb(hexcol):
    return tuple(int(hexcol[i : i + 2], 16) for i in (1, 3, 5))


# ---- raster renderer ---------------------------------------------------------
def render(size, cell_frac=CELL_FRAC, bg=BG, ss=4, canvas=None, offset=(0, 0)):
    """Render the mark onto a square canvas. `canvas`/`offset` let the icns
    tile compose onto a transparent 1024 board."""
    S = size * ss
    img = canvas if canvas is not None else Image.new("RGBA", (S, S), rgb(bg) + (255,))
    cell = S * cell_frac
    grout = cell * GROUT_FRAC
    tile = cell - grout
    ox = offset[0] * ss + (S - (GRID_W * cell - grout)) / 2
    oy = offset[1] * ss + (S - (GRID_H * cell - grout)) / 2

    sh = Image.new("L", img.size, 0)
    shd = ImageDraw.Draw(sh)
    for c, r in CELLS:
        x, y = ox + c * cell, oy + r * cell
        shd.rectangle([x, y + tile * 0.12, x + tile, y + tile * 1.12], fill=140)
    sh = sh.filter(ImageFilter.GaussianBlur(tile * 0.10))
    img.paste((0, 0, 0, 255), (0, 0), sh)

    d = ImageDraw.Draw(img)
    top, bot, bev = rgb(GRAD_TOP), rgb(GRAD_BOT), rgb(BEVEL)
    for c, r in CELLS:
        x, y = ox + c * cell, oy + r * cell
        n = int(tile)
        for i in range(n):
            t = i / (n - 1)
            col = bev if t < BEVEL_FRAC else tuple(
                int(a + (b - a) * (t - BEVEL_FRAC) / (1 - BEVEL_FRAC))
                for a, b in zip(top, bot)
            )
            d.line([x, y + i, x + tile, y + i], fill=col)
    if canvas is not None:
        return img
    return img.resize((size, size), Image.LANCZOS)


# ---- SVG emitters ------------------------------------------------------------
def svg_icon(vb=1024, cell=None, bg=True):
    cell = cell or vb * CELL_FRAC
    grout = cell * GROUT_FRAC
    tile = cell - grout
    ox = (vb - (GRID_W * cell - grout)) / 2
    oy = (vb - (GRID_H * cell - grout)) / 2
    f = lambda v: ("%.1f" % v).rstrip("0").rstrip(".")
    rects = "".join(
        f'<rect x="{f(ox + c * cell)}" y="{f(oy + r * cell)}" width="{f(tile)}" height="{f(tile)}" fill="url(#cmc)"/>'
        for c, r in CELLS
    )
    bgrect = f'<rect width="{vb}" height="{vb}" fill="{BG}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{vb}" height="{vb}" viewBox="0 0 {vb} {vb}" role="img" aria-label="Cereal Milk">'
        f"<defs>"
        f'<linearGradient id="cmc" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{BEVEL}"/><stop offset="{BEVEL_FRAC}" stop-color="{BEVEL}"/>'
        f'<stop offset="{BEVEL_FRAC}" stop-color="{GRAD_TOP}"/><stop offset="1" stop-color="{GRAD_BOT}"/>'
        f"</linearGradient>"
        f'<filter id="cms" x="-20%" y="-20%" width="140%" height="140%">'
        f'<feDropShadow dx="0" dy="{f(tile * 0.12)}" stdDeviation="{f(tile * 0.10)}" flood-color="#000000" flood-opacity="0.55"/>'
        f"</filter>"
        f"</defs>"
        f"{bgrect}"
        f'<g filter="url(#cms)">{rects}</g>'
        f"</svg>\n"
    )


def svg_mask(vb=1024):
    # Solid silhouette (no grout, no bevel) for the Safari pinned-tab mask.
    cell = vb * CELL_FRAC
    ox = (vb - GRID_W * cell) / 2
    oy = (vb - GRID_H * cell) / 2
    f = lambda v: ("%.1f" % v).rstrip("0").rstrip(".")
    rects = "".join(
        f'<rect x="{f(ox + c * cell)}" y="{f(oy + r * cell)}" width="{f(cell)}" height="{f(cell)}"/>'
        for c, r in CELLS
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{vb}" height="{vb}" viewBox="0 0 {vb} {vb}" role="img" aria-label="Cereal Milk">'
        f'<g fill="#000000">{rects}</g></svg>\n'
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
    render(512, cell_frac=CELL_FRAC * 0.74).convert("RGB").save(
        site("public", "icon-maskable-512.png")
    )
    ico = [render(s).convert("RGBA") for s in (48, 32, 16)]
    ico[0].save(site("src", "app", "favicon.ico"), format="ICO", append_images=ico[1:])

    # electron-builder: windows full-bleed square png
    render(1024).convert("RGB").save(os.path.join(APP, "build", "icon.png"))

    # macOS icns: Big Sur grid — 824px rounded tile centered on a transparent
    # 1024 board, mark scaled to the tile.
    def mac_board(size):
        ss = 4
        S = 1024 * ss
        board = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(board)
        d.rounded_rectangle([100 * ss, 100 * ss, 924 * ss, 924 * ss], radius=185 * ss, fill=rgb(BG) + (255,))
        render(1024, cell_frac=CELL_FRAC * 824 / 1024, ss=ss, canvas=board)
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
