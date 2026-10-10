// Reports the alpha channel of raw PNGs: size, % transparent / semi / opaque, and the opaque bounding box.
// usage: node tools/alpha.mjs [file-prefix ...]
import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAW = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets-raw')
const want = process.argv.slice(2)
const files = readdirSync(RAW).filter((f) => f.endsWith('.png') && (!want.length || want.some((w) => f.startsWith(w))))

for (const f of files) {
  const img = sharp(join(RAW, f))
  const meta = await img.metadata()
  if (!meta.hasAlpha) {
    console.log(`${f.padEnd(24)} ${meta.width}x${meta.height}  no alpha`)
    continue
  }
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let zero = 0, semi = 0, full = 0
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3]
      if (a <= 4) zero++
      else {
        if (a >= 250) full++
        else semi++
        if (a > 24) {
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
    }
  }
  const n = info.width * info.height
  const pc = (v) => ((v / n) * 100).toFixed(1).padStart(5) + '%'
  console.log(`${f.padEnd(24)} ${meta.width}x${meta.height}  clear ${pc(zero)}  semi ${pc(semi)}  solid ${pc(full)}  box ${x0},${y0} - ${x1},${y1}`)
}
