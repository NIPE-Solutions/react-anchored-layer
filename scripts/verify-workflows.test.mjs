import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('CI and browser workflows enforce the quality gates', async () => {
  const ci = await readFile('.github/workflows/ci.yml', 'utf8')
  const browser = await readFile('.github/workflows/browser.yml', 'utf8')
  assert.match(ci, /npm ci/)
  assert.match(ci, /npm run check/)
  for (const engine of ['chromium', 'firefox', 'webkit']) {
    assert.match(browser, new RegExp(engine))
  }
})

test('release workflow requires OIDC and explicit dispatch', async () => {
  const release = await readFile('.github/workflows/release.yml', 'utf8')
  assert.match(release, /workflow_dispatch/)
  assert.match(release, /id-token: write/)
  assert.match(release, /npm publish --provenance/)
  assert.doesNotMatch(release, /push:/)
})
