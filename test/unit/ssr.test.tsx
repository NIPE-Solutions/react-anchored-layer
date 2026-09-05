// @vitest-environment node
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import * as publicApi from '../../src/index'
import { Portal } from '../../src/portal'

describe('server rendering', () => {
  it('imports without DOM globals', () => {
    expect(publicApi).toBeDefined()
  })

  it('omits portal content on the server', () => {
    expect(
      renderToString(
        <Portal>
          <div>Floating</div>
        </Portal>,
      ),
    ).toBe('')
  })
})
