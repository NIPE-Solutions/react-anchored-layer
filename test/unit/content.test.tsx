import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Anchor } from '../../src/anchor'
import { Content } from '../../src/content'
import { Portal } from '../../src/portal'
import { Root } from '../../src/root'

const floatingState = vi.hoisted(() => ({
  isPositioned: false,
  middleware: [] as unknown[],
  placement: 'top-end',
}))

interface FloatingOptionsMock {
  middleware: unknown[]
}

vi.mock('@floating-ui/react-dom', () => ({
  autoUpdate: vi.fn(() => vi.fn()),
  flip: vi.fn((options: unknown) => ({ name: 'flip', options })),
  offset: vi.fn((options: unknown) => ({ name: 'offset', options })),
  shift: vi.fn((options: unknown) => ({ name: 'shift', options })),
  size: vi.fn((options: unknown) => ({ name: 'size', options })),
  useFloating: vi.fn((options: FloatingOptionsMock) => {
    floatingState.middleware = options.middleware
    return {
      context: {},
      floatingStyles: { left: 12, position: 'absolute', top: 34 },
      isPositioned: floatingState.isPositioned,
      placement: floatingState.placement,
      refs: {
        setFloating: vi.fn(),
        setReference: vi.fn(),
      },
    }
  }),
}))

describe('Content', () => {
  beforeEach(() => {
    floatingState.isPositioned = false
    floatingState.middleware = []
    floatingState.placement = 'top-end'
  })

  it('renders nothing while closed', () => {
    render(
      <Root open={false}>
        <Anchor>Anchor</Anchor>
        <Content data-testid="content">Layer</Content>
      </Root>,
    )
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('keeps the first unpositioned render mechanically hidden', () => {
    render(
      <Root open>
        <Anchor>Anchor</Anchor>
        <Content data-testid="content">Layer</Content>
      </Root>,
    )

    const content = screen.getByTestId('content')
    expect(content).toHaveAttribute('data-anchored-layer-content', '')
    expect(content).toHaveAttribute('data-positioned', 'false')
    expect(content).toHaveStyle({ pointerEvents: 'none', visibility: 'hidden' })
  })

  it('exposes final placement and consumer semantics when positioned', () => {
    floatingState.isPositioned = true
    render(
      <Root open>
        <Anchor>Anchor</Anchor>
        <Content
          data-testid="content"
          id="results"
          role="listbox"
          style={{ color: 'red' }}
        >
          Layer
        </Content>
      </Root>,
    )

    const content = screen.getByTestId('content')
    expect(content).toHaveAttribute('data-state', 'open')
    expect(content).toHaveAttribute('data-positioned', 'true')
    expect(content).toHaveAttribute('data-side', 'top')
    expect(content).toHaveAttribute('data-align', 'end')
    expect(content).toHaveAttribute('role', 'listbox')
    expect(content).toHaveStyle({
      color: 'rgb(255, 0, 0)',
      left: '12px',
      top: '34px',
    })
    expect(
      content.style.getPropertyValue('--anchored-layer-transform-origin'),
    ).toBe('right bottom')
  })

  it('builds offset, flip, shift, and size middleware with defaults', () => {
    render(
      <Root open>
        <Anchor>Anchor</Anchor>
        <Content collisionPadding={12} matchAnchorWidth offset={6}>
          Layer
        </Content>
      </Root>,
    )

    expect(
      floatingState.middleware.map((entry) => (entry as { name: string }).name),
    ).toEqual(['offset', 'flip', 'shift', 'size'])
    expect((floatingState.middleware[0] as { options: unknown }).options).toBe(
      6,
    )
    expect(
      (floatingState.middleware[1] as { options: unknown }).options,
    ).toEqual({ padding: 12 })
  })

  it('matches anchor width without losing a consumer width when disabled', () => {
    floatingState.isPositioned = true
    const { rerender } = render(
      <Root open>
        <Anchor>Anchor</Anchor>
        <Content data-testid="content" matchAnchorWidth style={{ width: 310 }}>
          Layer
        </Content>
      </Root>,
    )
    expect(screen.getByTestId('content').style.width).toBe(
      'var(--anchored-layer-anchor-width)',
    )

    rerender(
      <Root open>
        <Anchor>Anchor</Anchor>
        <Content data-testid="content" style={{ width: 310 }}>
          Layer
        </Content>
      </Root>,
    )
    expect(screen.getByTestId('content')).toHaveStyle({ width: '310px' })
  })

  it('avoids a second portal inside an explicit Portal', () => {
    const container = document.createElement('div')
    document.body.append(container)
    floatingState.isPositioned = true

    const { unmount } = render(
      <Root open>
        <Anchor>Anchor</Anchor>
        <Portal container={container}>
          <Content data-testid="content">Layer</Content>
        </Portal>
      </Root>,
    )

    expect(screen.getByTestId('content').parentElement).toBe(container)
    unmount()
    container.remove()
  })
})
