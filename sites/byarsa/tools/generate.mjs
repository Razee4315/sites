// Sends every prompt in the manifest to its own `codex exec` session and collects the PNGs.
// usage: node tools/generate.mjs [--force] [--c=16] [--retries=1] [id ...]   (no ids = whatever is missing)
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
const flag = (name, dflt) => Number((argv.find((a) => a.startsWith(`--${name}=`)) || `--${name}=${dflt}`).split('=')[1])
const force = argv.includes('--force')
const conc = flag('c', 16)
const retries = flag('retries', 1)
const ids = argv.filter((a) => !a.startsWith('--'))
const TIMEOUT = 14 * 60 * 1000

const files = (a) => (a.steps ? a.steps.map((_, i) => `${a.id}-${i + 1}.png`) : [`${a.id}.png`])
const done = (a) => files(a).every((f) => existsSync(join(RAW, f)))

const unknown = ids.filter((id) => !assets.some((a) => a.id === id))
if (unknown.length) console.log(`unknown id(s): ${unknown.join(', ')}`)

const skip = ((argv.find((a) => a.startsWith('--skip=')) || '').slice(7) || '').split(',')
const queue = assets.filter((a) => (ids.length ? ids.includes(a.id) : true) && !skip.includes(a.id) && (force || !done(a)))
console.log(`${queue.length} session(s) queued, ${conc} at a time`)

const HEAD =
  'You are being used purely as an image generator. Shell commands and file tools are broken in this environment: ' +
  'do NOT run any shell command, do NOT read, list or copy any file. Only call the built-in image generation tool ' +
  '(image_gen).\n\n'

const wrap = (a) => {
  if (a.steps) {
    return (
      HEAD +
      `Make exactly ${a.steps.length} images, in order, with one image_gen call each. STEP 1 is a new image. Every later ` +
      'step is an EDIT of the STEP 1 image (it is already visible in this conversation): same canvas size, same framing, ' +
      'every outline in exactly the same pixel position, so that the results line up perfectly when stacked.\n' +
      `Shape of every image: ${a.aspect}.` +
      (a.alpha ? ' Every image MUST keep a genuinely transparent background (real alpha channel).' : '') +
      '\n\n' +
      a.steps.map((s, i) => `STEP ${i + 1}:\n${s}`).join('\n\n') +
      '\n\nWhen all steps are done reply with only the saved file paths, in order.'
    )
  }
  return (
    HEAD +
    'Call image_gen exactly once with the prompt below, keeping all of its content. ' +
    `Requested shape: ${a.aspect}. ` +
    (a.alpha ? 'The output MUST have a genuinely transparent background (real alpha channel). ' : '') +
    'When it returns, reply with only the saved file path.\n\nPROMPT:\n' +
    a.prompt
  )
}

function session(a, attempt) {
  return new Promise((resolve) => {
    const t0 = Date.now()
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
      writeFileSync(join(LOGS, `${a.id}${attempt ? `.retry${attempt}` : ''}.log`), out)
      const secs = Math.round((Date.now() - t0) / 1000)
      const sid = (out.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1]
      const dir = sid && join(GEN, sid)
      if (!dir || !existsSync(dir)) return resolve({ ok: false, why: `exit ${code}, no image folder`, secs })
      const imgs = readdirSync(dir)
        .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
        .sort((x, y) => x.t - y.t)
      const want = files(a)
      if (imgs.length < want.length) return resolve({ ok: false, why: `${imgs.length}/${want.length} images`, secs })
      // a chain can produce a retried step; the last N in time order are the ones that were kept
      imgs.slice(-want.length).forEach((p, i) => copyFileSync(join(dir, p.f), join(RAW, want[i])))
      resolve({ ok: true, secs, sid })
    })
  })
}

async function run(a) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const r = await session(a, attempt)
    if (r.ok) return console.log(`ok    ${a.id.padEnd(16)} ${String(r.secs).padStart(4)}s${attempt ? '  (retry)' : ''}`)
    console.log(`FAIL  ${a.id.padEnd(16)} ${String(r.secs).padStart(4)}s  ${r.why}${attempt < retries ? '  -> retrying' : ''}`)
  }
  failed.push(a.id)
}

const failed = []
let next = 0
const t0 = Date.now()
await Promise.all(
  Array.from({ length: Math.min(conc, queue.length) }, async (_, w) => {
    await new Promise((r) => setTimeout(r, w * 700)) // stagger the starts a little
    while (next < queue.length) await run(queue[next++])
  }),
)
console.log(`\nfinished in ${Math.round((Date.now() - t0) / 1000)}s: ${queue.length - failed.length} ok, ${failed.length} failed${failed.length ? ' -> ' + failed.join(' ') : ''}`)
