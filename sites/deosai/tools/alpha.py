"""Alpha report: python tools/alpha.py file ...  -> mode, alpha min/max, % transparent / semi / opaque"""
import sys, numpy as np
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f)
    if im.mode != "RGBA":
        print(f"{f.split('/')[-1]:30} {im.size} mode={im.mode} (no alpha)"); continue
    a = np.array(im)[..., 3]
    t, o = (a < 8).mean() * 100, (a > 247).mean() * 100
    print(f"{f.split('/')[-1]:30} {im.size} a[{a.min()},{a.max()}] transparent {t:.1f}%  semi {100 - t - o:.1f}%  opaque {o:.1f}%")
