// The paper sections: the kite you can hold up to the light, and the week in the workshop.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, ease, fine, onFrame, onResize, pad, reduced, whileVisible } from './env.js'
import meta from '../img-meta.json'

export function initAnatomy() {
  // the torn edges overlap the sheet by exactly their faded tail
  $$('.sheet__edge').forEach((edge) => {
    const set = () => edge.style.setProperty('--tail', `${(edge.querySelector('img').offsetHeight * meta.edge.tail).toFixed(1)}px`)
    onResize(set)
    const img = edge.querySelector('img')
    img.complete ? set() : img.addEventListener('load', set)
    set()
  })

  const spec = $('[data-specimen]')
  const box = $('.specimen__kite')
  const lens = $('.specimen__lens')
  const back = $('.specimen__back')
  const ring = $('.specimen__ring')
  const toggle = $('.specimen__toggle')
  const hint = $('.specimen__hint')

  // ── the lens: a circle of backlit kite, registered to the pixel with the one beneath ──
  let W = 1
  let H = 1
  let D = 1
  const measure = onResize(() => {
    W = box.offsetWidth
    H = box.offsetHeight
    D = Math.round(Math.min(W * 0.62, 300))
    spec.style.setProperty('--lens', `${D}px`)
    back.style.width = `${W}px`
    back.style.height = `${H}px`
    place()
  })
  const at = { x: 0.5, y: 0.34, tx: 0.5, ty: 0.34, s: 1, ts: 1 }
  function place() {
    const x = at.x * W - D / 2
    const y = at.y * H - D / 2
    const s = at.s
    // scale the window, counter-scale the picture inside it, so the picture never moves
    lens.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${s.toFixed(4)})`
    ring.style.transform = lens.style.transform
    const cx = D / 2
    back.style.transformOrigin = `${cx}px ${cx}px`
    back.style.transform = `scale(${(1 / s).toFixed(5)}) translate3d(${(-x).toFixed(2)}px,${(-y).toFixed(2)}px,0)`
  }
  measure()
  box.querySelector('.specimen__front').addEventListener('load', measure)

  let lit = false // the whole kite held up, via the button
  let hovering = false
  const full = () => (Math.hypot(W, H) / D) * 2.2

  const seen = whileVisible(spec)
  onFrame((dt) => {
    if (!seen.on) return
    const k = reduced ? 1 : ease(lit ? 4 : 12, dt)
    at.x += (at.tx - at.x) * k
    at.y += (at.ty - at.y) * k
    at.s += (at.ts - at.s) * (reduced ? 1 : ease(5, dt))
    place()
  })

  const move = (e) => {
    const r = box.getBoundingClientRect()
    at.tx = (e.clientX - r.left) / r.width
    at.ty = (e.clientY - r.top) / r.height
    if (!hovering) {
      hovering = true
      // arrive under the pointer instead of sliding in from wherever it was last
      if (!lit) {
        at.x = at.tx
        at.y = at.ty
      }
    }
    spec.classList.add('is-lit')
    hint.style.opacity = 0
    probe(at.tx, at.ty)
  }
  box.addEventListener('pointermove', move)
  box.addEventListener('pointerdown', move)
  box.addEventListener('pointerleave', () => {
    hovering = false
    if (!lit) spec.classList.remove('is-lit')
    probe(-1, -1)
  })

  function setLit(to) {
    lit = to
    toggle.setAttribute('aria-pressed', String(lit))
    spec.classList.toggle('is-lit', lit || hovering)
    at.ts = lit ? full() : 1
    ring.style.visibility = lit ? 'hidden' : ''
    if (lit && !hovering) {
      at.tx = 0.5
      at.ty = 0.42
    }
  }
  toggle.addEventListener('click', () => setLit(!lit))

  // touch screens get a demonstration: the light passes over once as the kite scrolls in
  if (!fine && !reduced) {
    ScrollTrigger.create({
      trigger: box,
      start: 'top 55%',
      once: true,
      onEnter: () => {
        if (lit) return
        spec.classList.add('is-lit')
        gsap.fromTo(
          at,
          { tx: 0.5, ty: 0.1, x: 0.5, y: 0.1 },
          {
            tx: 0.5,
            ty: 0.78,
            duration: 2.6,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => !lit && !hovering && spec.classList.remove('is-lit'),
          },
        )
      },
    })
  }

  // ── parts: the list and the marks on the kite light each other up ──
  const parts = $$('.part')
  const dots = $$('.specimen__marks circle')
  const hot = (name) => {
    parts.forEach((p) => p.classList.toggle('is-hot', p.dataset.part === name))
    dots.forEach((d) => d.classList.toggle('is-hot', d.dataset.dot === name))
  }
  parts.forEach((p) => {
    p.addEventListener('pointerenter', () => hot(p.dataset.part))
    p.addEventListener('pointerleave', () => hot(null))
  })
  // under the lens, the nearest mark names itself
  const marks = dots.map((d) => ({ name: d.dataset.dot, x: d.cx.baseVal.value / 100, y: d.cy.baseVal.value / 150 }))
  function probe(x, y) {
    let best = null
    let bd = 0.012
    for (const m of marks) {
      const d = (m.x - x) ** 2 + ((m.y - y) * (H / W)) ** 2
      if (d < bd) {
        bd = d
        best = m.name
      }
    }
    hot(best)
  }
}

export function initWorks() {
  const shots = $$('.works__shot')
  const steps = $$('.step')
  const count = $('.works__count b')
  let current = 0
  let z = 1
  let tidy
  if (!reduced)
    gsap.set(
      shots.map((s) => s.querySelector('img')),
      { scale: 1.08 },
    )

  function show(i, dir) {
    if (i === current) return
    const from = shots[current]
    const to = shots[i]
    const img = to.querySelector('img')
    current = i
    count.textContent = pad(i + 1)
    if (reduced) {
      // no blind, no drift: the print is simply the right one
      shots.forEach((s) => s.classList.toggle('is-on', s === to))
      return
    }
    shots.forEach((s) => s.classList.toggle('is-under', s === from))
    to.classList.add('is-on')
    to.style.zIndex = ++z
    // the new print is drawn over the old one like a blind, from the direction you are travelling
    gsap.killTweensOf([to, img, from.querySelector('img')])
    gsap.fromTo(to, { yPercent: 100 * dir }, { yPercent: 0, duration: 1.25, ease: 'expo.inOut' })
    gsap.fromTo(img, { yPercent: -100 * dir, scale: 1.3 }, { yPercent: 0, scale: 1.08, duration: 1.25, ease: 'expo.inOut' })
    gsap.to(from.querySelector('img'), { yPercent: -14 * dir, duration: 1.25, ease: 'expo.inOut' })
    tidy?.kill()
    tidy = gsap.delayedCall(1.3, () => shots.forEach((s) => s !== shots[current] && s.classList.remove('is-on', 'is-under')))
  }

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 58%',
      end: 'bottom 58%',
      onToggle: (self) => {
        if (!reduced) step.classList.toggle('is-on', self.isActive)
        if (self.isActive) show(i, self.direction >= 0 ? 1 : -1)
      },
    })
  })
  steps.forEach((step, i) => (reduced || i === 0) && step.classList.add('is-on'))
}
