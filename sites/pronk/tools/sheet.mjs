// Contact sheets for review: node tools/sheet.mjs <out-name> <bg> id id id ...
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
mkdirSync('tools/preview', { recursive: true })
const [out, bg, ...ids] = process.argv.slice(2)
const cell = 520, cols = Math.min(4, ids.length), rows = Math.ceil(ids.length / cols)
const tiles = []
for (const [i, id] of ids.entries()) {
  const buf = await sharp(`assets-raw/${id}.png`).resize(cell - 30, cell - 30, { fit: 'inside' }).png().toBuffer()
  const m = await sharp(buf).metadata()
  tiles.push({ input: buf, left: (i % cols) * cell + Math.round((cell - m.width) / 2), top: Math.floor(i / cols) * cell + Math.round((cell - m.height) / 2) })
}
await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: bg } }).composite(tiles).jpeg({ quality: 86 }).toFile(`tools/preview/${out}.jpg`)
console.log(out, ids.join(' '))
