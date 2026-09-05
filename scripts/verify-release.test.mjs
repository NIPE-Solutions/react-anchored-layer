import assert from 'node:assert/strict'
import { test } from 'node:test'

import { validateRelease } from './verify-release.mjs'

test('accepts the alpha package version and matching tag', () => {
  assert.deepEqual(validateRelease('0.1.0-alpha.0', 'v0.1.0-alpha.0'), [])
})

test('rejects stable versions and mismatched tags', () => {
  assert.deepEqual(validateRelease('1.0.0', 'v0.1.0-alpha.0'), [
    'Initial releases must use an alpha prerelease version',
    'Tag v0.1.0-alpha.0 does not match package version 1.0.0',
  ])
})
