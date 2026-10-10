// A sheet of paper with the wordmark cut out of it, as SVG: a mask punches the letters through,
// a darker copy offset underneath gives the paper its thickness, and a blurred copy further back
// is the shadow the sheet throws on whatever is behind it. Used by the hero and by the footer.
const FAMILY = '"Big Shoulders Stencil Variable"'
export const PAPER = '#efe8da'
export const TRACK = 0.012

let glyphs = null
export function glyphMetrics(force = false) {
  if (glyphs && !force) return glyphs
  const c = document.createElement('canvas').getContext('2d')
  c.font = `900 1000px ${FAMILY}`
  if ('fontKerning' in c) c.fontKerning = 'none'
  const adv = {}
  for (const ch of 'QUIRE') adv[ch] = c.measureText(ch).width / 1000
  const cap = (c.measureText('I').actualBoundingBoxAscent || 720) / 1000
  return (glyphs = { adv, cap })
}

// width of a word in ems
export const widthOf = (s) => [...s].reduce((n, ch) => n + glyphMetrics().adv[ch], 0) + TRACK * (s.length - 1)

// one glyph per cell, each with its own x, so holes and loose letters land on exactly the same pixels
export function setLine(s, x, y, fs) {
  const { adv } = glyphMetrics()
  return [...s].map((ch) => {
    const cell = { ch, x, y }
    x += (adv[ch] + TRACK) * fs
    return cell
  })
}

export function sheetSVG({ k, w, h, fs, rows, crease = '', plugs = false, paper = PAPER }) {
  const holes = rows
    .map((cells) => `<text x="${cells.map((c) => c.x.toFixed(2)).join(' ')}" y="${cells[0].y.toFixed(2)}" font-size="${fs.toFixed(2)}">${cells.map((c) => c.ch).join('')}</text>`)
    .join('')
  const loose = plugs
    ? rows.flat().map((c, i) => `<text class="plug" data-i="${i}" x="${c.x.toFixed(2)}" y="${c.y.toFixed(2)}" font-size="${fs.toFixed(2)}" fill="${paper}">${c.ch}</text>`).join('')
    : ''
  const sheet = `<rect width="${w}" height="${h}" mask="url(#cut-${k})"`
  return `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <mask id="cut-${k}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
          <rect width="${w}" height="${h}" fill="#fff"/><g fill="#000">${holes}</g>
        </mask>
        <filter id="soft-${k}" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${(fs * 0.022).toFixed(1)}"/></filter>
        <pattern id="grain-${k}" width="256" height="256" patternUnits="userSpaceOnUse"><image href="${import.meta.env.BASE_URL}img/grain.png" width="256" height="256"/></pattern>
      </defs>
      <g transform="translate(${(fs * 0.014).toFixed(1)} ${(fs * 0.03).toFixed(1)})" filter="url(#soft-${k})" opacity="0.62">${sheet} fill="#02030a"/></g>
      <g transform="translate(${Math.max(1.5, fs * 0.0045).toFixed(1)} ${Math.max(2, fs * 0.007).toFixed(1)})">${sheet} fill="#b3a88f"/></g>
      ${sheet} fill="${paper}"/>
      ${sheet} fill="url(#grain-${k})"/>
      ${crease ? `<g mask="url(#cut-${k})" opacity="0.55">${crease}</g>` : ''}
      ${loose}
    </svg>`
}
