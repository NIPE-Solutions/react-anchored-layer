import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export function validateRelease(version, tag) {
  const issues = []
  if (!/^\d+\.\d+\.\d+-alpha\.\d+$/.test(version)) {
    issues.push('Initial releases must use an alpha prerelease version')
  }
  if (tag !== undefined && tag !== `v${version}`) {
    issues.push(`Tag ${tag} does not match package version ${version}`)
  }
  return issues
}

export async function verifyRelease() {
  const metadata = JSON.parse(await readFile('package.json', 'utf8'))
  const tagArgument = process.argv.find((argument) =>
    argument.startsWith('--tag='),
  )
  const tag = tagArgument?.slice('--tag='.length)
  const issues = validateRelease(metadata.version, tag)
  if (!metadata.publishConfig?.provenance)
    issues.push('npm provenance must be enabled')
  if (metadata.publishConfig?.access !== 'public')
    issues.push('package access must be public')
  if (issues.length > 0) throw new Error(issues.join('\n'))
  execFileSync('npm', ['pack', '--dry-run', '--json'], { stdio: 'pipe' })
  process.stdout.write(`Release dry run verified for ${metadata.version}.\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await verifyRelease()
}
