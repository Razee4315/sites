// Commission (the dye preview and the form that sends nothing) and the night-time footer.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, onFrame, onResize, reduced, whileVisible } from './env.js'
import { wind } from './wind.js'
import { Rig } from './rig.js'

export function initSend() {
  // ── dye: four registered photographs of the same kite, cross-faded ──
  const stack = $('.dye__stack')
  const frames = $$('.dye__stack img')
  const label = $('.dye__name b')
  const radios = $$('.form__dyes input')
  label.innerHTML = `<i>${label.textContent}</i>`
  let dye = 0
  radios.forEach((r, i) =>
    r.addEventListener('change', () => {
      if (i === dye) return
      const from = frames[dye]
      const to = frames[i]
      dye = i
      frames.forEach((f) => f.classList.toggle('is-on', f === to))
      frames[0].alt = `Ostro kite dyed ${r.value.toLowerCase()}.`
      if (reduced) {
        gsap.set(frames, { opacity: (k) => (k === i ? 1 : 0) })
        label.firstChild.textContent = r.value
        return
      }
      gsap.killTweensOf(frames)
      gsap.set(frames, { opacity: (k) => (frames[k] === from ? 1 : 0), zIndex: (k) => (frames[k] === to ? 2 : 1) })
      // the new colour soaks in while the kite takes a small gust
      gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' })
      gsap.set(from, { opacity: 0, delay: 0.7 })
      gsap.fromTo(stack, { rotation: -5, scale: 0.97 }, { rotation: 0, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.5)' })
      const word = label.firstChild
      gsap.to(word, {
        yPercent: -110,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          word.textContent = r.value
          gsap.fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' })
        },
      })
    }),
  )
  // it hangs there, turning slightly, like something on a thread
  if (!reduced) {
    const seen = whileVisible(stack)
    const sway = $('.dye')
    onFrame(() => {
      if (!seen.on) return
      const a = Math.sin(wind.t * 0.9) * 2.2 * wind.now + wind.gust * 3
      sway.style.transform = `rotate(${a.toFixed(2)}deg)`
    })
    sway.style.transformOrigin = '50% 0%'
  }

  // ── form: validates like a real one, sends nothing, says so ──
  const form = $('.form')
  const done = $('.form__done')
  const doneText = $('.form__done-text')
  const fields = [
    { input: $('#f-name'), err: $('#e-name'), ok: (v) => v.trim().length > 1 },
    { input: $('#f-mail'), err: $('#e-mail'), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
  ]
  const check = (f, show) => {
    const good = f.ok(f.input.value)
    if (show || good) {
      f.err.hidden = good
      f.input.closest('.field').classList.toggle('is-bad', !good)
      f.input.setAttribute('aria-invalid', String(!good))
      if (!good) f.input.setAttribute('aria-describedby', f.err.id)
      else f.input.removeAttribute('aria-describedby')
    }
    return good
  }
  fields.forEach((f) => {
    f.input.addEventListener('blur', () => f.input.value && check(f, true))
    f.input.addEventListener('input', () => check(f, false))
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const bad = fields.filter((f) => !check(f, true))
    if (bad.length) {
      bad[0].input.focus()
      if (!reduced) gsap.fromTo(bad.map((f) => f.input.closest('.field')), { x: -8 }, { x: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.3)' })
      return
    }
    const name = $('#f-name').value.trim().split(/\s+/)[0]
    const kite = $('#f-kite').value
    const colour = radios[dye].value.toLowerCase()
    const what = kite === 'Not sure yet' ? `a kite in ${colour}` : `${/^[AEIOU]/.test(kite) ? 'an' : 'a'} ${kite} in ${colour}`
    doneText.textContent = `Thank you, ${name}. If Tern were real there would now be ${what} with your name on a label, eleven weeks from the cliff. It isn't, so nothing has been sent anywhere. The wind noticed, though.`
    form.classList.add('is-sent')
    done.hidden = false
    if (!reduced) {
      gsap.fromTo(done.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.1 })
    }
    done.querySelector('button').focus({ preventScroll: true })
  })
  $('[data-again]').addEventListener('click', () => {
    form.reset()
    radios[dye].checked = true
    form.classList.remove('is-sent')
    done.hidden = true
    $('#f-name').focus({ preventScroll: true })
  })
}

export function initFoot() {
  const foot = $('.foot')
  const rig = new Rig($('[data-rig="foot"]'))
  const mobile = () => innerWidth <= 820
  const kite = rig.add($('[data-flyer="foot"]'), {
    bridle: [0.5, 0.36],
    rest: -16,
    sway: 1.7,
    line: 'rgba(242, 236, 223, 0.5)',
    lineFade: mobile() ? 0.16 : 0,
    anchor: () => ({ x: rig.w * (mobile() ? 0.7 : 0.6), y: rig.h - rig.w * (mobile() ? 0.3 : 0.12) }),
  })
  onResize(() => rig.measure())
  ScrollTrigger.addEventListener('refresh', () => rig.measure())

  if (reduced) {
    requestAnimationFrame(() => rig.settle())
    return
  }
  onFrame((dt) => rig.frame(dt))

  // the land comes up to meet you; the moon goes the other way
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: foot, start: 'top bottom', end: 'bottom bottom', scrub: true } })
  tl.fromTo('.foot__land--far', { yPercent: 60 }, { yPercent: 0 }, 0)
    .fromTo('.foot__land--mid', { yPercent: 90 }, { yPercent: 0 }, 0)
    .fromTo('.foot__land--near', { yPercent: 130 }, { yPercent: 0 }, 0)
    .fromTo('.foot__moon', { yPercent: 160 }, { yPercent: 0 }, 0)
    .fromTo('.foot__word', { yPercent: 70 }, { yPercent: 0 }, 0)
  kite.pose.s = 1
}
