// The opening: a white page with the name cut out of it. Summer rises behind the letters, then scrolling
// tears the snow in two and the plateau is underneath.
import { gsap, ScrollTrigger, $, $$, still, fine } from './core.js'

export function initHero() {
  const hero = $('.hero')
  const pin = $('.hero__pin')
  const world = $('.hero__world')
  const top = $('.hero__sheet--top')
  const bot = $('.hero__sheet--bot')
  const layers = $$('.hero__world [data-depth]')
  const card = $('.hero__card')

  // --- entrance: the world rises behind the cut letters, back to front
  const rise = $$('.hero__world [data-rise]')
  const ui = $$('.hero__ui > *')
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
  if (still) {
    gsap.set([rise, ui], { clearProps: 'all' })
  } else {
    gsap.set(rise, { yPercent: (i, el) => Number(el.dataset.rise), opacity: 1 })
    gsap.set($('.hero__sky'), { yPercent: 100 })
    gsap.set(ui, { y: 28, opacity: 0 })
    intro
      .to($('.hero__sky'), { yPercent: 0, duration: 1.5, ease: 'expo.inOut' }, 0)
      .to(rise, { yPercent: 0, duration: 1.9, stagger: 0.13 }, 0.35)
      .from($('.prop--sun img'), { rotation: -120, scale: 0.4, duration: 2.2, ease: 'elastic.out(1, 0.7)' }, 0.9)
      .to(ui, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, 1.1)
  }

  // --- idle life: the sun turns, clouds drift, the meadow breathes
  if (!still) {
    gsap.to($('.prop--sun img'), { rotation: '+=360', duration: 90, ease: 'none', repeat: -1, delay: 3.2 })
    $$('.hero__world .prop--cloud img').forEach((c, i) => {
      gsap.to(c, { x: i % 2 ? -34 : 40, duration: 9 + i * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    })
  }

  // --- pointer parallax: nearer layers travel further
  if (fine && !still) {
    const movers = layers.map((el) => ({
      d: Number(el.dataset.depth),
      x: gsap.quickTo(el.firstElementChild, 'x', { duration: 1.4, ease: 'power3.out' }),
      y: gsap.quickTo(el.firstElementChild, 'y', { duration: 1.4, ease: 'power3.out' }),
    }))
    pin.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5
      const ny = e.clientY / innerHeight - 0.5
      movers.forEach((m) => { m.x(-nx * m.d * 60); m.y(-ny * m.d * 26) })
    })
  }

  // --- scroll: tear the page open, then walk into the plateau
  if (still) {
    gsap.set([top, bot], { display: 'none' })
    return { play: () => {} }
  }
  gsap.set(card, { yPercent: 140, rotation: 5, autoAlpha: 0 })
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
  })
  tl.to(top, { yPercent: -1.6, duration: 0.07 }, 0)
    .to(bot, { yPercent: 1.6, duration: 0.07 }, 0)
    .to($$('.hero__ui--bot > *'), { opacity: 0, y: 30, duration: 0.08, stagger: 0.01 }, 0.02)
    .to(top, { yPercent: -112, rotation: -3.5, duration: 0.4, ease: 'power2.inOut' }, 0.07)
    .to(bot, { yPercent: 112, rotation: 2.5, duration: 0.4, ease: 'power2.inOut' }, 0.07)
    .fromTo(world, { scale: 1.16 }, { scale: 1, duration: 0.5, ease: 'power2.out' }, 0.05)
    .to(card, { yPercent: 0, rotation: -1.2, autoAlpha: 1, duration: 0.2, ease: 'power3.out' }, 0.42)
    .fromTo($('.prop--bear > div'), { x: '-38vh' }, { x: '96vh', duration: 0.72 }, 0.28)
    .fromTo($('.prop--bear img'), { y: 0 }, { y: -9, duration: 0.024, repeat: 29, yoyo: true, ease: 'sine.inOut' }, 0.28)
    .to(world, { scale: 1.07, yPercent: 2.5, duration: 0.3, ease: 'power1.in' }, 0.7)
    .to(card, { yPercent: -18, duration: 0.3 }, 0.7)

  // layers slide at their own speed on the way through (adds to the pointer parallax, which lives on the child)
  layers.forEach((el) => {
    const d = Number(el.dataset.depth)
    tl.fromTo(el, { yPercent: d * 9 }, { yPercent: -d * 5, duration: 0.95 }, 0.05)
  })

  // once the snow is gone, stop painting it
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onLeave: () => pin.classList.add('is-past'),
    onEnterBack: () => pin.classList.remove('is-past'),
  })

  return { play: () => intro.play() }
}
