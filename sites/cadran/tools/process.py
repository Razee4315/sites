"""Turn the raw Codex PNGs in assets-raw/ into trimmed, sized WebP in public/img/ and write src/img-meta.json."""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets-raw"
OUT = ROOT / "public" / "img"
OUT.mkdir(parents=True, exist_ok=True)
META = ROOT / "src" / "img-meta.json"
meta = json.loads(META.read_text()) if META.exists() else {}
# `python tools/process.py bottles` redoes only the bottles; no argument redoes everything
ONLY = sys.argv[1:] or ["bottles", "rest"]


def bbox(im, thresh=10):
    a = np.array(im)[..., 3]
    ys, xs = np.where(a > thresh)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def save(im, name, max_side, q):
    w, h = im.size
    s = min(1, max_side / max(w, h))
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    im.save(OUT / f"{name}.webp", "WEBP", quality=q, method=4)
    meta[name] = {"w": im.size[0], "h": im.size[1]}
    print(f"{name:22} {im.size[0]}x{im.size[1]}  {(OUT / f'{name}.webp').stat().st_size // 1024} KB")


# bottles: the four recoloured edits came back with a hazy backdrop, but they are pixel-registered to the
# first one, so every bottle takes the first bottle's clean alpha and the same crop box.
bottles = sorted(RAW.glob("bottle-*.png"))
if bottles and "bottles" in ONLY:
    ims = [Image.open(p).convert("RGBA") for p in bottles]
    alpha = ims[0].getchannel("A")
    x0, y0, x1, y1 = bbox(ims[0])
    box = (x0 - 4, y0 - 4, x1 + 4, y1 + 2)
    for p, im in zip(bottles, ims):
        im.putalpha(alpha)
        save(im.crop(box), p.stem, 1500, 92)

for p in sorted(RAW.glob("*.png")):
    if p.stem.startswith("bottle-") or "rest" not in ONLY:
        continue
    im = Image.open(p)
    has_alpha = im.mode == "RGBA" and np.array(im)[..., 3].min() < 250
    if has_alpha:
        x0, y0, x1, y1 = bbox(im)
        pad = round(0.02 * max(x1 - x0, y1 - y0))
        im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.size[0], x1 + pad), min(im.size[1], y1 + pad)))
        save(im, p.stem, 900, 88)
    else:
        save(im.convert("RGB"), p.stem, 2000 if im.size[0] > im.size[1] else 1500, 82)

(ROOT / "src").mkdir(exist_ok=True)
META.write_text(json.dumps(meta, indent=1))
