// A rig is a canvas laid over a scene. It draws what the photographs can't hold still for:
// the flying line and the paper tails. A flyer is one kite image, swayed by the wind,
// with its line and tails pinned to it.
import { wind } from './wind.js'
import { reduced, whileVisible } from './env.js'

const DEG = Math.PI / 180

class Tail {
  constructor(flyer, { at, length = 1.1, width = 0.05, front = '#e4412b', back = '#b9311f', segs = 26 }) {
    this.flyer = flyer
    this.at = at
    this.length = length
    this.width = width
    this.front = front
    this.back = back
    this.n = segs
    this.x = new Float32Array(segs)
    this.y = new Float32Array(segs)
    this.px = new Float32Array(segs)
    this.py = new Float32Array(segs)
    this.wx = new Float32Array(segs)
    this.wy = new Float32Array(segs)
    this.phase = Math.random() * 10
    this.ready = false
  }

  reset(ax, ay) {
    const seg = (this.length * this.flyer.h) / (this.n - 1)
    for (let i = 0; i < this.n; i++) {
      this.x[i] = this.px[i] = ax + i * seg * 0.25
      this.y[i] = this.py[i] = ay + i * seg * 0.95
    }
    this.ready = true
  }

  update(dt, ax, ay, W, dir) {
    if (!this.ready) this.reset(ax, ay)
    const { n, x, y, px, py } = this
    const seg = (this.length * this.flyer.h) / (n - 1)
    const scale = this.flyer.h / 520 // physics tuned at a 520px kite, scaled for others
    const dt2 = dt * dt
    const t = wind.t
    x[0] = ax
    y[0] = ay
    for (let i = 1; i < n; i++) {
      const k = i / n
      // capped, so a kite that is flown in fast drags its tail rather than whipping it into knots
      let vx = (x[i] - px[i]) * 0.965
      let vy = (y[i] - py[i]) * 0.965
      const v = Math.hypot(vx, vy)
      if (v > seg * 1.4) {
        vx *= (seg * 1.4) / v
        vy *= (seg * 1.4) / v
      }
      px[i] = x[i]
      py[i] = y[i]
      const flutter = Math.sin(t * 4.1 * (0.6 + W * 0.4) - i * 0.5 + this.phase) * 260 * W * k
      const fx = (dir * 430 * W + flutter) * scale
      const fy = (470 - 90 * Math.min(W, 2.4)) * scale
      x[i] += vx + fx * dt2
      y[i] += vy + fy * dt2
    }
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 1; i < n; i++) {
        const dx = x[i] - x[i - 1]
        const dy = y[i] - y[i - 1]
        const d = Math.hypot(dx, dy) || 1
        const off = (d - seg) / d
        if (i === 1) {
          x[i] -= dx * off
          y[i] -= dy * off
        } else {
          x[i] -= dx * off * 0.5
          y[i] -= dy * off * 0.5
          x[i - 1] += dx * off * 0.5
          y[i - 1] += dy * off * 0.5
        }
      }
    }
  }

  // a paper streamer: the rope gives it its hang, a travelling ripple gives it its flutter,
  // and its width breathes as it twists, showing front then back
  draw(ctx, W) {
    const { n, x, y, wx, wy } = this
    const half = (this.width * this.flyer.h) / 2
    const seg = (this.length * this.flyer.h) / (n - 1)
    const t = wind.t
    const live = Math.min(W, 2.2)
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1)
      const b = Math.min(n - 1, i + 1)
      const dx = x[b] - x[a]
      const dy = y[b] - y[a]
      const d = Math.hypot(dx, dy) || 1
      const k = i / (n - 1)
      const ripple = Math.sin(t * (2.6 + live * 2.4) - i * 0.58 + this.phase) * seg * 1.25 * live * Math.pow(k, 0.8)
      wx[i] = x[i] + (-dy / d) * ripple
      wy[i] = y[i] + (dx / d) * ripple
    }
    let nx0 = 0
    let ny0 = 0
    let c0 = 1
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1)
      const b = Math.min(n - 1, i + 1)
      const dx = wx[b] - wx[a]
      const dy = wy[b] - wy[a]
      const d = Math.hypot(dx, dy) || 1
      const twist = Math.cos(t * 1.7 * (0.4 + live * 0.6) - i * 0.42 + this.phase * 1.7)
      const taper = 1 - (i / (n - 1)) * 0.35
      const hw = Math.max(0.8, half * taper * (0.16 + 0.84 * Math.abs(twist)))
      const nx = (-dy / d) * hw
      const ny = (dx / d) * hw
      if (i > 0) {
        ctx.beginPath()
        ctx.moveTo(wx[i - 1] + nx0, wy[i - 1] + ny0)
        ctx.lineTo(wx[i] + nx, wy[i] + ny)
        ctx.lineTo(wx[i] - nx, wy[i] - ny)
        ctx.lineTo(wx[i - 1] - nx0, wy[i - 1] - ny0)
        ctx.closePath()
        ctx.fillStyle = ctx.strokeStyle = c0 + twist > 0 ? this.front : this.back
        ctx.lineWidth = 0.6 // closes the hairline seams between quads
        ctx.fill()
        ctx.stroke()
      }
      nx0 = nx
      ny0 = ny
      c0 = twist
    }
  }
}

export class Flyer {
  /**
   * @param {HTMLElement} el      the .kite wrapper
   * @param {object} o
   *   bridle [fx, fy]   where the line leaves the kite, as fractions of its box
   *   tails  [{ at:[fx,fy], length, width, front, back }]   lengths are multiples of kite height
   *   anchor () => {x, y} | null   where the line is held, in rig coordinates
   *   rest   degrees of lean at rest       sway  how much it moves about
   *   wind   () => strength, to override the site wind for this kite
   */
  constructor(el, o = {}) {
    this.el = el
    this.bridle = o.bridle || [0.5, 0.36]
    this.anchor = o.anchor || null
    this.rest = o.rest ?? -8
    this.sway = o.sway ?? 1
    this.windFn = o.wind || null
    this.line = o.line || 'rgba(15, 26, 61, 0.62)'
    this.lineFade = o.lineFade ?? 0
    this.loop = 0 // 0..1, wild looping in a gale
    this.tailAlpha = 1 // tails can be faded in after the kite has arrived
    this.pose = { x: 0, y: 0, r: 0, s: 1, o: 1 }
    this.layers = [] // extra {x, y, r} offsets (intro, scroll, the pull of the pointer)
    this.tails = (o.tails || []).map((t) => new Tail(this, t))
    this.phase = Math.random() * 20
    this.cx = this.cy = 0
    this.w = this.h = 1
    this.X = this.Y = this.R = 0
    this.alpha = 1
    this.shownAlpha = -1
  }

  measure() {
    let x = 0
    let y = 0
    let node = this.el
    const host = this.rig.host
    while (node && node !== host) {
      x += node.offsetLeft
      y += node.offsetTop
      node = node.offsetParent
    }
    this.w = this.el.offsetWidth || 1
    this.h = this.el.offsetHeight || 1
    this.cx = x + this.w / 2
    this.cy = y + this.h / 2
    this.tails.forEach((t) => (t.ready = false))
  }

  // a point on the kite, given as fractions of its box, in rig coordinates
  point(fx, fy) {
    const s = this.pose.s
    const dx = (fx - 0.5) * this.w * s
    const dy = (fy - 0.5) * this.h * s
    const c = Math.cos(this.R * DEG)
    const sn = Math.sin(this.R * DEG)
    return [this.X + dx * c - dy * sn, this.Y + dx * sn + dy * c]
  }

  update(dt) {
    const W = this.windFn ? this.windFn() : wind.now
    const t = wind.t
    const ph = this.phase
    const p = this.pose
    const h = this.h
    const s = this.sway * Math.min(W, 2.6)

    let x = p.x + (Math.sin(t * 0.53 + ph) * 0.045 + Math.sin(t * 1.31 + ph * 2) * 0.014) * h * s + wind.gust * h * 0.05
    let y = p.y + (Math.cos(t * 0.71 + ph * 1.3) * 0.03 + Math.sin(t * 1.9 + ph) * 0.008) * h * s - wind.lift * 0.016
    let r = this.rest + p.r + (Math.sin(t * 0.83 + ph) * 3.1 + Math.sin(t * 2.2 + ph * 1.7) * 1.2) * s + wind.gust * 6
    for (const l of this.layers) {
      x += l.x
      y += l.y
      r += l.r
    }
    if (this.loop > 0.001) {
      const a = t * 3.1 + ph
      x += Math.cos(a) * h * 0.42 * this.loop
      y += Math.sin(a * 1.03) * h * 0.26 * this.loop
      r += (Math.sin(a + 1.2) * 58 + Math.sin(a * 2.3) * 14) * this.loop
    }

    this.X = this.cx + x
    this.Y = this.cy + y
    this.R = r
    this.alpha = p.o
    this.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${r.toFixed(2)}deg) scale(${p.s.toFixed(4)})`
    if (Math.abs(this.alpha - this.shownAlpha) > 0.004) {
      this.el.style.opacity = this.shownAlpha = this.alpha
    }

    if (this.alpha > 0.01) {
      const dir = wind.gust * 0.9 + 1
      const step = Math.min(dt, 1 / 30)
      for (const tail of this.tails) {
        const [ax, ay] = this.point(tail.at[0], tail.at[1])
        tail.update(step, ax, ay, W, dir)
      }
    }
    this.W = W
  }

  draw(ctx) {
    ctx.globalAlpha = this.alpha
    const hold = this.anchor && this.anchor()
    if (hold) {
      const [bx, by] = this.point(this.bridle[0], this.bridle[1])
      const dist = Math.hypot(hold.x - bx, hold.y - by)
      const sag = dist * 0.16 * Math.max(0.15, 1.1 - this.W * 0.42)
      const mx = (bx + hold.x) / 2
      const my = (by + hold.y) / 2 + sag
      if (this.lineFade) {
        const g = ctx.createLinearGradient(bx, by, hold.x, hold.y)
        g.addColorStop(0, this.line)
        g.addColorStop(this.lineFade, this.line)
        g.addColorStop(Math.min(1, this.lineFade + 0.3), this.line.replace(/[\d.]+\)$/, '0)'))
        ctx.strokeStyle = g
      } else {
        ctx.strokeStyle = this.line
      }
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.quadraticCurveTo(mx, my, hold.x, hold.y)
      ctx.stroke()
    }
    if (this.tailAlpha > 0.01) {
      ctx.globalAlpha = this.alpha * this.tailAlpha
      for (const tail of this.tails) tail.draw(ctx, this.W)
    }
    ctx.globalAlpha = 1
  }
}

export class Rig {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.host = canvas.parentElement
    this.flyers = []
    this.seen = whileVisible(this.host, '20%')
    this.measure()
  }

  add(el, opts) {
    const f = new Flyer(el, opts)
    f.rig = this
    this.flyers.push(f)
    f.measure()
    return f
  }

  measure() {
    this.w = this.host.clientWidth
    this.h = this.host.clientHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(this.w * this.dpr)
    this.canvas.height = Math.round(this.h * this.dpr)
    this.flyers.forEach((f) => f.measure())
  }

  frame(dt, force = false) {
    if (!this.seen.on && !force) return
    const { ctx } = this
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)
    for (const f of this.flyers) f.update(dt)
    for (const f of this.flyers) if (f.alpha > 0.01) f.draw(ctx)
  }

  // reduced motion: one still frame with the tails hanging where they fall
  settle() {
    for (let i = 0; i < 90; i++) for (const f of this.flyers) f.update(1 / 60)
    this.frame(0, true)
  }
}

export const still = reduced
