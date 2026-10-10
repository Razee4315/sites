// Alpha report + contact previews for raw images.
//   node tools/inspect.mjs [id ...]       (no ids = everything in assets-raw)
// Prints size and an alpha histogram, and writes a preview of each cut-out
// composited over a loud flat colour into tools/preview/, so halos are obvious.
import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const OUT = join(root, 'tools', 'preview')
mkdirSync(OUT, { recursive: true })

const ids = process.argv.slice(2)
const files = readdirSync(RAW).filter((f) => f.endsWith('.png') && (!ids.length || ids.some((id) => f === `${id}.png` || f.startsWith(`${id}-`))))

for (const f of files) {
  const img = sharp(join(RAW, f))
  const meta = await img.metadata()
  if (meta.channels < 4) {
    console.log(`${f.padEnd(22)} ${meta.width}x${meta.height}  opaque (no alpha)`)
    continue
  }
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const n = info.width * info.height
  const b = { clear: 0, faint: 0, mid: 0, nearly: 0, solid: 0 }
  for (let i = 3; i < data.length; i += 4) {
    const v = data[i]
    if (v <= 2) b.clear++
    else if (v < 40) b.faint++
    else if (v < 215) b.mid++
    else if (v < 250) b.nearly++
    else b.solid++
  }
  const pct = (k) => ((b[k] / n) * 100).toFixed(1).padStart(5) + '%'
  console.log(
    `${f.padEnd(22)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)}  clear ${pct('clear')}  faint ${pct('faint')}  mid ${pct('mid')}  nearly ${pct('nearly')}  solid ${pct('solid')}`,
  )
  await sharp(join(RAW, f))
    .flatten({ background: '#ff2bd6' })
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(join(OUT, f.replace('.png', '.jpg')))
}
