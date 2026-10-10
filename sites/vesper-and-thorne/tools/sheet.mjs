// contact sheet for eyeballing: node tools/sheet.mjs out.png "#6b6b6b" cell id id id ...
import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const [out, bg, cellS, ...ids] = process.argv.slice(2)
const cell = Number(cellS)
const cols = Math.min(ids.length, Number(process.env.COLS || 3))
const rows = Math.ceil(ids.length / cols)
const tiles = await Promise.all(ids.map(async (id, i) => ({
  input: await sharp(join(root, 'public/img', `${id}.webp`)).resize(cell - 16, cell - 16, { fit: 'inside' }).png().toBuffer(),
  left: (i % cols) * cell + 8, top: Math.floor(i / cols) * cell + 8,
})))
await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: bg } }).composite(tiles).png().toFile(out)
