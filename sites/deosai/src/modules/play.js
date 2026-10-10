// The things you can play with: the loupe over the small flowers, the fish that scatter, the marmot lookouts.
import { gsap, $, $$, clamp, rand, still, fine } from './core.js'

const inView = (el, cb, margin = '100px') => {
  const io = new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), { rootMargin: margin })
  io.observe(el)
}

// ---------------------------------------------------------------- loupe
// The bed holds the tiny flowers at their true relative size. The lens is a round window holding a second,
// enlarged copy of the bed that is slid the opposite way, so it always magnifies what is under it.
export function initLoupe() {
  const bed = $('.small__bed')
  if (!bed) return
  const lens = $('.small__lens')
  const inner = $('.small__lens-in')
  const copy = $('.small__field', bed).cloneNode(true)
  copy.setAttribute('aria-hidden', 'true')
  $$('button, a', copy).forEach((b) => b.setAttribute('tabindex', '-1'))
  inner.appendChild(copy)
  const Z = 3.2
  let b = bed.getBoundingClientRect()
  const pos = { x: b.width * 0.5, y: b.height * 0.5 }
  const cur = { x: pos.x, y: pos.y }
  const place = () => {
    lens.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`
    copy.style.transform = `translate3d(${-cur.x * Z}px,${-cur.y * Z}px,0) scale(${Z})`
  }
  const measure = () => { b = bed.getBoundingClientRect(); copy.style.width = `${b.width}px`; copy.style.height = `${b.height}px` }
  measure()
  place()
  new ResizeObserver(measure).observe(bed)
  const move = (e) => {
    b = bed.getBoundingClientRect()
    pos.x = clamp(e.clientX - b.left, 0, b.width)
    pos.y = clamp(e.clientY - b.top, 0, b.height)
    bed.classList.add('is-live')
  }
  bed.addEventListener('pointermove', move)
  bed.addEventListener('pointerdown', move)
  let on = false
  inView(bed, (v) => (on = v))
  gsap.ticker.add(() => {
    if (!on) return
    if (!bed.classList.contains('is-live') && !still) {
      // before anyone touches it, the lens wanders over the bed on its own
      const t = performance.now() / 1000
      pos.x = b.width * (0.5 + 0.34 * Math.sin(t * 0.42))
      pos.y = b.height * (0.5 + 0.26 * Math.sin(t * 0.63 + 1))
    }
    cur.x += (pos.x - cur.x) * 0.16
    cur.y += (pos.y - cur.y) * 0.16
    place()
  })
  // a press through the lens opens whichever flower is under its centre
  bed.addEventListener('click', (e) => {
    if (e.target.closest('[data-species]')) return
    lens.style.visibility = 'hidden'
    const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-species]')
    lens.style.visibility = ''
    hit?.click()
  })
}

// ---------------------------------------------------------------- fish
export function initPond() {
  const pond = $('.pond')
  if (!pond) return
  const fish = $$('.pond__fish', pond).map((el, i) => {
    const depth = Number(el.dataset.depth || 1)
    return { el, depth, x: rand(0.05, 0.95), y: rand(0.16, 0.8), vx: (i % 2 ? 1 : -1) * rand(0.0006, 0.0014) * depth, vy: 0, lane: rand(0.18, 0.8), ph: rand(0, 6), w: 0, turn: 1, face: 1 }
  })
  let b = pond.getBoundingClientRect()
  const ptr = { x: -9, y: -9, live: false }
  const measure = () => { b = pond.getBoundingClientRect(); fish.forEach((f) => (f.w = f.el.offsetWidth)) }
  new ResizeObserver(measure).observe(pond)
  pond.addEventListener('pointermove', (e) => { b = pond.getBoundingClientRect(); ptr.x = (e.clientX - b.left) / b.width; ptr.y = (e.clientY - b.top) / b.height; ptr.live = true })
  pond.addEventListener('pointerleave', () => (ptr.live = false))
  pond.addEventListener('pointerdown', (e) => {
    // a tap sends a shock through the shoal
    b = pond.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height
    fish.forEach((f) => {
      const dx = f.x - px, dy = (f.y - py) * (b.height / b.width)
      const d = Math.hypot(dx, dy) + 0.02
      if (d < 0.36) { f.vx += (dx / d) * 0.012; f.vy += (dy / d) * 0.008 }
    })
  })
  let on = false
  inView(pond, (v) => { on = v; if (v) measure() })
  if (still) {
    measure()
    fish.forEach((f) => (f.el.style.transform = `translate3d(${f.x * b.width - f.w / 2}px,${f.y * b.height}px,0)`))
    return
  }
  gsap.ticker.add((time, dt) => {
    if (!on || !b.width) return
    const k = Math.min(dt, 40) / 16.67
    const asp = b.height / b.width
    fish.forEach((f) => {
      const cruise = 0.0011 * f.depth
      if (ptr.live) {
        const dx = f.x - ptr.x, dy = (f.y - ptr.y) * asp
        const d = Math.hypot(dx, dy) + 0.001
        const r = 0.16
        if (d < r) { const push = ((r - d) / r) * 0.0016 * k; f.vx += (dx / d) * push; f.vy += (dy / d) * push }
      }
      // settle back to a cruising speed and the fish's own lane
      const sp = Math.abs(f.vx)
      f.vx += (Math.sign(f.vx || 1) * cruise - f.vx) * 0.02 * k * (sp > cruise ? 1 : 0.5)
      f.vy += ((f.lane - f.y) * 0.0009 - f.vy * 0.045) * k
      f.x += f.vx * k
      f.y = clamp(f.y + f.vy * k, 0.06, 0.9)
      const m = (f.w / b.width) * 0.7
      if (f.x > 1 + m) f.x = -m
      if (f.x < -m) f.x = 1 + m
      f.face += ((f.vx < 0 ? 1 : -1) - f.face) * 0.14 * k // artwork faces left
      const wig = Math.sin(time * (5 + sp * 2200) + f.ph) * (2.2 + sp * 1400)
      const pitch = clamp((f.vy / (Math.abs(f.vx) + 0.0006)) * 28, -24, 24) * (f.vx < 0 ? -1 : 1)
      f.el.style.transform = `translate3d(${(f.x * b.width - f.w / 2).toFixed(1)}px,${(f.y * b.height).toFixed(1)}px,0) scaleX(${f.face.toFixed(3)}) rotate(${(pitch + wig).toFixed(2)}deg)`
    })
  })
}

// ---------------------------------------------------------------- marmots
export function initMarmots() {
  const field = $('.lookout')
  if (!field) return
  const holes = $$('.lookout__hole', field)
  const out = $('.lookout__n', field)
  const msg = $('.lookout__msg', field)
  let n = 0
  let on = false
  const lines = ['Whistle! Everyone below ground.', 'Spotted. It was watching you first.', 'Gone. Try the next mound.', 'Alarm raised across the colony.', 'That one will be back in a minute.']
  const up = (h, t = rand(1.5, 2.6)) => {
    if (h._up || h._cool) return
    h._up = true
    h.classList.add('is-up')
    gsap.to(h._m, { yPercent: 0, duration: 0.5, ease: 'back.out(1.6)' })
    h._timer = gsap.delayedCall(t, () => down(h))
  }
  const down = (h, fast) => {
    if (!h._up) return
    h._up = false
    h._timer?.kill()
    h.classList.remove('is-up')
    gsap.to(h._m, { yPercent: 108, duration: fast ? 0.16 : 0.45, ease: fast ? 'power2.in' : 'power3.in' })
  }
  holes.forEach((h) => {
    h._m = $('.lookout__marmot', h)
    gsap.set(h._m, { yPercent: 108 })
    h.addEventListener('click', () => {
      if (!h._up) { h._cool = false; return up(h, 1.2) }
      n++
      out.textContent = String(n).padStart(2, '0')
      msg.textContent = lines[(n - 1) % lines.length]
      gsap.fromTo($('.lookout__burst', h), { scale: 0.2, opacity: 1, rotation: rand(-20, 20) }, { scale: 1.25, opacity: 0, duration: 0.7, ease: 'expo.out' })
      gsap.fromTo(out, { scale: 1.5 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)' })
      // the whistle sends every lookout down at once
      holes.forEach((o) => down(o, true))
      h._cool = true
      gsap.delayedCall(1.4, () => (h._cool = false))
    })
  })
  if (still) { holes.forEach((h, i) => i % 2 === 0 && gsap.set(h._m, { yPercent: 0 })); return }
  const loop = () => {
    if (on) {
      const free = holes.filter((h) => !h._up && !h._cool)
      if (free.length && holes.filter((h) => h._up).length < 3) up(free[(Math.random() * free.length) | 0])
    }
    gsap.delayedCall(rand(0.5, 1.3), loop)
  }
  loop()
  inView(field, (v) => { on = v; if (!v) holes.forEach((h) => down(h)) }, '0px')
}

// ---------------------------------------------------------------- tilt: paper cards lean under the pointer
export function initTilt() {
  if (!fine || still) return
  $$('[data-tilt]').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' })
    gsap.set(el, { transformPerspective: 900 })
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect()
      ry(((e.clientX - b.left) / b.width - 0.5) * 14)
      rx(-((e.clientY - b.top) / b.height - 0.5) * 12)
    })
    el.addEventListener('pointerleave', () => { rx(0); ry(0) })
  })
}
