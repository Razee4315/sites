// Builds the seven worlds from the data, then wires their scroll choreography.
import { gsap, ScrollTrigger, $, $$, img, has, still, splitWords, scrollTo, lock, mqDesk } from './core.js'
import { icon } from './icons.js'
import { species, byId, inWorld } from '../data/species.js'
import { WORLDS, ORDER } from '../data/worlds.js'
import credits from '../data/credits.json'

// ------------------------------------------------------------------ pieces
const card = (s, cls = '', sizes = '(min-width: 900px) 22vw, 46vw') => `
  <button class="card ${cls}" type="button" data-species="${s.id}" data-cursor="open">
    <span class="card__art">${img(`sp-${s.id}`, { alt: '', sizes })}</span>
    <span class="card__meta"><span class="card__name">${s.name}</span><span class="card__sci sci">${s.sci}</span></span>
  </button>`

const credit = (id) => {
  const c = credits[id]
  return c ? ` <span class="by">Photo: ${c.author || 'unknown'}, <a href="${c.page}" target="_blank" rel="noopener">${c.licence}</a></span>` : ''
}
// a photograph seen through two sheets of cut paper
const win = (id, caption, cls = '', sizes = '(min-width: 900px) 60vw, 92vw') => `
  <figure class="window ${cls}" data-parallax="0.1">
    <div class="window__photo">${img(`ph-${id}`, { alt: caption, sizes })}</div>
    <div class="window__sheet window__sheet--1"></div><div class="window__sheet window__sheet--2"></div>
    <figcaption class="mono">${caption}.${credit(id)}</figcaption>
  </figure>`
// a photograph as a loose print
const print = (id, caption, cls = '') => `
  <figure class="print ${cls}" data-tilt>
    <div class="print__in">${img(`ph-${id}`, { alt: caption, sizes: '(min-width: 900px) 30vw, 80vw' })}</div>
    <figcaption class="mono">${caption}.${credit(id)}</figcaption>
  </figure>`
const fact = (big, small) => `<li class="fact" data-reveal><b class="display">${big}</b><span>${small}</span></li>`
const gen = (text = 'Paper scene · generated') => `<span class="gen mono">${icon('scissors')} ${text}</span>`

const head = (w, extra = '') => {
  const d = WORLDS[w]
  return `
  <header class="world__head">
    <span class="world__n display" aria-hidden="true" data-parallax="-0.25">${d.n}</span>
    <p class="world__k"><span class="tag tag--accent">${icon(w)} ${d.kicker}</span><span class="mono">World ${d.n} of VII</span></p>
    <h2 class="world__title display" data-split>${d.title}</h2>
    <p class="world__lede lede" data-reveal>${d.lede}</p>
    ${extra}
  </header>`
}
const floater = (id, cls, depth) => `<div class="floater ${cls}" data-parallax="${depth}" aria-hidden="true">${img(`sp-${id}`, { sizes: '(min-width: 900px) 34vw, 60vw' })}</div>`

// ------------------------------------------------------------------ the seven bodies
const body = {
  plants: () => `
    ${head('plants', floater('sedge', 'floater--a', -0.18) + floater('poa', 'floater--b', 0.14))}
    <div class="cols">
      <p class="body" data-reveal>Deosai is alpine meadow alternating with drier, stony ground. The growing season runs from about mid-May to September; everything on this page lives its whole year inside it.</p>
      <p class="body" data-reveal>How many plants? It depends who counted. A 1997 expedition listed about 340 species, the park’s 2006 baseline 460, and a 2016 survey of sample plots 132. Six of them, to begin:</p>
    </div>
    <div class="strip" data-cursor="drag">
      <div class="strip__track" data-stagger>${inWorld('plants').map((s) => card(s, 'card--stand')).join('')}</div>
    </div>
    <ul class="facts">
      ${fact('1998', 'The year a rush was named after this plateau: <em class="sci">Juncus deosaicus</em>, from a plant collected here at 3,900 m.')}
      ${fact('3', 'Lichens new to science described from Deosai between 2021 and 2024.')}
      ${fact('0', 'Trees. The tallest woody plants are willows that grow sideways.')}
    </ul>`,

  flowers: () => `
    ${head('flowers', floater('primula', 'floater--a', -0.2) + floater('gentian', 'floater--b', 0.16))}
    <div class="field" data-stagger>${inWorld('flowers', (s) => !s.small).map((s, i) => card(s, `card--bloom card--b${i + 1}`)).join('')}</div>
    ${win('bloom', 'Himalayan fleeceflower in bloom across the plains of Deosai', 'window--wide')}
    <div class="small">
      <div class="small__text">
        <p class="tag tag--accent">${icon('loupe')} The small print</p>
        <h3 class="display small__h" data-split>Now look down</h3>
        <p class="body" data-reveal>Most of what flowers on Deosai is smaller than your thumbnail, and built low to stay out of the wind. They are shown here about as small as they are. Move the lens over the ground to find them, and press one to open it.</p>
      </div>
      <div class="small__bed" data-cursor="none">
        <div class="small__field">
          ${[...inWorld('flowers', (s) => s.small), byId.thyme].map((s, i) => `<button class="tiny tiny--${i + 1}" type="button" data-species="${s.id}" aria-label="${s.name}">${img(`sp-${s.id}`, { alt: '', sizes: '300px' })}</button>`).join('')}
        </div>
        <div class="small__lens" aria-hidden="true"><div class="small__lens-in"></div></div>
      </div>
    </div>`,

  animals: () => `
    ${head('animals', floater('golden-eagle', 'floater--a', -0.3) + floater('marmot', 'floater--b', 0.12))}
    <div class="bear">
      <button class="bear__art" type="button" data-species="brown-bear" data-cursor="open" aria-label="Himalayan brown bear">${img('sp-brown-bear', { alt: 'Cut-paper Himalayan brown bear', sizes: '(min-width: 900px) 52vw, 92vw' })}</button>
      <div class="bear__text">
        <p class="tag tag--accent">The bear that came back</p>
        <h3 class="display bear__h"><span data-count="19">19</span> bears</h3>
        <p class="body" data-reveal>That was the count in 1993, and the reason the plateau was made a national park. The Himalayan brown bear breeds more slowly than any other brown bear population studied, so the recovery has taken thirty years and is not finished.</p>
        <ol class="chart" aria-label="Brown bears counted or estimated in Deosai">
          ${[[1993, 19], [2004, 38], [2006, 43], [2013, 56], [2022, 66]].map(([y, n]) => `<li style="--v:${n / 66}"><span class="chart__bar"><i></i></span><b class="display">${n}</b><span class="mono">${y}</span></li>`).join('')}
        </ol>
        <p class="mono chart__note">Counts and estimates use different methods and are not strictly comparable. 2022: 66 (95% range 58 to 77), park and buffer valleys.</p>
      </div>
    </div>
    <div class="lookout">
      <div class="lookout__text">
        <p class="tag tag--accent">Play · the lookouts</p>
        <h3 class="display lookout__h" data-split>Eighty to the square kilometre</h3>
        <p class="body" data-reveal>Golden marmots are the most common mammal on Deosai. One stands watch at the burrow, and when it whistles the whole colony drops. Catch a lookout before it sees you.</p>
        <p class="lookout__score"><b class="display lookout__n">00</b><span class="mono">spotted</span></p>
        <p class="lookout__msg mono" aria-live="polite">Press a marmot. Or a mound, and wait.</p>
      </div>
      <div class="lookout__field">
        ${[1, 2, 3, 4, 5].map((i) => `<button class="lookout__hole lookout__hole--${i}" type="button" data-cursor="spot" aria-label="Marmot burrow ${i}">
          <span class="lookout__burst" aria-hidden="true"></span>
          <span class="lookout__clip"><span class="lookout__marmot">${img('sp-marmot', { alt: '', sizes: '200px' })}</span></span>
          <span class="lookout__mound">${img('burrow', { alt: '', sizes: '320px' })}</span>
        </button>`).join('')}
      </div>
      <button class="lookout__more btn btn--small" type="button" data-species="marmot"><span class="btn__face"><span class="btn__label"><span>About the marmot</span><span>Open its sheet</span></span>${icon('arrow')}</span></button>
    </div>
    <div class="sub">
      <h3 class="display sub__h" data-split>On the ground</h3>
      <p class="body" data-reveal>Twelve kinds of mammal are confirmed for the park, most of them small: a pika, voles, a shrew, a stoat. These four are the ones people hope to see. Two of them keep to the rim.</p>
    </div>
    <div class="grid" data-stagger>${['wolf', 'red-fox', 'ibex', 'snow-leopard'].map((id) => card(byId[id], 'card--tile')).join('')}</div>
    <div class="sub">
      <h3 class="display sub__h" data-split>Overhead</h3>
      <p class="body" data-reveal>Dated, checkable records put at least 38 kinds of bird on the plateau, from ducks resting on Sheosar Lake in autumn to the eagles that keep the marmots nervous. And in the summer of 1999, pitfall traps here caught 43,751 ground invertebrates from 102 families. More than half were beetles.</p>
    </div>
    <div class="flock" data-stagger>${['lammergeier', 'citrine-wagtail', 'golden-eagle', 'horned-lark', 'kestrel', 'apollo'].map((id, i) => card(byId[id], `card--air card--a${i + 1}`)).join('')}</div>`,

  water: () => `
    ${head('water')}
    ${win('sheosar', 'Sheosar Lake, with Nanga Parbat in it twice', 'window--wide')}
    <ul class="facts">
      ${fact('Blind Lake', 'What <em>Sheosar</em> means in Shina. It lies at the western end of the park, 2.3 km long and 1.8 km wide, at 4,142 m or 4,250 m depending on whom you ask.')}
      ${fact('164–256', 'Small lakes on the plateau in any one late summer, counted from satellite images over thirty years. Only 66 of them are there every time.')}
      ${fact('3', 'River systems rise in the park: Shatung, Bara Pani and Kala Pani. The names mean what they sound like: <em>big water</em>, <em>black water</em>.')}
    </ul>
    <div class="flow">
      <div class="flow__text">
        <p class="tag tag--accent">${icon('water')} Where the water goes</p>
        <h3 class="display flow__h" data-split>Out, across a border, and back</h3>
        <p class="body" data-reveal>The three streams gather into the Shigar (not the one near Skardu), which joins the Shingo and crosses into Kargil. There the Dras and the Suru join it, and the whole river turns back into Baltistan to meet the Indus near Marol. The plateau’s north edge takes a shortcut: it drains to Satpara Lake and reaches the Indus at Skardu.</p>
      </div>
      <ol class="flow__steps" data-stagger>
        ${['Shatung · Bara Pani · Kala Pani', 'Shigar', 'Shingo', 'Dras', 'Suru', 'Indus'].map((r, i) => `<li><span class="mono">${String(i + 1).padStart(2, '0')}</span><b>${r}</b>${icon('down')}</li>`).join('')}
      </ol>
    </div>
    <div class="prints">
      ${print('barapani', 'Bara Pani, the largest river crossing the park', 'print--a')}
      ${print('kalapani', 'Kala Pani', 'print--b')}
    </div>`,

  fish: () => `
    <div class="fish__waves" aria-hidden="true" data-parallax="-0.3">${img('waves', { sizes: '120vw' })}</div>
    ${head('fish')}
    <div class="pond" data-cursor="scatter">
      ${['osman', 'snowtrout', 'loach', 'osman', 'snowtrout', 'loach', 'osman', 'snowtrout'].map((id, i) => `<button class="pond__fish pond__fish--${i + 1}" type="button" data-species="${id}" data-depth="${[1, 0.8, 0.6, 0.55, 1.1, 0.9, 0.75, 0.5][i]}" aria-label="${byId[id].name}" ${i > 2 ? 'tabindex="-1" aria-hidden="true"' : ''}>${img(`sp-${id}`, { alt: '', sizes: '(min-width: 900px) 24vw, 46vw' })}</button>`).join('')}
      <div class="pond__bed" aria-hidden="true">${img('bed', { sizes: '120vw' })}</div>
      <p class="pond__hint mono">${icon('drag')} Move through the water. Press to scatter them. ${gen('Paper fish · generated')}</p>
    </div>
    <div class="grid grid--3" data-stagger>${inWorld('fish').map((s) => card(s, 'card--tile')).join('')}</div>`,

  mountains: () => `
    ${head('mountains')}
    <div class="rim" aria-hidden="true">
      <div class="rim__sun" data-rim="-0.5">${img('sun', { sizes: '30vw' })}</div>
      <div class="rim__layer rim__layer--far" data-rim="0.1">${img('rim-far', { sizes: '130vw' })}</div>
      <div class="rim__layer rim__layer--mid" data-rim="0.28">${img('rim-mid', { sizes: '130vw' })}</div>
      <div class="rim__layer rim__layer--near" data-rim="0.6">${img('rim-near', { sizes: '130vw' })}</div>
      ${gen()}
    </div>
    <ul class="facts">
      ${fact('8,126 m', 'Nanga Parbat, the ninth-highest mountain on Earth. On a clear day you can see it from Sheosar Lake.')}
      ${fact('K2', 'From Burji La, the pass on the north rim, the view in clear weather takes in K2, Nanga Parbat, Masherbrum, the Gasherbrums and part of Broad Peak.')}
      ${fact('35 million years', 'How long, at least, this surface has been wearing down by less than 250 m per million years. Deosai is a leftover scrap of an older, larger high plateau.')}
    </ul>
    <div class="duo">
      ${win('nanga', 'Nanga Parbat from the Deosai plains')}
      <div class="duo__text">
        <h3 class="display" data-split>Flat is the strange part</h3>
        <p class="body" data-reveal>The middle of the park is nearly level. Almost two thirds of it lies between 4,000 and 4,500 m, and the Deosai Mountains around it rise another thousand metres, several of them past 5,500 m.</p>
        <p class="body" data-reveal>An English traveller, G. T. Vigne, crossed in 1835 and was not impressed: “A more dreary and desolate-looking tract the sun cannot shine upon.” In the same pages he noted that the bears were very numerous.</p>
      </div>
    </div>`,

  sky: () => `
    ${head('sky')}
    <div class="lights">
      <div class="lights__pin">
        <div class="lights__stage">
          ${[1, 2, 3, 4].map((i) => `<div class="lights__img lights__img--${i}">${img(`sky-${i}`, { alt: i === 1 ? 'Cut-paper scene of a high lake, shown in four lights' : '', sizes: '(min-width: 900px) 100vw, 180vw' })}</div>`).join('')}
          <div class="lights__stars" aria-hidden="true">${Array.from({ length: 34 }, (_, i) => `<i style="--x:${(i * 37.7) % 100};--y:${(i * 53.3) % 46};--d:${(i % 7) * 0.5}s;--s:${1 + (i % 3)}"></i>`).join('')}</div>
        </div>
        <div class="lights__panel">
          ${[
            ['Noon', 'Thin air', 'Pakistan’s UNESCO file lists the conditions of life up here: low pressure, low oxygen, and intense ultraviolet light. The plants wear wool and hug the ground for a reason.'],
            ['Evening', 'Weather in minutes', 'Sun, cloud, icy wind and thunder take turns through a single afternoon. A visitor in July 2023 met light snow at Sheosar Lake.'],
            ['Blue hour', 'The cold comes back', 'Mean daily temperatures run from −20 °C to 12 °C across the year. On 5 September 1835, Vigne woke to hoar-frost and 6 °C inside his tent.'],
            ['Night', 'Nothing to light it', 'Nobody lives on the plains, so there is no town glow. One travel writer describes the stars as extremely visible, and the sky as enormous over so much open ground.'],
          ].map(([k, h, t], i) => `<article class="lights__text" data-i="${i}"><p class="tag tag--accent">${k}</p><h3 class="display">${h}</h3><p class="body">${t}</p></article>`).join('')}
        </div>
        <div class="lights__tabs" role="group" aria-label="Time of day">
          ${['Noon', 'Evening', 'Blue hour', 'Night'].map((k, i) => `<button type="button" class="lights__tab mono" data-i="${i}" data-cursor="go">${k}</button>`).join('')}
        </div>
        ${gen('One paper scene, four lights · generated')}
      </div>
    </div>
    <div class="duo duo--flip">
      ${print('night', 'A real night at Deosai: camp under the Milky Way', 'print--big')}
      <div class="duo__text">
        <h3 class="display" data-split>And the real thing</h3>
        <p class="body" data-reveal>No dark-sky survey has measured Deosai, so we will not quote you a number. What can be said is simple: four thousand metres up, no settlement on the plains, and the nearest town a mountain pass away.</p>
      </div>
    </div>`,
}

// ------------------------------------------------------------------ build
export function buildWorlds() {
  $('#worlds').innerHTML = ORDER.map((w) => `<section class="world world--${w} paper" id="w-${w}" data-world="${w}" aria-labelledby="t-${w}"><div class="world__edge" aria-hidden="true"></div><div class="world__in">${body[w]().replace('class="world__title', `id="t-${w}" class="world__title`)}</div></section>`).join('')

  // placeholders in the static HTML
  $$('[data-img]').forEach((el) => {
    const name = el.dataset.img
    const hero = !!el.closest('.hero')
    el.insertAdjacentHTML('afterbegin', img(name, { alt: el.closest('[aria-hidden]') ? '' : name, sizes: el.dataset.sizes || (hero ? (name.startsWith('hero-') ? 'max(108vw, 196vh)' : '40vh') : '(min-width: 900px) 40vw, 80vw'), eager: hero }))
  })
  $$('[data-credit]').forEach((el) => el.insertAdjacentHTML('beforeend', `.${credit(el.dataset.credit)}`))

  // credits list
  const label = (id) => byId[id]?.name || { plains: 'Deosai plains', sheosar: 'Sheosar Lake and Nanga Parbat', nanga: 'Nanga Parbat from Deosai', barapani: 'Bara Pani', kalapani: 'Kala Pani', night: 'Night camp at Deosai', bloom: 'Flowers of Deosai', winter: 'Deosai under snow' }[id]
  $('#credit-list').innerHTML = Object.entries(credits)
    .filter(([id]) => label(id) && has(`ph-${id}`))
    .map(([id, c]) => `<li><b>${label(id)}</b><span>${byId[id]?.plate ? 'Plate' : 'Photo'}: ${c.author || 'unknown'} · <a href="${c.page}" target="_blank" rel="noopener">${c.licence}</a></span></li>`)
    .join('')

  // navigation
  const all = [['top', '', 'The blank page', 'snow'], ...ORDER.map((w) => [`w-${w}`, WORLDS[w].n, WORLDS[w].title, w]), ['end', '', 'Then it snows', 'snow']]
  $('.rail').innerHTML = all.map(([id, n, t, w]) => `<a href="#${id}" data-go data-cursor="go" aria-label="${t}"><i></i><span class="mono">${n ? `${n} · ` : ''}${t}</span></a>`).join('')
  $('.index__list').innerHTML = ORDER.map((w) => `<li><a href="#w-${w}" data-go data-world="${w}"><span class="mono">${WORLDS[w].n}</span><b class="display">${WORLDS[w].title}</b><span class="index__kk mono">${icon(w)} ${WORLDS[w].kicker}</span></a></li>`).join('')
  return all
}

// ------------------------------------------------------------------ motion
export function animateWorlds(all) {
  const bar = $('.bar')
  const railLinks = $$('.rail a')
  const setWhere = (i) => {
    const [, n, t, w] = all[i]
    bar.dataset.world = w
    $('.rail').dataset.world = w
    $('.bar__where-n').textContent = n ? `${n} / VII` : ''
    $('.bar__where-t').textContent = t
    railLinks.forEach((a, j) => a.classList.toggle('is-on', j === i))
  }
  all.forEach(([id], i) => {
    ScrollTrigger.create({ trigger: `#${id}`, start: 'top 45%', end: 'bottom 45%', onToggle: (s) => s.isActive && setWhere(i) })
  })
  setWhere(0)

  // index overlay
  const index = $('#index')
  const btn = $('.bar__index')
  const toggle = (open) => {
    if (open === !index.hidden) return
    btn.setAttribute('aria-expanded', String(open))
    document.documentElement.classList.toggle('index-open', open)
    lock(open)
    if (open) {
      index.hidden = false
      if (!still) {
        gsap.fromTo(index, { yPercent: -102 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' })
        gsap.fromTo($$('.index__list li', index), { y: 60, opacity: 0, rotation: 3 }, { y: 0, opacity: 1, rotation: 0, duration: 0.9, stagger: 0.05, delay: 0.15 })
      }
      $('.index__list a', index).focus({ preventScroll: true })
    } else if (still) index.hidden = true
    else gsap.to(index, { yPercent: -102, duration: 0.6, ease: 'power3.in', onComplete: () => (index.hidden = true) })
  }
  btn.addEventListener('click', () => toggle(index.hidden))
  document.addEventListener('keydown', (e) => e.key === 'Escape' && toggle(false))
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]')
    if (!a) return
    e.preventDefault()
    toggle(false)
    const id = a.getAttribute('href')
    const y = id === '#top' ? 0 : id
    still ? document.querySelector(id)?.scrollIntoView() : gsap.delayedCall(a.closest('.index') ? 0.35 : 0, () => scrollTo(y, { offset: id === '#about' ? 0 : -1 }))
  })

  // drag-to-scroll strip
  $$('.strip').forEach((strip) => {
    let down = false, x0 = 0, s0 = 0, moved = 0
    strip.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; x0 = e.clientX; s0 = strip.scrollLeft })
    window.addEventListener('pointermove', (e) => { if (!down) return; moved = Math.abs(e.clientX - x0); strip.scrollLeft = s0 - (e.clientX - x0); if (moved > 6) strip.classList.add('is-drag') })
    window.addEventListener('pointerup', () => { down = false; setTimeout(() => strip.classList.remove('is-drag'), 0) })
    strip.addEventListener('click', (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault() } }, true)
  })

  // the four lights: tabs jump the scroll to that light
  const lights = $('.lights')
  const texts = $$('.lights__text')
  const tabs = $$('.lights__tab')
  let phase = -1
  const setPhase = (p) => {
    if (p === phase) return
    phase = p
    texts.forEach((t, i) => t.classList.toggle('is-on', i === p))
    tabs.forEach((t, i) => { t.classList.toggle('is-on', i === p); t.setAttribute('aria-pressed', String(i === p)) })
    lights.dataset.phase = p
  }
  setPhase(0)

  if (still) {
    // no scrubbing: show the lights as tabs only
    tabs.forEach((t, i) => t.addEventListener('click', () => { setPhase(i); $$('.lights__img').forEach((im, j) => (im.style.opacity = j <= i ? 1 : 0)) }))
    return
  }

  const lt = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: lights, start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: (s) => setPhase(Math.min(3, Math.floor(s.progress * 4))) } })
  lt.fromTo('.lights__stage', { scale: 1.12 }, { scale: 1, duration: 3 }, 0)
    .to('.lights__img--2', { opacity: 1, duration: 0.5 }, 0.5)
    .to('.lights__img--3', { opacity: 1, duration: 0.5 }, 1.25)
    .to('.lights__img--4', { opacity: 1, duration: 0.5 }, 2)
    .to('.lights__stars', { opacity: 1, duration: 0.4 }, 2.2)
    .to({}, { duration: 0.3 }, 2.7)
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    const st = lt.scrollTrigger
    scrollTo(st.start + (st.end - st.start) * (i / 4 + 0.13), { duration: 1.2 })
  }))

  // headings: words slide up from behind a cut edge
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el)
    gsap.from(words, { yPercent: 115, rotation: 6, duration: 1.1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
  })
  $$('[data-reveal]').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }))
  $$('[data-stagger]').forEach((box) => {
    gsap.from(box.children, { y: 80, opacity: 0, rotation: (i) => (i % 2 ? 5 : -5), duration: 1.1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: box, start: 'top 84%' } })
  })
  $$('[data-parallax]').forEach((el) => {
    const d = Number(el.dataset.parallax)
    gsap.fromTo(el, { yPercent: d * 100 }, { yPercent: -d * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  // each world arrives as a sheet sliding over the last one
  $$('.world__edge').forEach((el) => gsap.fromTo(el, { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true } }))

  // counters
  $$('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count)
    const plain = 'plain' in el.dataset
    const o = { v: plain ? to - 40 : 0 }
    const fmt = (v) => (plain ? String(Math.round(v)) : Math.round(v).toLocaleString('en-US'))
    gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
  })
  gsap.from('.chart__bar i', { scaleY: 0, duration: 1.3, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.chart', start: 'top 85%' } })

  // the bear walks in
  gsap.fromTo('.bear__art', { xPercent: -38, rotation: -4 }, { xPercent: 0, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.bear', start: 'top bottom', end: 'top 25%', scrub: 0.8 } })

  // the rim: three ranges sliding at their own speeds, the sun going down behind them
  $$('[data-rim]').forEach((el) => {
    const d = Number(el.dataset.rim)
    gsap.fromTo(el, { xPercent: d * 14, yPercent: d < 0 ? -30 : d * 26 }, { xPercent: -d * 14, yPercent: d < 0 ? 85 : 0, ease: 'none', scrollTrigger: { trigger: '.rim', start: 'top bottom', end: 'bottom top', scrub: true } })
  })

  // the page turns white: the two torn sheets close over the last photograph
  const end = $('.end')
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: end, start: 'top top', end: 'bottom bottom', scrub: 0.8 } })
    .fromTo('.end__photo', { scale: 1.15 }, { scale: 1, duration: 1 }, 0)
    .fromTo('.end__sheet--top', { yPercent: -100 }, { yPercent: 0, duration: 0.62, ease: 'power2.inOut' }, 0.2)
    .fromTo('.end__sheet--bot', { yPercent: 100 }, { yPercent: 0, duration: 0.62, ease: 'power2.inOut' }, 0.2)
    .to('.end__cap', { opacity: 0, duration: 0.15 }, 0.3)
    .fromTo('.end__text > *', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, stagger: 0.035, ease: 'power2.out' }, 0.7)

  // cards lift their portrait toward the pointer
  if (mqDesk.matches) {
    $$('.card').forEach((c) => {
      const art = $('.card__art', c)
      const x = gsap.quickTo(art, 'x', { duration: 0.6, ease: 'power3.out' })
      const y = gsap.quickTo(art, 'y', { duration: 0.6, ease: 'power3.out' })
      c.addEventListener('pointermove', (e) => { const b = c.getBoundingClientRect(); x(((e.clientX - b.left) / b.width - 0.5) * 22); y(((e.clientY - b.top) / b.height - 0.5) * 18) })
      c.addEventListener('pointerleave', () => { x(0); y(0) })
    })
  }
}
