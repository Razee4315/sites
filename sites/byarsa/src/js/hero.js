import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, fine, reduce, starfield } from './util.js'

const hero = $('.hero')
const far = $$('.hero__far img')
const near = $$('.hero__near img')
// stack order in the DOM: night, blue, glow, day
const [, farBlue, farGlow, farDay] = far
const [, nearBlue, nearGlow, nearDay] = near

export function heroSetup() {
  starfield($('.hero__stars'), { density: 0.00026 })
  gsap.set('.g b', { yPercent: 108 })
  gsap.set('.hero__near .stack', { yPercent: 14 })
  gsap.set(['.hero__kicker', '.hero__lead', '.hero__cue', '.hero__urdu'], { autoAlpha: 0, y: 24 })
  gsap.set('.nav', { yPercent: -120 })

  // ── the day arrives as you scroll: blue hour → alpenglow → morning
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: reduce ? true : 0.6 },
  })
  tl.to('.sky--glow', { opacity: 1, duration: 3.4 }, 0)
    .to([farGlow, nearGlow], { opacity: 1, duration: 3.4 }, 0.2)
    .to('.hero__stars', { opacity: 0, duration: 2.4 }, 0)
    .fromTo('.hero__sun', { opacity: 0, yPercent: 26 }, { opacity: 0.9, yPercent: 8, duration: 3.6 }, 0.4)
    .to([far[1], near[1], far[0], near[0]], { opacity: 0, duration: 0.8 }, 3.2)
    .to('.sky--day', { opacity: 1, duration: 3.2 }, 3.8)
    .to([farDay, nearDay], { opacity: 1, duration: 3.2 }, 3.9)
    .to('.hero__sun', { opacity: 1, yPercent: -24, xPercent: 6, duration: 4.6 }, 4)
    .to([farGlow, nearGlow], { opacity: 0, duration: 0.9 }, 6.9)
    .to('.hero__clouds', { opacity: 1, duration: 3 }, 4.2)
    .to('.hero__shade', { opacity: 0.25, duration: 3 }, 5)
    .to('.hero__ui', { opacity: 0, duration: 1.4 }, 5.6)
  if (!reduce) {
    tl.to('.hero__title', { yPercent: -7, duration: 10 }, 0)
      .to('.hero__far', { yPercent: 5, scale: 1.05, transformOrigin: '50% 30%', duration: 10 }, 0)
      .to('.hero__near', { yPercent: 16, scale: 1.2, transformOrigin: '50% 100%', duration: 10 }, 0)
  }
  tl.set({}, {}, 10)

  // ── cursor depth
  if (fine && !reduce) {
    const layers = [
      [$('.hero__title'), 10, 5],
      [$('.hero__far .stack'), -9, -4],
      [$('.hero__near .stack'), -30, -12],
      [$('.hero__clouds'), 16, 6],
    ].map(([el, mx, my]) => ({ x: gsap.quickTo(el, 'x', { duration: 1.4, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 1.4, ease: 'power3.out' }), mx, my }))
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5
      const ny = e.clientY / innerHeight - 0.5
      for (const l of layers) {
        l.x(nx * l.mx)
        l.y(ny * l.my)
      }
    })
  }
}

// ── the giants stand up
export function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  tl.to('.sky--blue', { opacity: 1, duration: 2.6, ease: 'power2.inOut' }, 0)
    .to([farBlue, nearBlue], { opacity: 1, duration: 2.6, ease: 'power2.inOut' }, 0)
    .to('.g b', { yPercent: 0, duration: reduce ? 0.01 : 2.2, stagger: reduce ? 0 : 0.11 }, 0.25)
    .to('.hero__near .stack', { yPercent: 0, duration: reduce ? 0.01 : 2.4 }, 0.2)
    .to('.nav', { yPercent: 0, duration: 1.4 }, 1.3)
    .to(['.hero__kicker', '.hero__urdu', '.hero__lead', '.hero__cue'], { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.12 }, 1.5)
    .add(() => ScrollTrigger.refresh())
  return tl
}
