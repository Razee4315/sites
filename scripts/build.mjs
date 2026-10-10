// Builds every site in sites/ into dist/<name>/ and puts the gallery at dist/.
// BASE_PATH is the URL prefix the whole thing is served from ("/" locally, "/<repo>/" on GitHub Pages).
// Pass site names as arguments to build only those: node scripts/build.mjs pronk quire
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const base = `/${process.env.BASE_PATH ?? ''}/`.replace(/\/+/g, '/')

const all = readdirSync(join(root, 'sites'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
const only = process.argv.slice(2)
const unknown = only.filter((name) => !all.includes(name))
if (unknown.length) throw new Error(`no such site: ${unknown.join(', ')}`)

if (!only.length) rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

for (const name of only.length ? only : all) {
  const cwd = join(root, 'sites', name)
  const run = (cmd) => execSync(cmd, { cwd, stdio: 'inherit' })
  console.log(`\n── ${name}`)
  if (!existsSync(join(cwd, 'node_modules'))) run('npm ci')
  run(`npx vite build --base=${base}${name}/ --outDir="${join(dist, name)}" --emptyOutDir`)
}

cpSync(join(root, 'gallery'), dist, { recursive: true })
console.log(`\nBuilt ${only.length || all.length} site(s) and the gallery into dist/ (base ${base})`)
