import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import { validateCoreCss } from './check-css-contract.mjs'

test('core CSS contains mechanics but no theme', async () => {
  const css = await readFile(
    new URL('../src/styles/core.css', import.meta.url),
    'utf8',
  )
  assert.deepEqual(validateCoreCss(css), [])
})

test('core CSS validator rejects decorative rules', () => {
  assert.deepEqual(validateCoreCss('.x { background: red; }'), [
    'core.css must not set decorative property: background',
  ])
})
