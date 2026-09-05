import assert from 'node:assert/strict'
import { test } from 'node:test'

import { expectedExports } from './check-public-api.mjs'

test('public API is deliberately small', () => {
  assert.deepEqual(expectedExports, [
    'Anchor',
    'AnchoredLayer',
    'Content',
    'Portal',
    'Provider',
    'Root',
  ])
})
