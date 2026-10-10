// Gate, navigation, small-screen menu, cursor, magnetic buttons.
import { gsap, ScrollTrigger, env, $, $$, lock, go, toast } from '../lib/core.js'
import { audio } from '../lib/audio.js'

// ------------------------------------------------------------------ gate
export function initGate() {
  const gate = $('#gate')
  const skip = env.params.has('skip')
  return new Promise((resolve) => {
    if (skip) {
      gate.classList.add('is-gone')
      return resolve({ sound: false, instant: true })
    }
    lock(true)
    $('#nav').classList.add('is-intro')
    const temp = $('#gateTemp')
    const hot = $('#gateHot')
    const bar = $('#gateBar')
    const line = $('#gateLine')
    const actions = $('#gateActions')
    const pad = (v) => String(Math.round(v)).padStart(4, '0')

    // what the first screen needs before it may appear
    const need = [`${import.meta.env.BASE_URL}img/bell-1.webp`, `${import.meta.env.BASE_URL}img/clapper-s.webp`, `${import.meta.env.BASE_URL}img/molten-s.webp`]
    const loaded = Promise.all([
      document.fonts.ready,
      ...need.map(
        (src) =>
          new Promise((r) => {
            const im = new Image()
            im.onload = im.onerror = r
            im.src = src
          }),
      ),
    ])

    const heat = { v: 20 }
    const show = () => {
      temp.textContent = hot.textContent = pad(heat.v)
      const p = (heat.v - 20) / 1130
      hot.style.opacity = Math.pow(p, 1.6).toFixed(3)
      bar.style.transform = `scaleX(${p.toFixed(4)})`
    }
    const ready = () => {
      line.textContent = 'At pouring heat. Mind your sleeves.'
      gate.classList.add('is-ready')
      gsap.to(actions, { autoAlpha: 1, duration: 0.8 })
      gsap.from(actions.children, { y: 18, duration: 1, stagger: 0.09 })
      actions.querySelector('button').focus({ preventScroll: true })
    }
    if (env.reduce) {
      heat.v = 1150
      show()
      loaded.then(ready)
    } else {
      gsap.from('.gate__row, .gate__line, .gate__bar', { autoAlpha: 0, duration: 1, stagger: 0.08, delay: 0.1 })
      gsap.from('.gate__temp', { yPercent: 14, autoAlpha: 0, duration: 1.4, delay: 0.1 })
      // climb to 900 on a timer, hold there until the assets are in, then finish the climb
      const climb = gsap.to(heat, { v: 900, duration: 1.7, ease: 'power2.inOut', onUpdate: show })
      Promise.all([loaded, climb.then()]).then(() => gsap.to(heat, { v: 1150, duration: 0.9, ease: 'power3.out', onUpdate: show, onComplete: ready }))
    }

    actions.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-enter]')
      if (!btn || gate.classList.contains('is-leaving')) return
      gate.classList.add('is-leaving')
      const sound = btn.dataset.enter === 'sound'
      if (sound) await audio.enable()
      resolve({ sound, instant: false })
      const done = () => {
        gate.classList.add('is-gone')
        lock(false)
        ScrollTrigger.refresh()
      }
      if (env.reduce) return done()
      gsap
        .timeline({ onComplete: done })
        .to('.gate__row, .gate__line, .gate__bar', { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0)
        .to('.gate__temp', { scale: 1.12, autoAlpha: 0, duration: 0.9, ease: 'power3.in' }, 0)
        .to(gate, { yPercent: -100, duration: 1.25, ease: 'io' }, 0.35)
    })
  })
}

// ------------------------------------------------------------------ nav
export function initNav() {
  const nav = $('#nav')
  const links = $$('.nav__links a')
  let menuOpen = false
  nav.classList.add('is-top')

  // colour follows the section under the bar
  $$('[data-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: () => `top ${nav.offsetHeight / 2}px`,
      end: () => `bottom ${nav.offsetHeight / 2}px`,
      onToggle: (st) => st.isActive && nav.classList.toggle('is-light', sec.dataset.theme === 'light'),
    })
  })
  // hide going down, show coming up; links only once the hero has gone
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(st) {
      const y = st.scroll()
      nav.classList.toggle('is-top', y < window.innerHeight * 0.7)
      if (menuOpen) return
      nav.classList.toggle('is-hidden', st.direction === 1 && y > window.innerHeight * 0.9)
    },
  })
  // current chapter
  links.forEach((a) => {
    const sec = $(a.getAttribute('href'))
    if (!sec) return
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (st) => a.classList.toggle('is-on', st.isActive),
    })
  })
  // in-page links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href')
    const el = id.length > 1 && $(id)
    if (!el) return
    e.preventDefault()
    if (menuOpen) setMenu(false)
    go(id === '#top' ? 0 : el, id === '#top' ? {} : { offset: 0 })
    history.replaceState(null, '', id)
  })

  // ---- sound
  const toggle = $('#soundToggle')
  const label = $('.sound__label', toggle)
  const note = $('#longNote')
  toggle.addEventListener('click', () => audio.toggle())
  audio.subscribe((e) => {
    if (e.type === 'state') {
      toggle.setAttribute('aria-pressed', String(e.on))
      label.textContent = e.on ? 'Sound on' : 'Sound off'
      if (!e.on) gsap.set(note, { scaleX: 0 })
    }
    if (e.type === 'strike' && audio.on) {
      gsap.killTweensOf(note)
      gsap.fromTo(note, { scaleX: 1 }, { scaleX: 0, duration: e.dur, delay: e.delay, ease: 'power2.out' })
    }
  })

  // ---- menu (small screens)
  const menu = $('#menu')
  const mBtn = $('#menuToggle')
  const mLinks = $$('.menu__links a span')
  const tl = gsap
    .timeline({ paused: true, defaults: { ease: 'io' } })
    .to('.menu__bg', { yPercent: 101, duration: env.reduce ? 0.01 : 0.9 }, 0)
    .from(mLinks, { yPercent: 110, duration: env.reduce ? 0.01 : 1, stagger: 0.055, ease: 'out' }, 0.25)
    .from('.menu__links a b, .menu__foot', { autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out' }, 0.45)
  function setMenu(open) {
    menuOpen = open
    mBtn.setAttribute('aria-expanded', String(open))
    mBtn.querySelector('span').textContent = open ? 'Close' : 'Menu'
    menu.setAttribute('aria-hidden', String(!open))
    nav.classList.remove('is-hidden')
    nav.classList.toggle('is-menu', open)
    if (open) {
      menu.classList.add('is-open')
      nav.dataset.wasLight = nav.classList.contains('is-light') ? '1' : ''
      nav.classList.remove('is-light')
      lock(true)
      tl.timeScale(1).play()
    } else {
      lock(false)
      if (nav.dataset.wasLight) nav.classList.add('is-light')
      tl.timeScale(1.6).reverse().then(() => !menuOpen && menu.classList.remove('is-open'))
    }
  }
  mBtn.addEventListener('click', () => setMenu(!menuOpen))
  window.addEventListener('keydown', (e) => e.key === 'Escape' && menuOpen && (setMenu(false), mBtn.focus()))
  window.addEventListener('resize', () => menuOpen && window.innerWidth > 1080 && setMenu(false))
}

// asked for a bell while sound is off: offer, never impose
let lastNudge = 0
export function nudgeSound() {
  if (audio.on || !audio.supported) return
  const now = performance.now()
  if (now - lastNudge < 9000) return
  lastNudge = now
  const t = toast('<span>That would have rung.</span> <button type="button" class="toast__btn">Turn sound on</button>', 5200)
  t.querySelector('button').addEventListener('click', async () => {
    await audio.enable()
    audio.strike(370, { size: 8, gain: 0.5 })
    toast('<span>Sound on. Strike something.</span>', 2400)
  })
}

// ------------------------------------------------------------------ cursor
export function initCursor() {
  if (!env.fine || env.reduce) return
  const c = $('#cursor')
  const label = $('span', c)
  document.documentElement.classList.add('has-cursor')
  const x = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3.out' })
  const y = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3.out' })
  c.classList.add('is-hidden')
  let px = -1
  let py = -1
  const read = (el) => {
    const t = el?.closest?.('[data-cursor]')
    if (t) {
      label.textContent = t.dataset.cursor
      c.classList.add('is-label')
      c.classList.remove('is-link')
    } else {
      c.classList.remove('is-label')
      c.classList.toggle('is-link', !!el?.closest?.('a, button, input, label'))
    }
  }
  window.addEventListener(
    'pointermove',
    (e) => {
      c.classList.remove('is-hidden')
      x((px = e.clientX))
      y((py = e.clientY))
      read(e.target)
    },
    { passive: true },
  )
  // the page moves under a still pointer too
  let queued = false
  window.addEventListener(
    'scroll',
    () => {
      if (queued || px < 0) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        read(document.elementFromPoint(px, py))
      })
    },
    { passive: true },
  )
  window.addEventListener('pointerdown', () => c.classList.add('is-down'))
  window.addEventListener('pointerup', () => c.classList.remove('is-down'))
  document.addEventListener('pointerleave', () => c.classList.add('is-hidden'))
}

// ------------------------------------------------------------------ magnetic buttons
export function initMagnets() {
  if (!env.fine || env.reduce) return
  $$('.btn').forEach((b) => {
    const x = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3.out' })
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect()
      x((e.clientX - r.left - r.width / 2) * 0.22)
      y((e.clientY - r.top - r.height / 2) * 0.34)
    })
    b.addEventListener('pointerleave', () => {
      gsap.to(b, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' })
    })
  })
}
