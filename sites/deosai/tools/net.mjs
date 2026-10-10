// commons.wikimedia.org does not resolve on this network, but it is served by the same front end as
// en.wikipedia.org. This tiny fetch connects there and asks for the right host.
import https from 'node:https'
import dns from 'node:dns'

const lookup = (host, opts, cb) => dns.lookup(/wikimedia\.org$/.test(host) && !host.startsWith('upload') ? 'en.wikipedia.org' : host, opts, cb)

export function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, lookup, timeout: 45000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return resolve(get(new URL(res.headers.location, url).href, headers))
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({ ok: res.statusCode === 200, status: res.statusCode, buffer: Buffer.concat(chunks) }))
    })
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.on('error', reject)
  })
}
