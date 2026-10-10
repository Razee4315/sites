import { defineConfig } from 'vite'
import { readFileSync, existsSync } from 'node:fs'

// <img img="bell-1"> in index.html becomes a real tag with src, width and height from src/img-meta.json,
// so every image reserves its box before it loads.
const sized = () => ({
  name: 'sized-images',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const meta = existsSync('src/img-meta.json') ? JSON.parse(readFileSync('src/img-meta.json', 'utf8')) : {}
      return html.replace(/(<img [^>]*?)img="([\w-]+)"/g, (_, head, id) => {
        const m = meta[id]
        return m ? `${head}src="/img/${id}.webp" width="${m.w}" height="${m.h}"` : `${head}src="/img/${id}.webp"`
      })
    },
  },
})

export default defineConfig({
  plugins: [sized()],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
  build: { target: 'es2022', assetsInlineLimit: 0 },
})
