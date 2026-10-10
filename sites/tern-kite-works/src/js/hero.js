// Hero: a kite on a line, over a paper headland, at dawn. On a pointer device you are holding the line.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, ease, fine, onFrame, onResize, reduced } from './env.js'
import { wind } from './wind.js'
import { Rig } from './rig.js'

export function initHero() {
  const hero = $('.hero')
  const rig = new Rig($('[data-rig="hero"]'))
  const mobile = () => innerWidth <= 820

  // where the line is held: a spot on the near hill, or the pointer while it is over the hero
  const hold = { x: 0, y: 0 }
  const hill = { x: 0, y: 0 }
  const placeHill = () => {
    hill.x = rig.w * (mobile() ? 0.14 : 0.43)
    hill.y = rig.h - rig.w * (mobile() ? 0.2 : 0.085)
  }
  placeHill()
  Object.assign(hold, hill)

  const intro = { x: 0, y: 0, r: 0 }
  const scroll = { x: 0, y: 0, r: 0 }
  const pull = { x: 0, y: 0, r: 0 }

  const kite = rig.add($('[data-flyer="hero"]'), {
    bridle: [0.5, 0.33],
    rest: -13,
    sway: 1,
    anchor: () => hold,
    tails: [{ at: [0.5, 0.985], length: mobile() ? 0.85 : 1.5, width: 0.04 }],
  })
  kite.layers.push(intro, scroll, pull)

  let inside = false
  let px = 0
  let py = 0
  if (fine && !reduced) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect()
      px = e.clientX - r.left
      py = e.clientY - r.top
      inside = true
    })
    hero.addEventListener('pointerleave', () => (inside = false))
  }

  const remeasure = () => {
    rig.measure()
    placeHill()
  }
  onResize(remeasure)
  ScrollTrigger.addEventListener('refresh', remeasure)

  if (reduced) {
    requestAnimationFrame(() => rig.settle())
    return { intro: () => {} }
  }

  onFrame((dt) => {
    if (!rig.seen.on) return
    // only take the line when the pointer is below the kite, where a hand could be
    const taken = inside && py > kite.Y + kite.h * 0.2 && scrollY < innerHeight * 0.5
    const tx = taken ? px : hill.x
    const ty = taken ? py : hill.y
    const k = ease(taken ? 9 : 3, dt)
    hold.x += (tx - hold.x) * k
    hold.y += (ty - hold.y) * k
    // and the kite leans toward the hand that has it
    const lean = taken ? (px - kite.cx) / rig.w : 0
    pull.x += (lean * rig.w * 0.07 - pull.x) * ease(2.2, dt)
    pull.r += (lean * 16 - pull.r) * ease(2.2, dt)
    rig.frame(dt)
  })

  // leaving: everything parts at its own speed, the kite climbing fastest
  const out = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
  out
    .to('.hero__word', { yPercent: 34 }, 0)
    .to('.hero__sun', { yPercent: () => (mobile() ? -50 : -160) }, 0)
    .to('.hero__land--far', { yPercent: 22 }, 0)
    .to('.hero__land--mid', { yPercent: 10 }, 0)
    .to('.hero__land--near', { yPercent: -4 }, 0)
    .to('.hero__copy', { yPercent: -30, opacity: 0, ease: 'power1.in' }, 0)
    .to('.hero__hint', { opacity: 0, duration: 0.25 }, 0)
    .to(scroll, { y: () => -rig.h * 0.34, x: () => rig.w * 0.05, r: 9 }, 0)

  // arriving
  const letters = $$('.hero__letter > span')
  const lede = $('.hero__lede')._words || []
  gsap.set(letters, { yPercent: 112 })
  gsap.set(lede, { yPercent: 118 })
  gsap.set('.hero__eyebrow, .hero__actions .btn, .hero__hint', { opacity: 0, y: 18 })
  gsap.set('.hero__land', { y: '120%' })
  gsap.set('.hero__sun', { y: '260%' })
  gsap.set('.hero .drift', { opacity: 0 })
  intro.y = rig.h * 1.05
  intro.x = -rig.w * 0.22
  intro.r = -38
  kite.pose.o = 0
  kite.tailAlpha = 0

  function play() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.to('.hero__land--far', { y: 0, duration: 2 }, 0)
      .to('.hero__land--mid', { y: 0, duration: 2 }, 0.1)
      .to('.hero__land--near', { y: 0, duration: 2 }, 0.2)
      .to('.hero__sun', { y: 0, duration: 3.2, ease: 'power3.out' }, 0.3)
      .to(letters, { yPercent: 0, duration: 1.7, stagger: 0.09 }, 0.25)
      .to('.hero .drift', { opacity: 1, duration: 2.2, ease: 'power2.out', stagger: 0.12 }, 0.3)
      .to(kite.pose, { o: 1, duration: 0.5, ease: 'none' }, 0.55)
      .to(intro, { x: 0, y: 0, r: 0, duration: 2.6, ease: 'expo.out' }, 0.55)
      .to(kite, { tailAlpha: 1, duration: 0.9, ease: 'power1.inOut' }, 1.25)
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: 1.2 }, 1.05)
      .to(lede, { yPercent: 0, duration: 1.3, stagger: 0.05 }, 1.1)
      .to('.hero__actions .btn', { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 1.45)
      .to('.hero__hint', { opacity: 1, y: 0, duration: 1.2 }, 1.9)
    return tl
  }

  return { intro: play, rig, kite }
}
