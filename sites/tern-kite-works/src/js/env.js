// Small shared helpers and the things every module needs to agree on.
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches

export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const lerp = (a, b, t) => a + (b - a) * t
// frame-rate independent smoothing: how far to move toward a target this frame
export const ease = (rate, dt) => 1 - Math.exp(-rate * dt)
export const pad = (n, len = 2) => String(Math.round(n)).padStart(len, '0')

// one set of listeners for layout changes; modules subscribe
const resizers = new Set()
export const onResize = (fn) => (resizers.add(fn), fn)
let rw = innerWidth
let raf = 0
addEventListener('resize', () => {
  // phones fire resize when the URL bar slides; only a width change is a real relayout
  if (innerWidth === rw && !fine) return
  rw = innerWidth
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => resizers.forEach((fn) => fn()))
})
export const relayout = () => resizers.forEach((fn) => fn())

// per-frame subscribers, driven by gsap's ticker in main.js
const frames = new Set()
export const onFrame = (fn) => (frames.add(fn), fn)
export const runFrame = (dt) => frames.forEach((fn) => fn(dt))

// run a callback only while an element is near the viewport
export function whileVisible(el, margin = '15%') {
  const state = { on: false }
  new IntersectionObserver(([e]) => (state.on = e.isIntersecting), { rootMargin: margin }).observe(el)
  return state
}
