import assert from 'node:assert/strict'
import { test } from 'node:test'

import { requiredSiteFragments } from './verify-website.mjs'

test('website verification covers product and legal requirements', () => {
  assert.ok(requiredSiteFragments.includes('What Anchored Layer does not own'))
  assert.ok(
    requiredSiteFragments.includes('Positioning is powered by Floating UI'),
  )
  assert.ok(
    requiredSiteFragments.includes('https://opensource.nipesolutions.com'),
  )
  assert.ok(
    requiredSiteFragments.includes(
      'https://opensource.nipesolutions.com/impressum',
    ),
  )
  assert.ok(
    requiredSiteFragments.includes(
      'https://opensource.nipesolutions.com/privacy',
    ),
  )
})
