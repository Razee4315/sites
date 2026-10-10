import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import meta from '../data/images.json'

gsap.registerPlugin(ScrollTrigger, SplitText)
gsap.defaults({ ease: 'power3.out', duration: 0.8 })

export { gsap, ScrollTrigger, SplitText }

export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const pad2 = (n) => String(n).padStart(2, '0')

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
export const tallMQ = matchMedia('(orientation: portrait)')
const smallScreen = Math.min(screen.width, screen.height) < 700

// ───────── images ─────────
// Every file's dimensions were recorded when it was processed, so each <img> gets a real width and height.
export function img(id, { full = false } = {}) {
  const m = meta[id]
  if (!m) throw new Error(`unknown image: ${id}`)
  const useSmall = smallScreen && !full && m.s
  return {
    src: `${import.meta.env.BASE_URL}img/${id}${useSmall ? '.s' : ''}.webp`,
    w: m.w,
    h: m.h,
    ar: m.w / m.h,
    shadow: m.shPad ? { src: `${import.meta.env.BASE_URL}img/${id}.sh.webp`, x: m.shPad, y: m.shPadY } : null,
  }
}

// <img data-img="id"> placeholders in the markup
export function hydrate(root = document) {
  for (const el of $$('img[data-img]', root)) {
    const m = img(el.dataset.img)
    el.width = m.w
    el.height = m.h
    el.decoding = 'async'
    if (!el.hasAttribute('data-eager')) el.loading = 'lazy'
    el.src = m.src
  }
}

export const loadImage = (src) =>
  new Promise((resolve) => {
    const i = new Image()
    i.onload = i.onerror = () => resolve(src)
    i.src = src
    if (i.decode) i.decode().then(() => resolve(src), () => resolve(src))
  })

// ───────── fonts ─────────
// Resolves once every face the page uses has arrived. Anything that measures text (the cut-out
// wordmark, title fitting, line splitting) waits for this, or it measures the fallback font.
const FACES = [
  '900 100px "Big Shoulders Stencil Variable"',
  '400 40px "Bodoni Moda Variable"',
  'italic 400 40px "Bodoni Moda Variable"',
  '400 16px "Instrument Sans Variable"',
  '600 16px "Instrument Sans Variable"',
  'italic 400 16px "Instrument Sans Variable"',
]
let fontsPromise = null
export function fontsReady(onEach) {
  fontsPromise ||= Promise.all(FACES.map((f) => document.fonts.load(f, 'QUIREÖřš 0123').catch(() => {})))
  if (onEach) FACES.forEach((f) => document.fonts.load(f, 'QUIREÖřš 0123').then(onEach, onEach))
  return fontsPromise
}
export const FACE_COUNT = FACES.length

// ───────── smooth scroll ─────────
export let lenis = null

export function initScroll() {
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 1, touchMultiplier: 1.4 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
  }
  window.__lenis = lenis
  window.__gsap = gsap // handy for slowing the page down when checking animations
}

export function scrollTo(target, opts = {}) {
  if (lenis) return lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts })
  const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY + (opts.offset || 0)
  window.scrollTo({ top: y, behavior: 'auto' })
}

export const lockScroll = (on) => {
  if (lenis) on ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = on ? 'hidden' : ''
}
