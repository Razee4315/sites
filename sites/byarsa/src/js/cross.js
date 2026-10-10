import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, clamp, reduce } from './util.js'

// km from Skardu, metres above sea level (approximate, read off the map)
const PROFILE = [
  [0, 2228], [4, 2330], [9, 2636], [13, 2830], [19, 3180], [25, 3610], [31, 3960], [35, 4080], [40, 4000], [47, 3960],
  [55, 3990], [62, 4030], [70, 4060], [78, 4105], [86, 4142], [90, 4040], [96, 3760], [104, 3420], [114, 3180], [124, 2980],
  [136, 2760], [148, 2620], [160, 2546],
]
const STOPS = [
  { km: 0, m: 2228, name: 'Skardu', low: true },
  { km: 9, m: 2636, name: 'Sadpara Lake', low: true, right: true },
  { km: 35, m: 4080, name: 'Ali Malik Mar' },
  { km: 55, m: 3990, name: 'Bara Pani', low: true },
  { km: 70, m: 4060, name: 'Kala Pani' },
  { km: 86, m: 4142, name: 'Sheosar', low: true },
  { km: 104, m: 3420, name: 'Chilim', right: true },
  { km: 160, m: 2546, name: 'Astore' },
]
const W = 1600
const H = 520
const KM = 160
const LO = 1900
const HI = 4700
const px = (km) => (km / KM) * W
const py = (m) => H - ((m - LO) / (HI - LO)) * H

// Catmull-Rom through the points, written as cubic béziers
function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const t = 0.18
    d += ` C${(p1[0] + (p2[0] - p0[0]) * t).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) * t).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) * t).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) * t).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

export function route() {
  const svg = $('.route__svg')
  const plot = $('.route__plot')
  const list = $('.route__stops')
  const jeep = $('.route__jeep')
  const scroller = $('.route__scroll')
  const line = smooth(PROFILE.map(([k, m]) => [px(k), py(m)]))
  const grid = [2500, 3000, 3500, 4000, 4500]

  svg.innerHTML = `
    <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1c0d" stop-opacity=".2"/><stop offset="1" stop-color="#2a1c0d" stop-opacity="0"/></linearGradient></defs>
    ${grid.map((m) => `<line class="grid" x1="0" x2="${W}" y1="${py(m)}" y2="${py(m)}"/>`).join('')}
    <path class="area" d="${line} L${W},${H} L0,${H} Z"/>
    ${STOPS.map((s) => `<line class="drop" x1="${px(s.km)}" x2="${px(s.km)}" y1="${py(s.m)}" y2="${H}"/>`).join('')}
    <path class="line" d="${line}"/>
    <path class="line line--done" d="${line}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" style="stroke-width:4"/>`
  const path = $('.line', svg)
  const done = $('.line--done', svg)
  const total = path.getTotalLength()

  list.innerHTML =
    STOPS.map((s) => `<li class="${s.low ? 'is-low' : ''} ${s.right ? 'is-right' : ''}" style="--sx:${s.km / KM};--sy:${py(s.m) / H}"><b>${s.name}</b>${s.m.toLocaleString('en-US')} m · km ${s.km}</li>`).join('') +
    grid.map((m) => `<li class="route__alt" style="--sy:${py(m) / H}">${m.toLocaleString('en-US')}</li>`).join('')
  const stops = $$('li:not(.route__alt)', list)

  // x on the path is monotonic, so km → length can be found by bisection
  const lengthAt = (x) => {
    let a = 0
    let b = total
    for (let i = 0; i < 18; i++) {
      const mid = (a + b) / 2
      if (path.getPointAtLength(mid).x < x) a = mid
      else b = mid
    }
    return (a + b) / 2
  }

  const place = (p) => {
    const w = plot.clientWidth
    const h = plot.clientHeight
    const len = lengthAt(p * W)
    const a = path.getPointAtLength(len)
    const b = path.getPointAtLength(Math.min(total, len + 6))
    const c = path.getPointAtLength(Math.max(0, len - 6))
    const ang = (Math.atan2(((b.y - c.y) / H) * h, ((b.x - c.x) / W) * w) * 180) / Math.PI
    jeep.style.transform = `translate3d(${(a.x / W) * w}px, ${(a.y / H) * h}px, 0) rotate(${ang.toFixed(2)}deg)`
    done.style.strokeDashoffset = String(1 - len / total)
    const km = p * KM
    stops.forEach((li, i) => li.classList.toggle('is-passed', km >= STOPS[i].km - 0.5))
    if (scroller.scrollWidth > scroller.clientWidth + 4) scroller.scrollLeft = clamp(p * 1.15 - 0.075) * (scroller.scrollWidth - scroller.clientWidth)
  }

  let prog = reduce ? 0.54 : 0
  place(prog)
  if (!reduce) {
    ScrollTrigger.create({
      trigger: plot,
      start: 'top 78%',
      end: 'bottom 30%',
      scrub: 0.7,
      animation: gsap.to({ p: 0 }, { p: 1, ease: 'none', onUpdate() { place((prog = this.targets()[0].p)) } }),
    })
  }
  ScrollTrigger.addEventListener('refresh', () => place(prog))
  window.addEventListener('resize', () => place(prog))
}
