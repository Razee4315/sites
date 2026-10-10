import gsap from 'gsap'
import { $, reduce, whileVisible } from './util.js'

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; v.y = 1. - v.y; gl_Position = vec4(p, 0., 1.); }`
const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uImg;
uniform float uTime, uHorizon;
uniform vec3 uRip[12];
varying vec2 v;
void main(){
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1., ri / rs) : vec2(rs / ri, 1.);
  vec2 uv = (v - .5) * s + .5;                      // object-fit: cover
  float water = smoothstep(uHorizon, uHorizon + .035, uv.y);
  float d = clamp((uv.y - uHorizon) / (1. - uHorizon), 0., 1.);   // 0 far shore, 1 at your feet
  float persp = 1. / (d * 1.5 + .07);
  vec2 off = vec2(0.);
  // a breath of wind: long swells that tighten toward the far shore
  off.x += (sin(persp * 3.1 + uTime * .9 + uv.x * 13.) + sin(persp * 5.3 - uTime * .55 + uv.x * 22.)) * .0013 * (.35 + d);
  off.y += cos(persp * 4.2 + uTime * .7 + uv.x * 8.) * .0019 * (.3 + d);
  float glint = 0.;
  for (int i = 0; i < 12; i++) {
    vec3 r = uRip[i];
    float age = uTime - r.z;
    if (age < 0. || age > 7.) continue;
    vec2 q = uv - r.xy;
    q.x *= ri;
    q.y *= 2.7;                                     // rings lie flat on the water
    float dist = length(q);
    float front = age * .17;
    float env = exp(-pow((dist - front) * 7.5, 2.)) * exp(-age * .75) * smoothstep(0., .25, age);
    float wave = sin((dist - front) * 82.) * env;
    vec2 dir = q / max(dist, .0001);
    off += vec2(dir.x / ri, dir.y / 2.7) * wave * .016;
    glint += wave * env;
  }
  off *= water;
  vec3 col = texture2D(uTex, uv + off).rgb;
  col += vec3(.75, .86, 1.) * max(0., glint) * .22 * water;
  col += vec3(.6, .78, 1.) * smoothstep(.0016, .006, length(off)) * .035;
  gl_FragColor = vec4(col, 1.);
}`

// Sheosar: the lower half of the photograph is live water.
export function lake() {
  const box = $('.lake')
  const img = $('.lake__img')
  const canvas = $('.lake__gl')
  if (reduce) return
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
  if (!gl) return

  const sh = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
    return s
  }
  let prog
  try {
    prog = gl.createProgram()
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
  } catch (err) {
    console.warn('lake shader', err)
    return
  }
  gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const U = (n) => gl.getUniformLocation(prog, n)
  const HORIZON = 0.5
  const rip = new Float32Array(36).fill(-100)
  let ripI = 0
  let now = 0
  let ready = false
  let iw = 3
  let ih = 2

  const upload = () => {
    iw = img.naturalWidth
    ih = img.naturalHeight
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform2f(U('uImg'), iw, ih)
    gl.uniform1f(U('uHorizon'), HORIZON)
    ready = true
    size()
    box.classList.add('is-live')
  }
  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const w = Math.round(box.clientWidth * dpr)
    const h = Math.round(box.clientHeight * dpr)
    if (canvas.width === w && canvas.height === h) return
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
    gl.uniform2f(U('uRes'), w, h)
  }
  // screen point → image uv, through the same cover crop the shader uses
  const toUv = (cx, cy) => {
    const r = box.getBoundingClientRect()
    const rs = r.width / r.height
    const ri = iw / ih
    const sx = rs > ri ? 1 : rs / ri
    const sy = rs > ri ? ri / rs : 1
    return [((cx - r.left) / r.width - 0.5) * sx + 0.5, ((cy - r.top) / r.height - 0.5) * sy + 0.5]
  }
  const drop = (u, v) => {
    if (v < HORIZON + 0.02) return
    rip.set([u, v, now], ripI * 3)
    ripI = (ripI + 1) % 12
  }

  let last = [0, 0]
  let lastT = 0
  box.addEventListener('pointermove', (e) => {
    const d = Math.hypot(e.clientX - last[0], e.clientY - last[1])
    if (d < 46 && now - lastT < 0.5) return
    if (now - lastT < 0.09) return
    last = [e.clientX, e.clientY]
    lastT = now
    drop(...toUv(e.clientX, e.clientY))
  })
  box.addEventListener('pointerdown', (e) => drop(...toUv(e.clientX, e.clientY)))

  let nextRise = 1.5
  whileVisible(box, (t) => {
    if (!ready) return
    now = t
    size()
    if (t > nextRise) {
      // a fish rises somewhere
      const [u0] = toUv(box.getBoundingClientRect().left, 0)
      drop(u0 + Math.random() * (1 - 2 * u0), HORIZON + 0.08 + Math.random() * 0.34)
      nextRise = t + 2.2 + Math.random() * 3.5
    }
    gl.uniform1f(U('uTime'), t)
    gl.uniform3fv(U('uRip'), rip)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  })
  window.addEventListener('resize', size)
  if (img.complete && img.naturalWidth) upload()
  else img.addEventListener('load', upload, { once: true })
  img.loading = 'eager'
}

// the storm panorama slides sideways as the page scrolls past it
export function pano() {
  const strip = $('.pano__strip')
  const box = $('.pano')
  const travel = () => Math.min(0, box.clientWidth - strip.scrollWidth)
  if (reduce) return gsap.set(strip, { x: () => travel() * 0.62 })
  gsap.fromTo(
    strip,
    { x: 0 },
    { x: travel, ease: 'none', scrollTrigger: { trigger: box, start: 'top 92%', end: 'bottom 12%', scrub: 0.5, invalidateOnRefresh: true } },
  )
}
