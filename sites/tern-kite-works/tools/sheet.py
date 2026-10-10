"""Contact sheet of raw assets over a sky blue, for review.  python tools/sheet.py out.jpg id id id ..."""
import math, sys
from pathlib import Path
from PIL import Image
RAW = Path(__file__).resolve().parent.parent / "assets-raw"
out, names = sys.argv[1], sys.argv[2:]
cell = (660, 460)
ims = []
for n in names:
    p = RAW / f"{n}.png"
    if not p.exists():
        print("missing", n); continue
    im = Image.open(p).convert("RGBA"); im.thumbnail((cell[0] - 20, cell[1] - 20))
    bg = Image.new("RGBA", cell, (96, 160, 226, 255))
    bg.alpha_composite(im, ((cell[0] - im.size[0]) // 2, (cell[1] - im.size[1]) // 2)); ims.append(bg)
cols = min(3, len(ims)); rows = math.ceil(len(ims) / cols)
sheet = Image.new("RGB", (cols * cell[0], rows * cell[1]), (30, 30, 30))
for i, im in enumerate(ims):
    sheet.paste(im.convert("RGB"), ((i % cols) * cell[0], (i // cols) * cell[1]))
sheet.save(out, quality=85); print(sheet.size)
