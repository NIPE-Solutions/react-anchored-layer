import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  ensureVersionIsUnpublished,
  validateRelease,
} from './verify-release.mjs'

test('accepts the alpha package version and matching tag', () => {
  assert.deepEqual(validateRelease('0.1.0-alpha.0', 'v0.1.0-alpha.0'), [])
})

test('rejects stable versions and mismatched tags', () => {
  assert.deepEqual(validateRelease('1.0.0', 'v0.1.0-alpha.0'), [
    'Initial releases must use an alpha prerelease version',
    'Tag v0.1.0-alpha.0 does not match package version 1.0.0',
  ])
})

test('rejects a version that already exists on npm', () => {
  assert.throws(
    () =>
      ensureVersionIsUnpublished(
        '@nipe-solutions/react-anchored-layer',
        '0.1.0-alpha.0',
        () => ({ status: 0, stdout: '"0.1.0-alpha.0"\n', stderr: '' }),
      ),
    /already exists on npm/,
  )
})

test('accepts an npm 404 and rejects registry failures', () => {
  assert.doesNotThrow(() =>
    ensureVersionIsUnpublished(
      '@nipe-solutions/react-anchored-layer',
      '0.1.0-alpha.0',
      () => ({ status: 1, stdout: '', stderr: 'npm error code E404' }),
    ),
  )

  assert.throws(
    () =>
      ensureVersionIsUnpublished(
        '@nipe-solutions/react-anchored-layer',
        '0.1.0-alpha.0',
        () => ({ status: 1, stdout: '', stderr: 'network timeout' }),
      ),
    /Could not verify npm publication state/,
  )
})
