"""Contact sheet: python tools/sheet.py out.jpg cols WxH bg file1 file2 ...   (transparent images are composited on bg)"""
import sys
from PIL import Image, ImageDraw
out, cols, cell, bg, files = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5:]
cw, ch = (int(v) for v in cell.split("x"))
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cw, rows * (ch + 16)), bg)
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    try:
        im = Image.open(f).convert("RGBA")
    except Exception:
        continue
    im.thumbnail((cw - 6, ch - 6), Image.LANCZOS)
    x = (i % cols) * cw + (cw - im.size[0]) // 2
    y = (i // cols) * (ch + 16) + (ch - im.size[1]) // 2
    sheet.paste(im, (x, y), im)
    parts = f.replace("\\", "/").split("/")
    d.text(((i % cols) * cw + 4, (i // cols) * (ch + 16) + ch + 2), "/".join(parts[-2:])[-46:], fill="#fff")
sheet.save(out, quality=86)
print(out, sheet.size)
