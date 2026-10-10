import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, clamp, reduce, starfield } from './util.js'

// dusk drains out of the sky, the stars come up and the lamp goes on in the tent
export function night() {
  const sec = $('.night')
  starfield($('.night__stars'), { density: 0.00016, bright: 0.9 })
  const [, tentNight] = $$('.night__tent img')
  gsap.set('.night__stars', { opacity: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top 40%', end: 'bottom bottom', scrub: reduce ? true : 0.6 } })
  tl.to('.night__dusk', { opacity: 0, duration: 5 }, 0)
    .to('.night__wheel', { opacity: 0.9, duration: 5 }, 1.5)
    .to('.night__stars', { opacity: 1, duration: 4 }, 2)
    .to(tentNight, { opacity: 1, duration: 2.5 }, 2.6)
    .to('.night__glow', { opacity: 1, duration: 3 }, 3)
    .set({}, {}, 10)
  if (!reduce) {
    tl.fromTo('.night__far', { yPercent: 7 }, { yPercent: 0, duration: 10 }, 0)
      .fromTo('.night__near', { yPercent: 18 }, { yPercent: 0, duration: 10 }, 0)
      .fromTo('.night__tent', { yPercent: 40 }, { yPercent: 0, duration: 10 }, 0)
  }

  // the sky only turns while you can see it
  const wheel = $('.night__wheel img')
  new IntersectionObserver(([e]) => (wheel.style.animationPlayState = e.isIntersecting && !reduce ? 'running' : 'paused')).observe(sec)
}

// where today falls in the season
export function season() {
  const now = new Date()
  const year = now.getFullYear()
  const doy = (d) => Math.floor((d - new Date(year, 0, 1)) / 864e5)
  const open = new Date(year, 5, 20)
  const close = new Date(year, 9, 15)
  const today = $('.season__today')
  today.style.left = `${clamp(doy(now) / 365) * 100}%`
  const days = (a, b) => Math.max(1, Math.round((b - a) / 864e5))
  const status = $('.season__status')
  if (now < open) status.textContent = `Closed · opens in about ${days(now, open)} days`
  else if (now <= close) status.textContent = `Open now · closes in about ${days(now, close)} days`
  else status.textContent = `Closed · opens in about ${days(now, new Date(year + 1, 5, 20))} days`

  gsap.from(['.season__open', '.season__peak'], { scaleX: 0, duration: 1.6, ease: 'expo.out', stagger: 0.2, scrollTrigger: { trigger: '.season', start: 'top 85%', once: true } })
  gsap.from(today, { scaleY: 0, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.6, scrollTrigger: { trigger: '.season', start: 'top 85%', once: true } })
}

// the enquiry form: nothing is sent, but it behaves
export function form(scrollTo) {
  const f = $('.form')
  const body = $('.form__body', f)
  const done = $('.form__done', f)
  const val = $('.stepper__val', f)
  let people = 2

  $$('[data-step]', f).forEach((b) =>
    b.addEventListener('click', () => {
      people = clamp(people + Number(b.dataset.step), 1, 8)
      val.textContent = people
      gsap.fromTo(val, { yPercent: 40 * Number(b.dataset.step), opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out' })
    }),
  )

  // choosing a crossing further up fills the form in
  $$('[data-trip]').forEach((a) =>
    a.addEventListener('click', () => {
      const r = $(`input[name="trip"][value="${a.dataset.trip}"]`, f)
      if (r) r.checked = true
    }),
  )

  const check = (input) => {
    const field = input.closest('.field')
    const err = $('.field__err', field)
    let msg = ''
    if (!input.value.trim()) msg = input.name === 'name' ? 'We need something to call you' : 'We need somewhere to write back'
    else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) msg = 'That address looks unfinished'
    field.classList.toggle('is-bad', !!msg)
    input.setAttribute('aria-invalid', msg ? 'true' : 'false')
    err.textContent = msg
    return !msg
  }
  const required = $$('input[required]', f)
  required.forEach((i) => i.addEventListener('input', () => i.closest('.field').classList.contains('is-bad') && check(i)))

  f.addEventListener('submit', (e) => {
    e.preventDefault()
    const bad = required.filter((i) => !check(i))
    if (bad.length) {
      bad[0].focus()
      if (!reduce) gsap.fromTo(bad.map((i) => i.closest('.field')), { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' })
      return
    }
    const data = new FormData(f)
    const name = String(data.get('name')).trim().split(/\s+/)[0]
    $('.form__who', f).textContent = name
    $('.form__sum', f).textContent = `${data.get('trip')}, ${data.get('month')} 2027, for ${people === 1 ? 'one' : people}. We will write to ${String(data.get('email')).trim()} from Skardu within two days, sooner if the power is on.`
    gsap.to(body, {
      opacity: 0,
      y: -16,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        body.hidden = true
        done.hidden = false
        gsap.fromTo([...done.children], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' })
        done.focus?.()
        ScrollTrigger.refresh()
      },
    })
  })

  $('.form__again', f).addEventListener('click', () => {
    done.hidden = true
    body.hidden = false
    gsap.fromTo(body, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' })
    $('input[name="name"]', f).focus()
    ScrollTrigger.refresh()
  })
}
