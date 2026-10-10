// Flattens cut-outs onto the site's two grounds so they can be judged by eye.
//   node tools/preview.mjs lemon moth   -> tools/preview/<id>.jpg (dark left, bone right)
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
mkdirSync('tools/preview', { recursive: true })
for (const id of process.argv.slice(2)) {
  const src = sharp(`assets-raw/${id}.png`)
  const { width, height } = await src.metadata()
  const s = Math.min(1, 900 / Math.max(width, height))
  const w = Math.round(width * s), h = Math.round(height * s)
  const buf = await src.resize(w, h).png().toBuffer()
  const on = (bg) => sharp({ create: { width: w, height: h, channels: 3, background: bg } }).composite([{ input: buf }]).png().toBuffer()
  await sharp({ create: { width: w * 2, height: h, channels: 3, background: '#000' } })
    .composite([{ input: await on('#0b0907'), left: 0, top: 0 }, { input: await on('#e8dfcc'), left: w, top: 0 }])
    .jpeg({ quality: 88 }).toFile(`tools/preview/${id}.jpg`)
  console.log(id, width, height)
}
