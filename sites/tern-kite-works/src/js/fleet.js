// The fleet: six kites on one pinned stage. Scroll, and one is flown out as the next is flown in.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, onFrame, onResize, reduced } from './env.js'
import { Rig } from './rig.js'

const PAPER = { front: '#f2ecdf', back: '#cfc7b4' }
const INDIGO = { front: '#1f3f8f', back: '#152c66' }
const RED = { front: '#e4412b', back: '#b9311f' }

// where each kite's line leaves it, how it sits in the air, and what it trails
const RIGGING = {
  zephyr: { bridle: [0.5, 0.56], rest: -6, sway: 1.25, tails: [{ at: [0.03, 0.97], length: 0.9, width: 0.04, ...INDIGO }, { at: [0.97, 0.97], length: 0.9, width: 0.04, ...INDIGO }] },
  ostro: { bridle: [0.5, 0.33], rest: -11, sway: 1, tails: [{ at: [0.5, 0.985], length: 1.05, width: 0.04, ...RED}] },
  mistral: { bridle: [0.5, 0.4], rest: 5, sway: 0.5, tails: [] },
  levanter: { bridle: [0.5, 0.36], rest: -5, sway: 0.7, tails: [{ at: [0.06, 0.985], length: 0.8, width: 0.04, ...PAPER }, { at: [0.94, 0.985], length: 0.8, width: 0.04, ...RED }] },
  sirocco: { bridle: [0.5, 0.24], rest: 9, sway: 0.6, tails: [] },
  williwaw: { bridle: [0.5, 0.36], rest: -19, sway: 1.9, tails: [] },
}

export function initFleet(scrollTo) {
  const fleet = $('.fleet')
  const stage = $('.fleet__stage')
  const crafts = $$('.craft')
  const dots = $$('.fleet__nav button')

  // the wind range of each kite, drawn as eight Beaufort ticks
  crafts.forEach((c) => {
    const [lo, hi] = c.dataset.wind.split('-').map(Number)
    const bar = document.createElement('span')
    bar.className = 'beaufort'
    bar.setAttribute('aria-hidden', 'true')
    bar.innerHTML = Array.from({ length: 8 }, (_, i) => `<i${i >= lo && i <= hi ? ' class="is-in"' : ''}></i>`).join('')
    c.querySelector('.craft__beaufort').append(bar)
    const name = c.querySelector('.craft__name')
    name.innerHTML = `<span>${name.textContent}</span>`
  })

  const rig = new Rig($('[data-rig="fleet"]'))
  if (reduced) {
    // no pinning, no flying: six kites in a list, tails hanging
    rig.canvas.style.display = 'none'
    return { go: (i) => scrollTo(crafts[i]) }
  }

  fleet.classList.add('is-pinned')
  rig.measure()
  const flyers = crafts.map((c) =>
    rig.add(c.querySelector('.kite'), {
      ...RIGGING[c.dataset.kite],
      lineFade: 0.42,
      anchor: () => ({ x: rig.w * (innerWidth <= 860 ? 0.1 : 0.47), y: rig.h * 1.08 }),
    }),
  )
  flyers.forEach((f) => (f.pose.o = 0))
  onResize(() => rig.measure())
  ScrollTrigger.addEventListener('refresh', () => rig.measure()) // the pin is rebuilt on refresh; measure after it
  onFrame((dt) => rig.frame(dt))

  const parts = (c) => $$('.craft__no, .craft__motto, .craft__desc, .craft__spec > div', c)
  const nameOf = (c) => c.querySelector('.craft__name > span')
  let current = -1
  let tl

  function show(i, dir = 1, instant = false) {
    if (i === current) return
    const prev = current
    current = i
    tl?.progress(1).kill()
    dots.forEach((d, k) => {
      d.classList.toggle('is-on', k === i)
      d.setAttribute('aria-current', k === i ? 'true' : 'false')
    })
    crafts.forEach((c, k) => c.classList.toggle('is-on', k === i))

    const next = crafts[i]
    const fly = flyers[i]
    const W = rig.w
    const H = rig.h
    tl = gsap.timeline()

    if (prev >= 0) {
      const old = crafts[prev]
      const gone = flyers[prev]
      old.classList.add('is-leaving')
      tl.to(parts(old), { y: -26 * dir, opacity: 0, duration: 0.4, ease: 'power2.in', stagger: 0.025 }, 0)
        .to(nameOf(old), { yPercent: -112 * dir, duration: 0.6, ease: 'power3.in' }, 0)
        // taken by the wind: up and away to the right (or back down to the left when scrolling up)
        .to(gone.pose, { x: W * 0.36 * dir, y: -H * 0.95 * dir, r: 42 * dir, s: 0.82, duration: 0.85, ease: 'power2.in' }, 0)
        .to(gone.pose, { o: 0, duration: 0.3, ease: 'none' }, 0.55)
        .add(() => old.classList.remove('is-leaving'), 0.86)
    }

    const at = prev >= 0 ? 0.32 : 0
    tl.fromTo(fly.pose, { x: -W * 0.3 * dir, y: H * 0.95 * dir, r: -40 * dir, s: 0.8 }, { x: 0, y: 0, r: 0, s: 1, duration: 1.7, ease: 'expo.out' }, at)
      .fromTo(fly.pose, { o: 0 }, { o: 1, duration: 0.35, ease: 'none' }, at)
      .fromTo(fly, { tailAlpha: 0 }, { tailAlpha: 1, duration: 0.7, ease: 'power1.inOut' }, at + 0.55)
      .fromTo(nameOf(next), { yPercent: 112 * dir }, { yPercent: 0, duration: 1.3, ease: 'expo.out' }, at + 0.1)
      .fromTo(parts(next), { y: 34 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.05 }, at + 0.22)
    if (instant) tl.progress(1)
  }

  const st = ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => `+=${Math.round(innerHeight * 0.85 * crafts.length)}`,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const i = Math.min(crafts.length - 1, Math.floor(self.progress * crafts.length))
      if (i !== current) show(i, i > current ? 1 : -1)
    },
  })
  show(0, 1, true)

  // the first kite arrives as the stage comes into view, not before
  const first = flyers[0]
  first.pose.o = 0
  ScrollTrigger.create({
    trigger: stage,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      if (current !== 0) return
      gsap.fromTo(first.pose, { x: -rig.w * 0.3, y: rig.h * 0.8, r: -40, s: 0.8 }, { x: 0, y: 0, r: 0, s: 1, duration: 2, ease: 'expo.out' })
      gsap.to(first.pose, { o: 1, duration: 0.4, ease: 'none' })
      gsap.fromTo(first, { tailAlpha: 0 }, { tailAlpha: 1, duration: 0.8, delay: 0.7, ease: 'power1.inOut' })
    },
  })

  const go = (i) => {
    const span = st.end - st.start
    scrollTo(st.start + ((i + 0.5) / crafts.length) * span, 1.4)
  }
  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.go))))
  if (import.meta.env.DEV) window.__fleet = { flyers, rig, crafts }
  return { go }
}
