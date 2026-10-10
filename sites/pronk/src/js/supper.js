import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, clamp, lerp, reduced, fine, STACK, WIDE } from './util.js'

const AR = 1672 / 941 // the painting

// Where each course sits in the painting (fractions of its width and height),
// and how far the camera pushes in on a wide screen (s) and on a phone (ps).
const FOCUS = [
  { fx: 0.118, fy: 0.64, s: 1.62, ps: 1.24 }, // oysters, lemon, roemer
  { fx: 0.335, fy: 0.62, s: 1.5, ps: 1.22 }, // bread, butter, herring
  { fx: 0.612, fy: 0.63, s: 1.52, ps: 1.24 }, // lobster
  { fx: 0.762, fy: 0.52, s: 1.5, ps: 1.22 }, // pie
  { fx: 0.905, fy: 0.6, s: 1.55, ps: 1.24 }, // fruit, cheese
]
// minutes since midnight at the start of each course; the night ends at 29:52 (05:52)
const START = [18 * 60, 19 * 60 + 20, 21 * 60 + 5, 23 * 60 + 30, 26 * 60 + 10]
const PORTRAIT = 17 * 60 + 40
const DAWN = 29 * 60 + 52

export function initSupper() {
  const sec = $('.supper')
  if (!sec) return
  const pin = $('.supper__pin', sec)
  const cam = $('.supper__camera', sec)
  const states = $$('.supper__state', sec)
  const panel = $('.supper__panel', sec)
  const list = $('.supper__courses', sec)
  const courses = $$('.course', sec)
  const ticks = $$('.supper__ticks li', sec)
  const digits = $$('.supper__clock .d', sec)
  const dawn = $('.supper__dawn', sec)
  const capA = $('.supper__cap--a', sec)
  const capB = $('.supper__cap--b', sec)
  const [intro, ...rest] = courses
  const outro = rest.pop()
  const eats = rest // the five courses

  let geo = null
  let views = []
  const camera = { p: 0, creep: 0 }
  let clockKeys = [] // [timeline time, minutes]
  let spans = [] // [from, to] timeline time for each course
  let tl = null

  function measure() {
    const vw = pin.clientWidth
    const vh = pin.clientHeight
    const phone = matchMedia(STACK).matches
    list.style.height = phone ? Math.max(...courses.map((c) => c.offsetHeight)) + 'px' : ''
    const win = phone
      ? { x: 0, y: panel.offsetHeight, w: vw, h: vh - panel.offsetHeight }
      : { x: panel.offsetWidth, y: 0, w: vw - panel.offsetWidth, h: vh }
    const H0 = phone ? win.h : Math.max(vh, vw / AR)
    const W0 = H0 * AR
    cam.style.width = W0 + 'px'
    cam.style.height = H0 + 'px'

    // the framed "plate" view used before and after the meal on wide screens
    const pad = parseFloat(getComputedStyle(panel).paddingLeft)
    const navH = $('.nav').offsetHeight
    const capH = 58
    const pw = Math.min(vw - pad * 2, (vh - navH - capH - 12) * AR)
    const ph = pw / AR
    const px = (vw - pw) / 2
    const py = navH + (vh - navH - capH - ph) / 2
    pin.style.setProperty('--plate-x', px + 'px')
    pin.style.setProperty('--plate-y', py + 'px')
    pin.style.setProperty('--plate-w', pw + 'px')
    pin.style.setProperty('--plate-h', ph + 'px')

    geo = { vw, vh, phone, win, W0, H0 }
    const at = (f, s) => ({
      s,
      x: clamp(win.x + win.w * 0.5 - f.fx * W0 * s, win.x + win.w - W0 * s, win.x),
      y: clamp(win.y + win.h * 0.54 - f.fy * H0 * s, win.y + win.h - H0 * s, win.y),
      hold: true,
    })
    const plate = { s: pw / W0, x: px, y: py }
    views = phone
      ? [at({ fx: 0.86, fy: 0.5 }, 1), ...FOCUS.map((f) => at(f, f.ps)), at({ fx: 0.47, fy: 0.5 }, 1)]
      : [plate, ...FOCUS.map((f) => at(f, f.s)), plate]
    render()
  }

  const setCam = gsap.quickSetter(cam, 'css')
  function render() {
    if (!geo) return
    const { win, W0, H0, phone } = geo
    const i = clamp(Math.floor(camera.p), 0, views.length - 2)
    const t = camera.p - i
    const a = views[i]
    const b = views[i + 1]
    let s = lerp(a.s, b.s, t)
    let x = lerp(a.x, b.x, t)
    let y = lerp(a.y, b.y, t)
    if (!reduced) {
      // travelling between two close-ups the camera eases back a touch; while it rests it creeps forward
      const between = a.hold && b.hold
      const k = (between ? 1 - 0.13 * Math.sin(Math.PI * t) : 1) * (1 + 0.05 * camera.creep)
      const cx = win.x + win.w / 2
      const cy = win.y + win.h / 2
      s *= k
      x = cx - (cx - x) * k
      y = cy - (cy - y) * k
      if (between || phone) {
        x = clamp(x, win.x + win.w - W0 * s, win.x)
        y = clamp(y, win.y + win.h - H0 * s, win.y)
      }
    }
    setCam({ x, y, scale: s })
  }

  function clock(time) {
    let m = clockKeys[0][1]
    for (let k = 0; k < clockKeys.length - 1; k++) {
      const [t0, m0] = clockKeys[k]
      const [t1, m1] = clockKeys[k + 1]
      if (time >= t0) m = time >= t1 ? m1 : lerp(m0, m1, (time - t0) / (t1 - t0))
    }
    m = Math.round(m) % 1440
    const str = String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0')
    digits.forEach((d, i) => { if (d.textContent !== str[i]) d.textContent = str[i] })
    const now = spans.findIndex(([a, b]) => time >= a && time < b)
    ticks.forEach((li, i) => {
      li.classList.toggle('is-on', i === now)
      li.classList.toggle('is-done', spans[i] && time >= spans[i][1])
    })
  }

  function build(phone) {
    clockKeys = []
    spans = []
    camera.p = 0
    camera.creep = 0
    gsap.set(states.slice(1), { opacity: 0 })
    gsap.set(courses, { autoAlpha: 0 })
    gsap.set([dawn, capB], { autoAlpha: 0 })
    gsap.set(capA, { autoAlpha: 1 })
    gsap.set(cam, { opacity: 1 })
    gsap.set(panel, { xPercent: phone ? 0 : -101 })

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: 'bottom bottom',
        scrub: fine ? true : 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onRefresh: () => { render(); clock(tl.time()) },
      },
      onUpdate: () => { render(); clock(tl.time()) },
    })

    const parts = (c) => $$('.course__n, .course__t, .course__d', c)
    const textIn = (c, T) => {
      tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, T)
      tl.fromTo(parts(c), { y: 30 }, { y: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out' }, T)
    }
    const textOut = (c, T) => {
      tl.to(c, { autoAlpha: 0, duration: 0.28, ease: 'power1.in' }, T)
      tl.to(parts(c), { y: -20, duration: 0.28, ease: 'power1.in' }, T)
    }
    // move the camera along its path; with reduced motion it cuts through a dip to black instead
    const move = (to, T, dur, ease = 'power2.inOut') => {
      if (!reduced) return tl.to(camera, { p: to, duration: dur, ease }, T)
      const mid = T + dur / 2
      tl.to(cam, { opacity: 0, duration: 0.2 }, mid - 0.22).set(camera, { p: to }, mid).to(cam, { opacity: 1, duration: 0.2 }, mid + 0.02)
    }

    let T = 0
    clockKeys.push([0, PORTRAIT])

    // ── the portrait
    if (phone) {
      gsap.set(intro, { autoAlpha: 1 })
      move(1, 0.25, 1.9, 'power1.inOut')
      tl.fromTo(intro, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.28, ease: 'power1.in' }, 1.75)
      tl.fromTo(parts(intro), { y: 0 }, { y: -20, duration: 0.28, ease: 'power1.in' }, 1.75)
      T = 2.15
    } else {
      T = 0.45
      move(1, T, 1.5)
      tl.to(capA, { autoAlpha: 0, duration: 0.3 }, T)
      tl.to(panel, { xPercent: 0, duration: 1.05, ease: 'power3.out' }, T + 0.3)
      T += 1.1 // the first course starts to read while the camera is still settling
    }

    // ── five courses
    eats.forEach((c, i) => {
      const from = T
      clockKeys.push([T, START[i]])
      textIn(c, T)
      tl.fromTo(camera, { creep: 0 }, { creep: 1, duration: 2.5 }, T)
      // eaten
      tl.to(states[i + 1], { opacity: 1, duration: 0.85, ease: 'power1.inOut' }, T + 0.85)
      tl.fromTo($('.course__left', c), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' }, T + 1.5)
      T += 2.5
      clockKeys.push([T, START[i] + 48])
      spans.push([from, T])
      textOut(c, T - 0.1)
      if (i < eats.length - 1) {
        tl.to(camera, { creep: 0, duration: 1.05, ease: 'power1.inOut' }, T)
        move(i + 2, T, 1.05)
        T += 1.05
      }
    })

    // ── dawn
    tl.to(camera, { creep: 0, duration: 0.6 }, T)
    move(6, T + 0.1, 1.6)
    tl.to(dawn, { autoAlpha: 0.9, duration: 1.6 }, T + 0.1)
    if (phone) {
      textIn(outro, T + 1.1)
    } else {
      tl.to(panel, { xPercent: -101, duration: 0.9, ease: 'power2.in' }, T + 0.1)
      tl.to(capB, { autoAlpha: 1, duration: 0.4 }, T + 1.3)
    }
    T += 1.7
    clockKeys.push([T, DAWN])
    tl.to({}, { duration: 0.7 }, T) // a breath before the page lets go
    return tl
  }

  const mm = gsap.matchMedia()
  mm.add({ phone: STACK, desk: WIDE }, (c) => {
    measure()
    build(c.conditions.phone)
    return () => gsap.set([cam, panel, ...courses, ...states, dawn, capA, capB], { clearProps: 'all' })
  })
  ScrollTrigger.addEventListener('refreshInit', measure)
}
