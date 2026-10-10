"""Raw Codex PNGs in assets-raw/  ->  trimmed, sized WebP in public/img/  +  src/img-meta.json (w, h per image).

    python tools/process.py            everything
    python tools/process.py bell pit   only ids starting with these
"""
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
META.parent.mkdir(exist_ok=True)
meta = json.loads(META.read_text()) if META.exists() else {}
ONLY = sys.argv[1:]

# longest side in px, webp quality
SIZES = {
    "bell": (1100, 90), "bourdon": (1000, 90), "shipbell": (900, 90), "clockbell": (900, 90), "handbell": (1000, 90),
    "clapper": (900, 88), "headstock": (1200, 88), "sally": (1500, 88),
    "copper": (800, 88), "tin": (800, 88), "swarf-a": (700, 88), "swarf-b": (700, 88),
    "pit": (2000, 80), "belfry": (2000, 80), "sky": (2200, 82), "breakout": (1800, 80), "lathe": (1800, 80),
    "loam": (1400, 80), "furnace": (1400, 80), "fork": (1400, 80), "ropes": (1400, 80),
    "sparks-a": (1300, 78), "sparks-b": (1600, 78), "smoke": (1600, 72), "band": (2400, 84),
}
ON_BLACK = {"sparks-a", "sparks-b", "smoke"}
# left, top, right, bottom feather as a fraction of the side
FEATHER = {"sparks-a": (0.16, 0.1, 0.16, 0.12), "sparks-b": (0.08, 0.1, 0.08, 0.1), "smoke": (0.16, 0.18, 0.16, 0.18)}


def wanted(stem):
    return not ONLY or any(stem.startswith(o) for o in ONLY)


def family(stem):
    return stem[:-2] if stem[-2] == "-" and stem[-1].isdigit() else stem


def alpha_stats(im):
    a = np.array(im)[..., 3]
    return (a < 8).mean() * 100, ((a >= 8) & (a <= 247)).mean() * 100


def bbox(alpha, thresh=12):
    a = np.array(alpha)
    ys, xs = np.where(a > thresh)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def save(im, name, max_side, q):
    w, h = im.size
    s = min(1, max_side / max(w, h))
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    im.save(OUT / f"{name}.webp", "WEBP", quality=q, method=6)
    meta[name] = {"w": im.size[0], "h": im.size[1]}
    kb = (OUT / f"{name}.webp").stat().st_size // 1024
    print(f"  {name:12} {im.size[0]:>4}x{im.size[1]:<4} {kb:>4} KB")


def silhouette(im, name, max_side=420):
    """Soft black shape from the alpha channel, for contact shadows and glows."""
    a = im.getchannel("A")
    sil = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sil.putalpha(a)
    save(sil, name, max_side, 70)


done_chain = set()
for p in sorted(RAW.glob("*.png")):
    stem = p.stem
    fam = family(stem)
    if stem.startswith("_") or not wanted(stem) or fam in done_chain:
        continue
    size, q = SIZES.get(fam, (1600, 82))

    # edit chains: every frame takes frame 1's crop (and, for cut-outs, frame 1's alpha) so they stay registered
    frames = sorted(RAW.glob(f"{fam}-[0-9].png")) if fam != stem else [p]
    if fam != stem:
        done_chain.add(fam)
    ims = [Image.open(f).convert("RGBA") for f in frames]
    first = ims[0]
    cut = np.array(first)[..., 3].min() < 250

    if cut:
        t, semi = alpha_stats(first)
        print(f"{fam}: cut-out, {t:.0f}% transparent, {semi:.1f}% semi-transparent")
        alpha = first.getchannel("A")
        x0, y0, x1, y1 = bbox(alpha)
        pad = 3
        box = (max(0, x0 - pad), max(0, y0 - pad), min(first.size[0], x1 + pad), min(first.size[1], y1 + pad))
        for f, im in zip(frames, ims):
            if im.size != first.size:
                im = im.resize(first.size, Image.LANCZOS)
            im.putalpha(alpha)
            save(im.crop(box), f.stem, size, q)
    else:
        print(f"{fam}: photograph")
        for f, im in zip(frames, ims):
            if im.size != first.size:
                im = im.resize(first.size, Image.LANCZOS)
            rgb = im.convert("RGB")
            if fam in ON_BLACK:
                # pull the black floor to true zero so a screen blend leaves no visible rectangle
                arr = np.array(rgb).astype(np.float32)
                arr = np.clip((arr - 14) * (255 / (255 - 14)), 0, 255)
                # and feather every edge to black, so nothing ever shows where the picture stops
                h, w = arr.shape[:2]
                l, t, r, btm = FEATHER[fam]
                ramp = lambda n, a, z: np.clip(np.minimum(np.arange(n) / max(1, n * a), (n - 1 - np.arange(n)) / max(1, n * z)), 0, 1)
                fx = ramp(w, l, r) ** 1.5
                fy = ramp(h, t, btm) ** 1.5
                arr *= (fy[:, None] * fx[None, :])[..., None]
                rgb = Image.fromarray(arr.astype(np.uint8))
            save(rgb, f.stem, size, q)

META.write_text(json.dumps(dict(sorted(meta.items())), indent=1))
print(f"\n{len(meta)} images in meta")
