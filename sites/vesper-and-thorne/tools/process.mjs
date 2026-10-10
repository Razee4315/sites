// Turns the raw Codex PNGs in assets-raw/ into trimmed, sized WebP in public/img/ (large + small)
// and writes src/img-meta.json with the dimensions every <img> needs.
//   node tools/process.mjs            everything
//   node tools/process.mjs bell pour  only ids starting with these
import sharp from 'sharp'
import { readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const OUT = join(root, 'public', 'img')
const META = join(root, 'src', 'img-meta.json')
mkdirSync(OUT, { recursive: true })
const meta = existsSync(META) ? JSON.parse(readFileSync(META, 'utf8')) : {}
const only = process.argv.slice(2)

// per-image rules; first matching prefix wins
const RULES = [
  { p: 'bell-', trim: 'shared', alphaFrom: 'bell-1', max: 1500, q: 90 },
  { p: 'sally-', trim: 'x', max: 1800, q: 88 }, // rope must run off top and bottom: trim sides only
  { p: 'land-', trim: 'none', max: 2400, q: 84 }, // layers stay registered to the frame
  { p: 'birds', trim: 'all', max: 2000, q: 86 },
  { p: 'pour-', trim: 'none', max: 2200, q: 80 },
]
const rule = (id) => RULES.find((r) => id.startsWith(r.p)) || { trim: 'all', max: 2200, q: 84 }

async function rawOf(file) {
  const img = sharp(join(RAW, file)).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

function alphaStats({ data, w, h }) {
  let min = 255, max = 0, semi = 0, solid = 0
  let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3]
      if (a < min) min = a
      if (a > max) max = a
      if (a > 12) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
        if (a < 243) semi++
        else solid++
      }
    }
  return { min, max, semi: semi / Math.max(1, semi + solid), cover: (semi + solid) / (w * h), box: [x0, y0, x1 + 1, y1 + 1] }
}

async function emit(id, raw, box, q, max, hasAlpha) {
  const [x0, y0, x1, y1] = box
  const base = sharp(raw.data, { raw: { width: raw.w, height: raw.h, channels: 4 } }).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
  const w0 = x1 - x0, h0 = y1 - y0
  const s = Math.min(1, max / Math.max(w0, h0))
  const w = Math.round(w0 * s), h = Math.round(h0 * s)
  const sw = Math.round(w / 2), sh = Math.round(h / 2)
  const enc = (im) => (hasAlpha ? im.webp({ quality: q, alphaQuality: 92, effort: 5 }) : im.removeAlpha().webp({ quality: q, effort: 5 }))
  await enc(base.clone().resize(w, h, { kernel: 'lanczos3' })).toFile(join(OUT, `${id}.webp`))
  await enc(base.clone().resize(sw, sh, { kernel: 'lanczos3' })).toFile(join(OUT, `${id}-s.webp`))
  meta[id] = { w, h, sw, sh }
  const kb = (f) => Math.round(statSync(join(OUT, f)).size / 1024)
  return `${w}x${h} ${kb(`${id}.webp`)}KB / ${sw}x${sh} ${kb(`${id}-s.webp`)}KB`
}

const files = readdirSync(RAW).filter((f) => f.endsWith('.png')).sort()
const shared = {}
for (const f of files) {
  const id = basename(f, '.png')
  if (only.length && !only.some((o) => id.startsWith(o))) continue
  const r = rule(id)
  const raw = await rawOf(f)
  let st = alphaStats(raw)
  let note = ''
  if (r.alphaFrom) {
    // edits in a chain come back hazy; they are pixel-registered, so borrow the first frame's clean alpha
    if (!shared[r.alphaFrom]) {
      const first = await rawOf(`${r.alphaFrom}.png`)
      shared[r.alphaFrom] = { raw: first, st: alphaStats(first) }
    }
    const src = shared[r.alphaFrom]
    if (id !== r.alphaFrom && src.raw.w === raw.w && src.raw.h === raw.h) {
      note = `  (own alpha: semi ${(st.semi * 100).toFixed(1)}% cover ${(st.cover * 100).toFixed(0)}% -> borrowed)`
      for (let i = 3; i < raw.data.length; i += 4) raw.data[i] = src.raw.data[i]
    }
    st = src.st
  }
  const hasAlpha = st.min < 250
  let box = [0, 0, raw.w, raw.h]
  if (hasAlpha && r.trim !== 'none') {
    const [x0, y0, x1, y1] = st.box
    const pad = Math.round(0.012 * Math.max(x1 - x0, y1 - y0))
    const bx = [Math.max(0, x0 - pad), Math.max(0, y0 - pad), Math.min(raw.w, x1 + pad), Math.min(raw.h, y1 + pad)]
    box = r.trim === 'x' ? [bx[0], 0, bx[2], raw.h] : bx
  }
  const out = await emit(id, raw, box, r.q, r.max, hasAlpha)
  const a = hasAlpha ? `alpha ${st.min}-${st.max} semi ${(st.semi * 100).toFixed(1)}% cover ${(st.cover * 100).toFixed(0)}%` : 'opaque'
  console.log(`${id.padEnd(16)} raw ${raw.w}x${raw.h}  ${a.padEnd(38)} -> ${out}${note}`)
}
writeFileSync(META, JSON.stringify(meta, null, 1))
