import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import 'lenis/dist/lenis.css'
import './style.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import meta from './img-meta.json'
import { HOURS, PAPER, hourFor } from './data.js'

gsap.registerPlugin(ScrollTrigger, SplitText)
history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches
const D = (d) => (reduced ? 0.01 : d)
const src = (name) => `${import.meta.env.BASE_URL}img/${name}.webp`
const pad2 = (n) => String(n).padStart(2, '0')
const clock = (h) => {
  const m = Math.round(h * 60) % 1440
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`
}

function img(name, cls = '') {
  const el = new Image()
  el.src = src(name)
  el.alt = ''
  el.className = cls
  el.decoding = 'async'
  el.draggable = false
  if (meta[name]) {
    el.width = meta[name].w
    el.height = meta[name].h
  }
  return el
}

/* ── light: a theme is twelve numbers (bg, ink, accent, glow) so it can be blended ── */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const pack = (t) => [...hex(t.bg), ...hex(t.ink), ...hex(t.accent), ...hex(t.glow)]
const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t))
const THEMES = HOURS.map((h) => pack(h.theme))
const PAPER_T = pack(PAPER)
const root = document.documentElement
let themeKey = ''
function paint(t) {
  const v = t.map(Math.round)
  const key = v.join()
  if (key === themeKey) return
  themeKey = key
  const rgb = (i) => `rgb(${v[i]} ${v[i + 1]} ${v[i + 2]})`
  root.style.setProperty('--bg', rgb(0))
  root.style.setProperty('--ink', rgb(3))
  root.style.setProperty('--accent', rgb(6))
  root.style.setProperty('--glow', rgb(9))
}

/* ── build the stage ── */
const stage = $('.stage')
const rig = $('.rig')
const shadow = $('.rig__shadow')
const glow = $('.rig__glow')
const sun = $('.sun')
const bottleMeta = meta['bottle-1'] || { w: 400, h: 1200 }
rig.style.aspectRatio = `${bottleMeta.w} / ${bottleMeta.h}`
shadow.append(img('bottle-1'))
const bottles = HOURS.map((_, k) => {
  const el = img(`bottle-${k + 1}`)
  el.style.opacity = k ? 0 : 1
  $('.rig__bottles').append(el)
  return el
})

// each giant word is split in two so the bottle can stand in the middle of it like one more letter
const words = ['Cadran', ...HOURS.map((h) => h.name)].map((text) => {
  const el = document.createElement('div')
  el.className = 'word'
  const cut = Math.ceil(text.length / 2)
  const half = (s) => [...s].map((ch) => `<span class="c"><i>${ch}</i></span>`).join('')
  el.innerHTML = `<span class="word__h word__h--l">${half(text.slice(0, cut))}</span><span class="word__gap"></span><span class="word__h">${half(text.slice(cut))}</span>`
  $('.stage__words').append(el)
  const chars = $$('i', el)
  gsap.set(chars, { yPercent: 110 })
  return { el, chars, halves: $$('.word__h', el), gap: $('.word__gap', el) }
})

const notes = HOURS.map((h, c) =>
  h.items.map((it, k) => {
    const el = img(it.img, 'note')
    if (it.blur) el.style.filter = `blur(${it.blur}px)`
    $(it.d < 1 ? '.stage__notes--back' : '.stage__notes--front').append(el)
    return {
      ...it,
      el,
      ratio: meta[it.img] ? meta[it.img].h / meta[it.img].w : 1,
      dir: k % 2 ? 1 : -1,
      ph: c * 1.7 + k * 2.3,
      fs: 0.35 + ((k * 37 + c * 11) % 10) / 40,
      on: false,
    }
  }),
)

/* ── build the five panels ── */
const panelsEl = $('.hours__panels')
const panels = HOURS.map((h, i) => {
  const el = document.createElement('article')
  el.className = 'panel'
  el.innerHTML = `
    <div class="panel__l">
      <p class="mono panel__idx" data-a><b>${pad2(i + 1)}</b><span>/ 05</span><span>${h.time}</span></p>
      <h2 class="panel__kicker" data-a><span class="sr">${h.name}. </span><em>${h.kicker}</em></h2>
      <p class="panel__text" data-a>${h.text}</p>
      <dl class="panel__notes" data-a>
        ${h.notes.map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
    </div>
    <div class="panel__r">
      <figure class="panel__fig">
        <div class="panel__clip"><img src="${src('light-' + h.id)}" alt="${h.caption}" loading="lazy" width="${meta['light-' + h.id]?.w || 1000}" height="${meta['light-' + h.id]?.h || 1500}"></div>
        <figcaption class="mono panel__cap" data-a>${h.time} — ${h.caption}</figcaption>
      </figure>
      <div class="buy" data-a>
        <span class="mono">${h.name} — 50 ml — €165</span>
        <button class="btn" type="button" data-add><span class="btn__label">Add to bag</span></button>
      </div>
    </div>`
  panelsEl.append(el)
  const p = { el, lines: $$('[data-a]', el), clip: $('.panel__clip', el), photo: $('.panel__clip img', el) }
  gsap.set(p.lines, { opacity: 0 })
  gsap.set(p.clip, { clipPath: 'inset(100% 0% 0% 0%)' })
  return p
})

const hoursNav = $('.hours__nav')
const navBtns = HOURS.map((h, i) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = h.name
  b.addEventListener('click', () => goToHour(i))
  hoursNav.append(b)
  return b
})

/* dial ticks + marquee copy */
$('.dial__ticks').innerHTML = Array.from({ length: 24 }, (_, k) => {
  const long = k % 6 === 0
  return `<line x1="32" y1="${long ? 3.5 : 5}" x2="32" y2="${long ? 9 : 7}" transform="rotate(${k * 15} 32 32)"/>`
}).join('')
const track = $('.marquee__track')
const run = HOURS.map((h) => `<span><small>${h.time}</small>${h.name} <em>·</em></span>`).join('')
track.innerHTML = `<div>${run}${run}</div><div>${run}${run}</div>`
track.querySelectorAll('div').forEach((d) => (d.style.display = 'flex'))

/* ── the visitor's own hour ── */
let nowIdx = hourFor(new Date())
function tellTime() {
  const d = new Date()
  nowIdx = hourFor(d)
  $$('[data-now]').forEach((el) => (el.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`))
  $$('[data-now-hour]').forEach((el) => (el.textContent = HOURS[nowIdx].name))
}
tellTime()
setInterval(tellTime, 15000)

/* ── measuring ── */
let vw = 0
let vh = 0
let mobile = false
let rigW = 0
function measure() {
  vw = window.innerWidth
  vh = stage.clientHeight || window.innerHeight
  mobile = vw <= 860
  rigW = rig.offsetWidth
  const range = document.createRange()
  const gap = mobile ? 0 : rigW * 0.8
  for (const w of words) {
    w.el.style.fontSize = '100px'
    const [l, r] = w.halves.map((h) => (range.selectNodeContents(h), range.getBoundingClientRect().width))
    const fit = mobile ? (vw * 0.9) / (l + r) : (vw * 0.92 - gap) / (2 * Math.max(l, r))
    const size = Math.min(fit * 100, vh * (mobile ? 0.115 : 0.33))
    w.el.style.fontSize = `${size}px`
    // every word sits on the same baseline whatever its size (0.862 = Fraunces baseline in a line-height-1 box)
    w.el.style.top = `${vh * (mobile ? 0.215 : 0.395) - size * 0.862}px`
    w.gap.style.width = `${gap}px`
  }
  for (const set of notes)
    for (const n of set) {
      const w = (n.w / 100) * vh * (mobile ? 0.6 : 1)
      n.el.style.width = `${w}px`
      n.hw = w / 2
      n.hh = (w * n.ratio) / 2
      n.xp = mobile ? (n.x < 50 ? n.x * 0.42 : 100 - (100 - n.x) * 0.42) / 100 : n.x / 100
      // on a phone the copy owns the bottom third, so everything floats above it
      n.yp = (mobile ? 18 + ((n.y - 22) / 58) * 44 : n.y) / 100
    }
}

/* ── smooth scroll ── */
const lenis = reduced ? null : new Lenis({ lerp: 0.09, smoothWheel: true })
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  lenis.stop()
}
const scrollTo = (y, o = {}) => (lenis ? lenis.scrollTo(y, { duration: 1.8, ...o }) : window.scrollTo(0, typeof y === 'number' ? y : y.offsetTop))
function goToHour(i) {
  const el = $('.hours')
  const top = el.getBoundingClientRect().top + window.scrollY
  scrollTo(top + ((i + 0.36) / 5) * (el.offsetHeight - vh))
}

/* ── scroll state: four progress values feed one render loop ── */
const S = { hp: 0, bp: 0, P: 0, endP: 0, footP: 0 }
const track01 = (key, trigger, start, end) =>
  ScrollTrigger.create({ trigger, start, end, onUpdate: (st) => (S[key] = st.progress), onRefresh: (st) => (S[key] = st.progress) })
track01('hp', '.hero', 'top top', 'bottom top')
track01('bp', '.hours', 'top bottom', 'top top')
track01('P', '.hours', 'top top', 'bottom bottom')
track01('endP', '.atelier', 'top 90%', 'top 30%')
track01('footP', '.foot', 'top 80%', 'top 20%')

/* ── giant words and panels change on a clock, not on the scrubber ── */
let ready = false
let curtainUp = false
let curWord = -1
let curPanel = -1
function setWord(k, dir) {
  if (k === curWord) return
  if (curWord >= 0) {
    const out = words[curWord].chars
    gsap.killTweensOf(out)
    gsap.to(out, { yPercent: -110 * dir, duration: D(0.55), ease: 'power3.in', stagger: D(0.018) })
  }
  if (k >= 0) {
    const inn = words[k].chars
    gsap.killTweensOf(inn)
    gsap.fromTo(inn, { yPercent: 110 * dir }, { yPercent: 0, duration: D(1.15), ease: 'expo.out', stagger: D(0.04), delay: D(0.22) })
  }
  curWord = k
}
function setPanel(k, dir) {
  if (k === curPanel) return
  if (curPanel >= 0) {
    const p = panels[curPanel]
    p.el.classList.remove('is-on')
    gsap.killTweensOf([p.lines, p.clip, p.photo])
    gsap.to(p.lines, { y: -18 * dir, opacity: 0, duration: D(0.4), ease: 'power2.in', stagger: D(0.025) })
    gsap.to(p.clip, {
      clipPath: dir > 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)',
      duration: D(0.6),
      ease: 'power3.inOut',
      onComplete: () => gsap.set(p.el, { visibility: 'hidden' }),
    })
  }
  if (k >= 0) {
    const p = panels[k]
    p.el.classList.add('is-on')
    gsap.killTweensOf([p.lines, p.clip, p.photo])
    gsap.set(p.el, { visibility: 'visible' })
    gsap.fromTo(p.lines, { y: 26 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: D(1), ease: 'expo.out', stagger: D(0.07), delay: D(0.3) })
    gsap.fromTo(
      p.clip,
      { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: D(1.3), ease: 'expo.inOut', delay: D(0.15) },
    )
    gsap.fromTo(p.photo, { scale: 1.3 }, { scale: 1, duration: D(1.9), ease: 'expo.out', delay: D(0.15) })
  }
  navBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === k)))
  hoursNav.classList.toggle('is-on', k >= 0)
  curPanel = k
}

/* ── render ── */
const M = { x: 0, y: 0, tx: 0, ty: 0 }
if (finePointer && !reduced)
  window.addEventListener('pointermove', (e) => {
    M.tx = (e.clientX / vw) * 2 - 1
    M.ty = (e.clientY / vh) * 2 - 1
  })
const intro = { y: 0.3, o: 0, skew: 34 }
const heroView = $('.hero__view')
const topBar = $('.top')
const dial = $('.dial')
const dialHand = $('.dial__hand')
const dialTime = $('[data-dial-time]')
const dialName = $('[data-dial-name]')
let dialKey = ''
let mqX = 0
let lastY = 0
let dir = 1

function frame() {
  if (!ready) return
  const t = reduced ? 0 : performance.now() / 1000
  M.x += (M.tx - M.x) * 0.06
  M.y += (M.ty - M.y) * 0.06
  const y = window.scrollY
  if (y !== lastY) dir = y > lastY ? 1 : -1
  lastY = y

  // where we are in the day: s runs 0→5 across the five hours, sp eases across each boundary
  const s = S.P * 5
  const i = Math.min(4, Math.floor(s))
  const f = s - i
  const sp = i < 4 ? i + smooth(0.78, 1, f) : 4
  const a = Math.floor(sp)
  const b = Math.min(4, a + 1)
  const ft = sp - a
  const A = HOURS[a]
  const B = HOURS[b]
  const local = HOURS[nowIdx]

  // light
  let theme = mix(THEMES[a], THEMES[b], ft)
  if (S.endP > 0) theme = mix(theme, PAPER_T, S.endP)
  if (S.footP > 0) theme = mix(theme, THEMES[nowIdx], S.footP)
  paint(theme)
  let sx = lerp(A.sun[0], B.sun[0], ft)
  let sy = lerp(A.sun[1], B.sun[1], ft)
  let so = lerp(A.sun[2], B.sun[2], ft)
  if (S.endP > 0) (sx = lerp(sx, 62, S.endP)), (sy = lerp(sy, 0, S.endP)), (so = lerp(so, 0.9, S.endP))
  if (S.footP > 0) (sx = lerp(sx, local.sun[0], S.footP)), (sy = lerp(sy, local.sun[1], S.footP)), (so = lerp(so, local.sun[2], S.footP))
  sun.style.transform = `translate3d(${(sx / 100) * vw + M.x * 26}px, ${(sy / 100) * vh + M.y * 18}px, 0)`
  sun.style.opacity = so

  // bottle: centred in the hero, steps aside for the manifesto, comes back for the hours
  const m = smooth(0, 1, S.hp) * (1 - smooth(0, 1, S.bp))
  const rx = (mobile ? 0.5 : lerp(0.5, 0.78, m)) * vw - rigW / 2 - M.x * 7
  rig.style.transform = `translate3d(${rx}px, ${intro.y * vh}px, 0) scale(${lerp(1, mobile ? 1 : 0.84, m)})`
  rig.style.opacity = intro.o * (mobile ? 1 - 0.9 * m : 1)
  bottles.forEach((el, k) => {
    const o = k === 0 ? (sp >= 1 ? 0 : 1) : sp >= k + 1 ? 0 : clamp(sp - k + 1)
    if (el._o !== o) el.style.opacity = el._o = o
  })
  shadow.style.transform = `skewX(${-(lerp(A.shadow[0], B.shadow[0], ft) + intro.skew)}deg) scaleY(${lerp(A.shadow[1], B.shadow[1], ft)})`
  shadow.style.opacity = lerp(A.shadow[2], B.shadow[2], ft) * intro.o
  glow.style.opacity = smooth(3.2, 4, sp)

  // ingredients ride past the bottle, each at the speed of its depth
  const appear = smooth(0.45, 1, S.bp)
  for (let c = 0; c < 5; c++) {
    let p = (s - c - 0.42) * 2
    if (c === 4) p = Math.min(p, 0.25)
    for (const n of notes[c]) {
      let o = clamp((1.15 - Math.abs(p)) / 0.35)
      if (c === 0) o *= appear
      if (o <= 0.001) {
        if (n.on) (n.el.style.opacity = 0), (n.on = false)
        continue
      }
      n.on = true
      const fl = reduced ? 0 : 1
      const ny = n.yp * vh - p * 0.5 * vh * n.d + (c === 0 ? (1 - appear) * 0.4 * vh * n.d : 0) + Math.sin(t * n.fs + n.ph) * 9 * fl - n.hh - M.y * 14 * n.d
      const nx = n.xp * vw - n.hw - M.x * 24 * n.d + Math.cos(t * n.fs * 0.7 + n.ph) * 5 * fl
      const nr = n.r + p * 9 * n.dir + Math.sin(t * n.fs * 0.8 + n.ph) * 2 * fl
      n.el.style.transform = `translate3d(${nx}px, ${ny}px, 0) rotate(${nr}deg)`
      n.el.style.opacity = o
    }
  }

  // which word and which panel
  let wk = -1
  let pk = -1
  if (S.bp >= 0.86) {
    pk = clamp(Math.floor(s + 0.1), 0, 4)
    wk = pk + 1
  } else if (S.hp < 0.28) wk = 0
  if (curtainUp) {
    setWord(wk, dir)
    setPanel(pk, dir)
  }
  heroView.style.opacity = 1 - smooth(0, 0.4, S.hp)
  topBar.classList.toggle('is-away', S.endP > 0.02 && dir > 0)
  dial.classList.toggle('is-away', S.endP > 0.25)

  // dial: the hour of the scent on stage
  const hv = lerp(A.h, B.h, ft)
  const name = HOURS[Math.round(sp)].name
  const key = clock(hv) + name
  if (key !== dialKey) {
    dialKey = key
    dialTime.textContent = clock(hv)
    dialName.textContent = name
    dialHand.style.transform = `rotate(${((hv - 12) / 24) * 360}deg)`
  }

  // marquee drifts, and hurries when you scroll
  const half = track.offsetWidth / 2
  if (half) {
    mqX -= reduced ? 0 : 0.7 + Math.abs(lenis ? lenis.velocity : 0) * 0.35
    if (mqX <= -half) mqX += half
    track.style.transform = `translate3d(${mqX}px, 0, 0)`
  }
}
gsap.ticker.add(frame)

/* ── scroll-triggered reveals for the editorial sections ── */
function reveals() {
  const manifesto = SplitText.create('.manifesto__text', { type: 'words', wordsClass: 'w' })
  gsap.fromTo(
    manifesto.words,
    { opacity: 0.13 },
    { opacity: 1, ease: 'none', stagger: 0.5, scrollTrigger: { trigger: '.manifesto__text', start: 'top 74%', end: 'bottom 46%', scrub: 0.6 } },
  )

  $$('[data-lines]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 112,
          duration: D(1.2),
          ease: 'expo.out',
          stagger: D(0.1),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    })
  })

  $$('[data-reveal]').forEach((el) =>
    gsap.from(el, { y: 26, opacity: 0, duration: D(1.1), ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
  )

  $$('[data-clip]').forEach((fig) => {
    gsap.fromTo(
      fig,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: D(1.5), ease: 'expo.inOut', scrollTrigger: { trigger: fig, start: 'top 88%', once: true } },
    )
    const pic = $('[data-parallax]', fig)
    if (pic && !reduced)
      gsap.fromTo(pic, { yPercent: -15 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } })
  })

  $$('[data-grow]').forEach((fig) => {
    const st = { trigger: fig, start: 'top 96%', end: 'top 18%', scrub: 0.8 }
    gsap.fromTo(fig, { clipPath: 'inset(16% 18% 16% 18%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: st })
    gsap.fromTo($('img', fig), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { ...st } })
  })

  gsap.from('.rise > span', {
    yPercent: 115,
    duration: D(1.3),
    ease: 'expo.out',
    stagger: D(0.12),
    scrollTrigger: { trigger: '.foot__now', start: 'top 86%', once: true },
  })
  gsap.from('.foot__mark', { yPercent: 45, ease: 'none', scrollTrigger: { trigger: '.foot__mark', start: 'top bottom', end: 'max', scrub: 0.6 } })
}

/* ── small interactions ── */
let bag = 0
document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]')
  if (add) {
    bag++
    $('[data-bag]').textContent = bag
    gsap.fromTo('[data-bag]', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: D(0.5), ease: 'expo.out' })
    const label = $('.btn__label', add)
    add._text ??= label.textContent
    label.textContent = 'Added to your bag'
    add.classList.add('is-added')
    clearTimeout(add._t)
    add._t = setTimeout(() => {
      label.textContent = add._text
      add.classList.remove('is-added')
    }, 1700)
    return
  }
  const link = e.target.closest('a[href^="#"]')
  if (!link) return
  e.preventDefault()
  if (link.hasAttribute('data-now-link')) return goToHour(nowIdx)
  const id = link.getAttribute('href')
  if (id === '#top') return scrollTo(0)
  if (id === '#hours') return goToHour(0)
  const target = $(id)
  if (target) scrollTo(target.getBoundingClientRect().top + window.scrollY)
})

$('[data-news]').addEventListener('submit', (e) => {
  e.preventDefault()
  const input = e.target.email
  const ok = input.value.trim() && input.checkValidity()
  $('[data-news-msg]').textContent = ok ? 'Thank you. See you next season.' : 'That address does not look right.'
  if (ok) input.value = ''
})

/* ── load, then let the day begin ── */
async function boot() {
  const first = [...HOURS.map((_, k) => `bottle-${k + 1}`), ...HOURS[0].items.map((it) => it.img), 'light-lauds']
  let loaded = 0
  const shown = { v: 0 }
  const bar = $('[data-loader-bar]')
  const time = $('[data-loader-time]')
  const show = () => {
    bar.style.transform = `scaleX(${shown.v})`
    time.textContent = clock(shown.v * HOURS[0].h)
  }
  const bump = () => gsap.to(shown, { v: ++loaded / first.length, duration: D(0.6), ease: 'power2.out', onUpdate: show, overwrite: true })
  const images = first.map(
    (name) =>
      new Promise((res) => {
        const im = new Image()
        im.onload = im.onerror = () => (bump(), res())
        im.src = src(name)
      }),
  )
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  await Promise.race([Promise.all([...images, document.fonts.ready, wait(reduced ? 0 : 1300)]), wait(7000)])
  await wait(reduced ? 0 : 450)

  measure()
  reveals()
  ScrollTrigger.refresh()
  window.addEventListener('resize', () => (measure(), ScrollTrigger.refresh()))
  ready = true

  gsap.set('[data-hero], .top, .dial', { opacity: 0 })
  gsap
    .timeline({ onComplete: () => lenis?.start() })
    .to('.loader > *', { opacity: 0, y: -14, duration: D(0.5), ease: 'power2.in', stagger: D(0.05) })
    .to('.loader', { yPercent: -100, duration: D(1.1), ease: 'expo.inOut' }, '-=0.1')
    .set('.loader', { display: 'none' })
    .call(() => (curtainUp = true), null, '-=0.8')
    .to(intro, { y: 0, duration: D(1.7), ease: 'expo.out' }, '-=0.75')
    .to(intro, { o: 1, duration: D(0.9), ease: 'power2.out' }, '<')
    .to(intro, { skew: 0, duration: D(2.4), ease: 'expo.out' }, '<')
    .to('.top, .dial', { opacity: 1, duration: D(1), ease: 'power2.out' }, '-=1.9')
    .fromTo('[data-hero]', { y: 22 }, { y: 0, opacity: 1, duration: D(1.1), ease: 'expo.out', stagger: D(0.09) }, '-=1.9')
}
boot()
