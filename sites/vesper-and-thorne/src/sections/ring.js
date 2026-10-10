// IV · change ringing. Six ropes you can pull, and Plain Bob Minor drawn the way ringers print it:
// rows of numbers, a line through them for the bell you are following. The page can ring it.
import { gsap, ScrollTrigger, env, $, $$ } from '../lib/core.js'
import { audio, hz } from '../lib/audio.js'
import { nudgeSound } from './chrome.js'

// treble (1) to tenor (6): the top six notes of F sharp major, descending
const BELLS = [
  { n: 1, name: 'D♯', f: hz('D#', 5), sally: 'a' },
  { n: 2, name: 'C♯', f: hz('C#', 5), sally: 'b' },
  { n: 3, name: 'B', f: hz('B', 4), sally: 'c' },
  { n: 4, name: 'A♯', f: hz('A#', 4), sally: 'a' },
  { n: 5, name: 'G♯', f: hz('G#', 4), sally: 'b' },
  { n: 6, name: 'F♯', f: hz('F#', 4), sally: 'c' },
]

// Plain Bob Minor in place notation: x = every pair swaps; digits = those places stay put
const LEAD = ['x', '16', 'x', '16', 'x', '16', 'x', '16', 'x', '16', 'x', '12']
function change(row, pn) {
  const out = row.slice()
  const stay = pn === 'x' ? [] : [...pn].map((d) => Number(d) - 1)
  for (let i = 0; i < 5; i++) {
    if (stay.includes(i) || stay.includes(i + 1)) continue
    out[i] = row[i + 1]
    out[i + 1] = row[i]
    i++
  }
  return out
}
const ROWS = [[1, 2, 3, 4, 5, 6]]
for (let l = 0; l < 5; l++) for (const pn of LEAD) ROWS.push(change(ROWS[ROWS.length - 1], pn))
// 61 rows: rounds, sixty changes, and the last is rounds again

const CW = 30
const RH = 26
const PAD = 8
const NS = 'http://www.w3.org/2000/svg'
const el = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag)
  for (const k in attrs) e.setAttribute(k, attrs[k])
  return e
}

export function initRing() {
  // ---------------------------------------------------------------- ropes
  const ropesEl = $('#ropes')
  ropesEl.removeAttribute('aria-hidden')
  const ropes = BELLS.map((b) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'rope'
    btn.dataset.s = b.sally
    btn.dataset.cursor = 'Pull'
    btn.setAttribute('aria-label', `Ring bell ${b.n}, ${b.name.replace('♯', ' sharp')}`)
    const aspect = b.sally === 'b' ? [230, 115] : [253, 127]
    btn.innerHTML =
      `<span class="rope__pull"><img src="${import.meta.env.BASE_URL}img/sally-${b.sally}.webp" srcset="${import.meta.env.BASE_URL}img/sally-${b.sally}-s.webp ${aspect[1]}w, ${import.meta.env.BASE_URL}img/sally-${b.sally}.webp ${aspect[0]}w" sizes="64px" width="${aspect[0]}" height="1800" alt="" loading="lazy" decoding="async"></span>` +
      `<span class="rope__tag"><b>${b.n}</b>${b.name}</span>`
    ropesEl.append(btn)
    return btn
  })
  const pulls = ropes.map((r) => $('.rope__pull', r))

  function ring(i, { when = 0, gain = 0.36, user = false } = {}) {
    const b = BELLS[i]
    audio.strike(b.f, { size: 2.9 + i * 0.25, gain, when, pan: (i - 2.5) / 4.2 })
    if (user) nudgeSound()
    const go = () => {
      const r = ropes[i]
      r.classList.add('is-hit')
      setTimeout(() => r.classList.remove('is-hit'), 190)
      if (env.reduce) return
      const h = pulls[i].offsetHeight
      gsap.killTweensOf(pulls[i])
      gsap
        .timeline()
        .to(pulls[i], { y: h * 0.055, duration: 0.13, ease: 'power2.out' })
        .to(pulls[i], { y: 0, duration: 1.1, ease: 'elastic.out(1, 0.42)' })
    }
    const delay = when && audio.on ? Math.max(0, (when - audio.now()) * 1000) : 0
    delay > 8 ? setTimeout(go, delay) : go()
  }
  ropes.forEach((r, i) => r.addEventListener('click', () => ring(i, { gain: 0.5, user: true })))
  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return
    const i = '123456'.indexOf(e.key)
    if (i < 0) return
    const r = ropesEl.getBoundingClientRect()
    if (r.bottom < -400 || r.top > window.innerHeight + 900) return // only while the ring is near
    ring(i, { gain: 0.5, user: true })
  })

  if (!env.reduce) {
    gsap.from(pulls, {
      yPercent: -70,
      duration: 1.9,
      ease: 'elastic.out(1, 0.6)',
      stagger: 0.08,
      scrollTrigger: { trigger: ropesEl, start: 'top 82%', once: true },
    })
    gsap.from('.rope__tag', { autoAlpha: 0, y: 10, duration: 0.8, stagger: 0.06, delay: 0.5, scrollTrigger: { trigger: ropesEl, start: 'top 82%', once: true } })
  }

  // ---------------------------------------------------------------- the sheet
  const sheet = $('#methodSheet')
  const W = CW * 6 + PAD * 2
  const H = RH * 13
  const cells = ROWS.map(() => []) // cells[row] = list of <text> per position (a shared row has two sets)
  const nows = []
  const clips = []
  const X = (pos) => PAD + (pos + 0.5) * CW
  const Y = (r) => (r + 0.5) * RH

  for (let l = 0; l < 5; l++) {
    const wrap = document.createElement('div')
    wrap.className = 'lead'
    wrap.innerHTML = `<span class="lead__no">Lead ${l + 1}</span>`
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' })
    const now = el('rect', { class: 'l-now', x: 0, y: 0, width: W, height: RH, rx: 3 })
    svg.append(now)
    nows.push(now)
    svg.append(el('line', { class: 'l-rule', x1: 0, x2: W, y1: H - RH, y2: H - RH }))

    const defs = el('defs')
    const clip = el('clipPath', { id: `lead-clip-${l}` })
    const rect = el('rect', { x: -4, y: 0, width: W + 8, height: H })
    clip.append(rect)
    defs.append(clip)
    svg.append(defs)
    clips.push(rect)

    const lines = el('g', { 'clip-path': `url(#lead-clip-${l})` })
    for (const [bell, cls] of [[1, 'l-treble'], [2, 'l-work']]) {
      const pts = []
      for (let r = 0; r <= 12; r++) pts.push(`${X(ROWS[l * 12 + r].indexOf(bell))},${Y(r)}`)
      lines.append(el('polyline', { class: cls, points: pts.join(' ') }))
    }
    svg.append(lines)

    const digits = el('g', { class: 'l-digits' })
    for (let r = 0; r <= 12; r++) {
      const row = ROWS[l * 12 + r]
      const set = row.map((bell, pos) => {
        const t = el('text', { x: X(pos), y: Y(r), class: bell === 1 ? 't1' : bell === 2 ? 't2' : '' })
        t.textContent = bell
        digits.append(t)
        return t
      })
      cells[l * 12 + r].push(set)
    }
    svg.append(digits)
    wrap.append(svg)
    sheet.append(wrap)
  }

  if (!env.reduce) {
    const st = { trigger: sheet, start: 'top 78%', once: true }
    gsap.from('.lead', { y: 40, autoAlpha: 0, duration: 1.2, stagger: 0.1, scrollTrigger: st })
    // the line is drawn by opening a clip, lead after lead, so it reads as one continuous stroke
    gsap.fromTo(clips, { scaleY: 0 }, { scaleY: 1, transformOrigin: '0 0', duration: 1.5, ease: 'power2.inOut', stagger: 0.42, delay: 0.3, scrollTrigger: st })
  }

  // ---------------------------------------------------------------- the sequencer
  const playBtn = $('#methodPlay')
  const rowOut = $('#methodRow')
  const GAP = 0.2 // seconds between blows
  let playing = false
  let timer = 0
  let seq = [] // {t, row, pos, bell}
  let cursor = 0
  let t0 = 0 // performance.now() origin (ms)

  function build() {
    seq = []
    let t = 0.25
    ROWS.forEach((row, r) => {
      if (r > 0 && r % 2 === 0) t += GAP // the handstroke gap: a breath before every other row
      row.forEach((bell, pos) => {
        seq.push({ t, row: r, pos, bell })
        t += GAP
      })
    })
  }
  build()

  const leads = [...sheet.children]
  let shownLead = -1
  function markRow(r) {
    // on a phone the sheet is a strip: keep the lead being rung in view
    const lead = Math.min(4, Math.floor(Math.max(0, r - 1) / 12))
    if (lead !== shownLead && sheet.scrollWidth > sheet.clientWidth + 4) {
      shownLead = lead
      sheet.scrollTo({ left: leads[lead].offsetLeft - sheet.offsetLeft - 20, behavior: env.reduce ? 'auto' : 'smooth' })
    }
    rowOut.textContent = `${String(Math.min(r, 60)).padStart(2, '0')} / 60`
    nows.forEach((n, l) => {
      const local = r - l * 12
      const on = local >= 0 && local <= 12
      n.style.opacity = on ? 1 : 0
      if (on) n.setAttribute('y', local * RH)
    })
  }
  function blow(s) {
    if (s.pos === 0) markRow(s.row)
    cells[s.row].forEach((set) => {
      const t = set[s.pos]
      t.classList.add('is-hit')
      setTimeout(() => t.classList.remove('is-hit'), 240)
    })
  }
  function pump() {
    if (!playing) return
    const now = (performance.now() - t0) / 1000
    while (cursor < seq.length && seq[cursor].t < now + 0.14) {
      const s = seq[cursor++]
      const wait = Math.max(0, (s.t - now) * 1000)
      ring(s.bell - 1, { when: audio.on ? audio.now() + wait / 1000 : 0, gain: s.bell === 6 ? 0.4 : 0.33 })
      setTimeout(() => playing && blow(s), wait)
    }
    if (cursor >= seq.length) return setTimeout(() => stop(true), 900)
    timer = setTimeout(pump, 40)
  }
  function start() {
    playing = true
    shownLead = -1
    cursor = 0
    t0 = performance.now()
    playBtn.setAttribute('aria-pressed', 'true')
    playBtn.querySelector('span').textContent = 'Stand!'
    nudgeSound()
    pump()
  }
  function stop(finished) {
    playing = false
    clearTimeout(timer)
    playBtn.setAttribute('aria-pressed', 'false')
    playBtn.querySelector('span').textContent = finished ? 'Ring it again' : 'Ring it'
    nows.forEach((n) => (n.style.opacity = 0))
    if (finished) rowOut.textContent = '60 / 60 · rounds'
  }
  playBtn.addEventListener('click', () => (playing ? stop(false) : start()))
  // ringers stand when nobody is listening
  ScrollTrigger.create({ trigger: '#ring', start: 'top bottom', end: 'bottom top', onLeave: () => playing && stop(false), onLeaveBack: () => playing && stop(false) })

  // ---------------------------------------------------------------- the wheel turns with the page
  if (!env.reduce)
    gsap.fromTo('#wheel', { rotation: -70 }, { rotation: 250, ease: 'none', scrollTrigger: { trigger: '.tower', start: 'top bottom', end: 'bottom top', scrub: 0.8 } })
}
