import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, clamp, reduced, fine, rand, STACK } from './util.js'

export function initHero() {
  const hero = $('.hero')
  const objs = $$('.hobj', hero)
  const word = $('.hero__word')
  const chars = $$('.hero__ch i', hero)
  const glow = $('.hero__glow')
  const mothEl = $('.moth')

  if (reduced) return { intro() {} }

  // ── starting poses (the loader is covering this)
  gsap.set(chars, { yPercent: 112 })
  gsap.set($$('.hobj__f', hero), { opacity: 0, y: (i) => 90 + i * 14, scale: 0.86, rotation: (i) => (i % 2 ? 9 : -9) })
  gsap.set(glow, { opacity: 0, scale: 0.55 })
  gsap.set('.hero__meta .label span', { yPercent: 110 })
  gsap.set('.hero__tag .line span', { yPercent: 115 })
  gsap.set(['.hero__lede', '.hero__cue'], { opacity: 0, y: 14 })
  gsap.set('.nav', { yPercent: -120 })
  gsap.set(mothEl, { opacity: 0 })

  // ── idle drift: every object bobs on its own clock
  const drift = () =>
    $$('.hobj__f', hero).forEach((el) => {
      gsap.to(el, { y: rand(-12, -22), duration: rand(3.2, 5.4), ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to(el, { rotation: rand(-2.4, 2.4), duration: rand(4.5, 7.5), ease: 'sine.inOut', yoyo: true, repeat: -1 })
    })

  const intro = () => {
    const front = $$('.hero__stage--front .hobj__f', hero)
    const back = $$('.hero__stage:not(.hero__stage--front) .hobj__f', hero)
    gsap
      .timeline({ defaults: { ease: 'expo.out' }, onComplete: drift })
      .to(glow, { opacity: 1, scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
      .to(chars, { yPercent: 0, duration: 1.6, stagger: 0.075 }, 0.1)
      .to(back, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.9, stagger: 0.1 }, 0.35)
      .to(front, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 2.1, stagger: 0.11 }, 0.6)
      .to('.nav', { yPercent: 0, duration: 1.3, clearProps: 'transform' }, 1.0)
      .to('.hero__meta .label span', { yPercent: 0, duration: 1.2, stagger: 0.06 }, 1.1)
      .to('.hero__tag .line span', { yPercent: 0, duration: 1.4, stagger: 0.1 }, 1.15)
      .to(['.hero__lede', '.hero__cue'], { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 1.5)
      .to(mothEl, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 1.8)
  }

  // ── pointer parallax: nearer things move further
  if (fine) {
    const movers = objs.map((o) => {
      const m = $('.hobj__m', o)
      const d = parseFloat(o.dataset.depth || '0.5')
      return { d, x: gsap.quickTo(m, 'x', { duration: 1.2, ease: 'power3.out' }), y: gsap.quickTo(m, 'y', { duration: 1.2, ease: 'power3.out' }) }
    })
    const gx = gsap.quickTo(glow, 'x', { duration: 1.8, ease: 'power3.out' })
    const gy = gsap.quickTo(glow, 'y', { duration: 1.8, ease: 'power3.out' })
    const wx = gsap.quickTo(word, 'x', { duration: 1.4, ease: 'power3.out' })
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5
      const ny = e.clientY / innerHeight - 0.5
      movers.forEach((m) => { m.x(-nx * m.d * 46); m.y(-ny * m.d * 34) })
      gx(nx * innerWidth * 0.5); gy(ny * innerHeight * 0.5)
      wx(nx * 10)
    }, { passive: true })
  }

  // ── leaving: the still life comes apart as you scroll
  const out = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
  objs.forEach((o) => {
    const d = parseFloat(o.dataset.depth || '0.5')
    out.to(o, { y: () => -innerHeight * (0.12 + d * 0.5), rotation: (d > 0.6 ? 1 : -1) * d * 9, ease: 'none', duration: 1 }, 0)
  })
  out.to(word, { y: () => -innerHeight * 0.16, ease: 'none', duration: 1 }, 0)
  out.to('.hero__foot', { opacity: 0, y: -30, ease: 'none', duration: 0.35 }, 0)
  out.to('.hero__meta', { opacity: 0, ease: 'none', duration: 0.3 }, 0)
  out.to(glow, { opacity: 0.2, ease: 'none', duration: 1 }, 0)

  moth(hero, mothEl)
  return { intro }
}

/* a moth that cannot leave the light alone: it steers toward the pointer and circles it */
function moth(hero, el) {
  const inner = $('.moth__in', el)
  const p = { x: innerWidth * 0.8, y: innerHeight * 0.2 }
  const v = { x: 0, y: 0 }
  const light = { x: p.x, y: p.y }
  let heading = 24
  let t = Math.random() * 100
  let live = true
  let lastMove = 0

  // without a pointer it haunts the top right, near the tulip
  const home = () => ({ x: innerWidth * 0.8, y: innerHeight * (matchMedia(STACK).matches ? 0.31 : 0.2) })
  Object.assign(light, home())
  Object.assign(p, light)

  if (fine) {
    hero.addEventListener('pointermove', (e) => { light.x = e.clientX; light.y = e.clientY + scrollY; lastMove = performance.now() }, { passive: true })
    hero.addEventListener('pointerleave', () => Object.assign(light, home()))
  }
  ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => (live = s.isActive) })

  const setEl = gsap.quickSetter(el, 'css')
  const setIn = gsap.quickSetter(inner, 'scaleX')
  gsap.ticker.add((time, dt) => {
    if (!live) return
    const k = Math.min(dt, 40) / 16.7
    t += 0.016 * k
    const still = performance.now() - lastMove > 1400
    // orbit the light on a wobbling ellipse; wider and lazier when the light is still
    const r = still ? 54 : 92
    const tx = light.x + Math.cos(t * (still ? 0.7 : 1.7)) * r * 1.25
    const ty = light.y + Math.sin(t * (still ? 0.9 : 2.3)) * r * 0.8
    v.x += (tx - p.x) * 0.0042 * k
    v.y += (ty - p.y) * 0.0042 * k
    v.x *= Math.pow(0.93, k)
    v.y *= Math.pow(0.93, k)
    p.x += v.x * k
    p.y += v.y * k
    const speed = Math.hypot(v.x, v.y)
    if (speed > 0.25) {
      const want = (Math.atan2(v.y, v.x) * 180) / Math.PI + 90
      let diff = ((want - heading + 540) % 360) - 180
      heading += diff * 0.12 * k
    }
    const flap = clamp(speed / 2.2, 0.12, 1)
    setEl({ x: p.x, y: p.y, rotation: heading })
    setIn(1 - flap * 0.62 * Math.abs(Math.sin(t * 34)))
  })
}
