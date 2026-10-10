// Fans the image manifest out to parallel `codex exec` sessions and collects the PNGs into assets-raw/gen.
// usage: node tools/generate.mjs [--force] [--c=16] [--only=prefix] [id ...]   (no ids = everything missing)
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync, readdirSync, copyFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { assets } from './manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw', 'gen')
const LOGS = join(root, 'tools', 'logs')
const GEN = join(homedir(), '.codex', 'generated_images')
mkdirSync(RAW, { recursive: true })
mkdirSync(LOGS, { recursive: true })

const argv = process.argv.slice(2)
const flag = (name, fallback) => (argv.find((a) => a.startsWith(`--${name}=`)) || `--${name}=${fallback}`).split('=')[1]
const force = argv.includes('--force')
const conc = Number(flag('c', 16))
const only = flag('only', '')
const ids = argv.filter((a) => !a.startsWith('--'))
const TIMEOUT = 14 * 60 * 1000
const RETRIES = 1

// Codex cannot touch the filesystem on this machine, so every prompt opens with the same leash.
const LEASH =
  'You are being used purely as an image generator. Shell commands and file tools are broken in this ' +
  'environment: do NOT run any shell command, do NOT read, list or copy any file. Only call the built-in ' +
  'image generation tool (image_gen).\n\n'

const files = (a) => (a.steps ? a.steps.map((_, i) => `${a.id}-${i + 1}.png`) : [`${a.id}.png`])
const done = (a) => files(a).every((f) => existsSync(join(RAW, f)))

function brief(a) {
  if (a.steps) {
    return (
      LEASH +
      `Make exactly ${a.steps.length} images, in order, one image_gen call each. Every step after the first is an EDIT ` +
      'of the image produced by the step before it (it is already visible in this conversation): keep the framing, ' +
      'geometry and every object pixel-aligned and change only what the step says.\n\n' +
      a.steps.map((s, i) => `STEP ${i + 1} (shape: ${a.aspect}):\n${s}`).join('\n\n') +
      '\n\nWhen all steps are done reply with only the saved file paths, in order.'
    )
  }
  return (
    LEASH +
    'Call image_gen exactly once with the prompt below, keeping all of its content. ' +
    `Requested shape: ${a.aspect}. ` +
    (a.alpha
      ? 'The output MUST have a genuinely transparent background (real alpha channel), no backdrop, no surface, no cast shadow. '
      : '') +
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
      { cwd: root, windowsHide: true, shell: false },
    )
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.stdin.end(brief(a))
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
      if (imgs.length < want.length) return resolve({ ok: false, why: `got ${imgs.length}/${want.length} images`, secs })
      imgs.slice(-want.length).forEach((p, i) => copyFileSync(join(dir, p.f), join(RAW, want[i])))
      resolve({ ok: true, secs })
    })
  })
}

async function run(a) {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const r = await session(a, attempt)
    if (r.ok) return console.log(`ok    ${a.id.padEnd(28)} ${r.secs}s${attempt ? '  (retry)' : ''}`), true
    console.log(`${attempt < RETRIES ? 'retry' : 'FAIL '} ${a.id.padEnd(28)} ${r.secs}s  ${r.why}`)
  }
  return false
}

const queue = assets.filter(
  (a) => (ids.length ? ids.includes(a.id) : true) && (!only || a.id.startsWith(only)) && (force || !done(a)),
)
console.log(`${queue.length} job(s) of ${assets.length} in manifest, ${conc} at a time`)

let next = 0
let okCount = 0
const t0 = Date.now()
await Promise.all(
  Array.from({ length: Math.min(conc, queue.length) }, async () => {
    while (next < queue.length) if (await run(queue[next++])) okCount++
  }),
)
console.log(`ALL DONE  ${okCount}/${queue.length} ok in ${Math.round((Date.now() - t0) / 1000)}s`)
