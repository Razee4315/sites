// Interaction checks: specimen sheet, photo swap, index overlay, and the phone layout.
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] })
const errors = []
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
async function open(w, h, mobile) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 })
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))
  await page.goto('http://localhost:5391/', { waitUntil: 'networkidle2', timeout: 60000 })
  await wait(4500)
  return page
}
const to = async (page, sel, off = 0) => { await page.evaluate((sel, off) => { const el = document.querySelector(sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + off * innerHeight) }, sel, off); await wait(1800) }
const snap = (page, name) => page.screenshot({ path: `shots/${name}.jpg`, type: 'jpeg', quality: 70 })

let p = await open(1440, 810, false)
await to(p, '.bear', 0.1)
await p.click('.bear__art'); await wait(1900); await snap(p, 'x-sheet')
await p.click('.sheet__print'); await wait(1400); await snap(p, 'x-swap')
await p.keyboard.press('ArrowRight'); await wait(1700); await snap(p, 'x-next')
await p.keyboard.press('Escape'); await wait(900)
await p.click('.bar__index'); await wait(1600); await snap(p, 'x-index')
await p.keyboard.press('Escape'); await wait(900)
await to(p, '.small', 0.2); await p.mouse.move(900, 420); await wait(900); await snap(p, 'x-loupe')
await to(p, '.pond', 0); await p.mouse.move(700, 300); await wait(1500); await snap(p, 'x-pond')
await p.close()

p = await open(390, 844, true)
await snap(p, 'm-00')
const stops = [['#top', 2.2], ['#about', 0], ['#about', 1.1], ['#w-plants', 0], ['#w-plants', 1.2], ['#w-flowers', 1.1], ['.small', 0.3], ['.bear', 0], ['.lookout', 0.3], ['.flock', 0], ['#w-water', 1.0], ['.pond', 0], ['.rim', 0], ['.lights', 1.2], ['#end', 1.95], ['#credits', 0.6]]
let i = 1
for (const [s, o] of stops) { await to(p, s, o); await snap(p, `m-${String(i++).padStart(2, '0')}`) }
await to(p, '.field', 0); await p.tap('.card--bloom'); await wait(1900); await snap(p, 'm-sheet')
console.log(errors.length ? errors.slice(0, 10).join('\n') : 'no console errors')
await browser.close()
