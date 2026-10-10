// V · the layered landscape and the run of commissions; the catalogue; the inscription; the footer clock.
import { gsap, ScrollTrigger, SplitText, env, $, $$, clamp, smooth } from '../lib/core.js'
import { audio, hz } from '../lib/audio.js'
import { nudgeSound } from './chrome.js'

const NOTE = hz('F#', 4)

// ------------------------------------------------------------------ vista: sky, tower, reeds, birds
export function initVista() {
  const root = $('#vista')
  const sky = $('.vista__sky', root)
  const tower = $('.vista__tower', root)
  const reeds = $('.vista__reeds', root)
  const birds = $('.vista__birds', root)
  let rung = false
  let mx = 0

  const draw = (p) => {
    if (env.reduce) {
      // no travel: the flock is simply there, already clear of the headline
      birds.style.opacity = 0.9
      birds.style.transform = 'translate3d(46%, -40%, 0) scale(0.8)'
      return
    }
    const vh = window.innerHeight
    // the camera settles: far things barely move, near things travel
    const settle = 1 - smooth(0, 0.62, p)
    sky.style.transform = `translate3d(${(mx * -6).toFixed(1)}px, ${(settle * -0.03 * vh).toFixed(1)}px, 0) scale(1.06)`
    tower.style.transform = `translate3d(${(mx * -16).toFixed(1)}px, ${(settle * 0.2 * vh).toFixed(1)}px, 0)`
    reeds.style.transform = `translate3d(${(mx * -44).toFixed(1)}px, ${(settle * 0.52 * vh).toFixed(1)}px, 0)`
    // the bell speaks, the jackdaws leave
    const b = (p - 0.3) / 0.7
    birds.style.opacity = smooth(0.3, 0.4, p).toFixed(3)
    birds.style.transform = `translate3d(${(mx * -26 + b * -0.06 * vh).toFixed(1)}px, ${(b * -0.6 * vh).toFixed(1)}px, 0) scale(${(0.46 + Math.max(0, b) * 0.85).toFixed(4)})`
    if (p > 0.34 && !rung) {
      rung = true
      audio.strike(NOTE, { size: 8, gain: 0.2, pan: -0.25 })
    }
    if (p < 0.2) rung = false
  }
  let prog = 0
  ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (st) => draw((prog = st.progress)),
    onRefresh: (st) => draw((prog = st.progress)),
  })
  if (env.fine && !env.reduce) {
    const o = { v: 0 }
    const to = gsap.quickTo(o, 'v', { duration: 1.2, ease: 'power3.out', onUpdate: () => ((mx = o.v), draw(prog)) })
    root.addEventListener('pointermove', (e) => to(e.clientX / window.innerWidth - 0.5), { passive: true })
  }
}

// ------------------------------------------------------------------ lately hung
export function initWorks() {
  const root = $('#works')
  const track = $('#worksTrack')
  const bar = $('#worksBar')
  const now = $('#worksNow')
  const works = $$('.work', track)
  const imgs = works.map((w) => $('img', w))
  const setNow = (i) => (now.textContent = String(clamp(i, 0, works.length - 1) + 1).padStart(2, '0'))

  const mm = gsap.matchMedia()
  mm.add('(min-width: 901px)', () => {
    let dist = 0
    const size = () => (dist = Math.max(0, track.scrollWidth - window.innerWidth))
    size()
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onRefresh: (s) => (size(), draw(s.progress)),
      onUpdate: (s) => draw(s.progress),
    })
    function draw(p) {
      const x = -dist * p
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`
      bar.style.transform = `scaleX(${Math.max(0.02, p).toFixed(4)})`
      const mid = window.innerWidth / 2
      let best = 0
      let bestD = Infinity
      works.forEach((w, i) => {
        const c = w.offsetLeft + x + w.offsetWidth / 2
        const d = Math.abs(c - mid)
        if (d < bestD) (bestD = d), (best = i)
        // each photograph slides a little inside its frame, against the direction of travel
        if (!env.reduce) imgs[i].style.transform = `translate3d(${(clamp((c - mid) / window.innerWidth, -1, 1) * -5).toFixed(2)}%,0,0)`
      })
      setNow(best)
    }
    return () => {
      st.kill()
      track.style.transform = ''
      imgs.forEach((i) => (i.style.transform = ''))
    }
  })
  mm.add('(max-width: 900px)', () => {
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth
      const p = max > 0 ? track.scrollLeft / max : 0
      bar.style.transform = `scaleX(${Math.max(0.04, p).toFixed(4)})`
      setNow(Math.round(p * (works.length - 1)))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => track.removeEventListener('scroll', onScroll)
  })
}

// ------------------------------------------------------------------ what we cast
export function initCast() {
  const list = $('#castList')
  const items = $$('li', list)
  const shots = $$('.cast__show img')
  const pick = (k) => {
    items.forEach((li) => li.classList.toggle('is-on', li.dataset.k === k))
    shots.forEach((im) => im.classList.toggle('is-on', im.dataset.k === k))
  }
  items.forEach((li) => {
    li.addEventListener('pointerenter', (e) => e.pointerType !== 'touch' && (list.classList.add('is-hover'), pick(li.dataset.k)))
    $('a', li).addEventListener('focus', () => pick(li.dataset.k))
  })
  list.addEventListener('pointerleave', () => list.classList.remove('is-hover'))
  // on touch screens the row nearest the middle of the screen is the one on show
  if (!env.fine)
    items.forEach((li) =>
      ScrollTrigger.create({ trigger: li, start: 'top 68%', end: 'bottom 68%', onToggle: (st) => st.isActive && pick(li.dataset.k) }),
    )
  if (!env.reduce) {
    gsap.from(items, { y: 44, autoAlpha: 0, duration: 1.2, stagger: 0.09, scrollTrigger: { trigger: list, start: 'top 82%', once: true } })
    gsap.from('.cast__show', { scale: 0.86, autoAlpha: 0, duration: 1.6, scrollTrigger: { trigger: '.cast__wrap', start: 'top 78%', once: true } })
  }
}

// ------------------------------------------------------------------ the frieze band and the footer photograph drift
export function initDrift() {
  if (env.reduce) return
  $$('.band img, .foot__img img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
}

// ------------------------------------------------------------------ inscription + form
export function initCommission() {
  const input = $('#fLine')
  const count = $('#fCount')
  const paths = [$('#insLo'), $('#insHi'), $('#insFace')]
  const svg = $('.inscribe__svg')
  const bell = $('#inscribeBell')
  const form = $('#form')
  const err = $('#fErr')
  const done = $('#formDone')

  function setLine(v, animate = true) {
    const line = v.toUpperCase().replace(/\s+/g, ' ').slice(0, 30)
    const shown = line.trim() || '·'
    paths.forEach((p) => (p.textContent = shown))
    count.textContent = line.trim().length
    // lettering shrinks as the line grows, the way a founder would space it round the waist
    const size = clamp(590 / (Math.max(shown.length, 6) * 0.86), 20, 46)
    svg.style.setProperty('--ins', `${size.toFixed(1)}px`)
    if (animate && !env.reduce) gsap.fromTo(svg, { opacity: 0.55 }, { opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: true })
    fit(line)
    return line
  }
  // the field itself also steps its type down so a full thirty letters stay in view
  function fit(line) {
    const w = input.clientWidth
    if (!w) return
    input.style.fontSize = ''
    const base = parseFloat(getComputedStyle(input).fontSize)
    const need = w / (Math.max(1, line.length) * 0.69)
    if (need < base) input.style.fontSize = `${Math.max(15, need).toFixed(1)}px`
  }
  setLine(input.value, false)
  window.addEventListener('resize', () => fit(input.value))
  input.addEventListener('input', () => {
    const start = input.selectionStart
    input.value = setLine(input.value)
    input.setSelectionRange(start, start)
  })
  $$('.chips button').forEach((b) =>
    b.addEventListener('click', () => {
      input.value = setLine(b.dataset.line)
      strike(1)
    }),
  )

  function strike(side = 1) {
    audio.strike(NOTE, { size: 9.5, gain: 0.5 })
    if (env.reduce) return
    gsap.killTweensOf(bell)
    gsap
      .timeline()
      .to(bell, { rotation: 3 * side, duration: 0.22, ease: 'power2.out' })
      .to(bell, { rotation: 0, duration: 2.8, ease: 'elastic.out(1.2, 0.18)' })
  }
  bell.addEventListener('click', (e) => {
    const r = bell.getBoundingClientRect()
    strike(e.clientX ? Math.sign(r.left + r.width / 2 - e.clientX) || 1 : 1)
    nudgeSound()
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = form.elements.name.value.trim()
    const mail = form.elements.email.value.trim()
    if (!name) {
      err.textContent = 'We will need a name to write back to.'
      return form.elements.name.focus()
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
      err.textContent = 'That address will not reach you. Have another look.'
      return form.elements.email.focus()
    }
    err.textContent = ''
    $('#doneName').textContent = `, ${name.split(' ')[0]}`
    done.hidden = false
    strike(1)
    if (!env.reduce) gsap.from(done.children, { y: 26, autoAlpha: 0, duration: 1.1, stagger: 0.1 })
    $('#formAgain').focus({ preventScroll: true })
  })
  $('#formAgain').addEventListener('click', () => {
    done.hidden = true
    input.focus({ preventScroll: true })
  })

  if (!env.reduce)
    gsap.from('.inscribe__bell', { yPercent: -14, autoAlpha: 0, duration: 1.8, scrollTrigger: { trigger: '.inscribe', start: 'top 72%', once: true }, onComplete: () => strikeQuiet() })
  function strikeQuiet() {
    if (env.reduce) return
    gsap.timeline().to(bell, { rotation: -2, duration: 0.3, ease: 'power2.out' }).to(bell, { rotation: 0, duration: 2.4, ease: 'elastic.out(1.2, 0.2)' })
  }
}

// ------------------------------------------------------------------ footer: clock, quarters, the wordmark
export function initFoot() {
  const clock = $('#clock')
  const next = $('#clockNext')
  const two = (n) => String(n).padStart(2, '0')
  let lastQuarter = -1
  const SCALE = [hz('G#', 4), hz('F#', 4), hz('A#', 4), hz('C#', 4)]
  function chime(q, hour) {
    if (!audio.on) return
    const t = audio.now() + 0.1
    let k = 0
    for (let i = 0; i < q * 4; i++) audio.strike(SCALE[(i * (1 + (Math.floor(i / 4) % 3))) % 4], { size: 4, gain: 0.26, when: t + (k++) * 0.62 })
    if (q === 4) for (let h = 0; h < hour; h++) audio.strike(NOTE / 2, { size: 9, gain: 0.5, when: t + k * 0.62 + 1.4 + h * 2.1 })
  }
  function tick() {
    const d = new Date()
    clock.textContent = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`
    const left = 900 - ((d.getMinutes() % 15) * 60 + d.getSeconds())
    next.textContent = `${two(Math.floor(left / 60) % 15)}:${two(left % 60)}`
    const q = Math.floor(d.getMinutes() / 15)
    if (lastQuarter !== -1 && q !== lastQuarter) chime(q === 0 ? 4 : q, d.getHours() % 12 || 12)
    lastQuarter = q
  }
  tick()
  setInterval(tick, 1000)

  if (!env.reduce) {
    const mark = $('.foot__mark')
    const split = new SplitText(mark, { type: 'chars', charsClass: 'char' })
    gsap.from(split.chars, {
      yPercent: 105,
      rotation: 6,
      duration: 1.5,
      stagger: { each: 0.035, from: 'center' },
      scrollTrigger: { trigger: mark, start: 'top 96%', once: true },
    })
    gsap.from('.foot__cols > div', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1, scrollTrigger: { trigger: '.foot__cols', start: 'top 88%', once: true } })
  }
}
