// Shared entrance behaviours, all declared in the markup:
//   data-lines         headline rises line by line out of a mask
//   data-reveal        block fades up
//   data-curtain       figure wipes open, then its image drifts as you scroll past
//   data-parallax="n"  cut-out drifts at its own speed
//   data-scrub-words   paragraph lights up word by word with scroll
//   data-count="n"     number counts up once
import { gsap, ScrollTrigger, SplitText, env, $$ } from './core.js'

export function initReveals() {
  // ---- lines
  $$('[data-lines]').forEach((el) => {
    if (env.reduce) return el.classList.add('is-split')
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-split')
        self.masks?.forEach((m) => m.classList.add('line-mask'))
        return gsap.from(self.lines, {
          yPercent: 112,
          duration: 1.35,
          stagger: 0.085,
          ease: 'out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      },
    })
  })

  // ---- blocks
  $$('[data-reveal]').forEach((el) => {
    if (env.reduce) return
    gsap.from(el, {
      y: 30,
      autoAlpha: 0,
      duration: 1.3,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })

  // ---- figures
  $$('[data-curtain]').forEach((fig) => {
    const img = fig.querySelector('img')
    const box = document.createElement('div')
    const inner = document.createElement('div')
    box.className = 'curtain-box'
    inner.className = 'curtain-in'
    img.before(box)
    box.append(inner)
    inner.append(img)
    box.style.aspectRatio = `${img.getAttribute('width')} / ${img.getAttribute('height')}`
    inner.style.cssText = 'overflow:hidden;height:100%;will-change:transform'
    img.style.height = '100%'
    img.style.objectFit = 'cover'
    if (env.reduce) return
    const cap = fig.querySelector('figcaption')
    gsap.set(img, { scale: 1.16 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 84%', once: true } })
    tl.fromTo(inner, { yPercent: 101 }, { yPercent: 0, duration: 1.5, ease: 'io' }, 0)
      .fromTo(img, { yPercent: -101 }, { yPercent: 0, duration: 1.5, ease: 'io' }, 0)
    if (cap) tl.from(cap, { autoAlpha: 0, y: 12, duration: 0.9 }, 0.9)
    gsap.fromTo(
      img,
      { y: () => -0.06 * box.offsetHeight },
      {
        y: () => 0.06 * box.offsetHeight,
        ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      },
    )
  })

  // ---- floating cut-outs
  if (!env.reduce)
    $$('[data-parallax]').forEach((el) => {
      const s = parseFloat(el.dataset.parallax)
      const d = () => s * (env.phone ? 70 : 150)
      gsap.fromTo(
        el,
        { y: () => d(), rotation: s * -5 },
        {
          y: () => -d(),
          rotation: s * 5,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
        },
      )
    })

  // ---- word scrub
  $$('[data-scrub-words]').forEach((el) => {
    if (env.reduce) return
    SplitText.create(el, {
      type: 'words',
      wordsClass: 'word',
      autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(
          self.words,
          { opacity: 0.13 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.5,
            scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 52%', scrub: 0.4 },
          },
        )
      },
    })
  })

  // ---- counters
  $$('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count)
    const plain = el.hasAttribute('data-plain')
    const fmt = (v) => (plain ? String(Math.round(v)) : Math.round(v).toLocaleString('en-GB'))
    if (env.reduce) return
    const o = { v: plain ? to - 60 : 0 }
    el.textContent = fmt(o.v)
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) }),
    })
  })
}
