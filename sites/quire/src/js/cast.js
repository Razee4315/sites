// The paper company: ten figures standing in one long groove. On a wide screen the section pins and
// vertical scroll pushes the groove sideways; on a phone it is a strip you swipe. Either way the
// figures lag behind the movement and swing on their card bases, the way they do on a real slide.
import { gsap, ScrollTrigger, $, $$, clamp, pad2, reduce, img, lenis } from './util.js'
import { cast } from './data.js'

export function initCast() {
  const section = $('#cast')
  const view = $('#cast-view')
  const rail = $('#cast-rail')
  const bar = $('#cast-bar')
  const count = $('#cast-count')

  rail.innerHTML = cast
    .map((c) => {
      const m = img(c.img)
      return `<li class="fig${c.wide ? ' fig--wide' : c.mid ? ' fig--mid' : ''}" tabindex="0">
        <div class="fig__stand"><i class="fig__sh"></i><img src="${m.src}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async" draggable="false" alt="Cut-paper figure of ${c.name}"></div>
        <div class="fig__txt">
          <h3 class="fig__name">${c.name}</h3>
          <p class="fig__meta"><span>${c.voice}</span><b>${c.mm} mm</b></p>
          <p class="fig__note">${c.note}</p>
        </div>
      </li>`
    })
    .join('')

  const figs = $$('.fig', rail)
  const stands = figs.map((f) => $('.fig__stand', f))
  const swing = stands.map((s) => gsap.quickTo(s, 'rotation', { duration: 1.1, ease: 'elastic.out(1, 0.38)' }))
  const wide = matchMedia('(min-width: 861px)')

  // velocity → swing. Every figure is cut a little differently, so each swings a little differently.
  let rest = null
  function sway(v) {
    if (reduce) return
    const r = clamp(v * -0.0042, -7, 7)
    swing.forEach((fn, i) => fn(r * (0.7 + ((i * 37) % 10) / 16)))
    rest?.kill()
    rest = gsap.delayedCall(0.12, () => swing.forEach((fn) => fn(0)))
  }

  const progress = (p) => {
    bar.style.transform = `scaleX(${Math.max(0.02, p)})`
    count.textContent = `${pad2(clamp(Math.round(p * (cast.length - 1)) + 1, 1, cast.length))} / ${cast.length}`
  }

  let st = null
  let travel = 0
  function build() {
    st?.kill()
    gsap.set(rail, { clearProps: 'transform' })
    section.style.height = ''
    if (!wide.matches) return
    travel = Math.max(0, rail.scrollWidth - view.clientWidth)
    section.style.height = `${innerHeight + travel}px`
    const setX = gsap.quickSetter(rail, 'x', 'px')
    st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${travel}`,
      onUpdate: (self) => {
        setX(-self.progress * travel)
        progress(self.progress)
        sway(self.getVelocity())
      },
    })
  }
  build()
  wide.addEventListener('change', () => { build(); ScrollTrigger.refresh() })
  let w = innerWidth
  addEventListener('resize', () => {
    if (innerWidth === w) return
    w = innerWidth
    build()
  })

  // phone: native sideways scroll
  let lastLeft = 0
  let lastT = 0
  view.addEventListener('scroll', () => {
    if (wide.matches) return
    const now = performance.now()
    const v = ((view.scrollLeft - lastLeft) / Math.max(8, now - lastT)) * 1000
    lastLeft = view.scrollLeft
    lastT = now
    progress(view.scrollLeft / Math.max(1, view.scrollWidth - view.clientWidth))
    sway(v)
  }, { passive: true })

  // wide: the groove can also be dragged
  let drag = null
  view.addEventListener('pointerdown', (e) => {
    if (!wide.matches || e.pointerType === 'touch' || e.button) return
    drag = { x: e.clientX, y: scrollY }
    view.classList.add('is-drag')
    view.setPointerCapture(e.pointerId)
  })
  view.addEventListener('pointermove', (e) => {
    if (!drag) return
    const to = drag.y - (e.clientX - drag.x) * 1.4
    lenis ? lenis.scrollTo(to, { immediate: true }) : scrollTo(0, to)
  })
  const drop = () => {
    drag = null
    view.classList.remove('is-drag')
  }
  view.addEventListener('pointerup', drop)
  view.addEventListener('pointercancel', drop)

  // keyboard: tabbing to a figure brings it into view
  figs.forEach((f, i) =>
    f.addEventListener('focus', () => {
      if (!wide.matches || !st) return f.scrollIntoView({ inline: 'center', block: 'nearest' })
      const want = clamp(f.offsetLeft - view.clientWidth / 2 + f.offsetWidth / 2, 0, travel)
      const y = st.start + want
      if (Math.abs(scrollY - y) > 4) lenis ? lenis.scrollTo(y, { duration: 0.8 }) : scrollTo(0, y)
    }),
  )

  // a nudge on hover
  figs.forEach((f, i) => {
    f.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch' || reduce) return
      gsap.fromTo(stands[i], { rotation: i % 2 ? 4 : -4 }, { rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.3)', overwrite: true })
    })
  })

  if (!reduce) {
    gsap.from(stands, {
      yPercent: 12,
      opacity: 0,
      duration: 1.1,
      stagger: 0.07,
      ease: 'expo.out',
      scrollTrigger: { trigger: section, start: 'top 45%', once: true },
    })
    gsap.from('.cast__head > *', { opacity: 0, y: 24, duration: 1, stagger: 0.08, scrollTrigger: { trigger: section, start: 'top 60%', once: true } })
  }
  progress(0)
}
