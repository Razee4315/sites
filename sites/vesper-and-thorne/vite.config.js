import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

// <img data-i="pour-1"> in index.html becomes a full tag with src, srcset, width and height
// taken from src/img-meta.json (written by tools/process.mjs), so no image ever shifts layout.
const images = () => ({
  name: 'vt-images',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const meta = JSON.parse(readFileSync(new URL('./src/img-meta.json', import.meta.url), 'utf8'))
      return html.replace(/<img\b([^>]*?)\sdata-i="([^"]+)"([^>]*)>/g, (tag, pre, id, post) => {
        const m = meta[id]
        if (!m) throw new Error(`image "${id}" is not in img-meta.json`)
        const rest = pre + post
        const sizes = /\ssizes=/.test(rest) ? '' : ' sizes="100vw"'
        const lazy = /\sloading=/.test(rest) ? '' : ' loading="lazy"'
        return `<img${pre} src="/img/${id}.webp" srcset="/img/${id}-s.webp ${m.sw}w, /img/${id}.webp ${m.w}w"${sizes} width="${m.w}" height="${m.h}"${lazy} decoding="async"${post}>`
      })
    },
  },
})

export default defineConfig({
  plugins: [images()],
  server: { host: 'localhost' },
  preview: { host: 'localhost' },
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
