import gsap from 'gsap'
import { $, $$, clamp, desktop, fine, reduce, whileVisible } from './util.js'

// The meadow: eleven cut-out plants that sway in a light wind, lean away from the cursor,
// and stand up straight with a field-guide card when picked.
// the wind moves a wrapper, not the <img> itself, so the image stays ordinary painted content
function wrap(img) {
  const sway = document.createElement('span')
  sway.className = 'plant__sway'
  img.replaceWith(sway)
  sway.append(img)
  return sway
}

export function flora() {
  const meadow = $('.meadow')
  const plants = $$('.plant', meadow).map((li, i) => ({
    li,
    btn: $('button', li),
    img: wrap($('img', li)),
    phase: i * 1.7,
    speed: 0.5 + ((i * 37) % 10) / 16,
    amp: 1.1 + ((i * 53) % 10) / 9,
    gust: 0,
    vel: 0,
    cx: 0,
  }))

  const pick = (p) => {
    for (const q of plants) q.li.classList.toggle('is-active', q === p)
    meadow.classList.toggle('has-pick', !!p)
  }

  for (const p of plants) {
    p.btn.addEventListener('pointerenter', (e) => e.pointerType !== 'touch' && desktop() && pick(p))
    p.btn.addEventListener('focus', () => desktop() && pick(p))
    p.btn.addEventListener('click', () => desktop() && pick(p))
  }
  meadow.addEventListener('pointerleave', () => pick(null))
  meadow.addEventListener('focusout', (e) => !meadow.contains(e.relatedTarget) && pick(null))
  pick(null)

  // growing in
  gsap.from(
    plants.map((p) => p.btn),
    {
      yPercent: reduce ? 0 : 104,
      opacity: reduce ? 0 : 1,
      duration: 1.9,
      ease: 'expo.out',
      stagger: { each: 0.07, from: 'center' },
      scrollTrigger: { trigger: meadow, start: 'top 72%', once: true },
    },
  )

  if (reduce) return

  // wind
  const measure = () => {
    for (const p of plants) {
      const r = p.btn.getBoundingClientRect()
      p.cx = r.left + r.width / 2
      p.w = r.width
    }
  }
  let lastX = null
  if (fine) {
    meadow.addEventListener('pointermove', (e) => {
      if (lastX !== null) {
        const dx = clamp(e.clientX - lastX, -60, 60)
        measure()
        for (const p of plants) {
          const d = Math.abs(e.clientX - p.cx)
          const reach = Math.max(120, p.w * 0.9)
          if (d < reach) p.vel += dx * 0.02 * (1 - d / reach)
        }
      }
      lastX = e.clientX
    })
    meadow.addEventListener('pointerleave', () => (lastX = null))
  }

  whileVisible(meadow, (t) => {
    const breeze = Math.sin(t * 0.23) * 0.6 + 0.6 // slow swell shared by the whole meadow
    for (const p of plants) {
      // a damped spring carries each gust
      p.vel += -p.gust * 0.06
      p.vel *= 0.9
      p.gust = clamp(p.gust + p.vel, -14, 14)
      const active = p.li.classList.contains('is-active')
      const sway = Math.sin(t * p.speed + p.phase) * p.amp * (0.5 + breeze) * (active ? 0.25 : 1)
      p.img.style.transform = `rotate(${(sway + p.gust).toFixed(2)}deg) scale(${active ? 1.04 : 1})`
    }
  })
}
