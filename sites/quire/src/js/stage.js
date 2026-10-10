// The stage: scenes built from seven sheets of paper each, and the machinery that changes them.
import { gsap, img, loadImage, reduce, fine, tallMQ, $$ } from './util.js'

export const ORDER = ['back', 'far', 'flown', 'wing-l', 'wing-r', 'hero', 'front']
const DEPTH = { back: 0.1, far: 0.28, flown: 0.46, 'wing-l': 0.7, 'wing-r': 0.7, hero: 0.92, front: 1.3 }
const VARS = ['h', 'b', 'x', 'show', 'top', 'w', 'minw']

// One sheet. `.ly` is moved by the scene change, `.ly__p` by the pointer, `.ly__a` by the idle animation.
export function buildLayer(prod, kind, { full = false, fixed = false } = {}) {
  const id = `${prod.id}-${kind}`
  const m = img(id, { full })
  const cfg = prod.layers[kind] || {}
  const ly = document.createElement('div')
  ly.className = `ly ly--${kind}`
  ly.dataset.kind = kind
  ly.style.setProperty('--ar', m.ar.toFixed(4))
  place(ly, cfg, fixed)
  if (cfg.idle) ly.dataset.idle = cfg.idle
  if (m.shadow) {
    ly.style.setProperty('--spx', m.shadow.x.toFixed(4))
    ly.style.setProperty('--spy', m.shadow.y.toFixed(4))
  }
  ly.innerHTML =
    `<div class="ly__p"><div class="ly__a">` +
    (m.shadow ? `<img class="ly__sh" data-src="${m.shadow.src}" alt="" draggable="false">` : '') +
    `<img class="ly__img" data-src="${m.src}" width="${m.w}" height="${m.h}" alt="" draggable="false">` +
    `</div></div>`
  return ly
}

// A sheet's position is a handful of custom properties; `tall` holds the overrides for a portrait stage.
// (`fixed` is for scenes shown in a frame whose shape does not follow the screen's.)
function place(ly, cfg, fixed = false) {
  const v = tallMQ.matches && !fixed ? { ...cfg, ...cfg.tall } : cfg
  for (const k of VARS) v[k] != null ? ly.style.setProperty(`--${k}`, v[k]) : ly.style.removeProperty(`--${k}`)
}
export function placeScene(scene, prod) {
  for (const ly of $$('.ly', scene)) place(ly, prod.layers[ly.dataset.kind] || {})
}

export function buildScene(prod, opts) {
  const scene = document.createElement('div')
  scene.className = 'scene'
  scene.dataset.id = prod.id
  for (const kind of ORDER) scene.append(buildLayer(prod, kind, opts))
  return scene
}

// Fetch and decode a scene's sheets; resolves when it can be shown without popping in.
export function loadScene(scene, onStep) {
  if (scene._loading) return scene._loading
  const imgs = $$('img[data-src]', scene)
  let n = 0
  scene._loading = Promise.all(
    imgs.map((el) =>
      loadImage(el.dataset.src).then((src) => {
        el.src = src
        el.removeAttribute('data-src')
        onStep?.(++n, imgs.length)
      }),
    ),
  )
  return scene._loading
}

export class Stage {
  constructor({ root, scenesEl, productions }) {
    this.root = root
    this.el = scenesEl
    this.productions = productions
    this.scenes = productions.map((p, i) => buildScene(p, { full: i === 0 }))
    this.scenes.forEach((s) => this.el.append(s))
    this.current = -1
    this.target = -1
    this.busy = false
    this.tl = null
    this.pointer = { x: 0, y: 0, auto: true }
    this.movers = new Map()
    for (const scene of this.scenes) {
      this.movers.set(
        scene,
        $$('.ly', scene).map((ly) => {
          const p = ly.firstElementChild
          return { d: DEPTH[ly.dataset.kind], x: gsap.quickTo(p, 'x', { duration: 0.9, ease: 'power3.out' }), y: gsap.quickTo(p, 'y', { duration: 0.9, ease: 'power3.out' }) }
        }),
      )
    }
    if (!reduce) gsap.ticker.add((t) => this.tick(t))
    tallMQ.addEventListener('change', () => this.scenes.forEach((s, i) => placeScene(s, productions[i])))
  }

  layer(i, kind) {
    return this.scenes[i].querySelector(`.ly--${kind}`)
  }
  size() {
    return { w: this.el.offsetWidth, h: this.el.offsetHeight }
  }
  load(i, onStep) {
    return loadScene(this.scenes[i], onStep)
  }

  // ── parallax: the pointer shifts each sheet by its depth; with no pointer the stage drifts on its own
  point(nx, ny) {
    this.pointer.x = nx
    this.pointer.y = ny
    this.pointer.auto = false
  }
  tick(t) {
    const p = this.pointer
    const live = this.scenes.filter((s) => s.classList.contains('is-live'))
    if (!live.length) return
    let { x, y } = p
    if (p.auto || !fine) {
      x = Math.sin(t * 0.33) * 0.55
      y = Math.cos(t * 0.27) * 0.3
    }
    const amp = Math.max(10, this.el.offsetWidth * 0.017)
    for (const scene of live) for (const m of this.movers.get(scene)) {
      m.x(-x * amp * m.d)
      m.y(-y * amp * 0.5 * m.d)
    }
  }

  // ── where each sheet waits when it is off stage
  off(i, kind, exit = false) {
    const from = this.productions[i].layers.hero.from || 1
    switch (kind) {
      case 'back': return { yPercent: -104 }
      case 'far': return { yPercent: 150 }
      case 'front': return { yPercent: 125 }
      case 'wing-l': return { xPercent: -114 }
      case 'wing-r': return { xPercent: 114 }
      case 'flown': return { yPercent: -130 }
      case 'hero': return { x: (exit ? -from : from) * this.size().w * 1.05 }
    }
  }

  show(i) {
    this.scenes.forEach((s, k) => s.classList.toggle('is-live', k === i))
    this.current = this.target = i
  }

  // ── bring a scene on from nothing (the first one, behind the uncut sheet)
  enter(i) {
    const scene = this.scenes[i]
    scene.classList.add('is-live')
    this.current = this.target = i
    if (reduce) return gsap.timeline()
    const L = (k) => this.layer(i, k)
    const tl = gsap.timeline()
    tl.fromTo(L('far'), this.off(i, 'far'), { yPercent: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .fromTo(L('wing-l'), this.off(i, 'wing-l'), { xPercent: 0, duration: 1.4, ease: 'expo.out' }, 0.3)
      .fromTo(L('wing-r'), this.off(i, 'wing-r'), { xPercent: 0, duration: 1.4, ease: 'expo.out' }, 0.4)
      .fromTo(L('flown'), this.off(i, 'flown'), { yPercent: 0, duration: 1.6, ease: 'back.out(1.2)' }, 0.5)
      .fromTo(L('flown').firstElementChild, { rotation: 5 }, { rotation: 0, duration: 3, ease: 'elastic.out(1, 0.3)', transformOrigin: '50% -60%' }, 0.6)
      .fromTo(L('front'), this.off(i, 'front'), { yPercent: 0, duration: 1.2, ease: 'expo.out' }, 0.55)
      .fromTo(L('hero'), this.off(i, 'hero'), { x: 0, duration: 1.8, ease: 'power3.out' }, 0.7)
    return tl
  }

  // ── scene change: ask for a production; requests made mid-change are queued and hurried
  go(i) {
    if (this.current < 0 || i === this.target) return
    this.target = i
    if (this.busy) return this.tl?.timeScale(3)
    this.run()
  }

  run() {
    const from = this.current
    const to = this.target
    if (from === to) return
    this.busy = true
    this.load(to)
    const A = this.scenes[from]
    const B = this.scenes[to]
    this.onChange?.(from, to)

    const done = () => {
      A.classList.remove('is-live')
      gsap.set($$('.ly', A), { clearProps: 'transform' })
      this.current = to
      this.busy = false
      if (this.target !== to) this.run()
    }

    if (reduce) {
      B.classList.add('is-live')
      gsap.set(B, { zIndex: 2, opacity: 0 })
      gsap.set(A, { zIndex: 1 })
      this.tl = gsap.timeline({ onComplete: done }).to(B, { opacity: 1, duration: 0.5, ease: 'none' })
      return
    }

    const a = (k) => this.layer(from, k)
    const b = (k) => this.layer(to, k)
    gsap.set(A, { zIndex: 1 })
    gsap.set(B, { zIndex: 2 })
    const tl = (this.tl = gsap.timeline({ onComplete: done }))

    // strike: everything but the backcloth leaves the way it would in a real fly-tower
    tl.to(a('flown'), { ...this.off(from, 'flown'), duration: 0.65, ease: 'power2.in' }, 0)
      .to(a('hero'), { ...this.off(from, 'hero', true), duration: 0.75, ease: 'power2.in' }, 0)
      .to(a('front'), { ...this.off(from, 'front'), duration: 0.55, ease: 'power2.in' }, 0.06)
      .to(a('wing-l'), { ...this.off(from, 'wing-l'), duration: 0.65, ease: 'power3.in' }, 0.1)
      .to(a('wing-r'), { ...this.off(from, 'wing-r'), duration: 0.65, ease: 'power3.in' }, 0.16)
      .to(a('far'), { ...this.off(from, 'far'), duration: 0.55, ease: 'power2.in' }, 0.2)

    // the new backcloth drops in front of the old one, lands, and the set is built against it
    tl.add(() => B.classList.add('is-live'), 0.45)
      .fromTo(b('back'), this.off(to, 'back'), { yPercent: 0, duration: 0.9, ease: 'power4.out' }, 0.45)
      .fromTo(b('far'), this.off(to, 'far'), { yPercent: 0, duration: 0.95, ease: 'expo.out' }, 0.95)
      .fromTo(b('wing-l'), this.off(to, 'wing-l'), { xPercent: 0, duration: 1.05, ease: 'expo.out' }, 1.02)
      .fromTo(b('wing-r'), this.off(to, 'wing-r'), { xPercent: 0, duration: 1.05, ease: 'expo.out' }, 1.1)
      .fromTo(b('flown'), this.off(to, 'flown'), { yPercent: 0, duration: 1.25, ease: 'back.out(1.25)' }, 1.12)
      .fromTo(b('flown').firstElementChild, { rotation: 4.5 }, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.3)', transformOrigin: '50% -60%' }, 1.2)
      .fromTo(b('front'), this.off(to, 'front'), { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 1.18)
      .fromTo(b('hero'), this.off(to, 'hero'), { x: 0, duration: 1.35, ease: 'power3.out' }, 1.22)
      .fromTo(b('hero').firstElementChild, { rotation: -2.2 * (this.productions[to].layers.hero.from || 1) }, { rotation: 0, duration: 1.9, ease: 'elastic.out(1, 0.35)', transformOrigin: '50% 100%' }, 2.2)

    if (this.target !== to) tl.timeScale(3)
  }
}
