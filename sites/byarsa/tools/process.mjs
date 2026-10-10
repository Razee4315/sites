// assets-raw/*.png  ->  public/img/*.webp  +  src/images.json (width / height / variants per image id)
// Cut-outs are trimmed to their alpha box; aligned chains share one crop (and one alpha where asked).
import sharp from 'sharp'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const OUT = join(root, 'public', 'img')
mkdirSync(OUT, { recursive: true })

// id: { src | chain:[raw...] + names:[...], trim: 'box' | 'top' | false, widths:[...], q, shareAlpha }
const flowers = ['primula', 'aconite', 'potentilla', 'gentian', 'edelweiss', 'poppy', 'aster', 'pedicularis', 'bistort', 'geranium', 'rhodiola']
const jobs = [
  { chain: ['hero-far-1', 'hero-far-2', 'hero-far-3', 'hero-far-4'], names: ['hero-far-day', 'hero-far-blue', 'hero-far-glow', 'hero-far-night'], trim: 'top', widths: [1000, 1672], q: 80 },
  { chain: ['hero-near-1', 'hero-near-2', 'hero-near-3', 'hero-near-4'], names: ['hero-near-day', 'hero-near-blue', 'hero-near-glow', 'hero-near-night'], trim: 'top', widths: [1000, 1672], q: 80 },
  { chain: ['tent-1', 'tent-2'], names: ['tent-day', 'tent-night'], trim: 'box', widths: [640], q: 84 },
  ...flowers.map((f) => ({ src: `fl-${f}`, trim: 'box', widths: [420, 840], q: 84 })),
  { src: 'an-bear-stand', trim: 'box', widths: [420, 760], q: 84 },
  { src: 'an-bear-walk', trim: 'box', widths: [640, 1280], q: 84 },
  { src: 'an-marmot', trim: 'box', widths: [440, 860], q: 84 },
  { src: 'an-fox', trim: 'box', widths: [700, 1400], q: 84 },
  { src: 'an-ibex', trim: 'box', widths: [460, 920], q: 84 },
  { src: 'an-lammergeier', trim: 'box', widths: [820, 1640], q: 84 },
  { src: 'cut-jeep', trim: 'box', widths: [420], q: 84 },
  { src: 'cut-cloud-a', trim: 'box', widths: [800, 1500], q: 78 },
  { src: 'cut-cloud-b', trim: 'box', widths: [800, 1500], q: 78 },
  { src: 'ph-sheosar', widths: [900, 1536], q: 84 },
  { src: 'ph-barapani', widths: [900, 1672], q: 80 },
  { src: 'ph-storm', widths: [1400, 0], q: 80 },
  { src: 'ph-meadow', widths: [600, 1024], q: 80 },
  { src: 'ph-sadpara', widths: [600, 1024], q: 80 },
  { src: 'ph-track', widths: [800, 1536], q: 80 },
  { src: 'ph-scope', widths: [600, 1024], q: 80 },
  { src: 'ph-camp', widths: [800, 1536], q: 80 },
  { src: 'ph-herders', widths: [800, 1536], q: 80 },
  { src: 'ph-kettle', widths: [600, 1024], q: 80 },
  { src: 'ph-bearland', widths: [800, 1536], q: 84 },
  { src: 'ph-aerial', widths: [600, 1024], q: 80 },
  { src: 'ph-dusk', widths: [900, 1672], q: 80 },
  { src: 'ph-milkyway', widths: [900, 0], q: 78 },
]

const load = async (name) => {
  const { data, info } = await sharp(join(RAW, `${name}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

const box = ({ data, w, h }, min = 10) => {
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > min) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  return { x0, y0, x1, y1 }
}

const manifest = {}
for (const job of jobs) {
  const raws = job.chain || [job.src]
  const names = job.names || [job.src]
  if (!raws.every((r) => existsSync(join(RAW, `${r}.png`)))) {
    console.log(`skip  ${names.join(', ')} (raw missing)`)
    continue
  }
  const imgs = await Promise.all(raws.map(load))
  const { w, h } = imgs[0]

  if (job.shareAlpha) for (const im of imgs.slice(1)) for (let i = 3; i < im.data.length; i += 4) im.data[i] = imgs[0].data[i]

  let crop = { left: 0, top: 0, width: w, height: h }
  if (job.trim) {
    const b = imgs.map((im) => box(im)).reduce((a, c) => ({ x0: Math.min(a.x0, c.x0), y0: Math.min(a.y0, c.y0), x1: Math.max(a.x1, c.x1), y1: Math.max(a.y1, c.y1) }))
    const pad = 6
    if (job.trim === 'top') crop = { left: 0, top: Math.max(0, b.y0 - pad), width: w, height: h - Math.max(0, b.y0 - pad) }
    else {
      const left = Math.max(0, b.x0 - pad), top = Math.max(0, b.y0 - pad)
      crop = { left, top, width: Math.min(w, b.x1 + pad + 1) - left, height: Math.min(h, b.y1 + pad + 1) - top }
    }
  }

  for (let i = 0; i < imgs.length; i++) {
    const base = () => sharp(imgs[i].data, { raw: { width: w, height: h, channels: 4 } }).extract(crop)
    const variants = []
    for (const want of job.widths) {
      const vw = want && want < crop.width ? want : crop.width
      if (variants.some((v) => v.w === vw)) continue
      const file = `${names[i]}-${vw}.webp`
      let p = base()
      if (vw !== crop.width) p = p.resize({ width: vw })
      if (!job.trim) p = p.removeAlpha()
      const info = await p.webp({ quality: job.q, alphaQuality: 90, effort: 5 }).toFile(join(OUT, file))
      variants.push({ w: vw, h: info.height, file, kb: Math.round(info.size / 1024) })
    }
    variants.sort((a, b) => a.w - b.w)
    const big = variants.at(-1)
    manifest[names[i]] = { w: big.w, h: big.h, variants: variants.map(({ w, file }) => ({ w, file })) }
    console.log(`${names[i].padEnd(18)} ${String(big.w).padStart(4)}x${String(big.h).padEnd(4)} ${variants.map((v) => `${v.w}w ${v.kb}kb`).join('  ')}`)
  }
}

writeFileSync(join(root, 'src', 'images.json'), JSON.stringify(manifest, null, 1))
console.log(`\n${Object.keys(manifest).length} images -> public/img, sizes -> src/images.json`)
