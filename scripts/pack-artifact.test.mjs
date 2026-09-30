import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import * as artifact from './pack-artifact.mjs'

const sha = 'a'.repeat(40)
const metadata = {
  name: '@nipe-solutions/react-anchored-layer',
  version: '1.0.0',
  publishConfig: { access: 'public', provenance: true, tag: 'latest' },
  files: ['dist', 'CHANGELOG.md', 'LICENSE'],
}

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'anchored-release-'))
  mkdirSync(join(root, 'dist'))
  writeFileSync(join(root, 'package.json'), JSON.stringify(metadata))
  for (const path of [
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/core.css',
    'dist/theme.css',
    'dist/styles.css',
  ])
    writeFileSync(join(root, path), 'fixture\n')
  try {
    run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('packs and rechecks the same retained bytes with exact source identity', () =>
  fixture((root) => {
    const release = artifact.prepareArtifact({ root, sourceSha: sha })
    assert.equal(
      release.tarball,
      'nipe-solutions-react-anchored-layer-1.0.0.tgz',
    )
    assert.equal(release.sourceSha, sha)
    assert.equal(release.tag, 'latest')
    assert.deepEqual(
      artifact.verifyRetainedArtifact({ root, sourceSha: sha }),
      release,
    )
    assert.match(
      readFileSync(
        join(root, 'artifacts', `${release.tarball}.sha512`),
        'utf8',
      ),
      /^[a-f0-9]{128} {2}nipe-solutions-react-anchored-layer-1\.0\.0\.tgz\n$/,
    )
    assert.throws(
      () => artifact.prepareArtifact({ root, sourceSha: sha }),
      /EEXIST|preexisting/,
    )
  }))

test('retained artifact rejects mutated bytes, checksums, identity and extra files', () =>
  fixture((root) => {
    const release = artifact.prepareArtifact({ root, sourceSha: sha })
    const directory = join(root, 'artifacts')
    const tarball = join(directory, release.tarball)
    const original = readFileSync(tarball)
    writeFileSync(tarball, 'altered bytes')
    assert.throws(
      () => artifact.verifyRetainedArtifact({ root, sourceSha: sha }),
      /integrity/,
    )
    writeFileSync(tarball, original)
    assert.throws(
      () =>
        artifact.verifyRetainedArtifact({ root, sourceSha: 'b'.repeat(40) }),
      /source/,
    )
    const checksum = join(directory, `${release.tarball}.sha512`)
    const originalChecksum = readFileSync(checksum)
    writeFileSync(
      checksum,
      originalChecksum.toString() + originalChecksum.toString(),
    )
    assert.throws(
      () => artifact.verifyRetainedArtifact({ root, sourceSha: sha }),
      /checksum/,
    )
    writeFileSync(checksum, originalChecksum)
    writeFileSync(join(directory, 'extra'), 'unsafe')
    assert.throws(
      () => artifact.verifyRetainedArtifact({ root, sourceSha: sha }),
      /exactly/,
    )
  }))

test('packing rejects unexpected package files and refuses unsafe source SHA', () =>
  fixture((root) => {
    writeFileSync(join(root, 'dist', 'secret.txt'), 'must not ship')
    assert.throws(
      () => artifact.prepareArtifact({ root, sourceSha: sha }),
      /file surface/,
    )
    assert.throws(
      () => artifact.prepareArtifact({ root, sourceSha: 'bad\nsha' }),
      /source SHA/,
    )
  }))

test('pack descriptor validation rejects wrong identity and malformed integrity', () => {
  const descriptor = {
    name: metadata.name,
    version: '1.0.0',
    filename: 'nipe-solutions-react-anchored-layer-1.0.0.tgz',
    integrity: 'sha512-' + Buffer.alloc(64).toString('base64'),
    files: [
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
    ].map((path) => ({ path })),
  }
  assert.doesNotThrow(() => artifact.validatePackDescriptor([descriptor]))
  for (const patch of [
    { name: '@other/package' },
    { version: '1.0.1' },
    { filename: '../escape.tgz' },
    { integrity: 'sha512-YWJjZA==' },
    { files: [...descriptor.files, descriptor.files[0]] },
  ])
    assert.throws(() =>
      artifact.validatePackDescriptor([{ ...descriptor, ...patch }]),
    )
  for (const descriptors of [[], [descriptor, descriptor], {}])
    assert.throws(
      () => artifact.validatePackDescriptor(descriptors),
      /exactly one/,
    )
})

test('an npm pack process failure cannot leave an approvable artifact', () =>
  fixture((root) => {
    assert.throws(
      () =>
        artifact.prepareArtifact({
          root,
          sourceSha: sha,
          run: (command, args, options) => {
            if (command === 'npm') throw new Error('pack failed')
            return execFileSync(command, args, options)
          },
        }),
      /pack failed/,
    )
    assert.throws(
      () => artifact.verifyRetainedArtifact({ root, sourceSha: sha }),
      /ENOENT|exactly/,
    )
  }))
