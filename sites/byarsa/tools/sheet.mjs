// Contact sheet of raw PNGs flattened onto a background, for reviewing a batch at a glance.
// usage: node tools/sheet.mjs <out.jpg> <bg hex> <cell px> <cols> <prefix> [prefix ...]
import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAW = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets-raw')
const [out, bg, cellArg, colsArg, ...want] = process.argv.slice(2)
const cell = Number(cellArg)
const cols = Number(colsArg)
const files = readdirSync(RAW).filter((f) => f.endsWith('.png') && want.some((w) => f.startsWith(w)))
const rows = Math.ceil(files.length / cols)
const tiles = await Promise.all(
  files.map(async (f, i) => ({
    input: await sharp(join(RAW, f)).resize(cell - 8, cell - 8, { fit: 'inside' }).png().toBuffer(),
    left: (i % cols) * cell + 4,
    top: Math.floor(i / cols) * cell + 4,
  })),
)
await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: bg } })
  .composite(tiles)
  .jpeg({ quality: 86 })
  .toFile(out)
console.log(files.join('  '))
