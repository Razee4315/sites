// Finds openly licensed photographs on Wikimedia Commons.
//   node tools/commons.mjs search            -> candidates for every entry in tools/photo-queries.json (thumbs + json)
//   node tools/commons.mjs fetch             -> downloads the picks in tools/photo-picks.json at full working size
// Only public-domain / CC0 / CC BY / CC BY-SA files are ever kept; author, licence and source page are recorded.
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { get } from './net.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CAND = join(root, 'assets-raw', 'real', 'candidates')
const REAL = join(root, 'assets-raw', 'real')
// Commons' own API host does not resolve on this network; en.wikipedia.org answers for Commons files too (shared repository).
const API = 'https://en.wikipedia.org/w/api.php'
const UA = { 'User-Agent': 'DeosaiSiteBuilder/1.0 (personal educational project; contact anisnur19315@gmail.com)' }
const OPEN = /^(cc0|public domain|pd|cc by(-sa)? [0-9.]+|cc-by(-sa)?-[0-9.]+|cc by(-sa)?$)/i
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const strip = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim()

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`
  for (let i = 0; i < 4; i++) {
    const r = await get(url, UA).catch(() => ({ ok: false }))
    if (r.ok) return JSON.parse(r.buffer.toString('utf8'))
    await sleep(1500 * (i + 1))
  }
  throw new Error(`api failed: ${url}`)
}

async function download(url, file) {
  for (let i = 0; i < 4; i++) {
    const r = await get(url, UA).catch(() => ({ ok: false }))
    if (r.ok) return writeFileSync(file, r.buffer)
    await sleep(2000 * (i + 1))
  }
  throw new Error(`download failed: ${url}`)
}

const info = (p, width) => {
  const ii = p.imageinfo?.[0]
  if (!ii) return null
  const m = ii.extmetadata || {}
  return {
    title: p.title,
    page: ii.descriptionurl,
    thumb: ii.thumburl,
    w: ii.width,
    h: ii.height,
    mime: ii.mime,
    licence: strip(m.LicenseShortName?.value),
    licenceUrl: m.LicenseUrl?.value || '',
    author: strip(m.Artist?.value).slice(0, 120),
    credit: strip(m.Credit?.value).slice(0, 120),
    desc: strip(m.ImageDescription?.value).slice(0, 200),
    width,
  }
}

async function search(q, limit, thumbWidth) {
  const j = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: String(thumbWidth),
  })
  return Object.values(j.query?.pages || {})
    .sort((a, b) => a.index - b.index)
    .map((p) => info(p, thumbWidth))
    .filter((c) => c && OPEN.test(c.licence) && /jpeg|png/.test(c.mime) && Math.max(c.w, c.h) >= 1000)
}

const mode = process.argv[2]
const onlyIds = process.argv.slice(3)

if (mode === 'search') {
  const queries = JSON.parse(readFileSync(join(root, 'tools', 'photo-queries.json'), 'utf8'))
  for (const [id, qs] of Object.entries(queries)) {
    if (onlyIds.length && !onlyIds.includes(id)) continue
    const dir = join(CAND, id)
    if (existsSync(join(dir, 'candidates.json')) && !onlyIds.length) continue
    mkdirSync(dir, { recursive: true })
    const seen = new Set()
    const picks = []
    for (const q of [].concat(qs)) {
      for (const c of await search(q, 14, 480)) {
        if (seen.has(c.title) || picks.length >= 8) continue
        seen.add(c.title)
        picks.push(c)
      }
      await sleep(250)
    }
    for (const [i, c] of picks.entries()) {
      c.file = `${i + 1}.jpg`
      try {
        await download(c.thumb, join(dir, c.file))
      } catch {
        c.file = null
      }
      await sleep(120)
    }
    writeFileSync(join(dir, 'candidates.json'), JSON.stringify(picks.filter((c) => c.file), null, 1))
    console.log(`${id.padEnd(26)} ${picks.length} candidate(s)`)
  }
}

if (mode === 'fetch') {
  // photo-picks.json: { id: "File:Exact title.jpg" }
  const picks = JSON.parse(readFileSync(join(root, 'tools', 'photo-picks.json'), 'utf8'))
  const creditsFile = join(REAL, 'credits.json')
  const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {}
  for (const [id, title] of Object.entries(picks)) {
    if (onlyIds.length && !onlyIds.includes(id)) continue
    if (credits[id]?.title === title && existsSync(join(REAL, `${id}.jpg`))) continue
    const j = await api({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '2400' })
    const c = info(Object.values(j.query.pages)[0], 2400)
    if (!c || !OPEN.test(c.licence)) {
      console.log(`SKIP  ${id}  licence "${c?.licence}" not open, or file missing`)
      continue
    }
    await download(c.thumb, join(REAL, `${id}.jpg`))
    credits[id] = { title: c.title, page: c.page, author: c.author || c.credit, licence: c.licence, licenceUrl: c.licenceUrl }
    writeFileSync(creditsFile, JSON.stringify(credits, null, 1))
    console.log(`ok    ${id.padEnd(26)} ${c.licence.padEnd(14)} ${c.author || c.credit}`)
    await sleep(300)
  }
}
