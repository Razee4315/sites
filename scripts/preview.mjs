// Serves dist/ at http://localhost:4000 so the gallery and every site can be clicked through locally.
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const port = Number(process.env.PORT) || 4000
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webm': 'video/webm',
}

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  let file = join(dist, path)
  if (!file.startsWith(dist)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('\\') && !path.endsWith('/')) return res.writeHead(301, { Location: `${req.url}/` }).end()
    file = join(file, 'index.html')
  }
  if (!existsSync(file)) return res.writeHead(404).end('Not found')
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`http://localhost:${port}`))
