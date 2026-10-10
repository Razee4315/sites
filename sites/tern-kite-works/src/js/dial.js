// The Beaufort dial. Dragging it changes the weather on the whole site, and the kite beside it shows you why.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, ease, onFrame, onResize, reduced } from './env.js'
import { BEAUFORT, wind } from './wind.js'
import { Rig } from './rig.js'

// how the demonstration kite carries itself at each force: height (in kite-lengths; + is lower), lean, liveliness, looping
const CARRIAGE = [
  { y: 0.42, r: 58, sway: 0.0, loop: 0 },
  { y: 0.26, r: 20, sway: 0.5, loop: 0 },
  { y: 0.1, r: 6, sway: 0.8, loop: 0 },
  { y: 0, r: 0, sway: 1, loop: 0 },
  { y: -0.05, r: -3, sway: 1.15, loop: 0 },
  { y: -0.09, r: -5, sway: 1.35, loop: 0.05 },
  { y: -0.1, r: -6, sway: 1.5, loop: 0.3 },
  { y: -0.02, r: 0, sway: 1.6, loop: 1 },
]

export function initDial(fleet) {
  const section = $('.wind')
  const dial = $('.dial')
  const input = $('.dial__input')
  const track = $('.dial__track')
  const thumb = $('.dial__thumb')
  const num = $('.dial__num')
  const name = $('.dial__name')
  const knots = $('.dial__knots')
  const say = $('.dial__say')
  const chips = $$('.dial__kites li')

  const rig = new Rig($('[data-rig="wind"]'))
  const carry = { x: 0, y: 0, r: 0 }
  const kite = rig.add($('[data-flyer="wind"]'), {
    bridle: [0.5, 0.33],
    rest: -9,
    sway: 1,
    // the line runs down to the thumb of the dial: you are, quite literally, holding it
    anchor: () => hand,
    tails: [{ at: [0.5, 0.985], length: 1.15, width: 0.04}],
  })
  kite.layers.push(carry)
  const hand = { x: 0, y: 0 }
  let trackBox = { left: 0, top: 0, width: 1, height: 1 }
  const measure = onResize(() => {
    rig.measure()
    const s = section.getBoundingClientRect()
    const t = track.getBoundingClientRect()
    trackBox = { left: t.left - s.left, top: t.top - s.top, width: t.width, height: t.height }
    placeThumb(true)
  })

  let shown = Number(input.value)
  let thumbX = 0
  let thumbTo = 0
  function placeThumb(now) {
    thumbTo = (Number(input.value) / 7) * trackBox.width
    if (now || reduced) thumbX = thumbTo
  }

  function set(force, quiet) {
    const b = BEAUFORT[force]
    const c = CARRIAGE[force]
    const dir = force > shown ? 1 : -1
    wind.force = force
    placeThumb()
    dial.classList.toggle('is-none', b.fly.length === 0)
    chips.forEach((li) => li.classList.toggle('is-on', b.fly.includes(li.dataset.k)))
    input.setAttribute('aria-valuetext', `Force ${force}, ${b.name}`)

    gsap.to(carry, { y: c.y * kite.h, r: c.r, duration: reduced ? 0 : 1.8, ease: 'power3.out', overwrite: true })
    gsap.to(kite, { sway: c.sway, loop: c.loop, duration: reduced ? 0 : 1.4, ease: 'power2.out', overwrite: true })

    if (force === shown && !quiet) return
    shown = force
    if (quiet || reduced) {
      num.innerHTML = `<b>${force}</b>`
      name.textContent = b.name
      knots.textContent = b.knots
      say.textContent = b.say
      return
    }
    // the numeral rolls like a counter; the words are swapped under a quick dip
    const old = num.querySelector('b:last-child')
    const next = document.createElement('b')
    next.textContent = force
    num.append(next)
    gsap.killTweensOf(num.children)
    ;[...num.children].slice(0, -2).forEach((n) => n.remove())
    gsap.set(next, { position: 'absolute', left: 0, top: 0 })
    gsap.fromTo(next, { yPercent: 100 * dir }, { yPercent: 0, duration: 0.8, ease: 'expo.out' })
    if (old)
      gsap.to(old, {
        yPercent: -100 * dir,
        duration: 0.8,
        ease: 'expo.out',
        onComplete: () => {
          old.remove()
          gsap.set(next, { clearProps: 'position,left,top' })
        },
      })
    gsap
      .timeline({ overwrite: true })
      .to([name, knots, say], { opacity: 0, y: -8 * dir, duration: 0.16, ease: 'power1.in', stagger: 0.02 })
      .add(() => {
        name.textContent = b.name
        knots.textContent = b.knots
        say.textContent = b.say
      })
      .fromTo([name, knots, say], { opacity: 0, y: 12 * dir }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05 })
  }

  num.style.position = 'relative'
  input.addEventListener('input', () => set(Number(input.value)))
  input.addEventListener('pointerdown', () => track.classList.add('is-held'))
  addEventListener('pointerup', () => track.classList.remove('is-held'))
  track.dataset.vane = 'Drag'

  // the chips take you to that kite in the fleet
  $$('.dial__kites a').forEach((a) =>
    a.addEventListener(
      'click',
      (e) => {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (a.parentElement.classList.contains('is-on')) fleet.go(Number(a.dataset.fleet))
      },
      true,
    ),
  )

  measure()
  set(3, true)
  ScrollTrigger.addEventListener('refresh', measure)

  // leave the section and the weather goes back to a steady force 3
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onLeave: () => (wind.force = 3),
    onLeaveBack: () => (wind.force = 3),
    onEnter: () => (wind.force = Number(input.value)),
    onEnterBack: () => (wind.force = Number(input.value)),
  })

  if (reduced) {
    thumb.style.transform = `translate3d(${thumbTo}px,0,0)`
    input.addEventListener('input', () => {
      thumb.style.transform = `translate3d(${thumbTo}px,0,0)`
      hand.x = trackBox.left + thumbTo
      hand.y = trackBox.top + trackBox.height / 2
      rig.settle()
    })
    hand.x = trackBox.left + thumbTo
    hand.y = trackBox.top + trackBox.height / 2
    requestAnimationFrame(() => rig.settle())
    return
  }

  onFrame((dt) => {
    if (!rig.seen.on) return
    thumbX += (thumbTo - thumbX) * ease(16, dt)
    const lean = (thumbTo - thumbX) * 0.25
    thumb.style.transform = `translate3d(${thumbX.toFixed(2)}px,0,0) rotate(${lean.toFixed(2)}deg)`
    hand.x = trackBox.left + thumbX
    hand.y = trackBox.top + trackBox.height / 2
    rig.frame(dt)
  })
}
