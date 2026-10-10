import './styles/base.css'
import './styles/chrome.css'
import './styles/sections-a.css'
import './styles/sections-b.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { $, $$, reduced } from './js/util.js'
import { runLoader } from './js/loader.js'
import { initChrome } from './js/chrome.js'
import { initHero } from './js/hero.js'
import { initManifesto } from './js/manifesto.js'
import { initSupper } from './js/supper.js'
import { initInventory } from './js/inventory.js'
import { initHouse, initFoot, initDrift } from './js/house.js'
import { initPast } from './js/past.js'
import { initReserve } from './js/reserve.js'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })
history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

// smooth scroll (wheel only; touch stays native), driven by GSAP's ticker so ScrollTrigger stays in step
const lenis = reduced ? null : new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 })
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  lenis.stop()
}
window.__lenis = lenis

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? $(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts })
  else el.scrollIntoView({ behavior: 'auto', block: 'start' })
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href')
  if (id.length < 2 || !$(id)) return
  e.preventDefault()
  scrollToTarget(id)
  $(id).setAttribute('tabindex', '-1')
  $(id).focus({ preventScroll: true })
})

const ctx = { lenis, scrollToTarget }
initChrome(ctx)
const hero = initHero(ctx)
initManifesto(ctx)
initSupper(ctx)
initInventory(ctx)
initHouse(ctx)
initPast(ctx)
initReserve(ctx)
initFoot(ctx)
initDrift()

// late images change nothing in layout (all have dimensions), but fonts do
document.fonts.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh())

runLoader().then(() => {
  lenis?.start()
  hero.intro()
})

if (import.meta.env.DEV) window.__st = ScrollTrigger
$$('img').forEach((img) => img.setAttribute('draggable', 'false'))
