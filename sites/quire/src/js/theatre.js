// Hero and season: one pinned stage. The front sheet has the name cut out of it and folds
// open on scroll; the camera then pulls back until the stage is a window in a coloured sheet,
// and each further screen of scroll calls the next scene change.
import { gsap, ScrollTrigger, SplitText, $, $$, clamp, pad2, reduce, fine, tallMQ, lockScroll, scrollTo, fontsReady, FACE_COUNT } from './util.js'
import { productions } from './data.js'
import { Stage } from './stage.js'
import { glyphMetrics, widthOf, setLine, sheetSVG, PAPER } from './cutout.js'

const FOLD = 0.85 // screens of scroll to open the sheet
const PULL = [0.8, 1.45] // screens over which the camera pulls back
const EACH = 0.95 // screens per production

const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>'

export function initTheatre() {
  const theatre = $('#season')
  const pin = $('#pin')
  const stageEl = $('#stage')
  const fold = $('#fold')
  const tui = $('#tui')
  const dim = $('#dim')
  const spot = $('#spot')
  const themeMeta = $('meta[name="theme-color"]')

  const stage = new Stage({ root: stageEl, scenesEl: $('#scenes'), productions })
  $('#scenes').setAttribute('role', 'img')

  // ── frames, programme and act buttons, one per production
  const frames = productions.map((p, i) => {
    const f = document.createElement('i')
    f.className = 'frame'
    f.style.setProperty('--bg', p.theme.bg)
    if (!i) f.style.opacity = 1
    $('#frames').append(f)
    return f
  })
  const items = productions.map((p) => {
    const el = document.createElement('article')
    el.className = 'prog__item'
    el.setAttribute('aria-hidden', 'true')
    for (const [k, v] of Object.entries(p.theme)) el.style.setProperty(`--${k}`, v)
    const title = p.title.map((line) => `<span class="tl">${[...line].map((c) => (c === ' ' ? ' ' : `<span class="ch">${c}</span>`)).join('')}</span>`).join('')
    el.innerHTML = `
      <p class="prog__meta label"><span class="prog__num">${p.numeral}</span><span class="prog__who">${p.composer}</span><span class="prog__year">${p.year}</span></p>
      <h2 class="prog__title" aria-label="${p.title.join(' ')}">${title}</h2>
      <p class="prog__sub">${p.english}</p>
      <p class="prog__note">${p.note}</p>
      <dl class="prog__facts label"><div><dt>Runs</dt><dd>${p.run}</dd></div><div><dt>Length</dt><dd>${p.length}</dd></div><div><dt>Count</dt><dd>${p.fact}</dd></div></dl>
      <a class="btn prog__cta" href="#seats" data-pick="${p.id}"><span class="btn__t">Take a sheet</span>${arrow}</a>`
    $('#prog').append(el)
    return el
  })
  const acts = productions.map((p, i) => {
    const li = document.createElement('li')
    li.innerHTML = `<button type="button" aria-label="${p.title.join(' ')}">${p.numeral}</button>`
    $('#acts').append(li)
    li.firstChild.addEventListener('click', () => goTo(i))
    return li.firstChild
  })

  // ── geometry
  let pw = 0
  let ph = 0
  const cover = { x: 0, y: 0, scale: 1 }

  function measure() {
    if (pin.clientWidth < 120 || pin.clientHeight < 120) return
    pw = pin.clientWidth
    ph = pin.clientHeight
    pin.style.setProperty('--pw', `${pw}px`)
    pin.style.setProperty('--ph', `${ph}px`)
    const l = stageEl.offsetLeft
    const t = stageEl.offsetTop
    const w = stageEl.offsetWidth
    const h = stageEl.offsetHeight
    cover.scale = Math.max(pw / w, ph / h) * 1.03
    cover.x = pw / 2 - (l + w / 2)
    cover.y = ph / 2 - (t + h / 2)
    fitTitles()
    buildFold()
  }

  // every title is set as wide as its column allows and a little wider, so it steps onto the stage
  function fitTitles() {
    const tall = tallMQ.matches
    for (const el of items) {
      const title = $('.prog__title', el)
      title.style.fontSize = '100px'
      const widest = Math.max(...$$('.tl', title).map((l) => l.getBoundingClientRect().width))
      const room = el.clientWidth * (tall ? 1 : 1.2)
      const size = Math.min((room / widest) * 100, tall ? ph * 0.105 : ph * 0.24)
      title.style.fontSize = ''
      el.style.setProperty('--ts', `${size.toFixed(1)}px`)
    }
  }

  // ── the front sheet: an SVG the size of the screen with QUIRE masked out of it, one copy per leaf.
  // Each letter also exists as a loose piece of paper (a "plug") sitting in its own hole until it is punched out.
  let plugs = []
  let punched = false
  function buildFold() {
    const tall = tallMQ.matches
    const { cap } = glyphMetrics()
    const rows = []
    let fs
    let crease
    if (!tall) {
      fs = Math.min((pw * 0.88) / widthOf('QUIRE'), (ph * 0.5) / cap)
      rows.push(setLine('QUIRE', (pw - widthOf('QUIRE') * fs) / 2, ph * 0.432 + (cap * fs) / 2, fs))
      fold.style.removeProperty('--fy')
      crease = `<rect x="${pw / 2 - 1}" y="0" width="1" height="${ph}" fill="rgba(23,20,15,.2)"/><rect x="${pw / 2}" y="0" width="1" height="${ph}" fill="rgba(255,255,255,.5)"/>`
    } else {
      const top = 168
      const bottom = ph - (ph < 720 ? 96 : 150)
      const gap = Math.max(12, pw * 0.035)
      fs = Math.min((pw - 28) / widthOf('QUI'), (bottom - top - gap) / 2 / cap)
      const block = cap * fs * 2 + gap
      const y1 = top + (bottom - top - block) / 2 + cap * fs
      rows.push(setLine('QUI', 14, y1, fs))
      rows.push(setLine('RE', pw - 14 - widthOf('RE') * fs, y1 + gap + cap * fs, fs))
      // the sheet folds along the gap between the two lines
      const fy = Math.round(y1 + gap / 2)
      fold.style.setProperty('--fy', `${fy}px`)
      crease = `<rect x="0" y="${fy - 1}" width="${pw}" height="1" fill="rgba(23,20,15,.2)"/><rect x="0" y="${fy}" width="${pw}" height="1" fill="rgba(255,255,255,.5)"/>`
    }
    $$('.leaf__art', fold).forEach((el, k) => (el.innerHTML = sheetSVG({ k: k ? 'b' : 'a', w: pw, h: ph, fs, rows, crease, plugs: !punched })))
    const cells = rows.flat()
    plugs = cells.map((_, i) => $$(`.plug[data-i="${i}"]`, fold))
  }

  // ── programme in and out
  let shown = -1 // which programme is on the sheet; -1 = none (hero)
  let progTl = null

  function programme(i) {
    if (i === shown) return
    const prev = shown
    shown = i
    progTl?.progress(1)
    const tl = (progTl = gsap.timeline())
    const dur = reduce ? 0.01 : 1

    if (prev >= 0) {
      const el = items[prev]
      el.setAttribute('aria-hidden', 'true')
      tl.to([...el.children], { opacity: 0, y: -12, duration: 0.3 * dur, stagger: 0.025 * dur, ease: 'power2.in' }, 0).add(() => el.classList.remove('is-live'))
    }
    tl.to(tui, { opacity: 0, duration: 0.25 * dur, ease: 'none' }, 0)

    // the sheet changes colour: the new one fades in over the old
    // (coming from the hero, the first sheet is already there: the camera has just pulled back onto it)
    const f = frames[Math.max(0, i)]
    frames.forEach((x) => gsap.set(x, { zIndex: x === f ? 2 : x === frames[prev] ? 1 : 0 }))
    if (prev >= 0 && i >= 0) tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.8 * dur, ease: 'sine.inOut' }, 0.2)
    else tl.set(f, { opacity: 1 }, 0)
    tl.add(() => frames.forEach((x) => x !== f && gsap.set(x, { opacity: 0 })))

    if (i < 0) {
      tl.add(() => tui.classList.remove('is-live'))
      $('#scenes').setAttribute('aria-label', 'A paper stage set')
      themeMeta.content = PAPER
      return
    }

    const p = productions[i]
    const el = items[i]
    const at = prev >= 0 ? 0.62 : 0.05
    tl.add(() => {
      el.classList.add('is-live')
      el.removeAttribute('aria-hidden')
      tui.classList.add('is-live')
      tui.style.color = p.theme.ink
      acts.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')))
      $('#prev').disabled = i === 0
      $('#next').disabled = i === productions.length - 1
      themeMeta.content = p.theme.bg
      $('#scenes').setAttribute('aria-label', `Paper stage set for ${p.english === p.title.join(' ') ? p.english : `${p.title.join(' ')}, ${p.english}`}`)
    }, at)
    const rest = [...el.children].filter((c) => !c.classList.contains('prog__title'))
    tl.set([...el.children], { opacity: 1, y: 0 }, at)
      .fromTo($$('.ch', el), { yPercent: 118, rotation: 6 }, { yPercent: 0, rotation: 0, duration: 1.05 * dur, stagger: { amount: 0.3 * dur }, ease: 'expo.out' }, at)
      .fromTo(rest, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9 * dur, stagger: 0.07 * dur, ease: 'power3.out' }, at + 0.12)
      .to(tui, { opacity: 1, duration: 0.5 * dur, ease: 'none' }, at + 0.2)
  }

  // ── scroll → state
  let st = null
  let introTl = null
  const unit = () => innerHeight
  const startOf = (i) => theatre.offsetTop + (PULL[1] + i * EACH + 0.32) * unit()

  function goTo(i) {
    scrollTo(startOf(clamp(i, 0, productions.length - 1)))
  }
  $('#prev').addEventListener('click', () => goTo(stage.target - 1))
  $('#next').addEventListener('click', () => goTo(stage.target + 1))
  tui.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(stage.target + 1)
    if (e.key === 'ArrowLeft') goTo(stage.target - 1)
  })

  function onScroll(self) {
    const u = (self.scroll() - self.start) / unit()
    const framed = u > PULL[1] - 0.1 // the words wait until the camera has all but finished pulling back
    const i = framed ? clamp(Math.floor((u - PULL[1]) / EACH), 0, productions.length - 1) : -1
    programme(i)
    stage.go(Math.max(0, i))
    spotOn(framed && pointerIn)
    // preload the scene after next while there is time
    if (i >= 0) stage.load(Math.min(i + 1, productions.length - 1))
  }

  function buildScroll() {
    introTl?.scrollTrigger?.kill()
    introTl?.kill()
    st?.kill()
    const tall = tallMQ.matches
    const axis = tall ? 'rotationX' : 'rotationY'
    gsap.set($$('.leaf', fold), { clearProps: 'transform' })

    introTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: theatre, start: 'top top', end: () => `+=${PULL[1] * unit()}`, scrub: reduce ? true : 0.6, invalidateOnRefresh: true },
    })
    if (reduce) {
      introTl.to(fold, { opacity: 0, duration: FOLD }, 0)
    } else {
      introTl
        .to($('.leaf--a', fold), { [axis]: tall ? -96 : 96, duration: FOLD, ease: 'sine.inOut' }, 0)
        .to($('.leaf--b', fold), { [axis]: tall ? 96 : -96, duration: FOLD, ease: 'sine.inOut' }, 0)
        .to($$('.leaf__shade', fold), { opacity: 1, duration: FOLD * 0.9, ease: 'sine.in' }, 0)
        .to($$('.leaf__copy', fold), { opacity: 0, duration: 0.16 }, 0.02)
    }
    introTl
      .set(fold, { visibility: 'hidden' }, FOLD + 0.01)
      .fromTo(dim, { opacity: 0.3 }, { opacity: 0, duration: FOLD * 0.8 }, 0)
      .fromTo(stageEl, { x: () => cover.x, y: () => cover.y, scale: () => cover.scale }, { x: 0, y: 0, scale: 1, duration: PULL[1] - PULL[0], ease: 'power2.inOut', immediateRender: true }, PULL[0])

    st = ScrollTrigger.create({ trigger: theatre, start: 'top top', end: 'bottom bottom', onUpdate: onScroll, onRefresh: onScroll })
  }

  // ── follow-spot
  let pointerIn = false
  let spotIsOn = false
  const sx = gsap.quickTo(spot, 'x', { duration: 0.45, ease: 'power3.out' })
  const sy = gsap.quickTo(spot, 'y', { duration: 0.45, ease: 'power3.out' })
  function spotOn(on) {
    if (on === spotIsOn || !fine) return
    spotIsOn = on
    gsap.to(spot, { opacity: on ? 1 : 0, duration: on ? 0.5 : 0.9, ease: 'power2.out', overwrite: true })
  }
  if (fine) {
    pin.addEventListener('pointermove', (e) => {
      const r = stageEl.getBoundingClientRect()
      stage.point(((e.clientX / innerWidth) * 2 - 1), ((e.clientY / innerHeight) * 2 - 1))
      const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom
      const k = stageEl.offsetWidth / r.width
      sx((e.clientX - r.left) * k)
      sy((e.clientY - r.top) * k)
      pointerIn = inside
      spotOn(inside && shown >= 0)
    })
    pin.addEventListener('pointerleave', () => {
      pointerIn = false
      stage.pointer.auto = true
      spotOn(false)
    })
  }

  // ── loading and the first cut
  const loaderN = $('#loader-n')
  const loaderBar = $('#loader-bar')
  const progress = (f) => {
    loaderN.textContent = pad2(clamp(Math.round(f * 24), 1, 24))
    loaderBar.style.transform = `scaleX(${f})`
  }

  async function start({ instant = false } = {}) {
    gsap.set($$('.leaf__copy > *', fold), { opacity: 0 })
    progress(0.04)
    let got = 0
    const tick = () => progress(0.04 + (++got / (FACE_COUNT + 13)) * 0.96)
    await Promise.all([
      fontsReady(tick),
      stage.load(0, tick),
      new Promise((r) => setTimeout(r, instant || reduce ? 0 : 700)),
    ])
    progress(1)
    glyphMetrics(true)
    measure()
    buildScroll()
    // phones fire resize whenever the address bar slides; only a real change of size is worth a rebuild
    let lastW = innerWidth
    let lastH = innerHeight
    addEventListener('resize', debounce(() => {
      if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 130) return
      lastW = innerWidth
      lastH = innerHeight
      measure()
      ScrollTrigger.refresh()
    }, 180))
    tallMQ.addEventListener('change', () => { measure(); buildScroll(); ScrollTrigger.refresh() })

    const loader = $('#loader')
    const copy = $$('.leaf__copy > *', fold)

    if (instant || reduce) {
      punched = true
      buildFold()
      stage.show(0)
      loader.remove()
      gsap.set(copy, { opacity: 1 })
      document.documentElement.classList.add('is-ready')
      ScrollTrigger.refresh()
      return
    }

    lockScroll(true)
    const split = new SplitText($('.hero__line', fold), { type: 'lines', mask: 'lines', linesClass: 'sl' })
    const tl = gsap.timeline({
      onComplete: () => {
        punched = true
        plugs.flat().forEach((p) => p.remove())
        split.revert()
      },
    })
    tl.to(loader, { opacity: 0, y: 8, duration: 0.4, ease: 'power2.in' }, 0.25)
      .add(() => loader.remove(), 0.7)
      .add(stage.enter(0), 0.5)
    plugs.forEach((pair, i) => {
      const spin = (i % 2 ? 1 : -1) * (9 + ((i * 7) % 11))
      const at = 0.75 + i * 0.14
      tl.to(pair, { y: 7, duration: 0.12, ease: 'power2.out' }, at)
        .to(pair, { y: ph * 1.15, rotation: spin, x: spin * 2.4, duration: 1.15, ease: 'power2.in', transformOrigin: '50% 50%' }, at + 0.1)
    })
    tl.set($('.hero__line', fold), { opacity: 1 }, 1.25)
      .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'expo.out' }, 1.25)
      .fromTo($$('.leaf__copy--a .label, .hero__body, .hero__cue', fold), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 1.45)
      .add(() => {
        lockScroll(false)
        document.documentElement.classList.add('is-ready')
      }, 1.7)
  }

  // links elsewhere on the page can ask for a production's night to be preselected
  pin.addEventListener('click', (e) => {
    const a = e.target.closest('[data-pick]')
    if (a) document.dispatchEvent(new CustomEvent('quire:pick', { detail: a.dataset.pick }))
  })

  return { start, stage }
}

function debounce(fn, ms) {
  let t
  return (...a) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...a), ms)
  }
}
