// Every bell on the page is a real (small) simulation: a damped pendulum for the bell and a second
// one for its clapper, which is trapped between the two walls of the sound-bow. When the wall
// catches the clapper hard enough, that is a strike. Only transforms are written.

import gsap from 'gsap'

const hangs = new Set()
let running = false
let last = 0

export class Hang {
  constructor(el, { onStrike, calm = false, collide = true } = {}) {
    this.el = el
    this.swing = el.querySelector('.hang__swing')
    this.clap = el.querySelector('.hang__clapper')
    this.rings = [...el.querySelectorAll('.hang__ring')]
    this.ringI = 0
    this.size = parseFloat(el.dataset.size) || 1
    this.freq = parseFloat(el.dataset.freq) || 370
    this.fixed = el.classList.contains('hang--clock')
    this.onStrike = onStrike
    this.calm = calm
    this.collide = collide // false: the clapper still moves, but only deliberate strikes sound

    // heavier bells swing slower and die away slower
    this.w2 = (this.fixed ? 90 : 17) / Math.pow(this.size, 0.9) // (rad/s)^2
    this.damp = (this.fixed ? 5 : 0.85) / Math.pow(this.size, 0.35)
    this.cw2 = this.w2 * 2.1
    this.reach = 0.19 // how far the clapper can travel before it meets the wall (rad)

    this.th = 0 // bell angle
    this.om = 0
    this.ps = 0 // clapper angle (absolute)
    this.pom = 0
    this.quietUntil = 0
    this.visible = false
    this.awake = false

    hangs.add(this)
    new IntersectionObserver(([e]) => (this.visible = e.isIntersecting), { rootMargin: '25% 0px' }).observe(el)
  }

  wake() {
    this.awake = true
    if (!running) {
      running = true
      last = performance.now()
      gsap.ticker.add(tick)
    }
  }

  /** angular velocity impulse, rad/s */
  kick(v) {
    if (this.calm) v *= 0.25
    this.om = Math.max(-7, Math.min(7, this.om + v))
    this.wake()
  }

  /** a deliberate strike from one side: dir +1 swings the bell to the right */
  strike(dir = 1, power = 1) {
    this.hit(Math.min(1, 0.55 + 0.45 * power))
    this.kick(dir * (this.fixed ? 1.2 : 2.3) * power)
    this.ps = this.th + dir * this.reach * 0.9
    this.pom = this.om
    this.quietUntil = performance.now() + 240
  }

  hit(vel) {
    const r = this.rings[this.ringI++ % Math.max(1, this.rings.length)]
    if (r) {
      gsap.fromTo(r, { scale: 0.55, opacity: 0.85 * Math.min(1, vel + 0.2) }, { scale: 1.9, opacity: 0, duration: 1.6, ease: 'expo.out', overwrite: true })
    }
    this.onStrike?.(this, vel)
  }

  step(dt, now) {
    // bell
    const a = -this.w2 * Math.sin(this.th) - this.damp * this.om
    this.om += a * dt
    this.th += this.om * dt
    if (this.th > 1.15) (this.th = 1.15), (this.om *= -0.3)
    if (this.th < -1.15) (this.th = -1.15), (this.om *= -0.3)

    // clapper
    if (this.clap) {
      const ca = -this.cw2 * Math.sin(this.ps) - 0.7 * this.pom
      this.pom += ca * dt
      this.ps += this.pom * dt
      const rel = this.ps - this.th
      if (Math.abs(rel) > this.reach) {
        const side = Math.sign(rel)
        const closing = (this.pom - this.om) * side
        this.ps = this.th + side * this.reach
        if (closing > 0) {
          if (this.collide && closing > 0.55 && now > this.quietUntil) {
            this.hit(Math.min(1, closing / 3.2))
            this.quietUntil = now + 160
          }
          this.pom = this.om - side * closing * 0.22
        }
      }
    }

    const still = Math.abs(this.th) < 0.0006 && Math.abs(this.om) < 0.004 && Math.abs(this.ps) < 0.002 && Math.abs(this.pom) < 0.01
    if (still) {
      this.th = this.om = this.ps = this.pom = 0
      this.awake = false
    }
  }

  draw() {
    this.swing.style.transform = `rotate(${this.th.toFixed(5)}rad)`
    if (this.clap) this.clap.style.transform = `rotate(${(this.ps - this.th).toFixed(5)}rad)`
  }
}

function tick() {
  const now = performance.now()
  const dt = Math.min(0.034, (now - last) / 1000)
  last = now
  let any = false
  for (const h of hangs) {
    if (!h.awake) continue
    any = true
    // two sub-steps keep the stiff little bells stable
    h.step(dt / 2, now)
    h.step(dt / 2, now)
    if (h.visible || !h.awake) h.draw()
  }
  if (!any) {
    running = false
    gsap.ticker.remove(tick)
  }
}

/** nudge every bell that is on screen (used for scroll inertia) */
export function swayAll(v) {
  for (const h of hangs) if (h.visible) h.kick(v * (h.sign || 1))
}

export function allHangs() {
  return hangs
}
