import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import { validateReleaseWorkflow } from './verify-workflows.mjs'

test('CI and browser workflows enforce the quality gates', async () => {
  const ci = await readFile('.github/workflows/ci.yml', 'utf8')
  const browser = await readFile('.github/workflows/browser.yml', 'utf8')
  assert.match(ci, /npm ci/)
  assert.match(ci, /npm run check/)
  for (const engine of ['chromium', 'firefox', 'webkit']) {
    assert.match(browser, new RegExp(engine))
  }
})

test('release workflow publishes only from a published GitHub release', async () => {
  const release = await readFile('.github/workflows/release.yml', 'utf8')
  assert.deepEqual(validateReleaseWorkflow(release), [])
})

test('release workflow rejects a manually publishable dispatch', () => {
  const unsafeWorkflow = `
on:
  workflow_dispatch:
    inputs:
      publish:
        type: boolean
permissions:
  id-token: write
steps:
  - if: inputs.publish
    run: npm publish --provenance --access public --tag alpha
`

  assert.deepEqual(validateReleaseWorkflow(unsafeWorkflow), [
    'release.published trigger is required',
    'manual dispatch must not accept a publish input',
    'publish step must be restricted to the release event',
    'release tag must be checked out explicitly',
    'duplicate npm versions must be rejected',
    'full browser matrix must run before publishing',
    'per-tag publish concurrency is required',
    'release dependency caching must be disabled',
  ])
})
