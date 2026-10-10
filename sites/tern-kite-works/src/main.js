import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { $, $$, reduced, relayout, runFrame } from './js/env.js'
import { wind } from './js/wind.js'
import { initText, splitWords } from './js/text.js'
import { initHud, initSky, initSound, initVane } from './js/chrome.js'
import { initDrift } from './js/drift.js'
import { initHero } from './js/hero.js'
import { initFleet } from './js/fleet.js'
import { initAnatomy, initWorks } from './js/sheet.js'
import { initDial } from './js/dial.js'
import { initFoot, initSend } from './js/send.js'

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({ overwrite: 'auto' })
history.scrollRestoration = 'manual'
ScrollTrigger.config({ ignoreMobileResize: true })

// ── scroll ──────────────────────────────────────────────────────────────────
const lenis = reduced ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, autoRaf: false })
if (lenis) {
  lenis.on('scroll', (l) => {
    ScrollTrigger.update()
    wind.lift = l.velocity * 60
  })
  gsap.ticker.lagSmoothing(0)
}
gsap.ticker.add((time, delta) => {
  lenis?.raf(time * 1000)
  runFrame(Math.min(delta / 1000, 0.05))
})

const quart = (t) => 1 - Math.pow(1 - t, 4)
function scrollTo(target, duration = 1.8) {
  if (lenis) lenis.scrollTo(target, { duration, easing: quart, offset: 0 })
  else if (typeof target === 'number') scrollTo.native(target)
  else target.scrollIntoView({ block: 'start' })
}
scrollTo.native = (y) => window.scrollTo({ top: y })
if (import.meta.env.DEV) window.__tern = { lenis, wind, ScrollTrigger } // handles for the screenshot script

// ── scenes ──────────────────────────────────────────────────────────────────
// the fleet pins its stage, which lengthens the page, so it is set up before anything measures what lies below it
const fleet = initFleet(scrollTo)
initText()
const hero = initHero()
initSky()
initDrift()
initAnatomy()
initWorks()
initDial(fleet)
initSend()
initFoot()
initHud(scrollTo)
initVane()
initSound()

// the creed is read at the speed you scroll it
{
  const say = $('[data-scrub-words]')
  const words = splitWords(say)
  if (reduced) gsap.set(words, { opacity: 1 })
  else gsap.to(words, { opacity: 1, ease: 'none', stagger: 0.5, scrollTrigger: { trigger: say, start: 'top 82%', end: 'bottom 48%', scrub: 0.4 } })
}

// ── arrival ─────────────────────────────────────────────────────────────────
const root = document.documentElement
const loader = $('.loader')
const first = $$('.hero img')
let loaded = 0
const total = first.length + 1
const tick = () => loaded++
first.forEach((img) => (img.complete ? tick() : (img.addEventListener('load', tick, { once: true }), img.addEventListener('error', tick, { once: true }))))
document.fonts.ready.then(tick)

// measure everything once, in page order, before anything starts moving
function settle() {
  relayout()
  ScrollTrigger.sort()
  ScrollTrigger.refresh()
}
function arrive() {
  root.classList.add('is-ready')
  lenis?.start()
}

if (reduced) {
  window.addEventListener('load', () => (settle(), arrive()))
  loader.remove()
} else {
  lenis.stop()
  window.scrollTo(0, 0)
  const num = $('.loader__num')
  const line = $('.loader__line i')
  const state = { p: 0 }
  const began = performance.now()
  // the count follows the real load, but never runs faster than line can be let out
  const count = () => {
    const want = Math.min(loaded / total, (performance.now() - began) / 1500)
    state.p += (want - state.p) * 0.12
    num.textContent = String(Math.round(state.p * 300)).padStart(3, '0')
    line.style.transform = `scaleY(${state.p.toFixed(3)})`
    if (state.p < 0.995) return requestAnimationFrame(count)
    num.textContent = '300'
    settle()
    gsap
      .timeline({ onComplete: arrive })
      .to('.loader__inner > *', { y: -24, opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.05 }, 0.15)
      .to('.loader__sheet', { yPercent: -101, duration: 1.3, ease: 'expo.inOut' }, 0.45)
      .add(() => hero.intro(), 0.75)
  }
  requestAnimationFrame(count)
  // never strand anyone behind the loader
  setTimeout(() => (loaded = total), 6000)
}

// late images change the page height; keep the scroll maths honest
window.addEventListener('load', () => root.classList.contains('is-ready') && settle())
