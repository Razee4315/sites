export const $ = (s, c = document) => c.querySelector(s)
export const $$ = (s, c = document) => [...c.querySelectorAll(s)]
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
export const desktop = () => matchMedia('(min-width: 900px)').matches

// run a rAF loop only while the element is on screen
export function whileVisible(el, tick, margin = '10%') {
  let raf = 0
  let on = false
  const loop = (t) => {
    tick(t / 1000)
    raf = requestAnimationFrame(loop)
  }
  new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !on) {
        on = true
        raf = requestAnimationFrame(loop)
      } else if (!e.isIntersecting && on) {
        on = false
        cancelAnimationFrame(raf)
      }
    },
    { rootMargin: margin },
  ).observe(el)
}

// a field of twinkling stars on a 2d canvas
export function starfield(canvas, { density = 0.00022, bright = 1 } = {}) {
  const ctx = canvas.getContext('2d')
  let stars = []
  let w = 0
  let h = 0
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const tints = ['255,255,255', '255,244,224', '214,226,255', '255,226,196']
  const size = () => {
    const r = canvas.getBoundingClientRect()
    if (!r.width || (Math.abs(r.width * dpr - w) < 2 && Math.abs(r.height * dpr - h) < 80)) return
    w = canvas.width = Math.round(r.width * dpr)
    h = canvas.height = Math.round(r.height * dpr)
    const n = Math.round(r.width * r.height * density)
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    stars = Array.from({ length: n }, () => {
      const m = rnd()
      return { x: rnd() * w, y: rnd() * h, r: (0.35 + m * m * 1.25) * dpr, a: 0.25 + rnd() * 0.75, s: 0.4 + rnd() * 1.8, p: rnd() * 6.28, c: tints[Math.floor(rnd() * tints.length)] }
    })
    draw(0)
  }
  const draw = (t) => {
    ctx.clearRect(0, 0, w, h)
    for (const s of stars) {
      const tw = reduce ? 1 : 0.62 + 0.38 * Math.sin(t * s.s + s.p)
      ctx.fillStyle = `rgba(${s.c},${Math.min(1, s.a * tw * bright)})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, 6.2832)
      ctx.fill()
    }
  }
  size()
  window.addEventListener('resize', size)
  if (!reduce) whileVisible(canvas, draw)
  return { size }
}
