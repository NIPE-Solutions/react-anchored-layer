import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const decorativeProperties = [
  'background',
  'border',
  'box-shadow',
  'color',
  'font',
  'padding',
]

export function validateCoreCss(css) {
  const issues = []
  for (const property of decorativeProperties) {
    if (new RegExp(`(?:^|[;{\\s])${property}\\s*:`, 'm').test(css)) {
      issues.push(`core.css must not set decorative property: ${property}`)
    }
  }
  if (/(^|})\s*(html|body|\*)\s*\{/m.test(css)) {
    issues.push('core.css must not contain global selectors')
  }
  return issues
}

export async function checkCssContract(paths) {
  for (const path of paths) {
    const issues = validateCoreCss(await readFile(path, 'utf8'))
    if (issues.length > 0) throw new Error(`${path}: ${issues.join('; ')}`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const paths = process.argv.slice(2)
  await checkCssContract(paths.length > 0 ? paths : ['src/styles/core.css'])
  process.stdout.write('Core CSS contract verified.\n')
}
