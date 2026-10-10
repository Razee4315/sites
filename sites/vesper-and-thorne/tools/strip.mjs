// lays screenshots side by side for review: node tools/strip.mjs out.png cellW file file ...
import sharp from 'sharp'
const [out, cw, ...files] = process.argv.slice(2)
const w = Number(cw)
const bufs = await Promise.all(files.map((f) => sharp(f).resize({ width: w }).png().toBuffer({ resolveWithObject: true })))
const h = Math.max(...bufs.map((b) => b.info.height))
await sharp({ create: { width: (w + 10) * bufs.length - 10, height: h, channels: 3, background: '#ff00ff' } })
  .composite(bufs.map((b, i) => ({ input: b.data, left: i * (w + 10), top: 0 })))
  .png().toFile(out)
