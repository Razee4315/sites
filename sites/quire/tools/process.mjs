// Raw PNGs → web-ready WebP.
//   node tools/process.mjs            everything
//   node tools/process.mjs zf-hero    only these ids
//
// Cut-outs: faint alpha is cleaned to zero, transparent margins are trimmed, then a
// full and a small size are written, plus a tiny blurred silhouette (.sh) that the
// page lays under each sheet as its shadow. Opaque images are just resized.
// Writes public/img/* and src/data/images.json with the dimensions of every file.
import sharp from 'sharp'
import { readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const OUT = join(root, 'public', 'img')
const META = join(root, 'src', 'data', 'images.json')
mkdirSync(OUT, { recursive: true })
mkdirSync(dirname(META), { recursive: true })

// longest edge of the full and small versions, by family
const SIZES = [
  [/-back$/, { full: 1536, small: 900, q: 78 }],
  [/-(far|front)$|^audience$/, { full: 2172, small: 1200, q: 82 }],
  [/-wing-[lr]$/, { full: 1536, small: 900, q: 82 }],
  [/-flown$/, { full: 1536, small: 900, q: 82 }],
  [/-hero$/, { full: 1300, small: 760, q: 84 }],
  [/^fig-/, { full: 1200, small: 720, q: 84 }],
  [/^sil-/, { full: 720, small: 0, q: 84 }],
  [/^obj-/, { full: 1000, small: 560, q: 84 }],
  [/^doc-/, { full: 1672, small: 900, q: 76 }],
  [/^make-/, { full: 1536, small: 900, q: 78 }],
]
const sizeFor = (id) => SIZES.find(([re]) => re.test(id))?.[1] ?? { full: 1400, small: 800, q: 80 }
const wantsShadow = (id) => /-(far|front|wing-[lr]|flown|hero)$|^fig-|^obj-/.test(id)

const only = process.argv.slice(2)
const meta = existsSync(META) ? JSON.parse(readFileSync(META, 'utf8')) : {}

async function cutout(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  let x0 = W, y0 = H, x1 = -1, y1 = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4 + 3
      if (data[i] <= 10) data[i] = 0 // kill haze
      if (data[i] > 24) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  const box = { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).extract(box).png().toBuffer()
}

const fit = (edge) => ({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })

for (const f of readdirSync(RAW).filter((n) => n.endsWith('.png'))) {
  const id = f.replace('.png', '')
  if (only.length && !only.includes(id)) continue
  const src = join(RAW, f)
  const m = await sharp(src).metadata()
  const alpha = m.channels === 4
  const size = sizeFor(id)
  const base = alpha ? await cutout(src) : await sharp(src).toBuffer()

  const full = await sharp(base).resize(fit(size.full)).webp({ quality: size.q, alphaQuality: 92, effort: 6 }).toFile(join(OUT, `${id}.webp`))
  const entry = { w: full.width, h: full.height, alpha }
  if (size.small) {
    const s = await sharp(base).resize(fit(size.small)).webp({ quality: size.q, alphaQuality: 90, effort: 6 }).toFile(join(OUT, `${id}.s.webp`))
    entry.s = s.width
  }
  if (alpha && wantsShadow(id)) {
    // black silhouette from the alpha channel, padded so the blur is not clipped
    const pad = 28
    const a = await sharp(base).resize(fit(360)).extractChannel('alpha').raw().toBuffer({ resolveWithObject: true })
    const sil = await sharp({ create: { width: a.info.width, height: a.info.height, channels: 3, background: '#000' } })
      .joinChannel(a.data, { raw: { width: a.info.width, height: a.info.height, channels: 1 } })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
    await sharp(sil).blur(7).webp({ quality: 50, alphaQuality: 60 }).toFile(join(OUT, `${id}.sh.webp`))
    entry.shPad = pad / a.info.width // padding as a fraction of the sheet's width
    entry.shPadY = pad / a.info.height
  }
  meta[id] = entry
  console.log(`${id.padEnd(16)} ${String(full.width).padStart(4)}x${String(full.height).padEnd(4)} ${(full.size / 1024).toFixed(0).padStart(4)} kB${alpha ? '  cut-out' : ''}`)
}

// Paper grain: a small seamless tile of faint dark and light specks, laid over every flat colour.
{
  const N = 256
  const rnd = (() => { let s = 20261010; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) })()
  const px = Buffer.alloc(N * N * 4)
  for (let i = 0; i < N * N; i++) {
    const v = rnd() + rnd() + rnd() - 1.5 // roughly normal, -1.5..1.5
    const dark = v < 0
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = dark ? 20 : 255
    px[i * 4 + 3] = Math.min(255, Math.round(Math.abs(v) ** 1.6 * (dark ? 36 : 24)))
  }
  // tile 3x3, soften, crop the middle so the blur wraps cleanly
  const tile = await sharp(px, { raw: { width: N, height: N, channels: 4 } }).png().toBuffer()
  const big = await sharp({ create: { width: N * 3, height: N * 3, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(Array.from({ length: 9 }, (_, k) => ({ input: tile, left: (k % 3) * N, top: Math.floor(k / 3) * N })))
    .png()
    .toBuffer()
  await sharp(big).blur(0.6).extract({ left: N, top: N, width: N, height: N }).png({ compressionLevel: 9 }).toFile(join(OUT, 'grain.png'))
  console.log('grain.png')
}

writeFileSync(META, JSON.stringify(meta, null, 1))
console.log(`\n${Object.keys(meta).length} images → src/data/images.json`)
