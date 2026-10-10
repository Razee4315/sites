import { defineConfig } from 'vite'
import { readFileSync, existsSync } from 'node:fs'

// <img data-i="id"> in index.html is filled in from src/images.json (written by tools/process.mjs),
// so every image tag ships with src, srcset, width and height without hand-copying numbers.
function images() {
  const file = new URL('./src/images.json', import.meta.url)
  return {
    name: 'byarsa-images',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const map = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
        return html.replace(/<img\s+data-i="([^"]+)"([^>]*)>/g, (tag, id, rest) => {
          const m = map[id]
          if (!m) return tag
          const eager = /data-eager/.test(rest)
          const srcset = m.variants.length > 1 ? ` srcset="${m.variants.map((v) => `/img/${v.file} ${v.w}w`).join(', ')}"` : ''
          const sizes = srcset && !/sizes=/.test(rest) ? ' sizes="100vw"' : ''
          const load = eager ? ' fetchpriority="high"' : ' loading="lazy"'
          return `<img src="/img/${m.variants.at(-1).file}"${srcset}${sizes} width="${m.w}" height="${m.h}"${load}${rest.replace(/\s*data-eager/, '')}>`
        })
      },
    },
    configureServer(server) {
      server.watcher.add(file.pathname)
    },
  }
}

export default defineConfig({
  plugins: [images()],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
  build: { target: 'es2022', assetsInlineLimit: 0 },
})
