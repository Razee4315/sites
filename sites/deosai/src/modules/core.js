// Shared plumbing: smooth scroll, GSAP setup, image helper, small utilities.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import meta from '../data/img-meta.json'

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({ ease: 'expo.out', duration: 1 })

export const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const mqDesk = window.matchMedia('(min-width: 900px)')
export const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
export const $ = (s, root = document) => root.querySelector(s)
export const $$ = (s, root = document) => [...root.querySelectorAll(s)]
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const rand = (a, b) => a + Math.random() * (b - a)

export let lenis = null

export function initScroll() {
  if (still) {
    ScrollTrigger.config({ ignoreMobileResize: true })
    return
  }
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.6 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2), ...opts })
  else (typeof target === 'number' ? window.scrollTo(0, target) : document.querySelector(target)?.scrollIntoView())
}

export const lock = (on) => {
  if (lenis) on ? lenis.stop() : lenis.start()
  document.documentElement.classList.toggle('is-locked', on)
}

// <img> with intrinsic size, lazy loading and a small/large source pair
export function img(name, { cls = '', alt = '', sizes = '100vw', eager = false, small = true } = {}) {
  const m = meta[name]
  if (!m) return `<span class="img-missing ${cls}" data-missing="${name}"></span>`
  const sw = Math.round(m.w * (name.startsWith('ph-') ? 0.5 : Math.min(1, (name.startsWith('sp-') ? 560 : 1100) / m.w)))
  const srcset = small && sw < m.w ? ` srcset="${import.meta.env.BASE_URL}img/${name}-s.webp ${sw}w, ${import.meta.env.BASE_URL}img/${name}.webp ${m.w}w" sizes="${sizes}"` : ''
  return `<img class="${cls}" src="${import.meta.env.BASE_URL}img/${name}.webp"${srcset} width="${m.w}" height="${m.h}" alt="${alt.replace(/"/g, '&quot;')}" ${eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'} draggable="false">`
}
export const has = (name) => !!meta[name]
export const ratio = (name) => (meta[name] ? meta[name].w / meta[name].h : 1)

// split a heading into lines-of-words that can be slid up from behind a cut edge
export function splitWords(el) {
  if (el.dataset.split) return $$('.w > span', el)
  el.dataset.split = '1'
  const text = el.textContent
  el.setAttribute('aria-label', text.trim())
  el.innerHTML = text
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="w" aria-hidden="true"><span>${w}</span></span>`)
    .join(' ')
  return $$('.w > span', el)
}

export { gsap, ScrollTrigger }
