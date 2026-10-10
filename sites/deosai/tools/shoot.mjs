// Headless Chrome screenshots: node tools/shoot.mjs <label> <width> <height> <target ...>
// target = "#selector", "#selector+0.5" (selector top plus 0.5 viewport heights), or a pixel number
import puppeteer from 'puppeteer-core'
const [label, w, h, ...targets] = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars', '--force-device-scale-factor=1'] })
const page = await browser.newPage()
await page.setViewport({ width: +w, height: +h, isMobile: +w < 700, hasTouch: +w < 700 })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))
page.on('requestfailed', (r) => errors.push('FAILED ' + r.url()))
await page.goto(process.env.URL || 'http://localhost:5391/', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4500))
let i = 0
for (const t of targets) {
  const y = await page.evaluate((t, vh) => {
    if (/^\d+$/.test(t)) return +t
    const [sel, off] = t.split('+')
    const el = document.querySelector(sel)
    return el ? el.getBoundingClientRect().top + scrollY + (parseFloat(off) || 0) * vh : 0
  }, t, +h)
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await new Promise((r) => setTimeout(r, 1900))
  await page.screenshot({ path: `shots/${label}-${String(i++).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 72 })
}
console.log(errors.length ? errors.slice(0, 12).join('\n') : 'no console errors')
await browser.close()
