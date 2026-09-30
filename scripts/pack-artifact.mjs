import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  npmEnvironment,
  releaseName,
  releaseTarball,
  validateReleaseMetadata,
} from './verify-release.mjs'

const packageFiles = [
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'dist/core.css',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/styles.css',
  'dist/theme.css',
  'package.json',
]
const metadataKeys = [
  'access',
  'integrity',
  'name',
  'provenance',
  'sourceSha',
  'tag',
  'tarball',
  'version',
]

function requireSourceSha(sourceSha) {
  if (typeof sourceSha !== 'string' || !/^[a-f0-9]{40}$/.test(sourceSha))
    throw new Error('Artifact requires a valid source SHA')
}

function requireFileSurface(files) {
  if (
    !Array.isArray(files) ||
    JSON.stringify([...files].sort()) !== JSON.stringify(packageFiles)
  )
    throw new Error(
      'Release package file surface must match the exact public package files',
    )
}

function requireIntegrity(integrity) {
  const digest =
    typeof integrity === 'string' &&
    /^sha512-([A-Za-z0-9+/]+={0,2})$/.exec(integrity)?.[1]
  if (
    !digest ||
    Buffer.from(digest, 'base64').length !== 64 ||
    Buffer.from(digest, 'base64').toString('base64') !== digest
  )
    throw new Error('Artifact integrity requires canonical SHA-512 SRI')
}

export function validatePackDescriptor(descriptors) {
  if (!Array.isArray(descriptors) || descriptors.length !== 1)
    throw new Error('npm pack must return exactly one descriptor')
  const descriptor = descriptors[0]
  if (
    descriptor?.name !== releaseName ||
    descriptor?.version !== '1.0.0' ||
    descriptor?.filename !== releaseTarball
  )
    throw new Error('npm pack identity, version or filename mismatch')
  requireFileSurface(descriptor.files?.map((file) => file.path))
  requireIntegrity(descriptor.integrity)
  return descriptor
}

function requirePackageMetadata(metadata) {
  const issues = validateReleaseMetadata(metadata)
  if (issues.length) throw new Error(issues.join('\n'))
}

function inspectArchive(tarball, run) {
  const options = { encoding: 'utf8' }
  const paths = run('tar', ['-tzf', tarball], options).trimEnd().split('\n')
  requireFileSurface(
    paths.map((path) => (path.startsWith('package/') ? path.slice(8) : path)),
  )
  requirePackageMetadata(
    JSON.parse(run('tar', ['-xOf', tarball, 'package/package.json'], options)),
  )
}

function hashes(bytes) {
  return {
    integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    checksum: `${createHash('sha512').update(bytes).digest('hex')}  ${releaseTarball}\n`,
  }
}

export function prepareArtifact({
  root = process.cwd(),
  sourceSha = process.env.GITHUB_SHA ??
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  run = execFileSync,
} = {}) {
  requireSourceSha(sourceSha)
  requirePackageMetadata(
    JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')),
  )
  const directory = join(root, 'artifacts')
  mkdirSync(directory)
  try {
    const descriptor = validatePackDescriptor(
      JSON.parse(
        run(
          'npm',
          [
            'pack',
            '--json',
            '--ignore-scripts',
            '--pack-destination',
            directory,
          ],
          { cwd: root, encoding: 'utf8', env: npmEnvironment() },
        ),
      ),
    )
    const tarball = join(directory, releaseTarball)
    const { integrity, checksum } = hashes(readFileSync(tarball))
    if (integrity !== descriptor.integrity)
      throw new Error('Packed tarball integrity differs from npm descriptor')
    inspectArchive(tarball, run)
    const metadata = {
      name: releaseName,
      version: '1.0.0',
      tarball: releaseTarball,
      sourceSha,
      integrity,
      tag: 'latest',
      access: 'public',
      provenance: true,
    }
    writeFileSync(join(directory, `${releaseTarball}.sha512`), checksum, {
      flag: 'wx',
    })
    writeFileSync(
      join(directory, 'release-artifact.json'),
      `${JSON.stringify(metadata, null, 2)}\n`,
      { flag: 'wx' },
    )
    verifyRetainedArtifact({ root, sourceSha, run })
    return metadata
  } catch (error) {
    // This invocation owns the newly created directory; never remove earlier artifacts.
    rmSync(directory, { recursive: true, force: true })
    throw error
  }
}

export function verifyRetainedArtifact({
  root = process.cwd(),
  sourceSha = process.env.GITHUB_SHA,
  run = execFileSync,
} = {}) {
  requireSourceSha(sourceSha)
  requirePackageMetadata(
    JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')),
  )
  const directory = join(root, 'artifacts')
  const expectedFiles = [
    releaseTarball,
    `${releaseTarball}.sha512`,
    'release-artifact.json',
  ].sort()
  if (
    JSON.stringify(readdirSync(directory).sort()) !==
    JSON.stringify(expectedFiles)
  )
    throw new Error(
      'Artifact must contain exactly the tarball, checksum and metadata',
    )
  for (const filename of expectedFiles)
    if (!lstatSync(join(directory, filename)).isFile())
      throw new Error('Artifact entries must be regular files')
  const metadata = JSON.parse(
    readFileSync(join(directory, 'release-artifact.json'), 'utf8'),
  )
  if (
    !metadata ||
    Array.isArray(metadata) ||
    JSON.stringify(Object.keys(metadata).sort()) !==
      JSON.stringify(metadataKeys)
  )
    throw new Error('Invalid artifact metadata fields')
  if (metadata.sourceSha !== sourceSha)
    throw new Error('Retained artifact source SHA mismatch')
  if (
    metadata.name !== releaseName ||
    metadata.version !== '1.0.0' ||
    metadata.tarball !== releaseTarball ||
    metadata.tag !== 'latest' ||
    metadata.access !== 'public' ||
    metadata.provenance !== true
  )
    throw new Error('Retained artifact publication policy mismatch')
  requireIntegrity(metadata.integrity)
  const tarball = join(directory, releaseTarball)
  const { integrity, checksum } = hashes(readFileSync(tarball))
  if (integrity !== metadata.integrity)
    throw new Error('Retained tarball integrity mismatch')
  if (
    readFileSync(join(directory, `${releaseTarball}.sha512`), 'utf8') !==
    checksum
  )
    throw new Error('Retained artifact checksum mismatch')
  inspectArchive(tarball, run)
  return metadata
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    const metadata = prepareArtifact()
    process.stdout.write(`${resolve('artifacts', metadata.tarball)}\n`)
  } else if (args.length === 1 && args[0] === '--verify-retained') {
    verifyRetainedArtifact()
    process.stdout.write('Retained artifact bytes and policy verified.\n')
  } else throw new Error('Usage: pack-artifact.mjs [--verify-retained]')
}
