"""Raw Codex PNGs (assets-raw/) -> trimmed, sized WebP (public/img/) + src/img-meta.json with every width and height.

    python tools/process.py            everything
    python tools/process.py ostro ph   only ids starting with these prefixes
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets-raw"
OUT = ROOT / "public" / "img"
META = ROOT / "src" / "img-meta.json"
OUT.mkdir(parents=True, exist_ok=True)
meta = json.loads(META.read_text()) if META.exists() else {}
ONLY = sys.argv[1:]

# longest side, in px, that each cut-out is ever drawn at (x2 for sharp screens, capped by the source)
CUTOUT_SIDE = {"ostro": 1500, "light": 1500, "zephyr": 1500, "mistral": 1500, "levanter": 1500, "sirocco": 1500,
               "williwaw": 1200, "cloud": 1400, "sun": 700, "moon": 700, "tern": 520, "obj": 900}
# chains whose later frames are edits of the first: they share frame 1's alpha and crop so they stay registered
CHAINS = {"ostro": 4, "light": 2}
# full-width strips: trim only the empty sky above the torn edge
STRIPS = ("land-far", "land-mid", "land-near")
PAPER = np.array([242, 236, 223], np.float32)  # --paper in the CSS; the sheet, its tile and its torn edge must agree


def wanted(stem):
    return not ONLY or any(stem.startswith(p) for p in ONLY)


def alpha_of(im):
    return np.array(im.convert("RGBA"))[..., 3]


def report(name, im, path):
    meta[name] = {"w": im.size[0], "h": im.size[1]}
    print(f"{name:16} {im.size[0]:>5}x{im.size[1]:<5} {path.stat().st_size // 1024:>4} KB")


def save(im, name, side=None, q=86, width=None):
    w, h = im.size
    s = 1
    if side:
        s = min(1, side / max(w, h))
    if width:
        s = min(1, width / w)
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    path = OUT / f"{name}.webp"
    im.save(path, "WEBP", quality=q, method=6)
    report(name, im, path)
    return im


def alpha_stats(stem, a):
    semi = ((a > 8) & (a < 247)).mean() * 100
    flag = "  <-- hazy" if semi > 6 else ""
    print(f"   alpha {stem:14} min {a.min():>3} max {a.max():>3}  clear {(a <= 8).mean() * 100:5.1f}%  semi {semi:5.2f}%{flag}")


def bbox(a, thresh=12):
    ys, xs = np.where(a > thresh)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def padded(box, size, frac=0.012):
    x0, y0, x1, y1 = box
    p = round(frac * max(x1 - x0, y1 - y0))
    return max(0, x0 - p), max(0, y0 - p), min(size[0], x1 + p), min(size[1], y1 + p)


def side_for(stem):
    for key, side in CUTOUT_SIDE.items():
        if stem.startswith(key):
            return side
    return 1000


done = set()

# ── chains ────────────────────────────────────────────────────────────────────
for chain, n in CHAINS.items():
    frames = [RAW / f"{chain}-{i + 1}.png" for i in range(n)]
    if not all(p.exists() for p in frames):
        continue
    done.update(p.stem for p in frames)
    if not wanted(chain):
        continue
    ims = [Image.open(p).convert("RGBA") for p in frames]
    for p, im in zip(frames, ims):
        alpha_stats(p.stem, alpha_of(im))
    master = ims[0].getchannel("A")
    box = padded(bbox(np.array(master)), ims[0].size)
    for p, im in zip(frames, ims):
        if im.size != ims[0].size:
            im = im.resize(ims[0].size, Image.LANCZOS)
        im.putalpha(master)  # edits come back hazy; frame 1's clean alpha fits them all
        save(im.crop(box), p.stem, side=side_for(chain), q=90)

# ── scraps: one sheet of torn paper -> one file per scrap ─────────────────────
sheet = RAW / "scraps.png"
if sheet.exists():
    done.add("scraps")
if sheet.exists() and wanted("scrap"):
    im = Image.open(sheet).convert("RGBA")
    a = alpha_of(im)
    alpha_stats("scraps", a)
    solid = a > 40
    lab = np.zeros(a.shape, np.int32)
    boxes, cur = [], 0
    # flood-fill connected blobs, row-major, on a quarter-size mask for speed
    small = np.array(Image.fromarray((solid * 255).astype(np.uint8)).resize((a.shape[1] // 4, a.shape[0] // 4), Image.NEAREST)) > 0
    seen = np.zeros(small.shape, bool)
    for y in range(small.shape[0]):
        for x in range(small.shape[1]):
            if small[y, x] and not seen[y, x]:
                stack, xs, ys = [(y, x)], [], []
                seen[y, x] = True
                while stack:
                    cy, cx = stack.pop()
                    ys.append(cy)
                    xs.append(cx)
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < small.shape[0] and 0 <= nx < small.shape[1] and small[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            stack.append((ny, nx))
                if len(xs) > 250:
                    boxes.append((min(xs) * 4 - 6, min(ys) * 4 - 6, max(xs) * 4 + 10, max(ys) * 4 + 10))
    for i, b in enumerate(boxes):
        b = (max(0, b[0]), max(0, b[1]), min(im.size[0], b[2]), min(im.size[1], b[3]))
        save(im.crop(b), f"scrap-{i + 1}", side=200, q=84)
    meta["scraps"] = {"count": len(boxes)}

# ── the paper tile: flatten the lighting, then cross-fade it with a half-shifted copy of itself so it repeats without a seam ──
tex = RAW / "tex-washi.png"
if tex.exists():
    done.add("tex-washi")
if tex.exists() and wanted("tex"):
    N = 880
    im = Image.open(tex).convert("L").resize((N, N), Image.LANCZOS)
    g = np.asarray(im, np.float32)
    low = np.asarray(im.filter(ImageFilter.GaussianBlur(36)), np.float32)
    d = np.clip(g / low, 0.9, 1.07) - 1  # fibres only: no vignette, no cloudiness, and the darkest flecks tamed
    ramp = 0.5 - 0.5 * np.cos(2 * np.pi * (np.arange(N) + 0.5) / N)  # 0 at the borders, 1 in the middle
    w = np.outer(ramp, ramp)
    shifted = np.roll(d, (N // 2, N // 2), (0, 1))
    # each copy hides the other's seam; dividing by the weights' norm keeps the contrast even across the tile
    d = (d * w + shifted * (1 - w)) / np.sqrt(w * w + (1 - w) * (1 - w))
    grey = np.clip(236 + d * 255 * 1.25, 0, 255)  # light paper grey, to be multiplied over the sky
    out = Image.fromarray(grey.astype(np.uint8)).convert("RGB")
    path = OUT / "tex-washi.webp"
    out.save(path, "WEBP", quality=64, method=6)
    report("tex-washi", out, path)
    # the same fibres, tinted to the paper colour, as the ground of the paper sections
    tint = np.clip(PAPER[None, None, :] * (1 + d[..., None] * 1.0), 0, 255).astype(np.uint8)
    out = Image.fromarray(tint)
    path = OUT / "tex-paper.webp"
    out.save(path, "WEBP", quality=72, method=6)
    report("tex-paper", out, path)

# -- the torn edge of the paper sections: recoloured to the paper colour, fading out below so it melts into the sheet --
edge = RAW / "edge.png"
if edge.exists():
    done.add("edge")
if edge.exists() and wanted("edge"):
    im = Image.open(edge).convert("RGBA")
    a = alpha_of(im)
    alpha_stats("edge", a)
    top = int(np.where((a > 20).mean(1) > 0.002)[0].min())
    full = int(np.where((a > 240).mean(1) > 0.995)[0].min())
    tail = 90  # px of solid paper kept under the torn band, faded to nothing
    im = im.crop((3, max(0, top - 4), im.size[0] - 3, full + tail))
    px = np.asarray(im, np.float32)
    lum = px[..., :3].mean(-1)
    low = np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(30)), np.float32) + 1e-3
    al = px[..., 3] / 255
    lum_d = np.where(al > 0.9, lum / low, 1.0)  # keep the fibres, drop the photograph's own colour
    rgb = np.clip(PAPER[None, None, :] * (1 + (lum_d[..., None] - 1) * 1.1), 0, 255)
    h = px.shape[0]
    fade = np.clip((h - np.arange(h)) / tail, 0, 1)[:, None]
    out = Image.fromarray(np.dstack([rgb, px[..., 3] * fade]).astype(np.uint8), "RGBA")
    save(out, "edge", width=2000, q=86)
    meta["edge"]["tail"] = round(tail / h, 3)  # share of the strip that overlaps the sheet

# ── everything else ───────────────────────────────────────────────────────────
for p in sorted(RAW.glob("*.png")):
    stem = p.stem
    if stem in done or not wanted(stem):
        continue
    im = Image.open(p)
    if stem.startswith("ph-"):
        im = im.convert("RGB")
        wide = im.size[0] > im.size[1]
        save(im, stem, width=1800 if wide else 1200, q=80)
        save(im, f"{stem}@s", width=900 if wide else 640, q=76)
        continue
    im = im.convert("RGBA")
    a = alpha_of(im)
    alpha_stats(stem, a)
    if stem in STRIPS:
        x0, y0, x1, y1 = bbox(a, 20)
        im = im.crop((3, max(0, y0 - 6), im.size[0] - 3, im.size[1] - 3))
        # the strip's base dissolves, like a headland standing in haze, so no hard bottom edge ever shows
        px = np.asarray(im, np.float32)
        t = np.clip((np.arange(px.shape[0]) / px.shape[0] - 0.62) / 0.38, 0, 1)
        px[..., 3] *= (1 - t * t * (3 - 2 * t))[:, None]
        im = Image.fromarray(px.astype(np.uint8), "RGBA")
        save(im, stem, width=2000, q=84)
        continue
    save(im.crop(padded(bbox(a), im.size)), stem, side=side_for(stem), q=88)

(ROOT / "src").mkdir(exist_ok=True)
META.write_text(json.dumps(meta, indent=1))
print(f"\n{len(meta)} entries -> {META.relative_to(ROOT)}")
