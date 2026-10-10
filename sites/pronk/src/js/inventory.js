import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, clamp, rand, reduced, DESK, PHONE } from './util.js'

export function initInventory() {
  const sec = $('.inventory')
  if (!sec) return
  const track = $('.inventory__track', sec)
  const lots = $$('.lot', sec)
  const fill = $('.inventory__bar-line i', sec)
  const num = $('.js-lot-n', sec)
  const setLot = (n) => {
    const s = String(n).padStart(2, '0')
    if (num.textContent !== s) num.textContent = s
  }
  const current = (mid) => {
    let n = 0
    lots.forEach((l, i) => { if (l.getBoundingClientRect().left < mid) n = i + 1 })
    setLot(n)
  }
  const mm = gsap.matchMedia()

  // wide screens: the page scrolls down, the lots travel sideways
  mm.add(DESK, () => {
    const dist = () => track.scrollWidth - innerWidth
    const size = () => (sec.style.height = dist() + innerHeight + 'px')
    size()
    ScrollTrigger.addEventListener('refreshInit', size)

    const travel = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(fill, { scaleX: self.progress })
          current(innerWidth * 0.55)
        },
      },
    })
    if (!reduced)
      lots.forEach((lot) => {
        gsap.fromTo($('.lot__fig', lot), { x: () => innerWidth * 0.07 }, {
          x: () => -innerWidth * 0.07, ease: 'none',
          scrollTrigger: { trigger: lot, containerAnimation: travel, start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true },
        })
      })
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', size)
      sec.style.height = ''
      gsap.set([track, fill], { clearProps: 'all' })
    }
  })

  // phones: a native swipe carousel
  mm.add(PHONE, () => {
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth
      fill.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`
      current(innerWidth * 0.6)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      track.removeEventListener('scroll', onScroll)
      fill.style.transform = ''
    }
  })

  fly(sec)
}

/* Lot 10 walks about on the page and will not be touched. */
function fly(sec) {
  const el = $('.fly', sec)
  if (!el) return
  el.dataset.cursor = 'Shoo'
  if (reduced) return
  const box = el.parentElement
  const pos = { x: 0, y: 0, r: -20 }
  let busy = false
  gsap.set(el, { rotation: pos.r })

  // offsets are measured from the fly's resting spot (46% / 40% of its box)
  const bounds = () => {
    const b = box.getBoundingClientRect()
    const w = el.offsetWidth
    return { minX: -b.width * 0.42, maxX: b.width * 0.46 - w, minY: -b.height * 0.34, maxY: b.height * 0.5 - w }
  }

  function flee(fromX, fromY) {
    if (busy) return
    busy = true
    const b = bounds()
    const r = el.getBoundingClientRect()
    let ang = Math.atan2(r.top + r.height / 2 - fromY, r.left + r.width / 2 - fromX) + rand(-0.7, 0.7)
    const leg = () => {
      const d = rand(90, 190)
      const nx = clamp(pos.x + Math.cos(ang) * d, b.minX, b.maxX)
      const ny = clamp(pos.y + Math.sin(ang) * d, b.minY, b.maxY)
      const rot = (Math.atan2(ny - pos.y, nx - pos.x) * 180) / Math.PI + 90
      ang += rand(-1.6, 1.6)
      pos.x = nx
      pos.y = ny
      pos.r = rot
      return { x: nx, y: ny, rotation: rot + '_short' }
    }
    gsap.timeline({ onComplete: () => (busy = false) })
      .to(el, { ...leg(), duration: 0.16, ease: 'power1.in' })
      .to(el, { ...leg(), duration: 0.14, ease: 'none' })
      .to(el, { ...leg(), duration: 0.2, ease: 'power2.out' })
      .to(el, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0)
  }

  // it bolts when the pointer gets close
  sec.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect()
    if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width * 1.15) flee(e.clientX, e.clientY)
  }, { passive: true })
  el.addEventListener('pointerdown', (e) => flee(e.clientX, e.clientY))
  el.addEventListener('focus', () => {
    const r = el.getBoundingClientRect()
    flee(r.left - 40, r.top - 40)
  })

  // left alone, it walks a few steps
  const wander = () => {
    const r = el.getBoundingClientRect()
    if (!busy && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight) {
      const b = bounds()
      const a = ((pos.r - 90) * Math.PI) / 180 + rand(-0.9, 0.9)
      const d = rand(8, 26)
      pos.x = clamp(pos.x + Math.cos(a) * d, b.minX, b.maxX)
      pos.y = clamp(pos.y + Math.sin(a) * d, b.minY, b.maxY)
      pos.r = (a * 180) / Math.PI + 90
      gsap.to(el, { rotation: pos.r + '_short', duration: 0.18, ease: 'power1.inOut' })
      gsap.to(el, { x: pos.x, y: pos.y, duration: rand(0.25, 0.5), ease: 'steps(5)', delay: 0.15 })
    }
    gsap.delayedCall(rand(1.2, 3.6), wander)
  }
  gsap.delayedCall(2, wander)
}
