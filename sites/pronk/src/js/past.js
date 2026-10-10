import gsap from 'gsap'
import { $, $$, clamp, reduced } from './util.js'

// Before/after wipes built from two counter-moving transforms (no clip-path, no layout).
export function initPast() {
  $$('[data-ba]').forEach((el) => {
    const clip = $('.ba__clip', el)
    const inner = $('.ba__clip-in', el)
    const bar = $('.ba__bar', el)
    el.dataset.cursor = 'Eat'
    let p = 1 // where the divider is, 0..1 from the left; everything left of it is "before"
    let target = 1
    let seen = false
    let w = el.offsetWidth

    const draw = () => {
      clip.style.transform = `translate3d(${(p - 1) * 100}%,0,0)`
      inner.style.transform = `translate3d(${(1 - p) * 100}%,0,0)`
      bar.style.transform = `translate3d(${p * w}px,0,0)`
    }
    gsap.ticker.add(() => {
      if (Math.abs(target - p) < 0.0004) return
      p += (target - p) * (reduced ? 1 : 0.14)
      draw()
      el.setAttribute('aria-valuenow', String(Math.round((1 - p) * 100)))
    })
    draw()
    new ResizeObserver(() => {
      w = el.offsetWidth
      draw()
    }).observe(el)

    const fromEvent = (e) => {
      const r = el.getBoundingClientRect()
      target = clamp((e.clientX - r.left) / r.width, 0.02, 0.98)
    }
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'touch' || el.hasPointerCapture(e.pointerId)) fromEvent(e)
    })
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') el.setPointerCapture(e.pointerId)
      fromEvent(e)
    })
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      target = clamp(target + (e.key === 'ArrowLeft' ? -0.08 : 0.08), 0.02, 0.98)
      e.preventDefault()
    })

    // first time it comes into view, it takes a bite on its own
    new IntersectionObserver((entries, io) => {
      if (!entries[0].isIntersecting || seen) return
      seen = true
      io.disconnect()
      gsap.delayedCall(0.35, () => (target = 0.5))
    }, { threshold: 0.45 }).observe(el)
  })
}
