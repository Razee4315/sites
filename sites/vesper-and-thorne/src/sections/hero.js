// The hero bell is a real pendulum: a heavy bell and, inside it, a lighter clapper that lags behind.
// When the clapper catches up with the wall of the bell, it strikes: sound, a flash, rings in the air,
// and a wave through the headline. Cursor, click and scroll all push the bell.
import { gsap, ScrollTrigger, SplitText, env, $, $$, clamp, velocity } from '../lib/core.js'
import { audio, hz } from '../lib/audio.js'
import { nudgeSound } from './chrome.js'

const NOTE = hz('F#', 4)

export function initHero() {
  const hero = $('.hero')
  const swing = $('#heroSwing')
  const clapper = $('.hero__clapper')
  const rings = $$('.hero__rings i')
  const flash = $('#heroFlash')
  const title = $('#heroTitle')

  const split = new SplitText(title, { type: 'chars', charsClass: 'char' })
  const chars = split.chars
  let mids = []
  const measure = () => {
    const c = window.innerWidth / 2
    mids = chars.map((ch) => {
      const r = ch.getBoundingClientRect()
      return Math.abs(r.left + r.width / 2 - c) / window.innerWidth
    })
  }

  // ---------------------------------------------------------------- strike
  let last = 0
  let settled = false
  function strike(power = 1, fromUser = false) {
    const now = performance.now()
    if (now - last < 260) return
    last = now
    audio.strike(NOTE, { size: 9.5, gain: 0.26 + 0.34 * power })
    if (fromUser) nudgeSound()
    if (env.reduce) return
    gsap.fromTo(flash, { opacity: 0.9 * power }, { opacity: 0, duration: 2.4, ease: 'power2.out', overwrite: true })
    rings.forEach((r, i) => {
      gsap.fromTo(
        r,
        { scale: 0.42, opacity: 0.75 * power },
        { scale: 1.9 + i * 0.25, opacity: 0, duration: 2.6 + i * 0.5, delay: i * 0.16, ease: 'power2.out', overwrite: true },
      )
    })
    // the sound passes through the headline, outwards from the bell
    if (!settled) return
    const lift = -0.055 * power * parseFloat(getComputedStyle(title).fontSize)
    gsap.killTweensOf(chars)
    chars.forEach((ch, i) => {
      gsap
        .timeline({ delay: 0.03 + (mids[i] || 0) * 0.5 })
        .to(ch, { y: lift, duration: 0.14, ease: 'sine.out' })
        .to(ch, { y: 0, duration: 1.5, ease: 'elastic.out(1.1, 0.24)' })
    })
  }

  // ---------------------------------------------------------------- pendulum
  let th = 0, om = 0 // bell: angle, angular velocity (rad)
  let ph = 0, pom = 0 // clapper, in the world frame
  const K = 11, C = 0.62, KC = 30, CC = 1.4, REACH = 0.125, MAX = 0.3
  let awake = false
  let visible = true
  let rect = null

  function tick(_, dtMs) {
    if (!awake || !visible) return
    const dt = Math.min(0.032, dtMs / 1000)
    const steps = 2
    for (let s = 0; s < steps; s++) {
      const h = dt / steps
      om += (-K * th - C * om) * h
      th = clamp(th + om * h, -MAX, MAX)
      pom += (-KC * ph - CC * pom) * h
      ph += pom * h
      const rel = ph - th
      if (Math.abs(rel) > REACH) {
        const sign = Math.sign(rel)
        const closing = (pom - om) * sign // clapper moving into the wall
        ph = th + sign * REACH
        if (closing > 0) {
          if (closing > 0.5) strike(clamp(closing / 2.6, 0.25, 1))
          pom = om - sign * closing * 0.28
        }
      }
    }
    swing.style.transform = `rotate(${th.toFixed(5)}rad)`
    clapper.style.transform = `translateX(-50%) rotate(${(ph - th).toFixed(5)}rad)`
    if (Math.abs(th) < 0.0006 && Math.abs(om) < 0.002 && Math.abs(ph) < 0.0006 && Math.abs(pom) < 0.002) {
      awake = false
      th = om = ph = pom = 0
      swing.style.transform = ''
      clapper.style.transform = 'translateX(-50%)'
    }
  }
  const push = (v) => {
    if (env.reduce) return
    om = clamp(om + v, -2.4, 2.4)
    awake = true
  }
  gsap.ticker.add(tick)

  // cursor brushing the bell
  const getRect = () => (rect = swing.getBoundingClientRect())
  let px = null
  hero.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return
      if (!rect) getRect()
      const inside = e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top + rect.height * 0.25 && e.clientY < rect.bottom
      if (inside && px !== null) push(clamp((e.clientX - px) * 0.0042, -0.5, 0.5))
      px = e.clientX
    },
    { passive: true },
  )
  hero.addEventListener('pointerleave', () => (px = null))
  swing.addEventListener('click', (e) => {
    getRect()
    const side = e.clientX ? Math.sign(rect.left + rect.width / 2 - e.clientX) || 1 : 1
    push(side * 1.15)
    strike(1, true)
  })
  window.addEventListener('resize', () => ((rect = null), measure()))

  // scrolling shoves it too
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onToggle: (st) => (visible = st.isActive || st.progress === 0),
    onUpdate: () => {
      rect = null
      const v = velocity()
      if (Math.abs(v) > 6) push(clamp(v * 0.0011, -0.16, 0.16))
    },
  })

  // leaving: everything drifts at its own speed (set up only once the entrance has finished with these elements)
  function leave() {
    settled = true
    measure()
    if (env.reduce) return
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to('.hero__bell', { y: () => hero.offsetHeight * 0.14, ease: 'none', scrollTrigger: { ...st, invalidateOnRefresh: true } })
    gsap.to(title, { yPercent: -34, ease: 'none', scrollTrigger: st })
    gsap.to('.hero__glow', { opacity: 0.2, ease: 'none', scrollTrigger: st })
    gsap.to('.hero__foot, .hero__status, .hero__meta', { autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '45% top' } })
  }

  // ---------------------------------------------------------------- entrance
  return function enter({ instant }) {
    measure()
    const nav = $('#nav')
    if (env.reduce || instant) return nav.classList.remove('is-intro'), leave()
    const tl = gsap.timeline({ onComplete: leave })
    tl.from('.hero__bell', { yPercent: -112, duration: 1.7, ease: 'out' }, 0.25)
      .add(() => {
        th = -0.21
        om = 0.5
        awake = true
      }, 0.25)
      .from(chars, { yPercent: 70, opacity: 0, rotation: 5, duration: 1.5, stagger: { each: 0.04, from: 'center' }, ease: 'out' }, 0.7)
      .from('.hero__meta p, .hero__sub, .hero__cue, .hero__status', { y: 22, autoAlpha: 0, duration: 1.2, stagger: 0.08 }, 1.35)
      // the bar slides in on its own CSS transition; tweening its transform as well would fight that
      .add(() => nav.classList.remove('is-intro'), 1.3)
  }
}
