import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Portal } from '../../src/portal'
import { Provider } from '../../src/provider'

describe('Portal', () => {
  it('portals into document.body by default', () => {
    const host = document.createElement('div')
    document.body.append(host)

    const { unmount } = render(
      <Portal>
        <div data-testid="layer" />
      </Portal>,
      { container: host },
    )

    expect(screen.getByTestId('layer').parentElement).toBe(document.body)
    unmount()
    host.remove()
  })

  it('prefers an explicit container over the provider root', () => {
    const providerRoot = document.createElement('div')
    const explicitRoot = document.createElement('div')
    document.body.append(providerRoot, explicitRoot)

    const { unmount } = render(
      <Provider portalRoot={providerRoot}>
        <Portal container={explicitRoot}>
          <div data-testid="layer" />
        </Portal>
      </Provider>,
    )

    expect(screen.getByTestId('layer').parentElement).toBe(explicitRoot)
    unmount()
    providerRoot.remove()
    explicitRoot.remove()
  })

  it('uses the nearest provider root when no container is supplied', () => {
    const providerRoot = document.createElement('div')
    document.body.append(providerRoot)

    const { unmount } = render(
      <Provider portalRoot={providerRoot}>
        <Portal>
          <div data-testid="layer" />
        </Portal>
      </Provider>,
    )

    expect(screen.getByTestId('layer').parentElement).toBe(providerRoot)
    unmount()
    providerRoot.remove()
  })

  it('does not fall back when an explicit container is detached', () => {
    const detached = document.createElement('div')
    const { rerender } = render(
      <Portal container={detached}>
        <div data-testid="layer" />
      </Portal>,
    )

    expect(screen.queryByTestId('layer')).not.toBeInTheDocument()

    document.body.append(detached)
    rerender(
      <Portal container={detached}>
        <div data-testid="layer" />
      </Portal>,
    )
    expect(screen.getByTestId('layer').parentElement).toBe(detached)
    detached.remove()
  })
})
