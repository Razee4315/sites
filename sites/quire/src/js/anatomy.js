// "Seven sheets deep": the Rusalka set, seen from the front, then turned and pulled apart in 3D
// so each sheet of paper can be seen standing in its groove.
import { gsap, ScrollTrigger, $, $$, reduce, tallMQ, loadImage } from './util.js'
import { productions, sheets } from './data.js'
import { buildLayer } from './stage.js'

export function initAnatomy() {
  const prod = productions.find((p) => p.id === 'ru')
  const set = $('#rig-set')
  const list = $('#sheets')

  const planes = sheets.map((s, i) => {
    const plane = document.createElement('div')
    plane.className = 'plane'
    plane.innerHTML = `<div class="plane__in"></div><i class="plane__edge"></i><span class="plane__tag">${String(i + 1).padStart(2, '0')}</span>`
    plane.firstChild.append(buildLayer(prod, s.kind, { fixed: true }))
    set.append(plane)

    const li = document.createElement('li')
    li.tabIndex = 0
    li.innerHTML = `<i>${String(i + 1).padStart(2, '0')}</i><b>${s.name}</b><span>${s.spec}</span>`
    list.append(li)
    return { plane, li }
  })

  // load the sheets when the section comes near
  ScrollTrigger.create({
    trigger: '#anatomy',
    start: 'top 200%',
    once: true,
    onEnter: () => $$('img[data-src]', set).forEach((el) => loadImage(el.dataset.src).then((src) => (el.src = src))),
  })

  // hovering a line in the list lifts that sheet out of the stack
  let hot = -1
  const lift = planes.map(({ plane }) => gsap.quickTo(plane, 'y', { duration: 0.6, ease: 'power3.out' }))
  const fade = planes.map(({ plane }) => gsap.quickTo(plane, 'opacity', { duration: 0.4, ease: 'power2.out' }))
  function heat(i) {
    hot = i
    planes.forEach(({ li }, k) => {
      li.classList.toggle('is-hot', k === i)
      lift[k](k === i ? -set.offsetHeight * 0.06 : 0)
      fade[k](i < 0 || k === i ? 1 : 0.22)
    })
  }
  planes.forEach(({ li }, i) => {
    li.addEventListener('pointerenter', () => heat(i))
    li.addEventListener('focus', () => heat(i))
    li.addEventListener('click', () => heat(hot === i ? -1 : i))
    li.addEventListener('blur', () => heat(-1))
  })
  list.addEventListener('pointerleave', () => heat(-1))

  const mid = (planes.length - 1) / 2
  const edges = $$('.plane__edge', set)
  const tags = $$('.plane__tag', set)

  function pose(t) {
    // t: 0 = assembled, seen from the front; 1 = turned and pulled apart
    const tall = tallMQ.matches
    const w = set.offsetWidth
    const ry = (tall ? -44 : -52) * t
    const rx = 7 * t
    const gap = w * (tall ? 0.13 : 0.115) * t
    gsap.set(set, { rotationY: ry, rotationX: rx, scale: 1 - (tall ? 0.34 : 0.3) * t, x: w * (tall ? 0.02 : 0.03) * t, y: w * 0.015 * t })
    planes.forEach(({ plane }, i) => gsap.set(plane, { z: (i - mid) * gap }))
    gsap.set(edges, { opacity: Math.min(1, t * 2.2) })
    gsap.set(tags, { opacity: Math.max(0, t * 2.5 - 1.2) })
    set.style.setProperty('--sh', (0.5 * (1 - Math.min(1, t * 1.6))).toFixed(3))
  }

  if (reduce) {
    pose(1)
    return
  }
  const state = { t: 0 }
  pose(0)
  gsap.to(state, {
    t: 1,
    ease: 'power2.inOut',
    onUpdate: () => pose(state.t),
    scrollTrigger: {
      trigger: '#anatomy',
      start: 'top top',
      end: () => `+=${innerHeight * 1.35}`,
      scrub: 0.7,
      invalidateOnRefresh: true,
      onRefresh: () => pose(state.t),
    },
  })
  // then a slow turn while it stays pinned, so the stack never sits dead still
  gsap.fromTo(
    '#rig',
    { rotationY: 0 },
    { rotationY: 7, ease: 'none', scrollTrigger: { trigger: '#anatomy', start: () => `top+=${innerHeight * 1.2} top`, end: 'bottom bottom', scrub: 0.7 } },
  )
  gsap.from('.anatomy .display span', {
    yPercent: 60,
    opacity: 0,
    duration: 1.1,
    stagger: 0.09,
    ease: 'expo.out',
    scrollTrigger: { trigger: '#anatomy', start: 'top 55%', once: true },
  })
  gsap.from('.sheets li', { opacity: 0, x: -18, duration: 0.8, stagger: 0.05, scrollTrigger: { trigger: '#anatomy', start: 'top 30%', once: true } })
}
