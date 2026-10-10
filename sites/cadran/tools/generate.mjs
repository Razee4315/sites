// Fans image prompts out to parallel `codex exec` sessions and collects the PNGs.
// usage: node tools/generate.mjs [--force] [--c=12] [id ...]   (no ids = everything missing)
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
const force = argv.includes('--force')
const conc = Number((argv.find((a) => a.startsWith('--c=')) || '--c=12').slice(4))
const ids = argv.filter((a) => !a.startsWith('--'))
const TIMEOUT = 12 * 60 * 1000

const outName = (a, i) => (a.steps ? `${a.id}-${i + 1}.png` : `${a.id}.png`)
const done = (a) => existsSync(join(RAW, outName(a, (a.steps?.length || 1) - 1)))

const queue = assets.filter((a) => (ids.length ? ids.includes(a.id) : true) && (force || !done(a)))
console.log(`${queue.length} job(s), concurrency ${conc}`)

const wrap = (a) => {
  const head =
    'You are being used purely as an image generator. Shell commands and file tools are broken in this ' +
    'environment: do NOT run any shell command, do NOT read or copy any file. Only call the built-in ' +
    'image generation tool (image_gen).\n\n'
  if (a.steps) {
    return (
      head +
      `Make exactly ${a.steps.length} images, in order, one image_gen call each. Each later step is an EDIT of ` +
      'the image produced by the step before it (it is already visible in this conversation).\n\n' +
      a.steps.map((s, i) => `STEP ${i + 1} (${s.aspect}):\n${s.prompt}`).join('\n\n') +
      '\n\nWhen all steps are done reply with only the saved file paths, in order.'
    )
  }
  return (
    head +
    'Call image_gen exactly once with the prompt below, keeping all of its content. ' +
    `Requested shape: ${a.aspect}. ` +
    (a.alpha ? 'The output MUST have a genuinely transparent background (real alpha channel). ' : '') +
    'When it returns, reply with only the saved file path.\n\nPROMPT:\n' +
    a.prompt
  )
}

function run(a) {
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
      writeFileSync(join(LOGS, `${a.id}.log`), out)
      const sid = (out.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1]
      const dir = sid && join(GEN, sid)
      const secs = Math.round((Date.now() - t0) / 1000)
      if (!dir || !existsSync(dir)) return resolve(console.log(`FAIL  ${a.id}  (${secs}s, exit ${code}, no image dir)`))
      const pngs = readdirSync(dir)
        .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
        .sort((x, y) => x.t - y.t)
      const want = a.steps?.length || 1
      if (pngs.length < want) return resolve(console.log(`FAIL  ${a.id}  (${secs}s, got ${pngs.length}/${want} images)`))
      pngs.slice(-want).forEach((p, i) => copyFileSync(join(dir, p.f), join(RAW, outName(a, i))))
      console.log(`ok    ${a.id}  (${secs}s)`)
      resolve()
    })
  })
}

let i = 0
await Promise.all(
  Array.from({ length: Math.min(conc, queue.length) }, async () => {
    while (i < queue.length) await run(queue[i++])
  }),
)
console.log('ALL DONE')
