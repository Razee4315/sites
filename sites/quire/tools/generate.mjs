// Fans the image manifest out to parallel `codex exec` sessions and collects the PNGs.
//
//   node tools/generate.mjs                 everything that is missing
//   node tools/generate.mjs zf-back vx-fox  only these ids
//   node tools/generate.mjs --force zf-back regenerate even if present
//   node tools/generate.mjs --c=20          concurrency (default 16)
//   node tools/generate.mjs --family=zf     only ids starting with "zf-"
//
// Codex's shell sandbox is broken on this machine, so every prompt forbids shell and
// file tools and asks only for the built-in image tool. Codex writes each image to
// ~/.codex/generated_images/<session id>/ ; we read the session id from its output
// and copy the file(s) out ourselves.
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync, readdirSync, copyFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { assets } from './manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const LOGS = join(root, 'tools', 'logs')
const GEN = join(homedir(), '.codex', 'generated_images')
mkdirSync(RAW, { recursive: true })
mkdirSync(LOGS, { recursive: true })

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}
const force = argv.includes('--force')
const conc = Number(flag('c', 16))
const family = flag('family', '')
const ids = argv.filter((a) => !a.startsWith('--'))
const TIMEOUT = 14 * 60 * 1000
const RETRIES = 1

const count = (a) => a.steps?.length || 1
const outName = (a, i) => (a.steps ? `${a.id}-${i + 1}.png` : `${a.id}.png`)
const done = (a) => Array.from({ length: count(a) }, (_, i) => outName(a, i)).every((f) => existsSync(join(RAW, f)))

const unknown = ids.filter((id) => !assets.some((a) => a.id === id))
if (unknown.length) {
  console.error(`unknown id(s): ${unknown.join(', ')}`)
  process.exit(1)
}

const queue = assets.filter(
  (a) => (ids.length ? ids.includes(a.id) : true) && (family ? a.id.startsWith(family + '-') : true) && (force || !done(a)),
)

const HEAD =
  'You are being used purely as an image generator. Shell commands and file tools are broken in this ' +
  'environment: do NOT run any shell command, do NOT read, list or copy any file, do NOT try to verify the ' +
  'result. Only call the built-in image generation tool (image_gen).\n\n'

const SHAPES = {
  square: 'square, 1:1',
  portrait: 'portrait, 2:3 (taller than wide)',
  landscape: 'landscape, 3:2 (wider than tall)',
  wide: 'wide landscape, 16:9',
  pano: 'very wide panorama, about 3:1 (three times wider than tall)',
}

const ALPHA_RULE =
  'The output MUST have a genuinely transparent background (real alpha channel): no backdrop, no surface, ' +
  'no ground plane, no cast shadow outside the object, no glow or halo. '

function wrap(a) {
  if (a.steps) {
    return (
      HEAD +
      `Make exactly ${a.steps.length} images, in order, with one image_gen call each. Every step after the first ` +
      'is an EDIT of the image produced by the step before it (it is already visible in this conversation): keep ' +
      'the framing, crop, camera and the position of every element identical unless the step says otherwise.\n\n' +
      a.steps.map((s, i) => `STEP ${i + 1} — shape: ${SHAPES[s.shape || a.shape]}.\n${s.prompt}`).join('\n\n') +
      '\n\nWhen all steps are done reply with only the saved file paths, in order.'
    )
  }
  return (
    HEAD +
    'Call image_gen exactly once with the prompt below, keeping all of its content. ' +
    `Requested shape: ${SHAPES[a.shape]}. ` +
    (a.alpha ? ALPHA_RULE : '') +
    'When it returns, reply with only the saved file path.\n\nPROMPT:\n' +
    a.prompt
  )
}

function once(a) {
  return new Promise((resolve) => {
    const child = spawn(
      'codex',
      ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '-c', 'model_reasoning_effort="low"', '--color', 'never', '-'],
      { cwd: root, windowsHide: true },
    )
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.stdin.end(wrap(a))
    const timer = setTimeout(() => child.kill(), TIMEOUT)
    child.on('error', (e) => (out += `\nSPAWN ERROR ${e.message}`))
    child.on('close', (code) => {
      clearTimeout(timer)
      writeFileSync(join(LOGS, `${a.id}.log`), out)
      const sid = (out.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1]
      const dir = sid && join(GEN, sid)
      if (!dir || !existsSync(dir)) return resolve(`exit ${code}, no image folder`)
      const files = readdirSync(dir)
        .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
        .sort((x, y) => x.t - y.t)
      if (files.length < count(a)) return resolve(`got ${files.length}/${count(a)} images`)
      files.slice(-count(a)).forEach((p, i) => copyFileSync(join(dir, p.f), join(RAW, outName(a, i))))
      resolve(null)
    })
  })
}

const stamp = () => new Date().toLocaleTimeString('en-GB')
let ok = 0
const failed = []

async function run(a) {
  const t0 = Date.now()
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const err = await once(a)
    const secs = String(Math.round((Date.now() - t0) / 1000)).padStart(3)
    if (!err) {
      ok++
      return console.log(`${stamp()}  ok    ${secs}s  ${a.id}${attempt ? '  (retry)' : ''}`)
    }
    console.log(`${stamp()}  ${attempt < RETRIES ? 'retry' : 'FAIL '} ${secs}s  ${a.id}  — ${err}`)
  }
  failed.push(a.id)
}

console.log(`${stamp()}  ${queue.length} job(s), ${conc} at a time\n`)
let next = 0
await Promise.all(
  Array.from({ length: Math.min(conc, queue.length) }, async () => {
    while (next < queue.length) await run(queue[next++])
  }),
)
console.log(`\n${stamp()}  done: ${ok} ok, ${failed.length} failed${failed.length ? ' → ' + failed.join(' ') : ''}`)
