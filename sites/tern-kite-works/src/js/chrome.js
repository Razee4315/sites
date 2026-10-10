// The fixed furniture: the sky behind everything, the top bar, the line-out meter, the menu and the vane.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, clamp, ease, fine, onFrame, pad, reduced } from './env.js'
import { wind } from './wind.js'

// ── sky: five gradients stacked; each later one fades in over the one before ──
export function initSky() {
  const fade = (layer, trigger, start, end) =>
    gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger, start, end, scrub: true } })

  fade('.sky__l--morning', '.creed', 'top 95%', 'top 25%')
  fade('.sky__l--noon', '.fleet', 'top 95%', 'top 20%')
  fade('.sky__l--gold', '.anatomy', 'top 20%', 'bottom 60%') // changes behind the paper, unseen
  // the day ends over a screen of empty sky between the dial and the form, so no text is caught mid-change
  const dusk = fade('.sky__l--dusk', '.send', 'top 42%', 'top -18%')
  dusk.eventCallback('onUpdate', () => night(dusk.progress() > 0.45))
  fade('.sky__stars', '.send', 'top 0%', 'top -45%')
  if (!reduced) {
    gsap.fromTo('.send__sun', { yPercent: -40 }, { yPercent: 190, ease: 'none', scrollTrigger: { trigger: '.send', start: 'top bottom', end: 'top -40%', scrub: true } })
    gsap.fromTo('.send__sun', { opacity: 1 }, { opacity: 0, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: '.send', start: 'top 20%', end: 'top -30%', scrub: true } })
  }
}

// night falls for the fixed furniture at the same moment it falls for the sky
const nightWatchers = new Set()
let isNight = false
function night(to) {
  if (to === isNight) return
  isNight = to
  nightWatchers.forEach((fn) => fn())
}

// ── top bar ───────────────────────────────────────────────────────────────────
export function initHud(scrollTo) {
  const hud = $('.hud')
  const meter = $('.meter')
  const themed = $$('main > section, .foot')

  // the bar and the meter take their ink from whatever section is under them
  const watch = (el, line) => {
    let day = 'ink'
    const apply = () => (el.dataset.theme = isNight ? 'paper' : day)
    nightWatchers.add(apply)
    themed
      .filter((sec) => sec.dataset.sky !== 'dusk')
      .forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec,
          start: `top ${line}`,
          end: `bottom ${line}`,
          onToggle: (self) => {
            if (!self.isActive) return
            day = sec.dataset.theme
            apply()
          },
        })
      })
  }
  watch(hud, '32px')
  watch(meter, '50%')

  // which section are we in
  const links = $$('.hud__nav a')
  links.forEach((a) => {
    const sec = $(a.getAttribute('href'))
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => a.classList.toggle('is-here', self.isActive),
    })
  })

  // every in-page link glides
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href'))
      if (!target) return
      e.preventDefault()
      closeMenu()
      scrollTo(target)
      history.replaceState(null, '', a.getAttribute('href'))
    })
  })
  $('[data-top]')?.addEventListener('click', () => scrollTo(0, 2.6))

  // meter + clock: scroll is line let out, and the day going by
  const fill = $('.meter__fill')
  const kite = $('.meter__kite')
  const num = $('.meter__num')
  const clock = $('.hud__clock')
  const force = $('.hud__force')
  const rail = $('.meter__rail')
  let shown = -1
  let shownForce = -1
  let p = 0
  const DAWN = 5 * 60 + 41
  const DUSK = 21 * 60 + 8
  onFrame((dt) => {
    const max = document.documentElement.scrollHeight - innerHeight
    const target = max > 0 ? clamp(scrollY / max) : 0
    p += (target - p) * (reduced ? 1 : ease(8, dt))
    const m = Math.round(p * 300)
    if (m !== shown) {
      shown = m
      num.textContent = pad(m, 3)
      const mins = Math.round(DAWN + (DUSK - DAWN) * p)
      clock.textContent = `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`
    }
    fill.style.transform = `scaleY(${p.toFixed(4)})`
    kite.style.transform = `translate3d(0,${(-p * rail.offsetHeight).toFixed(1)}px,0)`
    if (wind.force !== shownForce) {
      shownForce = wind.force
      force.textContent = `F${wind.force} · SW`
    }
  })

  // the bar steps aside while you read downward and comes back the moment you turn round
  let lastY = scrollY
  let away = false
  onFrame(() => {
    const y = scrollY
    const d = y - lastY
    lastY = y
    let want = away
    if (y < 120 || open || hud.contains(document.activeElement)) want = false
    else if (d > 1.5) want = true
    else if (d < -1.5) want = false
    if (want !== away) hud.classList.toggle('is-away', (away = want))
    hud.classList.toggle('is-floating', y >= 120 && !away)
  })

  // small-screen menu
  const menu = $('.menu')
  const btn = $('.hud__menu')
  const label = $('.hud__menu-label')
  let open = false
  const tl = gsap
    .timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
    .set(menu, { visibility: 'visible' })
    .fromTo('.menu__sheet', { yPercent: -101 }, { yPercent: 0, duration: reduced ? 0.01 : 0.9 }, 0)
    .fromTo('.menu__nav a span', { yPercent: 120 }, { yPercent: 0, duration: reduced ? 0.01 : 0.9, ease: 'expo.out', stagger: 0.06 }, reduced ? 0 : 0.35)
    .fromTo('.menu__nav a i, .menu__foot', { opacity: 0 }, { opacity: 0.6, duration: 0.6, ease: 'none', stagger: 0.04 }, reduced ? 0 : 0.55)

  function setMenu(to) {
    if (open === to) return
    open = to
    menu.classList.toggle('is-open', open)
    menu.setAttribute('aria-hidden', String(!open))
    btn.setAttribute('aria-expanded', String(open))
    hud.classList.toggle('is-menu', open)
    label.textContent = open ? 'Close' : 'Menu'
    if (open) tl.timeScale(1).play()
    else tl.timeScale(1.6).reverse()
    document.documentElement.classList.toggle('menu-open', open)
  }
  function closeMenu() {
    setMenu(false)
  }
  btn.addEventListener('click', () => setMenu(!open))
  addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu())
  matchMedia('(min-width: 1021px)').addEventListener('change', closeMenu)
}

// ── the vane ──────────────────────────────────────────────────────────────────
export function initVane() {
  if (!fine || reduced) return
  const vane = $('.vane')
  const arm = $('.vane__arm')
  const dot = $('.vane__dot')
  const label = $('.vane__label')
  let x = innerWidth / 2
  let y = innerHeight / 2
  let angle = 0
  let len = 0.5
  let press = 1

  addEventListener(
    'pointermove',
    (e) => {
      vane.classList.add('is-on')
      const t = e.target instanceof Element ? e.target : null
      const theme = t?.closest('[data-theme]')?.dataset.theme
      vane.classList.toggle('is-paper', theme === 'paper')
      const tip = t?.closest('[data-vane]')
      vane.classList.toggle('has-label', !!tip)
      if (tip) label.textContent = tip.dataset.vane
      // over the specimen the lens is the cursor
      vane.style.visibility = t?.closest('.specimen__kite') ? 'hidden' : ''
      press = t?.closest('a, button, input, select, textarea, label') ? 1.5 : 1
    },
    { passive: true },
  )
  document.addEventListener('pointerleave', () => vane.classList.remove('is-on'))

  let scale = 1
  onFrame((dt) => {
    const p = wind.pointer
    const k = ease(14, dt)
    x += (p.x - x) * k
    y += (p.y - y) * k
    const speed = Math.hypot(p.vx, p.vy)
    // moving: the arm trails behind like a windsock. still: it settles downwind and trembles
    const want = speed > 0.05 ? Math.atan2(-p.vy, -p.vx) : Math.sin(wind.t * 3.1) * 0.12 * wind.now
    let d = want - angle
    d = Math.atan2(Math.sin(d), Math.cos(d))
    angle += d * ease(9, dt)
    len += (clamp(0.45 + speed * 0.9, 0.45, 2.2) - len) * ease(7, dt)
    scale += (press - scale) * ease(10, dt)
    vane.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
    arm.style.transform = `rotate(${angle.toFixed(3)}rad) scaleX(${len.toFixed(3)})`
    dot.style.transform = `scale(${scale.toFixed(3)})`
  })
}

// ── wind you can hear: filtered noise, no samples ─────────────────────────────
export function initSound() {
  const btn = $('.hud__sound')
  let ctx, low, high, lowGain, highGain, master
  let on = false

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    const len = ctx.sampleRate * 3
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let b = 0
    for (let i = 0; i < len; i++) {
      // brown-ish noise: integrate white noise, it sounds like air rather than hiss
      b = (b + (Math.random() * 2 - 1) * 0.04) / 1.02
      data[i] = b * 6
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    low = ctx.createBiquadFilter()
    low.type = 'bandpass'
    low.Q.value = 0.5
    high = ctx.createBiquadFilter()
    high.type = 'bandpass'
    high.Q.value = 6
    lowGain = ctx.createGain()
    highGain = ctx.createGain()
    master = ctx.createGain()
    master.gain.value = 0
    src.connect(low).connect(lowGain).connect(master)
    src.connect(high).connect(highGain).connect(master)
    master.connect(ctx.destination)
    src.start()
  }

  btn.addEventListener('click', () => {
    if (!ctx) build()
    on = !on
    btn.setAttribute('aria-pressed', String(on))
    ctx.resume()
    master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.4)
  })

  onFrame(() => {
    if (!ctx || !on) return
    const w = wind.now + Math.abs(wind.gust) * 0.8
    const t = ctx.currentTime
    low.frequency.setTargetAtTime(260 + w * 260, t, 0.25)
    lowGain.gain.setTargetAtTime(clamp(0.05 + w * 0.22, 0, 0.9), t, 0.25)
    high.frequency.setTargetAtTime(900 + w * 520 + Math.sin(wind.t * 1.7) * 160, t, 0.2)
    highGain.gain.setTargetAtTime(clamp((w - 0.9) * 0.05, 0, 0.16), t, 0.3)
  })
}
