import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(readFileSync(resolve(root, 'shadcn-registry-snapshot.json'), 'utf8'))
const config = JSON.parse(readFileSync(resolve(root, 'components.json'), 'utf8'))
const failures = []
if (config.style !== 'new-york') failures.push('components.json must use new-york')
if (config.tailwind?.baseColor !== 'neutral') failures.push('components.json must use neutral base color')
if (config.tailwind?.cssVariables !== true) failures.push('components.json must enable semantic CSS variables')
if (config.tailwind?.css !== 'src/styles.css') failures.push('Wrong Tailwind stylesheet path')
const css = readFileSync(resolve(root, 'src/styles.css'), 'utf8')
for (const token of ['@import "tailwindcss"', '@theme inline', '--background', '--foreground', '--primary', '--sidebar']) {
  if (!css.includes(token)) failures.push('Missing official token: ' + token)
}
for (const [name, expected] of Object.entries(manifest.components)) {
  const data = readFileSync(resolve(root, 'src/components/ui', name))
  const header = Buffer.from('blob ' + data.length + '\\0', 'utf8')
  const sha = createHash('sha1').update(header).update(data).digest('hex')
  if (sha !== expected) failures.push(name + ' differs from audited official New York v4 snapshot')
}
if (failures.length) {
  for (const failure of failures) process.stderr.write('✗ ' + failure + '\\n')
  process.exit(1)
}
process.stdout.write('OK: ' + Object.keys(manifest.components).length + ' official shadcn/ui New York v4 components, Neutral tokens and config verified\\n')
