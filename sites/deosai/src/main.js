import './styles/base.css'
import './styles/cursor.css'
import './styles/hero.css'
import './styles/worlds.css'
import './styles/sheet.css'
import { gsap, ScrollTrigger, $, $$, initScroll, lock, still } from './modules/core.js'
import { mountIcons, icon } from './modules/icons.js'
import { initCursor } from './modules/cursor.js'
import { initHero } from './modules/hero.js'
import { buildWorlds, animateWorlds } from './modules/worlds.js'
import { initSheet } from './modules/sheet.js'
import { initLoupe, initPond, initMarmots, initTilt } from './modules/play.js'

history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

mountIcons()
$('.loader__sc').innerHTML = icon('scissors')
const all = buildWorlds()
initScroll()
const hero = initHero()
animateWorlds(all)
initSheet()
initLoupe()
initPond()
initMarmots()
initTilt()
initCursor()

// the loader waits for the type and the hero's paper, then cuts itself open
const loader = $('.loader')
const num = $('.loader__n')
const cut = $('.loader__cut')
const sc = $('.loader__sc')
const need = [...$$('.hero img'), ...$$('.hero image')]
let done = 0
const state = { p: 0 }
const total = need.length + 1
const draw = () => {
  num.textContent = String(Math.round(state.p * 100)).padStart(3, '0')
  cut.style.transform = `scaleX(${1 - state.p})`
  sc.style.transform = `translateX(${state.p * 100}%)`
}
const bump = () => { done++; gsap.to(state, { p: done / total, duration: 0.5, ease: 'power2.out', onUpdate: draw }) }
const waitImg = (im) =>
  new Promise((r) => {
    if (im.tagName === 'image') { const t = new Image(); t.onload = t.onerror = r; t.src = im.getAttribute('href') }
    else if (im.complete) r()
    else { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }) }
  }).then(bump)

lock(true)
Promise.race([
  Promise.all([document.fonts.load('800 80px Bricolage').catch(() => {}).then(bump), ...need.map(waitImg)]),
  new Promise((r) => setTimeout(r, 9000)),
]).then(() => {
  ScrollTrigger.refresh()
  const open = () => { loader.remove(); lock(false) }
  if (still) return open()
  gsap.timeline()
    .to(state, { p: 1, duration: 0.4, onUpdate: draw })
    .to('.loader__in', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' })
    .add(() => hero.play())
    .to(loader, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '<')
    .add(open)
})

window.addEventListener('load', () => ScrollTrigger.refresh())
