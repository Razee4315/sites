// The five hours. Everything the day sequence needs: copy, light, shadow, and where each ingredient floats.
// items: x/y = centre in % of the viewport, w = width in vh, d = depth (below 1 sits behind the bottle, above 1 in front).

export const HOURS = [
  {
    id: 'lauds',
    name: 'Lauds',
    time: '05:40',
    h: 5 + 40 / 60,
    kicker: 'First light',
    text: 'The cold minute before the sun. Bergamot cut on wet stone, fig leaves still holding the night, white tea steeping in the dark.',
    notes: [
      ['Top', 'Bergamot, dew'],
      ['Heart', 'White tea, fig leaf'],
      ['Base', 'Wet stone, white musk'],
    ],
    caption: 'Fig terraces, eleven minutes before sunrise',
    theme: { bg: '#D9DFE6', ink: '#18202E', accent: '#A8644F', glow: '#FFEDE4' },
    sun: [10, 64, 0.85],
    shadow: [54, 1, 0.14],
    items: [
      { img: 'lauds-bergamot', x: 32, y: 36, w: 21, d: 0.85, r: -12 },
      { img: 'lauds-tea', x: 67, y: 25, w: 15, d: 0.6, r: 22, blur: 1 },
      { img: 'lauds-stone', x: 37.5, y: 77, w: 13, d: 1.15, r: 6 },
      { img: 'lauds-figleaf', x: 67.5, y: 63, w: 34, d: 1.55, r: 18, blur: 2.5 },
    ],
  },
  {
    id: 'terce',
    name: 'Terce',
    time: '09:10',
    h: 9 + 10 / 60,
    kicker: 'Morning',
    text: 'Shutters open. Orange blossom over the wall, a green mandarin split with a thumbnail, mint crushed underfoot on the way to the gate.',
    notes: [
      ['Top', 'Green mandarin, spearmint'],
      ['Heart', 'Orange blossom, petitgrain'],
      ['Base', 'White cedar, cotton musk'],
    ],
    caption: 'The orange grove, shutters just opened',
    theme: { bg: '#E3E9CF', ink: '#1A2A1B', accent: '#5F7B2E', glow: '#FFFCE2' },
    sun: [28, 20, 0.9],
    shadow: [31, 0.96, 0.2],
    items: [
      { img: 'terce-blossom', x: 67, y: 36, w: 26, d: 0.9, r: 10 },
      { img: 'terce-mint', x: 32, y: 26, w: 16, d: 0.6, r: -20, blur: 1 },
      { img: 'terce-mandarin', x: 37.5, y: 71, w: 17, d: 1.2, r: -8 },
      { img: 'terce-peel', x: 68.5, y: 76, w: 21, d: 1.6, r: 24, blur: 2.5 },
    ],
  },
  {
    id: 'sext',
    name: 'Sext',
    time: '12:00',
    h: 12,
    kicker: 'Zenith',
    text: 'The hour without shadow. Lemon on hot skin, salt drying white on the shoulders, immortelle baking on the dunes.',
    notes: [
      ['Top', 'Amalfi lemon, sea salt'],
      ['Heart', 'Immortelle, hot sand'],
      ['Base', 'Driftwood, ambrette'],
    ],
    caption: 'A white wall at noon, one fig branch',
    theme: { bg: '#F4F0E3', ink: '#191815', accent: '#9A7D0E', glow: '#FFFFFF' },
    sun: [50, 2, 1],
    shadow: [0, 0.1, 0.26],
    items: [
      { img: 'sext-lemon', x: 32, y: 38, w: 22, d: 0.9, r: -16 },
      { img: 'sext-immortelle', x: 67, y: 25, w: 17, d: 0.62, r: 14, blur: 1 },
      { img: 'sext-driftwood', x: 38, y: 78, w: 19, d: 1.15, r: 8 },
      { img: 'sext-salt', x: 67.5, y: 70, w: 30, d: 1.6, r: -6, blur: 2 },
    ],
  },
  {
    id: 'vespers',
    name: 'Vespers',
    time: '18:50',
    h: 18 + 50 / 60,
    kicker: 'Golden hour',
    text: 'Everything turns to honey. Apricots warm from the tree, saffron, hay cut that afternoon, a leaf of tobacco drying in the last sun.',
    notes: [
      ['Top', 'Apricot, saffron'],
      ['Heart', 'Honey, hay absolute'],
      ['Base', 'Blond tobacco, labdanum'],
    ],
    caption: 'The hay field, sun on the horizon',
    theme: { bg: '#E3A45F', ink: '#2A1306', accent: '#8A2C10', glow: '#FFE0A8' },
    sun: [91, 60, 0.9],
    shadow: [-57, 1, 0.26],
    items: [
      { img: 'vespers-apricot', x: 67, y: 37, w: 20, d: 0.9, r: 12 },
      { img: 'vespers-saffron', x: 32, y: 25, w: 15, d: 0.6, r: -10, blur: 1 },
      { img: 'vespers-tobacco', x: 68.5, y: 74, w: 15, d: 1.2, r: 26 },
      { img: 'vespers-honeycomb', x: 37, y: 71, w: 24, d: 1.5, r: -10, blur: 2 },
    ],
  },
  {
    id: 'compline',
    name: 'Compline',
    time: '23:40',
    h: 23 + 40 / 60,
    kicker: 'Night',
    text: 'The house is asleep. Iris root like cold suede, incense still hanging in the cloister, vanilla and oud burning low.',
    notes: [
      ['Top', 'Frankincense, pink pepper'],
      ['Heart', 'Iris root, violet leaf'],
      ['Base', 'Vanilla pod, oud'],
    ],
    caption: 'The cloister, one candle left',
    theme: { bg: '#0D1017', ink: '#E9E2D2', accent: '#C2A878', glow: '#3E4D74' },
    sun: [74, 8, 0.75],
    shadow: [-16, 0.9, 0.5],
    items: [
      { img: 'compline-iris', x: 32.5, y: 42, w: 17, d: 0.9, r: -8 },
      { img: 'compline-incense', x: 68, y: 25, w: 14, d: 0.62, r: 16, blur: 1 },
      { img: 'compline-vanilla', x: 38.5, y: 76, w: 20, d: 1.15, r: -22 },
      { img: 'compline-oud', x: 67.5, y: 70, w: 26, d: 1.5, r: 10, blur: 2 },
    ],
  },
]

export const PAPER = { bg: '#EEE9DE', ink: '#1A1916', accent: '#8F5230', glow: '#FFFFFF' }

// Which fragrance belongs to a wall-clock hour.
export function hourFor(date) {
  const h = date.getHours() + date.getMinutes() / 60
  if (h >= 4.5 && h < 8) return 0
  if (h >= 8 && h < 11) return 1
  if (h >= 11 && h < 16) return 2
  if (h >= 16 && h < 21) return 3
  return 4
}
