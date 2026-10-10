import { defineConfig } from 'vite'
import { readFileSync, existsSync } from 'node:fs'

// <img data-i="ostro-1"> becomes a full tag: src, intrinsic width/height, and a srcset when a small rendition exists.
function images() {
  const metaPath = new URL('./src/img-meta.json', import.meta.url)
  return {
    name: 'tern-images',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {}
        return html.replace(/<img\b([^>]*?)\sdata-i="([^"]+)"/g, (tag, before, id) => {
          const m = meta[id]
          if (!m) throw new Error(`index.html uses an image that was never processed: "${id}"`)
          const small = meta[`${id}@s`]
          const set = small ? ` srcset="/img/${id}@s.webp ${small.w}w, /img/${id}.webp ${m.w}w"` : ''
          return `<img${before} src="/img/${id}.webp"${set} width="${m.w}" height="${m.h}"`
        })
      },
    },
    configureServer(server) {
      server.watcher.add(metaPath.pathname)
      server.watcher.on('change', (f) => f.endsWith('img-meta.json') && server.ws.send({ type: 'full-reload' }))
    },
  }
}

export default defineConfig({
  plugins: [images()],
  server: { host: '127.0.0.1' },
  build: { target: 'es2022', assetsInlineLimit: 0 },
})
