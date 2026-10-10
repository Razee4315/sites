"""Turn raw images into web-ready WebP in public/img and record their sizes in src/data/img-meta.json.

  python tools/process.py            everything
  python tools/process.py gen        only generated images
  python tools/process.py real       only photographs

Generated cut-outs: alpha cleaned, trimmed to the paper, a soft paper shadow baked in, two sizes.
Stage flats: trimmed top only (they bleed off the other three edges), two sizes.
Photographs: one shared crop and grade so pictures from many cameras sit together as one set.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
GEN = ROOT / "assets-raw" / "gen"
REAL = ROOT / "assets-raw" / "real"
OUT = ROOT / "public" / "img"
META = ROOT / "src" / "data" / "img-meta.json"
OUT.mkdir(parents=True, exist_ok=True)
META.parent.mkdir(parents=True, exist_ok=True)
meta = json.loads(META.read_text()) if META.exists() else {}
ONLY = sys.argv[1:] or ["gen", "real"]

FLATS = ("hero-", "rim-", "bed", "waves", "torn-")
SNOW = np.array([246, 242, 232], dtype=np.float32)
SHADOW = (24, 8, 44)


def save(im, name, sizes, q, alpha_q=92):
    """sizes: {suffix: max_width}. Records the largest as the intrinsic size."""
    for suffix, max_w in sizes.items():
        w, h = im.size
        s = min(1.0, max_w / w)
        out = im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
        path = OUT / f"{name}{suffix}.webp"
        out.save(path, "WEBP", quality=q, method=5, alpha_quality=alpha_q)
        if suffix == "":
            meta[name] = {"w": out.size[0], "h": out.size[1]}
            print(f"{name:28} {out.size[0]}x{out.size[1]:<5} {path.stat().st_size // 1024:>4} KB")


def clean_alpha(im):
    """Push near-transparent haze to zero and near-opaque to full, keeping the anti-aliased edge."""
    a = np.array(im.getchannel("A"), dtype=np.float32)
    a = np.clip((a - 14) / (238 - 14), 0, 1) * 255
    im.putalpha(Image.fromarray(a.astype(np.uint8)))
    return im


def bbox(im, thresh=12):
    a = np.array(im.getchannel("A"))
    ys, xs = np.where(a > thresh)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def with_shadow(im):
    """A sheet of paper lying a few millimetres above the page: tight contact shadow plus a soft offset one."""
    w, h = im.size
    m = max(w, h)
    pad = round(m * 0.06)
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    a = Image.new("L", canvas.size, 0)
    a.paste(im.getchannel("A"), (pad, pad))
    soft = a.filter(ImageFilter.GaussianBlur(m * 0.016)).point(lambda v: int(v * 0.42))
    tight = a.filter(ImageFilter.GaussianBlur(m * 0.004)).point(lambda v: int(v * 0.38))
    for layer, off in ((soft, (round(m * 0.008), round(m * 0.022))), (tight, (round(m * 0.002), round(m * 0.005)))):
        sh = Image.new("RGBA", canvas.size, SHADOW + (0,))
        shifted = Image.new("L", canvas.size, 0)
        shifted.paste(layer, off)
        sh.putalpha(shifted)
        canvas = Image.alpha_composite(canvas, sh)
    top = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    top.paste(im, (pad, pad))
    canvas = Image.alpha_composite(canvas, top)
    x0, y0, x1, y1 = bbox(canvas, 3)
    return canvas.crop((x0, y0, x1, y1))


def to_snow(im):
    """Re-tint the torn white paper to the site's snow colour, keeping its fibre shading."""
    arr = np.array(im, dtype=np.float32)
    lum = arr[..., :3].mean(axis=2)
    ref = np.percentile(lum[arr[..., 3] > 250], 70)
    shade = np.clip(lum / ref, 0, 1.03)[..., None]
    arr[..., :3] = np.clip(SNOW * shade, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


if "gen" in ONLY:
    for p in sorted(GEN.glob("*.png")):
        name = p.stem
        im = Image.open(p)
        has_alpha = im.mode == "RGBA" and np.array(im)[..., 3].min() < 250
        if name.startswith("sky-"):
            save(im.convert("RGB"), name, {"": 1920, "-s": 960}, 84)
        elif name.startswith(FLATS):
            im = clean_alpha(im.convert("RGBA"))
            x0, y0, x1, y1 = bbox(im)
            if name == "torn-a":  # paper hangs from the top: keep the top, trim below the tear
                im = to_snow(im).crop((0, 0, im.size[0], min(im.size[1], y1 + 6)))
            elif name == "torn-b":
                im = to_snow(im).crop((0, max(0, y0 - 6), im.size[0], im.size[1]))
            else:
                im = im.crop((0, max(0, y0 - 4), im.size[0], y1))
            save(im, name, {"": 2172, "-s": 1100}, 86)
        elif has_alpha:
            im = clean_alpha(im.convert("RGBA"))
            im = im.crop(bbox(im))
            im = with_shadow(im)
            save(im, name, {"": 1200, "-s": 560}, 88)
        else:
            save(im.convert("RGB"), name, {"": 1800, "-s": 900}, 84)

if "real" in ONLY:
    crops = json.loads((ROOT / "tools" / "photo-crops.json").read_text()) if (ROOT / "tools" / "photo-crops.json").exists() else {}
    for p in sorted(REAL.glob("*.jpg")):
        name = f"ph-{p.stem}"
        im = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
        c = crops.get(p.stem, {})
        ratio = c.get("ratio", 4 / 5)  # species portraits are 4:5; places override
        fx, fy, zoom = c.get("x", 0.5), c.get("y", 0.5), c.get("zoom", 1.0)
        w, h = im.size
        cw, ch = (w, w / ratio) if w / h < ratio else (h * ratio, h)
        cw, ch = cw / zoom, ch / zoom
        x0 = min(max(fx * w - cw / 2, 0), w - cw)
        y0 = min(max(fy * h - ch / 2, 0), h - ch)
        im = im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch)))
        # one grade for the whole set: normalise the range, lift contrast a touch, calm the saturation
        im = ImageOps.autocontrast(im, cutoff=(0.4, 0.3), preserve_tone=True)
        im = ImageEnhance.Contrast(im).enhance(1.05)
        im = ImageEnhance.Color(im).enhance(0.96)
        big = c.get("w", 1100 if ratio < 1.2 else 2000)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2)) if max(im.size) < big * 1.2 else im
        save(im, name, {"": big, "-s": round(big * 0.5)}, 80)

META.write_text(json.dumps(meta, indent=1, sort_keys=True))
print(f"{len(meta)} images in meta")
