import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as release from './verify-release.mjs'

const name = '@nipe-solutions/react-anchored-layer'
const sha = 'a'.repeat(40)
const metadata = {
  name,
  version: '1.0.0',
  publishConfig: { access: 'public', provenance: true, tag: 'latest' },
}

test('accepts exactly the stable version and matching optional tag', () => {
  assert.deepEqual(release.validateRelease('1.0.0', 'v1.0.0'), [])
  assert.deepEqual(release.validateRelease('1.0.0'), [])
  for (const version of ['0.1.0-alpha.0', '1.0.1', '01.0.0', '1.0.0+build'])
    assert.ok(release.validateRelease(version).length > 0)
  assert.ok(release.validateRelease('1.0.0', 'v1.0.1').length > 0)
})

test('publication policy rejects wrong identity and unsafe configuration', () => {
  assert.deepEqual(release.validateReleaseMetadata(metadata), [])
  for (const patch of [
    { name: '@other/package' },
    { private: true },
    { publishConfig: { ...metadata.publishConfig, tag: 'alpha' } },
    { publishConfig: { ...metadata.publishConfig, provenance: 'true' } },
    { publishConfig: { ...metadata.publishConfig, access: 'restricted' } },
  ])
    assert.ok(
      release.validateReleaseMetadata({ ...metadata, ...patch }).length > 0,
    )
})

test('registry guard accepts only a structured version E404', () => {
  const absent = {
    status: 1,
    stdout: JSON.stringify({ error: { code: 'E404' } }),
    stderr: 'npm error code E404',
  }
  assert.doesNotThrow(() =>
    release.ensureVersionIsUnpublished(name, '1.0.0', () => absent),
  )
  assert.throws(
    () =>
      release.ensureVersionIsUnpublished(name, '1.0.0', () => ({
        status: 0,
        stdout: '"1.0.0"',
        stderr: '',
      })),
    /already exists/,
  )
  for (const result of [
    { status: 1, stdout: '', stderr: 'timeout mentions E404' },
    { status: 1, stdout: '{broken', stderr: 'E404' },
    { status: null, signal: 'SIGTERM', stdout: absent.stdout, stderr: '' },
    { ...absent, error: new Error('spawn failed') },
    {
      status: 1,
      stdout: JSON.stringify({ error: { code: 'E503' } }),
      stderr: '',
    },
  ])
    assert.throws(
      () => release.ensureVersionIsUnpublished(name, '1.0.0', () => result),
      /Could not verify/,
    )
})

test('registry lookup pins the public registry and ignores user npm configuration', () => {
  release.ensureVersionIsUnpublished(
    name,
    '1.0.0',
    (command, args, options) => {
      assert.equal(command, 'npm')
      assert.deepEqual(args, [
        'view',
        `${name}@1.0.0`,
        'version',
        '--json',
        '--registry=https://registry.npmjs.org',
      ])
      assert.equal(options.env.NPM_CONFIG_USERCONFIG, '/dev/null')
      return { status: 1, stdout: '{"error":{"code":"E404"}}', stderr: '' }
    },
  )
})

test('current main guard compares exact HEAD, dispatched SHA and fresh remote ref', () => {
  const env = {
    GITHUB_SHA: sha,
    GITHUB_REF: 'refs/heads/main',
    GITHUB_EVENT_NAME: 'workflow_dispatch',
  }
  const run = (command, args) => {
    assert.equal(command, 'git')
    return args[0] === 'rev-parse' ? `${sha}\n` : `${sha}\trefs/heads/main\n`
  }
  assert.equal(release.verifyCurrentMain({ env, run }), sha)
  for (const remote of [
    `${'b'.repeat(40)}\trefs/heads/main\n`,
    `${sha}\trefs/heads/not-main\n`,
    `${sha}\trefs/heads/main\n${sha}\trefs/heads/main\n`,
    '',
  ])
    assert.throws(
      () =>
        release.verifyCurrentMain({
          env,
          run: (_command, args) =>
            args[0] === 'rev-parse' ? `${sha}\n` : remote,
        }),
      /Current main/,
    )
  assert.throws(
    () =>
      release.verifyCurrentMain({
        env,
        run: () => {
          throw new Error('network failed')
        },
      }),
    /lookup failed/,
  )
  assert.throws(
    () =>
      release.verifyCurrentMain({ env: { ...env, GITHUB_SHA: 'bad' }, run }),
    /SHA/,
  )
  assert.throws(
    () =>
      release.verifyCurrentMain({
        env: { ...env, GITHUB_REF: 'refs/heads/feature' },
        run,
      }),
    /manual dispatch from main/,
  )
  assert.throws(
    () =>
      release.verifyCurrentMain({
        env: { ...env, GITHUB_EVENT_NAME: 'release' },
        run,
      }),
    /manual dispatch from main/,
  )
  assert.throws(
    () =>
      release.verifyCurrentMain({
        env: { ...env, GITHUB_SHA: 'b'.repeat(40) },
        run,
      }),
    /stale|mismatched/,
  )
})

test('release arguments reject accidental publishing and ambiguous forms', () => {
  assert.deepEqual(release.parseArguments(['--dry-run']), {
    dryRun: true,
    ensureUnpublished: false,
    tag: undefined,
    currentMain: false,
  })
  assert.equal(
    release.parseArguments(['--verify-current-main']).currentMain,
    true,
  )
  assert.equal(
    release.parseArguments(['--ensure-unpublished']).ensureUnpublished,
    true,
  )
  for (const args of [
    ['--publish'],
    ['--tag='],
    ['--tag=v1.0.0', '--tag=v1.0.1'],
    ['--verify-current-main', '--dry-run'],
  ])
    assert.throws(() => release.parseArguments(args), /arguments|tag/)
})
