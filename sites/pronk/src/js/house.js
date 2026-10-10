import gsap from 'gsap'
import { $, $$, reduced } from './util.js'

// The room: day turns to candlelight as the rules scroll past.
export function initHouse() {
  const sec = $('.house')
  if (!sec) return
  gsap.to($('.house__img--night', sec), {
    opacity: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: sec, start: 'top 20%', end: 'center 30%', scrub: true,
      onUpdate: (self) => sec.classList.toggle('is-night', self.progress > 0.55),
    },
  })
  if (!reduced)
    gsap.fromTo($('.house__par', sec), { yPercent: -5.5 }, { yPercent: 5.5, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } })
}

export function initFoot() {
  const hero = $('.foot__hero')
  if (!hero || reduced) return
  gsap.fromTo($('.foot__par', hero), { yPercent: -7 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top bottom', end: 'bottom bottom', scrub: true } })
  gsap.fromTo('.foot__word', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot__cols', start: 'top bottom', end: 'bottom bottom', scrub: true } })
}

// stray objects that slide at their own pace, and a snail that crosses the reservations very slowly
export function initDrift() {
  if (reduced) return
  $$('.drift[data-speed]').forEach((el) => {
    const k = parseFloat(el.dataset.speed)
    gsap.fromTo(el, { y: () => innerHeight * 0.14 * k }, { y: () => -innerHeight * 0.14 * k, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } })
  })
  $$('.drift[data-creep]').forEach((el) => {
    gsap.fromTo(el, { x: () => innerWidth * 0.16 }, { x: () => -innerWidth * 0.2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } })
  })
}
