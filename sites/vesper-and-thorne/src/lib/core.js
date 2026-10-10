import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
CustomEase.create('out', '0.16, 1, 0.3, 1')
CustomEase.create('io', '0.76, 0, 0.2, 1')
gsap.defaults({ ease: 'out', duration: 1.1 })

export { gsap, ScrollTrigger, SplitText }

const mq = (q) => window.matchMedia(q)
export const env = {
  reduce: mq('(prefers-reduced-motion: reduce)').matches,
  fine: mq('(hover: hover) and (pointer: fine)').matches,
  get phone() {
    return window.innerWidth <= 760
  },
  get small() {
    return window.innerWidth <= 900
  },
  params: new URLSearchParams(location.search),
}

export const $ = (s, el = document) => el.querySelector(s)
export const $$ = (s, el = document) => [...el.querySelectorAll(s)]
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

// ---------------------------------------------------------------- smooth scroll
export let lenis = null
export function startScroll() {
  if (env.reduce) return
  lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 0.95, anchors: false })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  window.__lenis = lenis
}
export const velocity = () => (lenis ? lenis.velocity : 0)
export function lock(on) {
  document.body.classList.toggle('is-locked', on)
  if (lenis) on ? lenis.stop() : lenis.start()
}
export function go(target, opts = {}) {
  const el = typeof target === 'string' ? $(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts })
  else el.scrollIntoView({ behavior: env.reduce ? 'auto' : 'smooth' })
}

// ---------------------------------------------------------------- a small toast, used when a bell is struck with sound off
let toastEl = null
let toastT = 0
export function toast(html, ms = 4200) {
  if (!toastEl) {
    toastEl = document.createElement('div')
    toastEl.className = 'toast'
    toastEl.setAttribute('role', 'status')
    document.body.appendChild(toastEl)
  }
  toastEl.innerHTML = html
  clearTimeout(toastT)
  gsap.killTweensOf(toastEl)
  gsap.fromTo(toastEl, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 })
  toastT = setTimeout(() => gsap.to(toastEl, { autoAlpha: 0, y: 10, duration: 0.5 }), ms)
  return toastEl
}
