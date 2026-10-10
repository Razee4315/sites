// The ring of six, and change ringing. Methods are written in place notation, the way ringers
// write them: "x" means every pair of neighbours swaps, "16" means the bells in 1st and 6th place
// stay where they are and the rest swap. The rows, the blue line and the playback all come from that.

import gsap from 'gsap'
import meta from '../img-meta.json'
import { Hang } from './pendulum.js'
import { audio } from './audio.js'

// treble → tenor, a major scale in F♯ (the tenor is No. 4,117's little sister)
const BELLS = [
  ['D♯', 622.25, 0.6],
  ['C♯', 554.37, 0.67],
  ['B', 493.88, 0.75],
  ['A♯', 466.16, 0.83],
  ['G♯', 415.3, 0.91],
  ['F♯', 369.99, 1],
]

const METHODS = {
  hunt: {
    name: 'Plain Hunt',
    pn: 'x.16',
    working: 6,
    blue: 2,
    about: 'Each bell weaves from the front to the back and home again. Twelve changes, then rounds. The first thing every ringer learns.',
  },
  bob: {
    name: 'Plain Bob Minor',
    pn: 'x.16.x.16.x.16.x.16.x.16.x.12',
    working: 6,
    blue: 2,
    about: 'Plain hunting, with a dodge at the end of every lead so the bells do not come home too soon. Sixty changes, no row rung twice.',
  },
  grandsire: {
    name: 'Grandsire Doubles',
    pn: '3.1.5.1.5.1.5.1.5.1',
    working: 5,
    blue: 3,
    about: 'Five bells weave while the tenor tolls behind in sixth place and keeps the time. Thirty changes. Written down in 1650 and rung every Sunday since.',
  },
  rounds: {
    name: 'Rounds',
    pn: '',
    working: 6,
    blue: 2,
    about: 'Treble to tenor, straight down the scale, over and over. Where every band starts and where every method ends.',
  },
}

function change(row, places, working) {
  const next = row.slice()
  const stay = places === 'x' ? [] : [...places].map(Number)
  let i = 0
  while (i < working) {
    if (stay.includes(i + 1) || i === working - 1) i += 1
    else {
      next[i] = row[i + 1]
      next[i + 1] = row[i]
      i += 2
    }
  }
  return next
}

function rowsFor(key) {
  const m = METHODS[key]
  const rounds = [1, 2, 3, 4, 5, 6]
  const rows = [{ r: rounds }, { r: rounds }]
  if (!m.pn) {
    for (let i = 0; i < 6; i++) rows.push({ r: rounds })
    return rows
  }
  const pn = m.pn.split('.')
  let row = rounds
  for (let guard = 0; guard < 40; guard++) {
    pn.forEach((p, i) => {
      row = change(row, p, m.working)
      rows.push({ r: row, lead: pn.length > 2 && i === pn.length - 1 })
    })
    if (row.join('') === '123456') break
  }
  rows.push({ r: rounds })
  return rows
}

export function initRing({ reduced, onNeedSound }) {
  const wrap = document.getElementById('tower-bells')
  const scroll = document.getElementById('blue-scroll')
  const blue = document.getElementById('blue')
  const about = document.getElementById('method-about')
  const count = document.getElementById('ring-count')
  const play = document.getElementById('ring-play')
  const methods = [...document.querySelectorAll('#methods button')]
  if (!wrap) return

  // ── six bells ──
  const img = (id, cls) => `<img class="${cls}" src="${import.meta.env.BASE_URL}img/${id}.webp" width="${meta[id]?.w || 100}" height="${meta[id]?.h || 100}" alt="" loading="lazy" />`
  wrap.innerHTML = BELLS.map(
    ([note, freq, s], i) => `
    <div class="tower__bell" style="--s:${s}">
      <div class="hang" data-bell data-freq="${freq}" data-size="${(s * 0.8).toFixed(2)}" data-cursor="Ring" tabindex="0" role="button" aria-label="Ring bell ${i + 1}, ${note.replace('♯', ' sharp')}">
        <div class="hang__swing"><div class="hang__clapper">${img('clapper', '')}</div>${img('bell-3', 'hang__bell')}${img('headstock', 'hang__stock')}</div>
        <i class="hang__ring"></i><i class="hang__ring"></i>
      </div>
      <p class="tower__num label"><b>${i + 1}</b>${note}</p>
    </div>`,
  ).join('')

  const cells = [...wrap.children]
  const hangs = cells.map((c) => new Hang(c.querySelector('.hang'), { collide: false, calm: reduced }))
  let flip = 1

  function ring(i, power = 0.8, dir) {
    const h = hangs[i]
    if (!h) return
    h.strike(dir ?? (flip = -flip), power)
    audio.strike(h.freq, 0.5 + power * 0.4, { ring: 0.36, lite: true })
    const c = cells[i]
    c.classList.add('is-hit')
    clearTimeout(c._t)
    c._t = setTimeout(() => c.classList.remove('is-hit'), 140)
  }

  cells.forEach((c, i) => {
    const el = c.querySelector('.hang')
    el.addEventListener('click', (e) => {
      const r = el.getBoundingClientRect()
      ring(i, 1, e.clientX && e.clientX > r.left + r.width / 2 ? -1 : 1)
    })
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        ring(i, 1)
      }
    })
  })

  // ── the blue line ──
  let key = 'hunt'
  let rows = []
  let rowEls = []
  let rh = 30

  function draw() {
    const m = METHODS[key]
    rows = rowsFor(key)
    about.textContent = m.about
    scroll.innerHTML =
      rows
        .map(
          ({ r, lead }) =>
            `<div class="blue__row${lead ? ' is-lead' : ''}">${r.map((b) => `<span class="${b === 1 ? 't' : b === m.blue ? 'b' : ''}">${b}</span>`).join('')}</div>`,
        )
        .join('') + '<svg class="blue__lines"><polyline class="lt"/><polyline class="lb"/></svg>'
    rowEls = [...scroll.querySelectorAll('.blue__row')]
    rh = rowEls[0].offsetHeight || 30
    const cw = rowEls[0].offsetWidth / 6
    const path = (bell) => rows.map(({ r }, i) => `${(r.indexOf(bell) + 0.5) * cw},${(i + 0.5) * rh}`).join(' ')
    const svg = scroll.querySelector('svg')
    svg.setAttribute('width', cw * 6)
    svg.setAttribute('height', rows.length * rh)
    svg.querySelector('.lt').setAttribute('points', path(1))
    svg.querySelector('.lb').setAttribute('points', path(m.blue))
    show(0, true)
  }

  let shown = -1
  function show(i, jump) {
    if (rowEls[shown]) rowEls[shown].classList.remove('is-now')
    shown = i
    rowEls[i]?.classList.add('is-now')
    gsap.to(scroll, { y: -i * rh, duration: jump || reduced ? 0 : 0.5, ease: 'power3.out', overwrite: true })
    count.textContent = `Row ${Math.min(rows.length - 3, Math.max(0, i - 1))} of ${rows.length - 3}`
  }

  // ── playback ──
  const BEAT = 0.235
  let playing = false
  let ri = 0
  let pi = 0
  let due = 0

  function tick() {
    const now = performance.now() / 1000
    let guard = 0
    while (playing && now >= due && guard++ < 4) {
      if (pi === 0) show(ri)
      const bell = rows[ri].r[pi]
      // handstroke and backstroke swing the bell opposite ways
      ring(bell - 1, 0.62, ri % 2 ? 1 : -1)
      pi++
      due += BEAT
      if (pi === 6) {
        pi = 0
        ri++
        if (ri % 2 === 0) due += BEAT // the handstroke gap: one beat of silence every other row
        if (ri >= rows.length) return stop(true)
      }
    }
  }

  function start() {
    if (playing) return
    playing = true
    ri = 0
    pi = 0
    due = performance.now() / 1000 + 0.25
    play.querySelector('span').textContent = 'Stand'
    play.setAttribute('aria-pressed', 'true')
    gsap.ticker.add(tick)
  }

  function stop(finished) {
    if (!playing) return
    playing = false
    gsap.ticker.remove(tick)
    play.querySelector('span').textContent = finished ? 'Ring it again' : 'Ring it'
    play.setAttribute('aria-pressed', 'false')
    if (finished) count.textContent = 'That’s all. Stand.'
  }

  play.addEventListener('click', async () => {
    if (playing) return stop()
    if (!audio.on) await onNeedSound()
    start()
  })

  methods.forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.method === key) return
      stop()
      key = b.dataset.method
      methods.forEach((x) => x.setAttribute('aria-checked', String(x === b)))
      gsap.fromTo([about, blue], { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' })
      draw()
    }),
  )
  // arrow keys move between methods, as a radio group should
  document.getElementById('methods').addEventListener('keydown', (e) => {
    const i = methods.indexOf(document.activeElement)
    if (i < 0) return
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = methods[(i + d + methods.length) % methods.length]
    n.focus()
    n.click()
  })

  // 1–6 on the keyboard, while the tower is on screen
  let near = false
  const tower = document.getElementById('tower')
  new IntersectionObserver(([e]) => {
    near = e.isIntersecting
    if (!near) stop()
  }).observe(tower)
  window.addEventListener('keydown', (e) => {
    if (!near || e.metaKey || e.ctrlKey || e.altKey) return
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return
    const n = Number(e.key)
    if (n >= 1 && n <= 6) ring(n - 1, 1)
  })

  draw()
  let rt
  window.addEventListener('resize', () => {
    clearTimeout(rt)
    rt = setTimeout(() => {
      const keep = shown
      draw()
      show(Math.max(0, keep), true)
    }, 200)
  })

  return { ring, stop }
}
