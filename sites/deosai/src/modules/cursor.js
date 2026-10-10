// The cursor is a paper butterfly. A small dot sits exactly on the pointer; the butterfly chases it on a
// spring, banks into its turns, flaps faster the faster it flies, and lands with open wings on anything
// that can be pressed. Mouse users only.
import gsap from 'gsap'

const WING =
  'M-1.200 -1.500C-5.500 -15.500 -19 -21.500 -23.500 -13.500C-26.500 -8 -22 -1 -12.500 .5C-8.500 1.100 -4.500 .9 -1.200 .2C-9.500 2.200 -17.500 7.500 -15.500 14.500C-13.800 20.200 -6.500 19.500 -3.300 12.500C-1.900 9.300 -1.300 5.300 -1.200 1.500Z'
const SPOTS =
  '<circle cx="-16.500" cy="-10.500" r="2.900"/><circle cx="-9.300" cy="-7.300" r="1.700"/><circle cx="-10.300" cy="11.500" r="2.300"/>'

export function initCursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine) return { refresh() {} }

  const el = document.createElement('div')
  el.className = 'cursor'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = `
    <div class="cursor__ring"><div class="cursor__disc"></div><span class="cursor__label mono"></span></div>
    <div class="cursor__fly"><div class="cursor__tilt">
      <svg viewBox="-28 -26 56 52" width="56" height="52">
        <g class="wing wing--l"><path d="${WING}"/><g class="spots">${SPOTS}</g></g>
        <g class="wing wing--r"><g transform="scale(-1 1)"><path d="${WING}"/><g class="spots">${SPOTS}</g></g></g>
        <path class="body" d="M0-9.500c1.300 0 1.900 2.300 1.900 7.800S1.300 12.500 0 12.500s-1.900-8.700-1.900-14.200S-1.300-9.500 0-9.500zM-.6-9.300C-1.500-13-3.300-15.300-6-16.300M.6-9.300C1.500-13 3.300-15.300 6-16.300"/>
      </svg>
    </div></div>
    <div class="cursor__dot"></div>`
  document.body.appendChild(el)
  document.documentElement.classList.add('has-cursor')

  const dot = el.querySelector('.cursor__dot')
  const fly = el.querySelector('.cursor__fly')
  const tilt = el.querySelector('.cursor__tilt')
  const ring = el.querySelector('.cursor__ring')
  const label = el.querySelector('.cursor__label')

  const p = { x: innerWidth / 2, y: innerHeight / 2 } // pointer
  const f = { x: p.x, y: p.y, vx: 0, vy: 0, rot: 0 } // butterfly
  const r = { x: p.x, y: p.y } // ring
  let shown = false
  let landed = false
  let t = 0

  const show = () => {
    if (shown) return
    shown = true
    f.x = r.x = p.x
    f.y = r.y = p.y
    el.classList.add('is-on')
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return
      p.x = e.clientX
      p.y = e.clientY
      show()
    },
    { passive: true },
  )
  document.addEventListener('pointerleave', () => { shown = false; el.classList.remove('is-on') })
  window.addEventListener('pointerdown', () => el.classList.add('is-down'))
  window.addEventListener('pointerup', () => el.classList.remove('is-down'))

  // what is under the pointer decides the state
  const SEL = 'a, button, [role="button"], input, summary, [data-cursor]'
  let current = null
  const read = (target) => {
    const hit = target?.closest?.(SEL) || null
    if (hit === current) return
    current = hit
    const text = hit?.closest('[data-cursor]')?.dataset.cursor || ''
    landed = !!hit
    el.classList.toggle('is-landed', landed)
    el.classList.toggle('has-label', !!text && text !== 'none')
    el.classList.toggle('is-hidden', text === 'none')
    if (text && text !== 'none') label.textContent = text
  }
  document.addEventListener('pointerover', (e) => read(e.target), { passive: true })

  // the skin follows the world under the pointer
  let world = ''
  const skin = () => {
    const w = document.elementFromPoint(p.x, p.y)?.closest('[data-world]')
    const name = w?.dataset.world || 'snow'
    if (name !== world) el.dataset.world = world = name
  }

  gsap.ticker.add((time, dt) => {
    if (!shown) return
    const k = Math.min(dt, 40) / 16.67
    t += dt
    dot.style.transform = `translate3d(${p.x}px,${p.y}px,0)`

    // ring: quick, critically damped
    r.x += (p.x - r.x) * (1 - Math.pow(0.72, k))
    r.y += (p.y - r.y) * (1 - Math.pow(0.72, k))
    ring.style.transform = `translate3d(${r.x}px,${r.y}px,0)`

    // butterfly: a soft spring toward a point just above-right of the pointer, plus a wander
    const wob = still ? 0 : 1
    const tx = p.x + (landed ? 20 : 22) + Math.sin(t / 310) * 7 * wob
    const ty = p.y - (landed ? 22 : 20) + Math.cos(t / 240) * 6 * wob
    f.vx += (tx - f.x) * 0.045 * k
    f.vy += (ty - f.y) * 0.045 * k
    f.vx *= Math.pow(0.8, k)
    f.vy *= Math.pow(0.8, k)
    f.x += f.vx * k
    f.y += f.vy * k
    const speed = Math.hypot(f.vx, f.vy)
    const aim = speed > 0.6 ? (Math.atan2(f.vy, f.vx) * 180) / Math.PI + 90 : landed ? 18 : f.rot * 0.96
    let d = aim - f.rot
    d = ((d + 540) % 360) - 180
    f.rot += d * 0.12 * k
    fly.style.transform = `translate3d(${f.x}px,${f.y}px,0)`
    tilt.style.transform = `rotate(${f.rot.toFixed(2)}deg) scale(${landed ? 0.82 : 1})`
    el.classList.toggle('is-fast', speed > 2.2)
    if ((t | 0) % 6 === 0) skin()
  })

  // buttons marked data-magnet lean toward the pointer
  const magnets = new WeakSet()
  function refresh() {
    document.querySelectorAll('[data-magnet]').forEach((m) => {
      if (magnets.has(m) || still) return
      magnets.add(m)
      const qx = gsap.quickTo(m, 'x', { duration: 0.7, ease: 'elastic.out(1,0.5)' })
      const qy = gsap.quickTo(m, 'y', { duration: 0.7, ease: 'elastic.out(1,0.5)' })
      m.addEventListener('pointermove', (e) => {
        const b = m.getBoundingClientRect()
        qx((e.clientX - (b.left + b.width / 2)) * 0.28)
        qy((e.clientY - (b.top + b.height / 2)) * 0.36)
      })
      m.addEventListener('pointerleave', () => { qx(0); qy(0) })
    })
  }
  refresh()
  return { refresh }
}
