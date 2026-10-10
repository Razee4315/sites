// Contact sheets for review: node tools/sheet.mjs <name> <bg> <cols> id id id ...
// Writes tools/preview/sheet-<name>.jpg with each raw image flattened on <bg>.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const [name, bg, colsArg, ...ids] = process.argv.slice(2)
const cols = Number(colsArg)
const CELL = Math.floor(1800 / cols)
const rows = Math.ceil(ids.length / cols)
mkdirSync(join(root, 'tools', 'preview'), { recursive: true })

const tiles = await Promise.all(
  ids.map(async (id, i) => ({
    input: await sharp(join(root, 'assets-raw', `${id}.png`))
      .flatten({ background: bg })
      .resize({ width: CELL - 12, height: CELL - 12, fit: 'contain', background: bg })
      .toBuffer(),
    left: (i % cols) * CELL + 6,
    top: Math.floor(i / cols) * CELL + 6,
  })),
)
await sharp({ create: { width: cols * CELL, height: rows * CELL, channels: 3, background: '#111' } })
  .composite(tiles)
  .jpeg({ quality: 84 })
  .toFile(join(root, 'tools', 'preview', `sheet-${name}.jpg`))
console.log(`sheet-${name}.jpg  ${cols * CELL}x${rows * CELL}`)
