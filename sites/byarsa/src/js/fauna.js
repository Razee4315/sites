import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, clamp, fine, lerp, reduce } from './util.js'

// ── five residents, one at a time, while the section is pinned
export function residents(scrollTo) {
  const res = $('.res')
  const beasts = $$('.beast', res)
  const btns = $$('.res__index button', res)
  const count = $('.res__count b', res)
  const mm = gsap.matchMedia()

  mm.add('(min-width: 900px)', () => {
    let cur = -1
    const parts = (b) => ({ fig: $('.beast__fig', b), no: $('.beast__no', b), text: [...$('.beast__text', b).children], scale: $('.scale', b), bird: b.dataset.beast === 'bird' })

    const show = (i, dir = 1) => {
      if (i === cur) return
      const prev = beasts[cur]
      const next = beasts[i]
      cur = i
      btns.forEach((b, k) => {
        b.classList.toggle('is-on', k === i)
        b.setAttribute('aria-current', k === i ? 'true' : 'false')
      })
      count.textContent = String(i + 1).padStart(2, '0')

      if (prev) {
        const p = parts(prev)
        gsap.killTweensOf([p.fig, p.no, p.text, p.scale])
        gsap
          .timeline({ onComplete: () => prev !== beasts[cur] && gsap.set(prev, { visibility: 'hidden' }) })
          .to(p.fig, { xPercent: -16 * dir, opacity: 0, duration: reduce ? 0.2 : 0.55, ease: 'power3.in' }, 0)
          .to(p.no, { opacity: 0, yPercent: -8 * dir, duration: 0.45, ease: 'power2.in' }, 0)
          .to(p.text, { opacity: 0, y: -18 * dir, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, 0)
      }

      const n = parts(next)
      gsap.killTweensOf([n.fig, n.no, n.text, n.scale])
      gsap.set(next, { visibility: 'visible' })
      const tl = gsap.timeline({ delay: prev ? 0.3 : 0 })
      if (reduce) {
        tl.fromTo([n.fig, n.no, n.text], { opacity: 0, xPercent: 0, yPercent: 0, y: 0 }, { opacity: 1, duration: 0.3 })
        return
      }
      if (n.bird) tl.fromTo(n.fig, { xPercent: 70 * dir, yPercent: -30, rotation: -8 * dir, opacity: 0 }, { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1, duration: 2.4, ease: 'power3.out' }, 0)
      else tl.fromTo(n.fig, { xPercent: 22 * dir, yPercent: 0, rotation: 0, opacity: 0, scale: 0.96 }, { xPercent: 0, opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' }, 0)
      tl.fromTo(n.no, { opacity: 0, yPercent: 14 * dir }, { opacity: 1, yPercent: 0, duration: 1.6, ease: 'expo.out' }, 0)
        .fromTo(n.text, { opacity: 0, y: 36 * dir }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out' }, 0.25)
        .fromTo(n.scale, { opacity: 0 }, { opacity: 0.85, duration: 0.8 }, 0.9)
    }

    const st = ScrollTrigger.create({
      trigger: res,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => show(clamp(Math.floor(self.progress * beasts.length), 0, beasts.length - 1), self.direction || 1),
    })
    const first = ScrollTrigger.create({ trigger: res, start: 'top 60%', once: true, onEnter: () => cur < 0 && show(0, 1) })

    const go = (e) => {
      const i = Number(e.currentTarget.dataset.go)
      scrollTo(st.start + ((i + 0.5) / beasts.length) * (st.end - st.start))
    }
    btns.forEach((b) => b.addEventListener('click', go))

    // the bird never quite holds still
    const hover = reduce ? null : gsap.to('[data-beast="bird"] .beast__fig > img, [data-beast="bird"] .beast__shadow', { y: '-1.6vh', rotation: 1.2, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })

    return () => {
      st.kill()
      first.kill()
      hover && hover.kill()
      btns.forEach((b) => b.removeEventListener('click', go))
      gsap.set(beasts, { clearProps: 'visibility' })
      gsap.set($$('.beast__fig, .beast__no, .beast__text > *, .scale', res), { clearProps: 'all' })
    }
  })

  mm.add('(max-width: 899px)', () => {
    const tweens = beasts.map((b) =>
      gsap.from([$('.beast__fig', b), ...$('.beast__text', b).children], {
        opacity: 0,
        y: reduce ? 0 : 44,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: b, start: 'top 78%', once: true },
      }),
    )
    return () => tweens.forEach((t) => t.kill())
  })
}

// ── the bear walks the seam between the two sections
export function bearWalk() {
  const el = $('.bears__walk')
  if (reduce) return gsap.set(el, { x: '62vw', y: 0, xPercent: 0, yPercent: -94 })
  const st = ScrollTrigger.create({
    trigger: '.bears',
    start: 'top bottom',
    end: 'top 12%',
    scrub: 0.8,
    animation: gsap.fromTo(el, { x: () => -el.offsetWidth * 1.05, y: 0, xPercent: 0, yPercent: -94 }, { x: () => innerWidth * 1.02, y: 0, xPercent: 0, yPercent: -94, ease: 'none', force3D: true }),
    invalidateOnRefresh: true,
  })
  // a little weight in the stride
  gsap.to($('img', el), { y: -5, rotation: 0.8, duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  return st
}

// ── find the bear: a magnifying glass over the photograph
export function loupe() {
  const fig = $('.loupe')
  const img = $('.loupe__img', fig)
  const lens = $('.loupe__lens', fig)
  const zoom = $('.loupe__zoom', fig)
  const cap = $('figcaption span', fig)
  const Z = 3.4
  const BEAR = { x: 0.227, y: 0.613 }
  const pos = { x: 0.6, y: 0.36, tx: 0.6, ty: 0.36 }
  let w = 1
  let h = 1
  let found = false
  let running = false

  const size = () => {
    w = img.offsetWidth
    h = img.offsetHeight
    zoom.style.width = `${w * Z}px`
    zoom.style.height = `${h * Z}px`
    render()
  }
  const render = () => {
    const r = lens.offsetWidth / 2
    lens.style.transform = `translate3d(${pos.x * w}px, ${pos.y * h}px, 0)`
    zoom.style.transform = `translate3d(${-pos.x * w * Z + r}px, ${-pos.y * h * Z + r}px, 0)`
  }
  const tick = () => {
    pos.x = lerp(pos.x, pos.tx, reduce ? 1 : 0.16)
    pos.y = lerp(pos.y, pos.ty, reduce ? 1 : 0.16)
    render()
    if (!found && Math.hypot(pos.x - BEAR.x, (pos.y - BEAR.y) * (h / w)) < 0.045) {
      found = true
      fig.classList.add('is-found')
      cap.textContent = 'There. An adult, about four hundred metres off.'
    }
    if (Math.abs(pos.x - pos.tx) + Math.abs(pos.y - pos.ty) > 0.0005) requestAnimationFrame(tick)
    else running = false
  }
  const aim = (e) => {
    const r = img.getBoundingClientRect()
    pos.tx = clamp((e.clientX - r.left) / r.width)
    pos.ty = clamp((e.clientY - r.top) / r.height)
    if (!running) {
      running = true
      requestAnimationFrame(tick)
    }
  }
  fig.addEventListener('pointermove', aim)
  fig.addEventListener('pointerdown', aim)
  window.addEventListener('resize', size)
  $('img', img).addEventListener('load', size)
  ScrollTrigger.addEventListener('refresh', size)
  size()

  // keyboard: arrow keys move the glass
  fig.tabIndex = 0
  fig.setAttribute('aria-label', 'Photograph with a magnifying glass. Use the arrow keys to move the glass and find the bear.')
  fig.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [-0.03, 0], ArrowRight: [0.03, 0], ArrowUp: [0, -0.04], ArrowDown: [0, 0.04] }[e.key]
    if (!d) return
    e.preventDefault()
    pos.tx = clamp(pos.tx + d[0])
    pos.ty = clamp(pos.ty + d[1])
    if (!running) {
      running = true
      requestAnimationFrame(tick)
    }
  })

  if (!fine) {
    // on touch, the glass drifts toward the bear's side so there is something to chase
    ScrollTrigger.create({ trigger: fig, start: 'top 60%', once: true, onEnter: () => gsap.to(pos, { tx: 0.5, ty: 0.5, duration: 0.01, onComplete: () => !running && ((running = true), requestAnimationFrame(tick)) }) })
  }
}
