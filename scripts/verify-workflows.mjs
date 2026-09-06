import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export function validateReleaseWorkflow(source) {
  const issues = []
  if (!/release:\s*\n\s+types:\s*\[published\]/.test(source))
    issues.push('release.published trigger is required')
  if (/workflow_dispatch:[\s\S]*?inputs:[\s\S]*?publish:/.test(source))
    issues.push('manual dispatch must not accept a publish input')
  if (
    !/if:\s*\$\{\{ github\.event_name == 'release' \}\}[\s\S]*?npm publish/.test(
      source,
    )
  )
    issues.push('publish step must be restricted to the release event')
  if (!/ref:\s*\$\{\{ env\.RELEASE_TAG \}\}/.test(source))
    issues.push('release tag must be checked out explicitly')
  if (!/--ensure-unpublished/.test(source))
    issues.push('duplicate npm versions must be rejected')
  if (!/test:e2e/.test(source) || !/test:website:e2e/.test(source))
    issues.push('full browser matrix must run before publishing')
  if (
    !/group:\s*npm-publish-\$\{\{ github\.event\.release\.tag_name \|\| inputs\.tag \}\}/.test(
      source,
    )
  )
    issues.push('per-tag publish concurrency is required')
  if (!/id-token:\s*write/.test(source))
    issues.push('npm trusted publishing requires id-token: write')
  if (!/npm publish --provenance --access public --tag alpha/.test(source))
    issues.push('npm publish flags must be explicit')
  if (!/package-manager-cache:\s*false/.test(source))
    issues.push('release dependency caching must be disabled')
  return issues
}

export async function verifyWorkflows() {
  const files = ['ci.yml', 'browser.yml', 'release.yml']
  for (const file of files) {
    const source = await readFile(`.github/workflows/${file}`, 'utf8')
    if (!source.includes('permissions:'))
      throw new Error(`${file} lacks permissions`)
    if (file === 'release.yml') {
      const issues = validateReleaseWorkflow(source)
      if (issues.length > 0) throw new Error(issues.join('\n'))
    }
  }
  process.stdout.write('Workflow contracts verified.\n')
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await verifyWorkflows()
}
