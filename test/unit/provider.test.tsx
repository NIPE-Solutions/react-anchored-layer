import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { usePortalRoot } from '../../src/context'
import { Provider } from '../../src/provider'

function PortalRootProbe() {
  const portalRoot = usePortalRoot()
  return <output>{portalRoot?.dataset.name ?? 'none'}</output>
}

describe('Provider', () => {
  it('uses the nearest portal root', () => {
    const outer = document.createElement('div')
    outer.dataset.name = 'outer'
    const inner = document.createElement('div')
    inner.dataset.name = 'inner'

    render(
      <Provider portalRoot={outer}>
        <PortalRootProbe />
        <Provider portalRoot={inner}>
          <PortalRootProbe />
        </Provider>
      </Provider>,
    )

    expect(
      screen.getAllByRole('status').map((node) => node.textContent),
    ).toEqual(['outer', 'inner'])
  })
})
