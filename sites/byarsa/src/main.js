import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { $, $$, clamp, fine, lerp, reduce } from './js/util.js'
import { heroSetup, heroIntro } from './js/hero.js'
import { flora } from './js/flora.js'
import { residents, bearWalk, loupe } from './js/fauna.js'
import { lake, pano } from './js/water.js'
import { route } from './js/cross.js'
import { night, season, form } from './js/night.js'

gsap.registerPlugin(ScrollTrigger, SplitText)
gsap.defaults({ overwrite: 'auto' })
history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

// ───────────── smooth scroll
const lenis = reduce ? null : new Lenis({ lerp: 0.095, wheelMultiplier: 0.95, anchors: false })
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  lenis.stop()
}
window.__lenis = lenis
const scrollTo = (target, opts = {}) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts })
  else {
    const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY
    window.scrollTo({ top: y, behavior: 'auto' })
  }
}

// ───────────── anchors
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const el = $(a.getAttribute('href'))
  if (!el) return
  e.preventDefault()
  closeMenu()
  scrollTo(a.getAttribute('href') === '#top' ? 0 : el)
  if (el.id !== 'top') {
    el.tabIndex = -1
    el.focus({ preventScroll: true })
  }
})

// ───────────── mobile menu
const burger = $('.nav__burger')
const menu = $('.menu')
let menuOpen = false
const menuTl = gsap
  .timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
  .set(menu, { visibility: 'visible' })
  .fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: reduce ? 0.01 : 0.9 })
  .from('.menu__list a', { yPercent: 110, duration: reduce ? 0.01 : 0.9, ease: 'expo.out', stagger: 0.05 }, '-=0.45')
  .from('.menu__foot', { opacity: 0, duration: 0.5 }, '-=0.4')
function openMenu() {
  menuOpen = true
  burger.setAttribute('aria-expanded', 'true')
  menu.setAttribute('aria-hidden', 'false')
  $('.nav').dataset.theme = 'dark'
  lenis?.stop()
  menuTl.timeScale(1).play()
}
function closeMenu() {
  if (!menuOpen) return
  menuOpen = false
  burger.setAttribute('aria-expanded', 'false')
  menu.setAttribute('aria-hidden', 'true')
  lenis?.start()
  menuTl.timeScale(1.6).reverse()
  syncTheme()
}
burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()))
addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu())
gsap.set(menu, { yPercent: -100 })

// ───────────── nav theme follows the section under it
const themed = $$('[data-theme]:not(.nav)')
function syncTheme() {
  if (menuOpen) return
  const probe = 36
  let theme = 'dark'
  for (const s of themed) {
    const r = s.getBoundingClientRect()
    if (r.top <= probe && r.bottom > probe) theme = s.dataset.theme
  }
  const nav = $('.nav')
  if (nav.dataset.theme !== theme) nav.dataset.theme = theme
}

// ───────────── the clock: scroll position is the time of day
const hud = { time: $('.hud__time'), temp: $('.hud__temp'), phase: $('.hud__phase'), dial: $('.hud__dial i') }
const mins = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3))
const TEMPS = [[287, -3], [370, 1], [450, 5], [620, 11], [790, 15], [900, 9], [940, 4], [1050, 9], [1130, 6], [1260, 1], [1360, -2], [1439, -4]]
const PHASES = [[320, 'Blue hour'], [385, 'First light'], [600, 'Morning'], [770, 'Midday'], [900, 'Afternoon'], [1020, 'Storm'], [1150, 'Golden hour'], [1300, 'Dusk'], [1441, 'Night']]
let anchors = []
function readAnchors() {
  const y0 = scrollY
  anchors = $$('[data-time]').map((el) => ({ y: el.getBoundingClientRect().top + y0, t: mins(el.dataset.time) }))
  const hero = $('.hero')
  anchors.splice(1, 0, { y: hero.offsetTop + hero.offsetHeight - innerHeight, t: 365 })
  const nightEl = $('.night')
  anchors.push({ y: nightEl.offsetTop + nightEl.offsetHeight - innerHeight, t: 1360 })
  anchors.push({ y: document.documentElement.scrollHeight - innerHeight * 0.4, t: 1439 })
  anchors.sort((a, b) => a.y - b.y)
}
let lastMin = -1
function tickClock() {
  if (!anchors.length) return
  const y = scrollY + innerHeight * 0.4
  let m = anchors[0].t
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (y >= a.y) m = b.y > a.y ? lerp(a.t, b.t, clamp((y - a.y) / (b.y - a.y))) : b.t
  }
  if (scrollY < 2) m = anchors[0].t
  m = Math.round(m)
  if (m === lastMin) return
  lastMin = m
  hud.time.textContent = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  let deg = TEMPS[0][1]
  for (let i = 0; i < TEMPS.length - 1; i++) if (m >= TEMPS[i][0]) deg = lerp(TEMPS[i][1], TEMPS[i + 1][1], clamp((m - TEMPS[i][0]) / (TEMPS[i + 1][0] - TEMPS[i][0])))
  deg = Math.round(deg)
  hud.temp.textContent = `${deg < 0 ? '−' : ''}${Math.abs(deg)}°C`
  hud.phase.textContent = PHASES.find((p) => m < p[0])[1]
  hud.dial.style.transform = `rotate(${((m - 720) / 1440) * 360}deg)`
}

// ───────────── reveals
function reveals() {
  $$('[data-split]').forEach((el) => {
    if (reduce) return gsap.from(el, { opacity: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'ln',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 112, rotation: 2.2, transformOrigin: '0 100%', duration: 1.5, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    })
  })
  $$('[data-lines]').forEach((el) => {
    if (reduce) return gsap.from(el, { opacity: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
    SplitText.create(el, {
      type: 'lines',
      linesClass: 'ln',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { opacity: 0, y: 26, duration: 1.2, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
    })
  })

  // photographs open like a shutter and drift inside their frames
  $$('.frame').forEach((frame) => {
    const img = $('img', frame)
    const fig = frame.closest('[data-parallax]')
    if (reduce) return gsap.from(frame, { opacity: 0, duration: 0.8, scrollTrigger: { trigger: frame, start: 'top 90%', once: true } })
    gsap.from(frame, { yPercent: 12, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: frame, start: 'top 92%', once: true } })
    if (fig) {
      gsap.fromTo(img, { y: 0, yPercent: -13.8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.from(img, { scale: 1.18, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: frame, start: 'top 92%', once: true } })
    }
  })

  $$('.label, figcaption.mono, .route__legend').forEach((el) => gsap.from(el, { opacity: 0, y: reduce ? 0 : 14, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }))

  // numbers count up
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count)
    const fmt = (v) => Math.round(v).toLocaleString('en-US')
    if (reduce || !end) return
    const o = { v: 0 }
    el.textContent = '0'
    gsap.to(o, { v: end, duration: 2.2, ease: 'expo.out', onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
  })

  gsap.from('.fact', { opacity: 0, y: reduce ? 0 : 40, duration: 1.2, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: '.facts', start: 'top 86%', once: true } })
  gsap.from('.rivers__names b', { yPercent: reduce ? 0 : 105, opacity: reduce ? 0 : 1, duration: 1.3, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: '.rivers__names', start: 'top 86%', once: true } })
  gsap.from('.temps tr', { opacity: 0, y: reduce ? 0 : 16, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.temps', start: 'top 88%', once: true } })
  gsap.from('.camp__list li', { opacity: 0, y: reduce ? 0 : 16, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.camp__list', start: 'top 90%', once: true } })
  $$('.trip').forEach((t, i) => gsap.from([...$('a', t).children].slice(1), { opacity: 0, y: reduce ? 0 : 24, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: i * 0.08, scrollTrigger: { trigger: t, start: 'top 80%', once: true } }))
  gsap.from('.bears__num > *', { opacity: 0, x: reduce ? 0 : -30, duration: 1.3, ease: 'expo.out', stagger: 0.14, scrollTrigger: { trigger: '.bears__num', start: 'top 86%', once: true } })
  gsap.from('.form', { opacity: 0, y: reduce ? 0 : 50, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 86%', once: true } })
  gsap.from('.lake__foot > *', { opacity: 0, y: reduce ? 0 : 24, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.lake', start: 'top 45%', once: true } })

  // footer: the wordmark stands up, the marmot keeps watch
  gsap.from('.foot__word span', { yPercent: reduce ? 0 : 100, opacity: reduce ? 0 : 1, duration: 1.7, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.foot__mark', start: 'top 82%', once: true } })
  gsap.from('.foot__marmot', { yPercent: reduce ? 0 : 60, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', delay: 0.9, scrollTrigger: { trigger: '.foot__mark', start: 'top 82%', once: true } })
}

// ───────────── the giant's shadow: the sun crosses, the letters' shadows swing
function shadowplay() {
  const box = $('.shadowplay')
  const cast = $('.shadowplay__cast')
  const sun = $('.shadowplay__sun')
  const set = (p) => {
    const a = lerp(-56, 56, p)
    const low = Math.abs(a) / 56
    const rad = (a * Math.PI) / 180
    sun.style.transform = `translate3d(${(Math.sin(rad) * 46).toFixed(2)}vw, ${(-Math.cos(rad) * 18.5).toFixed(2)}vw, 0)`
    cast.style.transform = `scaleY(${-(0.5 + 1.25 * Math.pow(low, 1.4)).toFixed(3)}) skewX(${(-a * 1.02).toFixed(2)}deg)`
  }
  set(reduce ? 0.2 : 0.04)
  if (reduce) return
  ScrollTrigger.create({ trigger: box, start: 'top 92%', end: 'bottom 18%', scrub: 0.5, animation: gsap.to({ p: 0.04 }, { p: 0.96, ease: 'none', onUpdate() { set(this.targets()[0].p) } }) })
  gsap.from('.shadowplay__type', { yPercent: 104, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: box, start: 'top 80%', once: true } })
  gsap.from(cast, { opacity: 0, duration: 1.6, delay: 0.5, scrollTrigger: { trigger: box, start: 'top 80%', once: true } })
}

// ───────────── cursor
function cursor() {
  if (!fine) return
  const el = $('.cursor')
  const label = $('.cursor__label')
  const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
  const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
  gsap.set(el, { x: -200, y: -200, scale: 0 })
  let mode = ''
  let px = -1
  let py = -1
  let seenY = 0
  const under = (target) => {
    const t = target?.closest?.('[data-cursor]')
    const next = t ? t.dataset.cursor : ''
    if (next === mode) return
    mode = next
    el.classList.toggle('cursor--ring', mode === 'ring')
    label.textContent = mode === 'ring' ? '' : mode
    gsap.to(el, { scale: mode ? 1 : 0, duration: 0.5, ease: mode ? 'back.out(1.8)' : 'power3.in' })
  }
  addEventListener('pointermove', (e) => {
    x((px = e.clientX))
    y((py = e.clientY))
    under(e.target)
  })
  // the page moves under a still pointer too
  gsap.ticker.add(() => {
    if (px < 0 || Math.abs(scrollY - seenY) < 4) return
    seenY = scrollY
    under(document.elementFromPoint(px, py))
  })
  document.addEventListener('pointerleave', () => ((mode = ''), gsap.to(el, { scale: 0, duration: 0.3 })))
}

// ───────────── loading: the climb from Skardu
async function load() {
  const num = $('.loader__num')
  const bar = $('.loader__bar i')
  const o = { v: 2228 }
  const eager = $$('.hero img')
  let got = 0
  const ready = Promise.all([
    document.fonts.load('400 1em "League Gothic"').catch(() => {}),
    document.fonts.load('300 1em "Newsreader Variable"').catch(() => {}),
    document.fonts.ready,
    ...eager.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => ((img.onload = r), (img.onerror = r)))).then(() => img.decode?.().catch(() => {})).then(() => gsap.to(bar, { scaleX: ++got / eager.length, duration: 0.4, ease: 'power2.out', overwrite: true }))),
  ])
  const climb = gsap.to(o, { v: 4114, duration: reduce ? 0.3 : 2.1, ease: 'power2.inOut', onUpdate: () => (num.textContent = Math.round(o.v).toLocaleString('en-US')) })
  gsap.to('.loader__to', { opacity: 1, duration: 0.6, delay: reduce ? 0.2 : 1.7 })
  await Promise.race([Promise.all([ready, climb]), new Promise((r) => setTimeout(r, 9000))])
  gsap.to(bar, { scaleX: 1, duration: 0.3 })

  readAnchors()
  tickClock()
  ScrollTrigger.refresh()
  document.documentElement.classList.add('is-ready')
  gsap
    .timeline()
    .to('.loader__inner', { opacity: 0, y: -30, duration: 0.6, ease: 'power2.in' }, 0.25)
    .to('.loader', { yPercent: -100, duration: reduce ? 0.3 : 1.2, ease: 'expo.inOut' }, 0.55)
    .set('.loader', { display: 'none' })
    .add(() => lenis?.start(), 0.9)
    .add(heroIntro(), 0.75)
}

// ───────────── go
heroSetup()
reveals()
shadowplay()
flora()
residents(scrollTo)
bearWalk()
loupe()
lake()
pano()
route()
night()
season()
form(scrollTo)
cursor()

ScrollTrigger.addEventListener('refresh', () => {
  readAnchors()
  lastMin = -1
  tickClock()
})
// the wordmark and links step aside while you read; the clock stays
let lastY = 0
const navEl = $('.nav')
gsap.ticker.add(() => {
  tickClock()
  syncTheme()
  const y = scrollY
  if (Math.abs(y - lastY) > 6) {
    navEl.classList.toggle('is-min', y > lastY && y > innerHeight * 0.6 && !menuOpen)
    lastY = y
  }
})

// lazy images sit inside clipped, animated boxes, so fetch them a couple of screens early
$$('main > *, .foot').forEach((sec) => ScrollTrigger.create({ trigger: sec, start: 'top 300%', once: true, onEnter: () => $$('img[loading=lazy]', sec).forEach((i) => (i.loading = 'eager')) }))
load()
