// I · the pour (three registered frames), II · four ages of one bell, III · the five partials.
import { gsap, ScrollTrigger, env, $, $$, clamp, smooth } from '../lib/core.js'
import { audio, hz, PARTIALS } from '../lib/audio.js'
import { nudgeSound } from './chrome.js'

const NOTE = hz('F#', 4)

// a bell nodding on its pivot after being struck by hand
function nod(el, side = 1) {
  if (env.reduce) return
  gsap.killTweensOf(el)
  gsap
    .timeline()
    .to(el, { rotation: 3.2 * side, duration: 0.22, ease: 'power2.out' })
    .to(el, { rotation: 0, duration: 2.6, ease: 'elastic.out(1.2, 0.18)' })
}
const sideOf = (el, e) => {
  const r = el.getBoundingClientRect()
  return e.clientX ? Math.sign(r.left + r.width / 2 - e.clientX) || 1 : 1
}

// ------------------------------------------------------------------ the pour
export function initPour() {
  const root = $('#pour')
  const frames = $('.pour__frames', root)
  const [, f2, f3] = $$('.pour__frames img', root)
  const caps = $$('.pour__cap', root)
  const num = $('#pourNum')
  const rail = $('#pourRail')
  let stage = -1
  let shown = ''

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (st) => draw(st.progress),
    onRefresh: (st) => draw(st.progress),
  })
  function draw(p) {
    f2.style.opacity = smooth(0.2, 0.36, p).toFixed(3)
    f3.style.opacity = smooth(0.6, 0.78, p).toFixed(3)
    rail.style.transform = `scaleX(${p.toFixed(4)})`
    if (!env.reduce) frames.style.transform = `scale(${(1.07 - 0.07 * p).toFixed(4)})`
    // furnace holds at heat, the metal goes in, then it starts its three days of cooling
    const t = p < 0.3 ? 1080 + 70 * smooth(0, 0.3, p) : p < 0.66 ? 1150 : 1150 - 520 * smooth(0.66, 1, p)
    const txt = String(Math.round(t))
    if (txt !== shown) num.textContent = shown = txt
    const s = p < 0.28 ? 0 : p < 0.69 ? 1 : 2
    if (s !== stage) {
      stage = s
      caps.forEach((c, i) => c.classList.toggle('is-on', i === s))
    }
  }
}

// ------------------------------------------------------------------ four ages
export function initAges() {
  const root = $('#ages')
  const bell = $('#agesBell')
  const [, tuned, century, old] = $$('img', bell)
  const whens = $$('.ages__when span', root)
  const texts = $$('.ages__text article', root)
  const ticks = $$('.ages__rail span', root)
  const rail = $('#agesRail')
  let stage = -1

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (st) => draw(st.progress),
    onRefresh: (st) => draw(st.progress),
  })
  function draw(p) {
    tuned.style.opacity = smooth(0.2, 0.3, p).toFixed(3)
    century.style.opacity = smooth(0.45, 0.55, p).toFixed(3)
    old.style.opacity = smooth(0.7, 0.8, p).toFixed(3)
    rail.style.transform = `scaleX(${clamp(p * 1.02).toFixed(4)})`
    const s = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3
    if (s !== stage) {
      stage = s
      ;[whens, texts, ticks].forEach((set) => set.forEach((el, i) => el.classList.toggle('is-on', i === s)))
    }
  }
  bell.addEventListener('click', (e) => {
    // as cast it argues with itself; from week six on it is true, and the room it hangs in grows with the years
    audio.strike(NOTE, { size: stage === 0 ? 5 : 9.5, gain: 0.55, tuned: stage > 0 })
    nudgeSound()
    nod(bell, sideOf(bell, e))
  })

  if (!env.reduce) {
    gsap.from('.dim--w i', { scaleX: 0, duration: 1.6, ease: 'io', scrollTrigger: { trigger: root, start: 'top 20%' } })
    gsap.from('.dim--h i', { scaleY: 0, duration: 1.6, ease: 'io', scrollTrigger: { trigger: root, start: 'top 20%' } })
    gsap.from('.dim span', { autoAlpha: 0, duration: 1, delay: 0.9, scrollTrigger: { trigger: root, start: 'top 20%' } })
    gsap.from('.ages__bell', { yPercent: 18, autoAlpha: 0, duration: 1.6, scrollTrigger: { trigger: root, start: 'top 55%' } })
  }
}

// ------------------------------------------------------------------ five partials
export function initVoice() {
  const root = $('#tuner')
  const rows = $$('#partials li', root)
  const rings = Object.fromEntries($$('.tuner__rings i', root).map((r) => [r.dataset.p, r]))
  const verdict = $('#tunerVerdict')
  const mouth = $('#tunerStrike')
  const SIZE = 8
  const nominal = NOTE * 2
  let tuned = false

  const spec = Object.fromEntries(PARTIALS.map((p) => [p.key, p]))
  const hzOf = (k, t) => nominal * (t ? spec[k].ratio : spec[k].cast)
  const centsOf = (k, t) => (t ? 0 : 1200 * Math.log2(spec[k].cast / spec[k].ratio))
  const fmtCents = (c) => (Math.abs(c) < 0.5 ? '±0 ¢' : `${c > 0 ? '+' : '−'}${Math.abs(Math.round(c))} ¢`)

  const live = Object.fromEntries(rows.map((li) => [li.dataset.p, { hz: hzOf(li.dataset.p, false), c: centsOf(li.dataset.p, false) }]))
  function paint(li) {
    const k = li.dataset.p
    $('.p__hz b', li).textContent = Math.round(live[k].hz)
    const c = $('.p__cents', li)
    c.textContent = fmtCents(live[k].c)
    c.classList.toggle('is-true', Math.abs(live[k].c) < 0.5)
  }
  rows.forEach(paint)

  function ringOut(keys) {
    keys.forEach((k) => {
      const li = rows.find((r) => r.dataset.p === k)
      const d = Math.max(0.6, SIZE * spec[k].decay)
      gsap.fromTo($('.p__bar i', li), { scaleX: 1 }, { scaleX: 0, duration: d, ease: 'power2.out', overwrite: true })
      const ring = rings[k]
      ring.style.setProperty('--dur', `${d}s`)
      ring.classList.remove('is-ringing')
      void ring.offsetWidth
      ring.classList.add('is-ringing')
    })
    if (!env.reduce) gsap.fromTo(mouth, { scale: 0.985 }, { scale: 1, duration: 1.4, ease: 'elastic.out(1.2, 0.2)', overwrite: true })
  }
  function sound(keys) {
    audio.strike(NOTE, { size: SIZE, gain: keys.length === 1 ? 0.6 : 0.55, tuned, only: keys.length === 5 ? null : keys })
    nudgeSound()
    ringOut(keys)
  }
  const ALL = ['hum', 'prime', 'tierce', 'quint', 'nominal']
  rows.forEach((li) => $('button', li).addEventListener('click', () => sound([li.dataset.p])))
  $('#tunerAll').addEventListener('click', () => sound(ALL))
  mouth.addEventListener('click', () => sound(ALL))

  function setState(next, quiet) {
    if (next === tuned) return
    tuned = next
    root.classList.toggle('is-tuned', tuned)
    $$('.switch button', root).forEach((b) => {
      const on = (b.dataset.state === 'tuned') === tuned
      b.classList.toggle('is-on', on)
      b.setAttribute('aria-pressed', String(on))
    })
    verdict.textContent = tuned ? 'Tuned: five partials, one bell.' : 'As cast: five partials, five opinions.'
    rows.forEach((li) => {
      const k = li.dataset.p
      gsap.to(live[k], {
        hz: hzOf(k, tuned),
        c: centsOf(k, tuned),
        duration: env.reduce ? 0 : 1.1,
        ease: 'power3.out',
        onUpdate: () => paint(li),
      })
    })
    if (!quiet) setTimeout(() => sound(ALL), env.reduce ? 0 : 380)
  }
  $$('.switch button', root).forEach((b) => b.addEventListener('click', () => setState(b.dataset.state === 'tuned')))
}
