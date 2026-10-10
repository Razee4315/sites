import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const imagesJson = fileURLToPath(new URL('./src/data/images.json', import.meta.url))

// <img data-img="lemon" ...> in index.html becomes a full tag with src, srcset and
// the real pixel dimensions recorded by tools/process.mjs.
function pronkImages() {
  return {
    name: 'pronk-images',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const meta = JSON.parse(readFileSync(imagesJson, 'utf8'))
        return html.replace(/<img\s+data-img="([^"]+)"([^>]*)>/g, (_, id, rest) => {
          const im = meta[id]
          if (!im) throw new Error(`index.html asks for image "${id}" which is not in images.json`)
          const set = [...im.small.map((w) => `/img/${id}-${w}.webp ${w}w`), `/img/${id}.webp ${im.w}w`].join(', ')
          const srcset = im.small.length ? ` srcset="${set}"${/\ssizes=/.test(rest) ? '' : ' sizes="100vw"'}` : ''
          return `<img src="/img/${id}.webp"${srcset} width="${im.w}" height="${im.h}"${rest}>`
        })
      },
    },
    configureServer(server) {
      server.watcher.add(imagesJson)
      server.watcher.on('change', (f) => f.endsWith('images.json') && server.ws.send({ type: 'full-reload' }))
    },
  }
}

export default defineConfig({
  plugins: [pronkImages()],
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
