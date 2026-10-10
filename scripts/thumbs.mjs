// Retakes the gallery thumbnails: opens each built site and saves its first screen to gallery/thumbs/<name>.webp.
// Needs `npm run build` and `npm run preview` first, plus Chrome (or set CHROME to another Chromium browser).
// Borrows puppeteer-core from sites/deosai, which already depends on it.
import { createRequire } from 'node:module'
import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const puppeteer = createRequire(join(root, 'sites', 'deosai', 'package.json'))('puppeteer-core')
const origin = process.env.ORIGIN || 'http://localhost:4000'
const executablePath = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const settle = Number(process.env.SETTLE) || 6000
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const all = readdirSync(join(root, 'sites'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
const names = process.argv.length > 2 ? process.argv.slice(2) : all

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--hide-scrollbars'] })
for (const name of names) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${origin}/${name}/`, { waitUntil: 'networkidle0', timeout: 60000 })
  await wait(settle)
  // The two foundries open on a sound prompt; go in without sound so the thumbnail shows the page behind it.
  const entered = await page.evaluate(() => {
    const quiet = [...document.querySelectorAll('button, a')].find((el) => /quietly|in silence/i.test(el.textContent))
    quiet?.click()
    return Boolean(quiet)
  })
  if (entered) await wait(settle)
  await page.screenshot({ path: join(root, 'gallery', 'thumbs', `${name}.webp`), type: 'webp', quality: 84 })
  await page.close()
  console.log(`thumb ${name}`)
}
await browser.close()
