import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { audio } from './js/audio.js'
import { Hang, swayAll } from './js/pendulum.js'
import { initRing } from './js/ring.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const params = new URLSearchParams(location.search)
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('still')
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
const fmt = (n) => Math.round(n).toLocaleString('en-GB')
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

document.documentElement.classList.toggle('reduced', reduced)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

/* ───────────────────────── smooth scroll ───────────────────────── */

const lenis = new Lenis({ lerp: reduced ? 1 : 0.1, smoothWheel: !reduced, anchors: false })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
lenis.stop()

function goTo(target, immediate) {
  lenis.scrollTo(target, { duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4), immediate: immediate || reduced, force: true })
}

$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'))
    if (!t) return
    e.preventDefault()
    closeMenu()
    goTo(t)
    t.setAttribute('tabindex', '-1')
    t.focus({ preventScroll: true })
  }),
)

/* ───────────────────────── sound ───────────────────────── */

const soundBtn = $('#sound')
audio.listeners.add((on) => {
  soundBtn.setAttribute('aria-pressed', String(on))
  $('#sound-state').textContent = on ? 'on' : 'off'
})
soundBtn.addEventListener('click', () => audio.toggle())
const needSound = () => audio.enable()

/* ───────────────────────── bells that swing ───────────────────────── */

const strikeSound = (h, vel) => audio.strike(h.freq, vel)
const bells = $$('[data-bell]').map((el, i) => {
  const h = new Hang(el, { onStrike: strikeSound, calm: reduced })
  h.sign = el.closest('.card') ? -1 : i % 2 ? -1 : 1
  el.addEventListener('click', (e) => {
    const r = el.getBoundingClientRect()
    const fromLeft = e.clientX ? e.clientX < r.left + r.width / 2 : Math.random() < 0.5
    h.strike(fromLeft ? -1 : 1, 1)
  })
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      h.strike(Math.random() < 0.5 ? -1 : 1, 1)
    }
  })
  if (fine && !reduced) {
    // brushing past a bell pushes it
    el.addEventListener('pointermove', (e) => h.kick(clamp(e.movementX, -40, 40) * -0.0035))
  }
  return h
})
const heroBell = bells[0]

// scroll inertia: bells feel the page accelerate under them
let vPrev = 0
lenis.on('scroll', ({ velocity }) => {
  const a = velocity - vPrev
  vPrev = velocity
  if (!reduced && Math.abs(a) > 0.4) swayAll(clamp(a, -40, 40) * 0.0052)
})

const ringApi = initRing({ reduced, onNeedSound: needSound })

/* ───────────────────────── the gate ───────────────────────── */

const gate = $('#gate')
const criticalImgs = ['bell-1', 'headstock', 'clapper', 'sparks-b', 'smoke']

function preload(onStep) {
  const jobs = criticalImgs.map(
    (id) =>
      new Promise((res) => {
        const im = new Image()
        im.onload = im.onerror = res
        im.src = `${import.meta.env.BASE_URL}img/${id}.webp`
      }),
  )
  jobs.push(document.fonts.ready.catch(() => {}))
  let n = 0
  jobs.forEach((j) => j.then(() => onStep(++n / jobs.length)))
  return Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, 6000))])
}

function heroStart() {
  // everything the entrance animates starts from here
  gsap.set('.hero__title .ln__i', { yPercent: 112 })
  gsap.set(['.hero__meta span', '.hero__tag > *', '.hero__lede', '.hero__scroll'], { opacity: 0, y: 18 })
  gsap.set('#top-bar', { yPercent: -110 })
  gsap.set(['.rope', '.chapter'], { opacity: 0 })
  gsap.set('.hero__fire', { opacity: 0 })
  gsap.set(['.hero__embers', '.hero__smoke'], { opacity: 0 })
  gsap.set('.hero__bell', { opacity: 0 })
}

function heroIn(delay = 0) {
  const tl = gsap.timeline({ delay, defaults: { ease: 'expo.out' } })
  tl.set('.hero__bell', { opacity: 1 }, 0)
    .add(() => {
      // the bell is let go from the left and tolls itself to a stop
      heroBell.th = -0.62
      heroBell.ps = -0.62 + heroBell.reach
      heroBell.om = 0
      heroBell.wake()
    }, 0)
    .fromTo('.hero__bell', { yPercent: -14 }, { yPercent: 0, duration: 1.8 }, 0)
    .to('.hero__fire', { opacity: 1, duration: 3, ease: 'power2.out' }, 0.1)
    .to('.hero__embers', { opacity: 1, duration: 3, ease: 'power1.out' }, 0.3)
    .to('.hero__smoke', { opacity: 0.2, duration: 4, ease: 'power1.out' }, 0.3)
    .to('.hero__title .ln__i', { yPercent: 0, duration: 1.5, stagger: 0.13 }, 0.25)
    .to('#top-bar', { yPercent: 0, duration: 1.4 }, 0.7)
    .to('.hero__meta span', { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.8)
    .to('.hero__tag > *', { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 1.0)
    .to(['.hero__lede', '.hero__scroll'], { opacity: 1, y: 0, duration: 1.3, stagger: 0.1 }, 1.05)
    .to(['.rope', '.chapter'], { opacity: 1, duration: 1.2, ease: 'power1.out' }, 1.3)
  return tl
}

function openGate(withSound) {
  if (withSound) audio.enable()
  gate.inert = true
  lenis.start()
  if (reduced) {
    gsap.to(gate, { opacity: 0, duration: 0.3, onComplete: () => (gate.hidden = true) })
    gsap.set(['.hero__title .ln__i', '.hero__meta span', '.hero__tag > *', '.hero__lede', '.hero__scroll', '#top-bar', '.rope', '.chapter', '.hero__fire', '.hero__embers', '.hero__bell'], { clearProps: 'all' })
    gsap.set('.hero__smoke', { opacity: 0.2 })
    return
  }
  gsap
    .timeline()
    .to('.gate__mid, .gate__choose, .gate__note, .gate__brand', { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in', stagger: 0.03 })
    .to('.gate__glow', { scale: 2.4, opacity: 1, duration: 1.1, ease: 'power2.in' }, 0)
    .to(gate, { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, 0.45)
    .add(() => (gate.hidden = true))
  heroIn(0.75)
}

async function runGate() {
  heroStart()
  const tempEl = $('#gate-temp')
  const bar = $('#gate-bar')
  const status = $('#gate-status')
  const choose = $('#gate-choose')

  if (params.has('quiet')) {
    await preload(() => {})
    gate.hidden = true
    lenis.start()
    if (reduced) openGate(false)
    else heroIn(0.1)
    return
  }

  const heat = { v: 0, target: 0 }
  const showHeat = () => {
    tempEl.textContent = fmt(heat.v)
    bar.style.transform = `scaleX(${heat.v / 1150})`
    gsap.set('.gate__glow', { opacity: 0.1 + (heat.v / 1150) * 0.6, scale: 0.5 + (heat.v / 1150) * 0.5 })
  }
  if (reduced) {
    await preload(() => {})
    heat.v = 1150
    showHeat()
  } else {
    gsap.from('.gate__brand, .gate__mid > *, .gate__note', { opacity: 0, y: 16, duration: 1, ease: 'expo.out', stagger: 0.07 })
    const climb = gsap.to(heat, { v: 860, duration: 2.6, ease: 'power1.out', onUpdate: showHeat })
    await Promise.all([preload(() => {}), new Promise((r) => setTimeout(r, 1500))])
    climb.kill()
    await gsap.to(heat, { v: 1150, duration: 0.9, ease: 'power2.out', onUpdate: showHeat })
  }
  status.textContent = 'The metal is ready'
  choose.style.visibility = 'visible'
  gsap.from(choose.children, { opacity: 0, y: 18, duration: reduced ? 0.01 : 0.9, ease: 'expo.out', stagger: 0.08 })
  $('#enter-sound').focus({ preventScroll: true })
  $('#enter-sound').addEventListener('click', () => openGate(true), { once: true })
  $('#enter-quiet').addEventListener('click', () => openGate(false), { once: true })
}

/* ───────────────────────── menu, cursor, rope, chapter ───────────────────────── */

const burger = $('#burger')
const menu = $('#menu')
function closeMenu() {
  if (!menu.classList.contains('is-open')) return
  menu.classList.remove('is-open')
  menu.setAttribute('aria-hidden', 'true')
  burger.setAttribute('aria-expanded', 'false')
  lenis.start()
}
burger.addEventListener('click', () => {
  if (menu.classList.contains('is-open')) return closeMenu()
  menu.classList.add('is-open')
  menu.setAttribute('aria-hidden', 'false')
  burger.setAttribute('aria-expanded', 'true')
  lenis.stop()
})
window.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu())
menu.inert = false

if (fine) {
  const cur = $('#cursor')
  const label = $('#cursor-t')
  const x = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3.out' })
  const y = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3.out' })
  window.addEventListener('pointermove', (e) => {
    x(e.clientX)
    y(e.clientY)
    const t = e.target.closest?.('[data-cursor]')
    const txt = t?.dataset.cursor
    if (txt) label.textContent = txt
    cur.classList.toggle('is-on', !!txt)
  })
  document.addEventListener('pointerleave', () => cur.classList.remove('is-on'))
}

// the hero leans a little toward the pointer: embers furthest, words least
if (fine && !reduced) {
  const layers = [
    ['.hero__embers', 26],
    ['.hero__smoke', 14],
    ['.hero__title', -7],
    ['.hero__bell', 10],
  ].map(([sel, amt]) => [gsap.quickTo(sel, 'x', { duration: 1.4, ease: 'power3.out' }), sel === '.hero__bell' || sel === '.hero__title' ? null : gsap.quickTo(sel, 'y', { duration: 1.4, ease: 'power3.out' }), amt])
  $('.hero').addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5
    const ny = e.clientY / innerHeight - 0.5
    layers.forEach(([x, y, amt]) => {
      x(nx * amt)
      y?.(ny * amt)
    })
  })
}

// the bar steps aside while you read down, and returns when you scroll up
const topBar = $('#top-bar')
lenis.on('scroll', ({ scroll, direction }) => {
  if (menu.classList.contains('is-open')) return
  topBar.classList.toggle('is-away', direction > 0 && scroll > innerHeight * 0.6)
})

// the rope: the sally rides down the page with you, and bounces when you stop short
const sally = $('#sally')
let sallyY = 0
let sallyV = 0
let sallyTarget = 0
function ropeTick() {
  if (sally.offsetParent === null) return
  const k = 60
  const d = 9
  const dt = 1 / 60
  sallyV += (k * (sallyTarget - sallyY) - d * sallyV) * dt
  sallyY += sallyV * dt
  sally.style.transform = `translate3d(0,${sallyY.toFixed(1)}px,0)`
}
lenis.on('scroll', ({ progress }) => {
  const span = innerHeight - sally.offsetHeight - 140
  sallyTarget = 90 + clamp(progress, 0, 1) * span
})
sallyY = sallyTarget = 90
if (reduced) lenis.on('scroll', () => (sally.style.transform = `translate3d(0,${sallyTarget}px,0)`))
else gsap.ticker.add(ropeTick)

const chN = $('#chapter-n')
const chT = $('#chapter-t')
function setChapter(v) {
  const [n, t] = v.split('|')
  if (chT.textContent === t) return
  if (reduced) return (chN.textContent = n), (chT.textContent = t)
  gsap.to([chN, chT], {
    opacity: 0,
    y: -6,
    duration: 0.2,
    overwrite: true,
    onComplete() {
      chN.textContent = n
      chT.textContent = t
      gsap.fromTo([chN, chT], { opacity: 0, y: 6 }, { opacity: (i) => (i ? 1 : 0.6), y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.04 })
    },
  })
}

/* ───────────────────────── scroll choreography ───────────────────────── */

function choreograph() {
  // chapter label + nav state
  $$('[data-chapter]').forEach((sec) =>
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setChapter(sec.dataset.chapter) }),
  )
  $$('.top__nav a').forEach((a) => {
    const sec = $(a.getAttribute('href'))
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-here', s.isActive) })
  })

  // image wipes, day ticks
  $$('[data-reveal], .days').forEach((el, i) => {
    if (el.matches('.days')) $$('li', el).forEach((li, j) => li.style.setProperty('--i', j))
    ScrollTrigger.create({ trigger: el, start: 'top 84%', once: true, onEnter: () => el.classList.add('is-in') })
  })

  // counters
  $$('[data-count]').forEach((el) => {
    const to = +el.dataset.count
    if (reduced || to < 2) return
    const o = { v: 0 }
    el.textContent = '0'
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: () => (el.textContent = fmt(o.v)) }),
    })
  })

  if (reduced) {
    $$('.creed__text').forEach((el) => (el.style.opacity = 1))
  } else {
    // headlines rise line by line out of their own baseline
    $$('[data-lines]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'sl',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }),
      })
    })
    $$('[data-fade]').forEach((el) =>
      gsap.from(el, { opacity: 0, y: 28, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    )

    // the creed lights up word by word as you read down it
    $$('[data-words]').forEach((el) => {
      SplitText.create(el, {
        type: 'words',
        wordsClass: 'w',
        autoSplit: true,
        onSplit: (self) =>
          gsap.to(self.words, {
            opacity: 1,
            ease: 'none',
            stagger: 0.5,
            scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 46%', scrub: 0.4 },
          }),
      })
    })
    gsap.from('.creed__stats li', {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: '.creed__stats', start: 'top 88%', once: true },
    })

    // parallax inside picture frames, and loose objects that float past
    $$('[data-parallax]').forEach((img) =>
      gsap.fromTo(img, { yPercent: -6.5 }, { yPercent: 6.5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }),
    )
    $$('[data-float]').forEach((el) => {
      const d = +el.dataset.float
      gsap.fromTo(
        el,
        { y: -d, rotation: d / 9 },
        { y: d, rotation: -d / 9, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
      )
    })

    // hero drifts apart as you leave it
    const out = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    gsap.to('.hero__title', { yPercent: -16, ease: 'none', scrollTrigger: out })
    gsap.to('.hero__bell', { y: () => innerHeight * 0.14, ease: 'none', scrollTrigger: out })
    gsap.to('.hero__foot', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { ...out, end: '45% top' } })
  }

  /* the pour: three registered frames */
  {
    const [, f2, f3] = $$('.pour__frames img')
    const timeEl = $('#pour-time')
    const tempEl = $('#pour-temp')
    const clock = { t: 0, c: 1150 }
    const setClock = () => {
      const s = Math.round(clock.t)
      timeEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
      tempEl.textContent = `${fmt(clock.c)} °C`
    }
    gsap.set('.pour__beat--1', { opacity: 1 })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.pour', start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 0.5 } })
    tl.fromTo('.pour__frames', { scale: 1.04 }, { scale: 1.16, duration: 1 }, 0)
      .to('.pour__beat--1', { opacity: 0, y: -40, duration: 0.07 }, 0.16)
      .to(f2, { opacity: 1, duration: 0.12, ease: 'power1.in' }, 0.24)
      .fromTo('.pour__sparks', { opacity: 0, yPercent: 18, scale: 0.8 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.1 }, 0.27)
      .to('.pour__sparks', { yPercent: -26, scale: 1.25, duration: 0.3 }, 0.37)
      .fromTo('.pour__big', { opacity: 0, y: 90, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.08, ease: 'power2.out' }, 0.3)
      .fromTo('.pour__beat--2', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.32)
      .to(clock, { t: 240, duration: 0.33, onUpdate: setClock }, 0.3)
      .fromTo('#pour-meter', { scaleX: 0 }, { scaleX: 1, duration: 0.33 }, 0.3)
      .to(['.pour__big', '.pour__beat--2'], { opacity: 0, y: -50, duration: 0.07, stagger: 0.01 }, 0.57)
      .to('.pour__sparks', { opacity: 0, duration: 0.08 }, 0.6)
      .to(f3, { opacity: 1, duration: 0.13 }, 0.64)
      .to(clock, { c: 1012, duration: 0.34, onUpdate: setClock }, 0.64)
      .fromTo('.pour__beat--3', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.76)
      .to({}, { duration: 0.06 }, 0.94)
  }

  /* four hundred years: four registered finishes */
  {
    const imgs = $$('.life__bell img')
    const [, bone, green] = $$('.life__bg i')
    const whens = $$('.life__when p')
    const notes = $$('.life__notes li')
    gsap.set([whens.slice(1), notes.slice(1)], { opacity: 0 })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.life', start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 0.5 } })
    tl.fromTo('#life-tick', { scaleX: 0.02 }, { scaleX: 1, duration: 1 }, 0)
    tl.fromTo('.life__bell', { scale: 0.92 }, { scale: 1.04, duration: 1 }, 0)
    const cuts = [0.2, 0.46, 0.72]
    cuts.forEach((at, i) => {
      // words leave, the metal and the room change, new words arrive: the text never sits on a half-way grey
      const out = 0.03
      const w = 0.06
      tl.to(whens[i], { opacity: 0, yPercent: -22, duration: out }, at - out)
        .to(notes[i], { opacity: 0, y: -24, duration: out }, at - out)
        .to(imgs[i + 1], { opacity: 1, duration: w }, at)
      if (i === 0) tl.to(bone, { opacity: 1, duration: w }, at)
      if (i === 2) tl.to(green, { opacity: 1, duration: w }, at)
      tl.fromTo(whens[i + 1], { opacity: 0, yPercent: 22 }, { opacity: 1, yPercent: 0, duration: 0.04, ease: 'power2.out' }, at + w)
        .fromTo(notes[i + 1], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.04, ease: 'power2.out' }, at + w)
    })
  }

  /* the catalogue runs sideways on wide screens; the bells feel it */
  const mm = gsap.matchMedia()
  mm.add('(min-width: 821px)', () => {
    const sec = $('.bells')
    const track = $('#bells-track')
    const dist = () => Math.max(0, track.scrollWidth - innerWidth)
    const size = () => (sec.style.height = `${innerHeight + dist()}px`)
    size()
    ScrollTrigger.addEventListener('refreshInit', size)
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 0.6, invalidateOnRefresh: true },
    })
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', size)
      tween.kill()
      sec.style.height = ''
      gsap.set(track, { clearProps: 'transform' })
    }
  })

  // the ring section opens on the belfry
  if (!reduced) {
    gsap.fromTo('.tower__bell', { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.tower', start: 'top 80%', once: true } })
    ScrollTrigger.create({
      trigger: '.tower',
      start: 'top 62%',
      once: true,
      onEnter: () => [0, 1, 2, 3, 4, 5].forEach((i) => setTimeout(() => ringApi?.ring(i, 0.5), 300 + i * 235)),
    })
    gsap.from('.foot__big span', { yPercent: 60, opacity: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.foot__big', start: 'top 92%', once: true } })
    gsap.from('.partials__list li', { opacity: 0, y: 34, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.partials__list', start: 'top 84%', once: true } })
    gsap.from('.card__copy > *', { opacity: 0, y: 26, duration: 1.1, ease: 'expo.out', stagger: 0.03, scrollTrigger: { trigger: '.bells', start: 'top 40%', once: true } })
    gsap.from('.form > .field', { opacity: 0, y: 30, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.form', start: 'top 86%', once: true } })
    gsap.from('.band', { opacity: 0, y: 50, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.band', start: 'top 90%', once: true } })
  }
}

/* ───────────────────────── tuning: hear one partial at a time ───────────────────────── */

const zones = $$('.pb__zone')
// from the shoulder down to the lip: hum, prime, tierce, quint, nominal
function lightZone(i, ms = 700) {
  const z = zones[i]
  if (!z) return
  z.classList.add('is-on')
  clearTimeout(z._t)
  z._t = setTimeout(() => z.classList.remove('is-on'), ms)
}
function wave(btn) {
  btn.classList.remove('is-on')
  void btn.offsetWidth
  btn.classList.add('is-on')
  clearTimeout(btn._t)
  btn._t = setTimeout(() => btn.classList.remove('is-on'), 3600)
}
const partialBtns = $$('.partial')
partialBtns.forEach((btn) => {
  const i = +btn.dataset.partial
  btn.addEventListener('click', async () => {
    if (!audio.on) await needSound()
    audio.tone(370 * +btn.dataset.ratio, 4 - i * 0.45)
    lightZone(i, 900)
    wave(btn)
    $('#partials-hint').textContent = 'Now strike all five together.'
  })
  btn.addEventListener('pointerenter', () => lightZone(i, 500))
})
$('#strike-all')?.addEventListener('click', async () => {
  if (!audio.on) await needSound()
  audio.strike(370, 1)
  partialBtns.forEach((b, i) => {
    wave(b)
    lightZone(i, 1400 - i * 150)
  })
  $('#partials-hint').textContent = 'That is one bell.'
})

/* ───────────────────────── the inscription ───────────────────────── */

const band = $('#band')
const bandText = $('#band-text')
const words = $('#f-words')
const EXAMPLES = ['Ring out the old', 'For those at sea', 'I call the living', 'Cast in a wet spring', 'Marrowby · 2026']
let ex = 0
let exTimer

function fitBand() {
  gsap.set(bandText, { scale: 1 })
  const max = band.clientWidth * 0.8
  const w = bandText.scrollWidth
  gsap.set(bandText, { scale: w > max ? max / w : 1 })
}
function setBand(text, punch) {
  bandText.textContent = text
  fitBand()
  if (punch && !reduced) gsap.fromTo(bandText, { opacity: 0.55 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
}
function cycle() {
  clearInterval(exTimer)
  exTimer = setInterval(() => {
    if (words.value.trim() || document.hidden) return
    ex = (ex + 1) % EXAMPLES.length
    if (reduced) return setBand(EXAMPLES[ex])
    gsap.to(bandText, {
      opacity: 0,
      duration: 0.4,
      onComplete() {
        setBand(EXAMPLES[ex])
        words.placeholder = EXAMPLES[ex]
        gsap.to(bandText, { opacity: 1, duration: 0.7 })
      },
    })
  }, 3400)
}
words?.addEventListener('input', () => {
  const v = words.value.replace(/\s+/g, ' ').trimStart()
  $('#f-count').textContent = v.length
  setBand(v || EXAMPLES[ex], true)
})
window.addEventListener('resize', fitBand)

const form = $('#form')
const done = $('#form-done')
form?.addEventListener('submit', (e) => {
  e.preventDefault()
  let bad = null
  const check = (id, test, msg) => {
    const input = $(id)
    const field = input.closest('.field')
    const ok = test(input.value.trim())
    field.classList.toggle('is-bad', !ok)
    input.setAttribute('aria-invalid', String(!ok))
    $('.field__err', field).textContent = ok ? '' : msg
    if (!ok && !bad) bad = input
  }
  check('#f-name', (v) => v.length > 1, 'We need a name to write to.')
  check('#f-mail', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'That does not look like an address we can write to.')
  if (bad) return bad.focus()
  const first = $('#f-name').value.trim().split(/\s+/)[0]
  $('#done-name').textContent = first ? `, ${first}` : ''
  done.hidden = false
  audio.strike(370, 0.9)
  if (!reduced) {
    gsap.fromTo(done, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    gsap.fromTo(done.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 })
  }
  $('#form-again').focus({ preventScroll: true })
})
$$('#f-name, #f-mail').forEach((input) =>
  input.addEventListener('input', () => {
    const field = input.closest('.field')
    if (!field.classList.contains('is-bad')) return
    field.classList.remove('is-bad')
    input.removeAttribute('aria-invalid')
    $('.field__err', field).textContent = ''
  }),
)
$('#form-again')?.addEventListener('click', () => {
  done.hidden = true
  words.focus()
})

/* ───────────────────────── go ───────────────────────── */

document.fonts.ready.then(() => {
  choreograph()
  fitBand()
  cycle()
  ScrollTrigger.refresh()
})
window.addEventListener('load', () => ScrollTrigger.refresh())
runGate()

// for the screenshot rig
window.__site = { lenis, audio, bells, ScrollTrigger, gsap }
