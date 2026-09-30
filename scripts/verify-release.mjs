import { execFileSync, spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export function validateRelease(version, tag) {
  const issues = []
  if (version !== '1.0.0') {
    issues.push('This release requires exactly stable version 1.0.0')
  }
  if (tag !== undefined && tag !== `v${version}`) {
    issues.push(`Tag ${tag} does not match package version ${version}`)
  }
  return issues
}

export const releaseName = '@nipe-solutions/react-anchored-layer'
export const releaseTarball = 'nipe-solutions-react-anchored-layer-1.0.0.tgz'

export function validateReleaseMetadata(metadata, tag) {
  const issues = validateRelease(metadata.version, tag)
  if (metadata.name !== releaseName)
    issues.push('Unexpected release package name')
  if (metadata.private === true)
    issues.push('Release package must not be private')
  if (metadata.publishConfig?.provenance !== true)
    issues.push('npm provenance must be enabled')
  if (metadata.publishConfig?.access !== 'public')
    issues.push('package access must be public')
  if (metadata.publishConfig?.tag !== 'latest')
    issues.push('npm dist-tag must be latest')
  return issues
}

export function npmEnvironment() {
  return { ...process.env, NPM_CONFIG_USERCONFIG: '/dev/null' }
}

export function ensureVersionIsUnpublished(name, version, run = spawnSync) {
  if (name !== releaseName || version !== '1.0.0')
    throw new Error('Unexpected registry package identity or version')
  const result = run(
    'npm',
    [
      'view',
      `${name}@${version}`,
      'version',
      '--json',
      '--registry=https://registry.npmjs.org',
    ],
    { encoding: 'utf8', env: npmEnvironment(), timeout: 30_000 },
  )
  if (result.status === 0) {
    throw new Error(`${name}@${version} already exists on npm`)
  }
  let errorCode
  try {
    errorCode = JSON.parse(result.stdout)?.error?.code
  } catch {
    /* An ambiguous lookup must fail closed. */
  }
  if (
    result.status !== 1 ||
    result.error ||
    result.signal ||
    errorCode !== 'E404'
  ) {
    throw new Error(
      `Could not verify npm publication state: ${String(result.stderr).trim()}`,
    )
  }
}

export function verifyCurrentMain({
  env = process.env,
  run = execFileSync,
} = {}) {
  if (
    env.GITHUB_REF !== 'refs/heads/main' ||
    env.GITHUB_EVENT_NAME !== 'workflow_dispatch'
  )
    throw new Error('Current main requires a manual dispatch from main')
  if (
    typeof env.GITHUB_SHA !== 'string' ||
    !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA)
  )
    throw new Error('Current main requires a valid GitHub SHA')
  let head, remote
  try {
    head = run('git', ['rev-parse', '--verify', 'HEAD'], { encoding: 'utf8' })
    remote = run(
      'git',
      ['ls-remote', '--exit-code', 'origin', 'refs/heads/main'],
      { encoding: 'utf8', timeout: 30_000 },
    )
  } catch (error) {
    throw new Error('Current main lookup failed', { cause: error })
  }
  const checkedOut =
    typeof head === 'string'
      ? /^([a-f0-9]{40})\r?\n?$/.exec(head)?.[1]
      : undefined
  const currentMain =
    typeof remote === 'string'
      ? /^([a-f0-9]{40})\trefs\/heads\/main\r?\n?$/.exec(remote)?.[1]
      : undefined
  if (!checkedOut || !currentMain)
    throw new Error(
      'Current main requires exactly one HEAD and remote refs/heads/main commit',
    )
  if (checkedOut !== env.GITHUB_SHA || currentMain !== checkedOut)
    throw new Error(
      'Current main rejected a stale or mismatched checkout; dispatch again from current main',
    )
  return checkedOut
}

export function parseArguments(args) {
  const options = {
    dryRun: false,
    ensureUnpublished: false,
    tag: undefined,
    currentMain: false,
  }
  const seen = new Set()
  for (const argument of args) {
    const key = argument.startsWith('--tag=') ? '--tag' : argument
    if (seen.has(key)) throw new Error('Duplicate release arguments')
    seen.add(key)
    if (argument === '--dry-run') options.dryRun = true
    else if (argument === '--ensure-unpublished')
      options.ensureUnpublished = true
    else if (argument === '--verify-current-main') options.currentMain = true
    else if (key === '--tag' && /^--tag=v1\.0\.0$/.test(argument))
      options.tag = argument.slice(6)
    else throw new Error('Invalid release arguments or tag')
  }
  if (options.currentMain && args.length !== 1)
    throw new Error('Current main arguments cannot be combined')
  return options
}

export async function verifyRelease(
  options = parseArguments(process.argv.slice(2)),
) {
  if (options.currentMain) {
    verifyCurrentMain()
    return
  }
  const metadata = JSON.parse(await readFile('package.json', 'utf8'))
  const issues = validateReleaseMetadata(metadata, options.tag)
  if (issues.length > 0) throw new Error(issues.join('\n'))
  if (options.ensureUnpublished)
    ensureVersionIsUnpublished(metadata.name, metadata.version)
  if (options.dryRun)
    execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      stdio: 'pipe',
      env: npmEnvironment(),
    })
  process.stdout.write(`Release dry run verified for ${metadata.version}.\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await verifyRelease()
}
