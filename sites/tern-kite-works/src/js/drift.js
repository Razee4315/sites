// Clouds, birds and loose paper: the things the wind carries across the page.
import gsap from 'gsap'
import { $, $$, onFrame, onResize, reduced, whileVisible } from './env.js'
import { wind } from './wind.js'
import meta from '../img-meta.json'

export function initDrift() {
  // ── clouds: carried sideways by the wind, lifted past you by the scroll ──
  const hosts = new Map()
  const clouds = $$('.drift').map((el) => {
    const host = el.closest('section, footer')
    if (!hosts.has(host)) hosts.set(host, { seen: whileVisible(host, '25%'), top: 0, w: 0 })
    return { el, host: hosts.get(host), speed: Number(el.dataset.speed || 0.6), par: Number(el.dataset.par || 0), x: 0, left: 0, w: 0 }
  })
  const measure = onResize(() => {
    hosts.forEach((h, node) => {
      h.top = node.getBoundingClientRect().top + scrollY
      h.w = node.clientWidth
    })
    clouds.forEach((c) => {
      c.left = c.el.offsetLeft
      c.w = c.el.offsetWidth
    })
  })
  measure()

  if (!reduced) {
    onFrame((dt) => {
      const pace = innerWidth * 0.011
      for (const c of clouds) {
        if (!c.host.seen.on) continue
        c.x += (wind.now + wind.gust * 1.4) * c.speed * pace * dt
        // off one side, back on at the other
        if (c.left + c.x > c.host.w + 30) c.x = -c.left - c.w - 30
        else if (c.left + c.x < -c.w - 40) c.x = c.host.w - c.left + 20
        const y = c.par ? -(scrollY - c.host.top) * c.par : 0
        c.el.style.transform = `translate3d(${c.x.toFixed(1)}px,${y.toFixed(1)}px,0)`
      }
    })
  }

  // ── terns: three paper birds cross the creed as you read it ──────────────
  const birds = $$('.bird')
  if (birds.length && !reduced) {
    const creed = $('.creed')
    const routes = [
      { from: [1.06, 0.95], to: [-0.3, 0.42], bob: 26, rate: 1.0 },
      { from: [1.18, 1.1], to: [-0.2, 0.6], bob: 18, rate: 1.25 },
      { from: [1.3, 0.86], to: [-0.16, 0.3], bob: 14, rate: 1.5 },
    ]
    const state = { p: 0 }
    gsap.to(state, { p: 1, ease: 'none', scrollTrigger: { trigger: creed, start: 'top 85%', end: () => `+=${innerHeight * 1.5}`, scrub: 1.2 } })
    const seen = whileVisible(creed)
    onFrame(() => {
      if (!seen.on) return
      const w = creed.clientWidth
      const h = innerHeight
      birds.forEach((b, i) => {
        const r = routes[i]
        const p = state.p
        const x = (r.from[0] + (r.to[0] - r.from[0]) * p) * w
        const y = (r.from[1] + (r.to[1] - r.from[1]) * p) * h + Math.sin(wind.t * r.rate * 1.7 + i * 2) * r.bob
        const tilt = Math.cos(wind.t * r.rate * 1.7 + i * 2) * 5 - 6
        b.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`
      })
    })
  } else {
    birds.forEach((b, i) => (b.style.transform = `translate(${68 + i * 9}vw, ${14 + i * 7}vh)`))
  }

  // ── loose paper: from force 4 up, scraps start to go past ────────────────
  const field = $('.wind__scraps')
  if (field && !reduced && meta.scraps) {
    const seen = whileVisible(field, '0%')
    const count = meta.scraps.count
    const scraps = Array.from({ length: 12 }, (_, i) => {
      const id = `scrap-${(i % count) + 1}`
      const img = new Image(meta[id].w, meta[id].h)
      img.src = `${import.meta.env.BASE_URL}img/${id}.webp`
      img.alt = ''
      img.className = 'scrap'
      img.decoding = 'async'
      img.style.opacity = 0
      field.append(img)
      return { img, x: -100, y: 0, vx: 0, r: 0, vr: 0, ph: Math.random() * 10, live: false, wait: Math.random() * 2 }
    })
    const want = [0, 0, 0, 0, 3, 6, 9, 12]
    onFrame((dt) => {
      if (!seen.on) return
      const w = field.clientWidth
      const h = field.clientHeight
      const n = want[wind.force]
      scraps.forEach((s, i) => {
        if (!s.live) {
          if (i >= n) return
          s.wait -= dt
          if (s.wait > 0) return
          s.live = true
          s.x = -60
          s.y = h * (0.12 + Math.random() * 0.7)
          s.vx = w * (0.22 + Math.random() * 0.3)
          s.vr = (Math.random() - 0.5) * 520
          s.img.style.opacity = 1
        }
        const push = wind.now * 0.8
        s.x += s.vx * push * dt
        s.y += (Math.sin(wind.t * 2.4 + s.ph) * 60 + 18) * dt
        s.r += s.vr * push * dt
        const flip = Math.cos(wind.t * 5 + s.ph) // paper tumbling shows its edge
        if (s.x > w + 80) {
          s.live = false
          s.wait = Math.random() * (i < n ? 1.6 : 0.2)
          s.img.style.opacity = 0
        }
        s.img.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0) rotate(${s.r.toFixed(1)}deg) scaleY(${(0.35 + 0.65 * Math.abs(flip)).toFixed(3)})`
      })
    })
  }
}
