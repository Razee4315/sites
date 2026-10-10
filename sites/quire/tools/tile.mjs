// node tile.mjs out.jpg cols cellW file file ...
import sharp from 'sharp'
const [out, colsA, cellA, ...files] = process.argv.slice(2)
const cols = +colsA, cw = +cellA
const metas = await Promise.all(files.map((f) => sharp(f).metadata()))
const ch = Math.round(Math.max(...metas.map((m) => (m.height / m.width) * cw)))
const tiles = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize({ width: cw }).toBuffer(), left: (i % cols) * (cw + 8), top: Math.floor(i / cols) * (ch + 8) })))
await sharp({ create: { width: cols * (cw + 8), height: Math.ceil(files.length / cols) * (ch + 8), channels: 3, background: '#555' } }).composite(tiles).jpeg({ quality: 86 }).toFile(out)
console.log(out)
