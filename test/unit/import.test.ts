import { describe, expect, it } from 'vitest'

import * as api from '../../src/index'

describe('public module', () => {
  it('loads without browser globals', () => {
    expect(api).toBeDefined()
  })
})
