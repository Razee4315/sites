// Everything the page says that is not in index.html.

// Each production: its words, its paper colours, and how its seven sheets stand on stage.
// Layer values are CSS custom properties in container units of the stage (cqw / cqh).
export const productions = [
  {
    id: 'zf',
    numeral: 'I',
    title: ['Die', 'Zauberflöte'],
    english: 'The Magic Flute',
    composer: 'W. A. Mozart',
    year: 1791,
    note: 'Mozart’s last opera is a fairy tale that keeps changing its mind about who the villain is. We built it the way Schinkel drew it in 1816: a dome of stars and a queen who arrives on the moon. Ours has 412 stars. Each was cut twice — the first lot were too cheerful.',
    run: '12 Nov – 6 Dec',
    length: '2 h 20',
    fact: '412 stars',
    theme: { bg: '#0c1748', ink: '#f4ebd2', soft: '#b9bfe0', accent: '#e3ba5e', on: '#0c1748' },
    layers: {
      far: { h: '46cqh', b: '7cqh', tall: { h: '40cqh', b: '12cqh' } },
      flown: { x: '-13cqw', top: '-2cqh', w: 'max(56cqw, 72cqh)', tall: { x: '-6cqw', w: '104cqw', top: '-3cqh' } },
      'wing-l': { tall: { show: '24cqw' } },
      'wing-r': { tall: { show: '22cqw' } },
      hero: { h: '60cqh', x: '55%', b: '5cqh', from: 1, tall: { h: '56cqh', x: '56%', b: '8cqh' } },
      front: { h: '27cqh', b: '-11cqh', tall: { b: '-3cqh' } },
    },
  },
  {
    id: 'fh',
    numeral: 'II',
    title: ['Der fliegende', 'Holländer'],
    english: 'The Flying Dutchman',
    composer: 'Richard Wagner',
    year: 1843,
    note: 'Wagner was born four streets from here and would have hated this. His storm wants ninety players. Ours has six, and a sea of grey sugar paper that two people shake from the wings. It is still the loudest thing we do.',
    run: '14 Jan – 7 Feb',
    length: '2 h 15, no interval',
    fact: '9 red sails',
    theme: { bg: '#20282b', ink: '#ece7dc', soft: '#a9b4b3', accent: '#d2493c', on: '#f4ebd2' },
    layers: {
      far: { h: '40cqh', b: '16cqh', tall: { h: '36cqh', b: '22cqh' } },
      flown: { x: '4cqw', top: '-17cqh', w: 'max(60cqw, 76cqh)', tall: { w: '112cqw', top: '-12cqh' } },
      'wing-l': { show: '25cqw', tall: { show: '20cqw' } },
      'wing-r': { show: '27cqw', tall: { show: '20cqw' } },
      hero: { h: '58cqh', x: '50%', b: '10cqh', from: 1, idle: 'rock', tall: { h: '50cqh', x: '52%', b: '17cqh' } },
      front: { h: '31cqh', b: '-13cqh', idle: 'swell', tall: { b: '-4cqh' } },
    },
  },
  {
    id: 'ru',
    numeral: 'III',
    title: ['Rusalka'],
    english: 'A lyric fairy tale in three acts',
    composer: 'Antonín Dvořák',
    year: 1901,
    note: 'A water spirit gives up her voice to be loved by a prince, which is an awkward thing to do in an opera. The moon is one disc of Japanese silver paper with a single lamp behind it. When she sings to it we switch everything else off.',
    run: '4 – 28 Mar',
    length: '2 h 40',
    fact: '1 lamp',
    theme: { bg: '#0e2e2a', ink: '#e6efe6', soft: '#a2bdb2', accent: '#f0b2bd', on: '#0e2e2a' },
    layers: {
      far: { h: '40cqh', b: '6cqh', tall: { h: '38cqh', b: '14cqh' } },
      flown: { x: '9cqw', top: '-9cqh', w: 'max(66cqw, 84cqh)', tall: { w: '118cqw', x: '-4cqw', top: '-8cqh' } },
      'wing-l': { show: '29cqw', tall: { show: '25cqw' } },
      'wing-r': { show: '27cqw', tall: { show: '22cqw' } },
      hero: { h: '52cqh', x: '44%', b: '9cqh', from: -1, tall: { h: '50cqh', x: '50%', b: '9cqh' } },
      front: { h: '27cqh', b: '-10cqh', idle: 'reed', tall: { b: '-3cqh' } },
    },
  },
  {
    id: 'or',
    numeral: 'IV',
    title: ['Orfeo ed', 'Euridice'],
    english: 'Orpheus and Eurydice',
    composer: 'C. W. Gluck',
    year: 1762,
    note: 'He may lead her out of the underworld on one condition: he must not look back. The set is black paper and one orange lamp. Euridice travels on her own slide, always a hand’s width behind his. On most nights someone in the audience tells him not to turn round.',
    run: '22 Apr – 16 May',
    length: '1 h 35',
    fact: '0 backward glances',
    theme: { bg: '#161312', ink: '#ece4d8', soft: '#a89f95', accent: '#ff7a3c', on: '#161312' },
    layers: {
      far: { h: '38cqh', b: '8cqh', tall: { h: '36cqh', b: '16cqh' } },
      flown: { x: '0cqw', top: '-12cqh', w: 'max(74cqw, 86cqh)', tall: { w: '120cqw', top: '-10cqh' } },
      'wing-l': { show: '27cqw', tall: { show: '22cqw' } },
      'wing-r': { show: '29cqw', tall: { show: '22cqw' } },
      hero: { h: '52cqh', x: '50%', b: '8cqh', from: 1, tall: { h: '50cqh', x: '52%', b: '9cqh' } },
      front: { h: '26cqh', b: '-13cqh', idle: 'flicker', tall: { b: '-3cqh' } },
    },
  },
  {
    id: 'vx',
    numeral: 'V',
    title: ['Příhody lišky', 'Bystroušky'],
    english: 'The Cunning Little Vixen',
    composer: 'Leoš Janáček',
    year: 1924,
    note: 'Janáček found his heroine in a newspaper comic strip and gave her the best music he ever wrote about growing old. It is the only opera in our season that happens in daylight. There are some 2,300 leaves, cut over one winter by one person, who would like you to notice.',
    run: '3 – 27 Jun',
    length: '1 h 50',
    fact: '2,300 leaves',
    theme: { bg: '#ead9b0', ink: '#3a2011', soft: '#7d5a36', accent: '#b9401a', on: '#f6ecd4' },
    layers: {
      far: { h: '34cqh', b: '15cqh', tall: { h: '30cqh', b: '20cqh' } },
      flown: { x: '2cqw', top: '-10cqh', w: 'max(58cqw, 70cqh)', tall: { w: '94cqw', top: '-7cqh' } },
      'wing-l': { show: '31cqw', tall: { show: '26cqw' } },
      'wing-r': { show: '27cqw', tall: { show: '22cqw' } },
      hero: { h: '34cqh', x: '40%', b: '12cqh', from: -1, tall: { h: '30cqh', x: '46%', b: '13cqh' } },
      front: { h: '26cqh', b: '-9cqh', tall: { b: '-3cqh' } },
    },
  },
]

// The seven sheets of a scene, back to front, as the anatomy section names them.
export const sheets = [
  { kind: 'back', name: 'Backcloth', spec: 'Mulberry paper in nine bands' },
  { kind: 'far', name: 'Ground row, far', spec: 'The opposite shore, 6 mm high firs' },
  { kind: 'flown', name: 'Flown piece', spec: 'Silver moon on three linen threads' },
  { kind: 'wing-l', name: 'Wing, stage left', spec: 'Willow: 212 separate leaves' },
  { kind: 'wing-r', name: 'Wing, stage right', spec: 'Three birches and a fir' },
  { kind: 'hero', name: 'Figure, on her slide', spec: 'Rusalka, 96 mm seated' },
  { kind: 'front', name: 'Ground row, near', spec: 'Reeds, and three lilies' },
]

export const cast = [
  { img: 'zf-hero', name: 'The Queen of the Night', mid: true, opera: 'Die Zauberflöte', voice: 'Soprano', mm: 148, note: 'Her top F is sung from directly behind her left shoulder.' },
  { img: 'fig-papageno', name: 'Papageno', opera: 'Die Zauberflöte', voice: 'Baritone', mm: 131, note: '164 feathers. The cage has a door that opens.' },
  { img: 'fig-dutchman', name: 'The Dutchman', mid: true, opera: 'Der fliegende Holländer', voice: 'Bass-baritone', mm: 152, note: 'The tallest figure in the box, and the only one nobody likes to pack.' },
  { img: 'fig-senta', name: 'Senta', opera: 'Der fliegende Holländer', voice: 'Soprano', mm: 139, note: 'The portrait she holds is four millimetres wide.' },
  { img: 'ru-hero', name: 'Rusalka', opera: 'Rusalka', voice: 'Soprano', mm: 96, note: 'Seated. Her hair took longer than the lake.' },
  { img: 'fig-jezibaba', name: 'Ježibaba', mid: true, opera: 'Rusalka', voice: 'Mezzo-soprano', mm: 118, note: 'The cat is glued on. We tried it separately. It wandered.' },
  { img: 'or-hero', name: 'Orfeo', opera: 'Orfeo ed Euridice', voice: 'Countertenor', mm: 141, note: 'Faces forward. Was not given a choice.' },
  { img: 'fig-euridice', name: 'Euridice', mid: true, opera: 'Orfeo ed Euridice', voice: 'Soprano', mm: 138, note: 'Her veil is one layer of tissue. Do not breathe on it.' },
  { img: 'vx-hero', name: 'Bystrouška', opera: 'The Cunning Little Vixen', voice: 'Soprano', mm: 62, note: 'Sixty-two millimetres at the shoulder, and she knows it.', wide: true },
  { img: 'fig-forester', name: 'The Forester', opera: 'The Cunning Little Vixen', voice: 'Baritone', mm: 136, note: 'The pipe is not lit. People ask.' },
]

export const people = [
  { img: 'sil-1', name: 'Henrike Vossberg', role: 'Founder, cutter', line: 'Cuts every sheet. Left-handed, which is why the trees lean.' },
  { img: 'sil-2', name: 'Tomasz Brzeziński', role: 'Music director, harmonium', line: 'Reduces ninety parts to six. Apologises to the composers by name.' },
  { img: 'sil-3', name: 'Amara Okonkwo-Lindt', role: 'Soprano', line: 'Sings the Queen and Rusalka on alternate nights, and the Vixen for fun.' },
  { img: 'sil-4', name: 'Jonas Rehfeldt', role: 'Baritone', line: 'Has been the Dutchman 61 times. Still gets seasick at the storm.' },
  { img: 'sil-5', name: 'Mirela Dragan', role: 'Cello', line: 'Is the entire string section and would like that on record.' },
  { img: 'sil-6', name: 'Arvid Sellin', role: 'Clarinet', line: 'Seventy-six. Has played every performance since the first. Refuses to be thanked.' },
  { img: 'sil-7', name: 'Kofi Brandt', role: 'Lamps', line: 'Thirty-eight lamps on one dimmer board he soldered himself.' },
  { img: 'sil-8', name: 'Liesl Aumann', role: 'Slides', line: 'Moves every figure by hand, in the dark, on a count of four.' },
]

// Upcoming nights. Seats already gone are derived from the date, so they stay put between visits.
export const nights = [
  { p: 'zf', date: '2026-11-12', time: '19:30', tag: 'First night' },
  { p: 'zf', date: '2026-11-14', time: '19:30' },
  { p: 'zf', date: '2026-11-15', time: '15:00', tag: 'Matinée' },
  { p: 'zf', date: '2026-11-21', time: '19:30' },
  { p: 'fh', date: '2027-01-14', time: '19:30', tag: 'First night' },
  { p: 'fh', date: '2027-01-16', time: '19:30' },
  { p: 'ru', date: '2027-03-04', time: '19:30', tag: 'First night' },
  { p: 'ru', date: '2027-03-07', time: '15:00', tag: 'Matinée' },
  { p: 'or', date: '2027-04-22', time: '19:30', tag: 'First night' },
  { p: 'vx', date: '2027-06-03', time: '19:30', tag: 'First night' },
  { p: 'vx', date: '2027-06-27', time: '15:00', tag: 'Last sheet of the season' },
]

export const PRICE = 38
