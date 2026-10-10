// Raw Codex PNGs -> web-ready WebP in public/img, plus src/data/images.json with
// the pixel size of every file so each <img> can carry explicit dimensions.
//
//   node tools/process.mjs            process everything in assets-raw/
//   node tools/process.mjs --check    only print the alpha report
import sharp from 'sharp'
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { images } from './manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const OUT = join(root, 'public', 'img')
const DATA = join(root, 'src', 'data')
mkdirSync(OUT, { recursive: true })
mkdirSync(DATA, { recursive: true })
const checkOnly = process.argv.includes('--check')

// longest edge per family, and extra widths to emit for srcset
const SPEC = {
  table: { max: 2560, widths: [1280], quality: 80 },
  room: { max: 1400, widths: [800], quality: 80 },
  past: { max: 1600, widths: [900], quality: 80 },
  plate: { max: 360, widths: [], quality: 86, alpha: true },
  obj: { max: 1100, widths: [560], quality: 86, alpha: true },
  surface: { max: 1600, widths: [], quality: 72 },
}

// things only ever shown small
const MAX = { fly: 260, moth: 380, cherries: 520, walnut: 560, snail: 640 }

const manifestById = Object.fromEntries(images.map((i) => [i.id, i]))
const familyOf = (name) => {
  const id = name.replace(/\.png$/, '')
  return (manifestById[id] || manifestById[id.replace(/-\d+$/, '')])?.family
}

// share of pixels that are fully clear / fully solid / in between
async function alphaReport(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let clear = 0, solid = 0, lo = 255, hi = 0
  const n = info.width * info.height
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i]
    if (a < lo) lo = a
    if (a > hi) hi = a
    if (a <= 8) clear++
    else if (a >= 247) solid++
  }
  return { w: info.width, h: info.height, lo, hi, clear: clear / n, solid: solid / n, semi: 1 - (clear + solid) / n }
}

const pct = (v) => (v * 100).toFixed(1).padStart(5) + '%'
const meta = {}
const files = readdirSync(RAW).filter((f) => f.endsWith('.png')).sort()

for (const f of files) {
  const family = familyOf(f)
  if (!family) { console.log(`skip  ${f} (not in manifest)`); continue }
  const spec = SPEC[family]
  const id = f.replace(/\.png$/, '')
  const src = join(RAW, f)
  let pipeline = sharp(src)

  if (id === 'craquelure' && !checkOnly) {
    // keep only the cracks: dark hairlines on a transparent sheet, mirrored into a 16:9 tile that has no seam
    const S = 1024
    const grey = await sharp(src).resize(S, S).greyscale().raw().toBuffer()
    const soft = await sharp(src).resize(S, S).greyscale().blur(10).raw().toBuffer()
    const half = Buffer.alloc(S * S * 4)
    for (let i = 0; i < S * S; i++) {
      half[i * 4] = 22; half[i * 4 + 1] = 14; half[i * 4 + 2] = 8
      half[i * 4 + 3] = Math.max(0, Math.min(255, (soft[i] - grey[i] - 6) * 7))
    }
    const a = await sharp(half, { raw: { width: S, height: S, channels: 4 } }).png().toBuffer()
    const b = await sharp(a).flop().png().toBuffer()
    const W = 1820
    await sharp({ create: { width: S * 2, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: a, left: 0, top: 0 }, { input: b, left: S, top: 0 }])
      .png().toBuffer()
      .then((buf) => sharp(buf).extract({ left: Math.round((S * 2 - W) / 2), top: 0, width: W, height: S }).webp({ quality: 70, alphaQuality: 80, effort: 5 }).toFile(join(OUT, 'craquelure.webp')))
    meta[id] = { w: W, h: S, small: [] }
    console.log(`ok    craquelure       cracks only, ${W}x${S}`)
    continue
  }

  if (spec.alpha) {
    // edits in a chain can return a hazy alpha: borrow the first step's clean one, they are pixel-aligned
    const chainStep = id.match(/^(.*)-(\d+)$/)
    let alphaSrc = src
    if (chainStep && chainStep[2] !== '1' && existsSync(join(RAW, `${chainStep[1]}-1.png`))) alphaSrc = join(RAW, `${chainStep[1]}-1.png`)
    const rep = await alphaReport(src)
    const flag = rep.lo > 8 ? 'NO-ALPHA' : rep.semi > 0.12 ? 'HAZY' : 'clean'
    console.log(`alpha ${id.padEnd(16)} ${rep.w}x${rep.h} a:${rep.lo}-${rep.hi} clear${pct(rep.clear)} solid${pct(rep.solid)} semi${pct(rep.semi)} ${flag}${alphaSrc !== src ? ' (alpha from step 1)' : ''}`)
    if (checkOnly) continue
    if (alphaSrc !== src) {
      const { width, height } = await sharp(src).metadata()
      // two passes: sharp applies removeAlpha after joinChannel inside a single pipeline
      const a = await sharp(alphaSrc).ensureAlpha().extractChannel(3).resize(width, height).png().toBuffer()
      const rgb = await sharp(src).removeAlpha().png().toBuffer()
      pipeline = sharp(await sharp(rgb).joinChannel(a).png().toBuffer())
    }
    // trim the transparent margin so layout boxes hug the object (chains keep their shared frame)
    if (!chainStep) pipeline = sharp(await pipeline.trim({ threshold: 6 }).png().toBuffer())
  } else if (checkOnly) continue

  const base = await pipeline.png().toBuffer()
  const m = await sharp(base).metadata()
  const scale = Math.min(1, (MAX[id] || spec.max) / Math.max(m.width, m.height))
  const w = Math.round(m.width * scale)
  const h = Math.round(m.height * scale)
  const opts = { quality: spec.quality, alphaQuality: 90, effort: 5, smartSubsample: true }
  await sharp(base).resize(w, h).webp(opts).toFile(join(OUT, `${id}.webp`))
  const small = []
  for (const sw of spec.widths) {
    if (sw >= w) continue
    await sharp(base).resize(sw).webp(opts).toFile(join(OUT, `${id}-${sw}.webp`))
    small.push(sw)
  }
  meta[id] = { w, h, small }
  if (!spec.alpha) console.log(`ok    ${id.padEnd(16)} ${m.width}x${m.height} -> ${w}x${h}`)
}

if (!checkOnly) {
  writeFileSync(join(DATA, 'images.json'), JSON.stringify(meta, null, 2))
  console.log(`\n${Object.keys(meta).length} images -> public/img, sizes in src/data/images.json`)
}
