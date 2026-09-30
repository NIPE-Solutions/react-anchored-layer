import { act, render, screen, waitFor } from '@testing-library/react'
import { platform } from '@floating-ui/react-dom'
import { flushSync } from 'react-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AnchoredLayer as A } from '../../src'

describe('content ref lifecycle', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {
          /* JSDOM has no layout engine. */
        }
        unobserve() {
          /* JSDOM has no layout engine. */
        }
        disconnect() {
          /* JSDOM has no layout engine. */
        }
      },
    )
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {
          /* Observer notifications require a browser layout engine. */
        }
        disconnect() {
          /* Observer notifications require a browser layout engine. */
        }
      },
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })
  it('retains the content ref through rerenders and releases it on close', () => {
    const attachments: HTMLElement[] = []
    const releases: HTMLElement[] = []
    const contentRef = (node: HTMLDivElement | null) => {
      if (node !== null) {
        attachments.push(node)
        return () => {
          releases.push(node)
        }
      }
    }
    const fixture = (open: boolean, text: string) => (
      <A.Root open={open}>
        <A.Anchor>Anchor</A.Anchor>
        <A.Content ref={contentRef} data-testid="layer">
          {text}
        </A.Content>
      </A.Root>
    )
    const { rerender } = render(fixture(true, 'Before'))
    const node = screen.getByTestId('layer')
    expect(attachments).toEqual([node])
    rerender(fixture(true, 'After'))
    expect(attachments).toEqual([node])
    expect(releases).toEqual([])
    rerender(fixture(false, 'After'))
    expect(screen.queryByTestId('layer')).not.toBeInTheDocument()
    expect(releases).toEqual([node])
  })

  it('hides a replacement anchor until its own position has resolved', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return new DOMRect(
          this.dataset.testid === 'after' ? 500 : 100,
          60,
          100,
          20,
        )
      },
    )
    const fixture = (anchorKey: string) => (
      <A.Root open>
        <A.Anchor key={anchorKey} data-testid={anchorKey}>
          Anchor
        </A.Anchor>
        <A.Content data-testid="layer" avoidCollisions={false}>
          Layer
        </A.Content>
      </A.Root>
    )
    const { rerender } = render(fixture('before'))
    await waitFor(() => {
      expect(screen.getByTestId('layer')).toHaveAttribute(
        'data-positioned',
        'true',
      )
    })
    const oldTransform = screen.getByTestId('layer').style.transform

    act(() => {
      flushSync(() => {
        rerender(fixture('after'))
      })
    })

    // The real positioning hook still has its old result before its promise settles.
    expect(screen.getByTestId('layer')).toHaveAttribute(
      'data-positioned',
      'false',
    )
    expect(screen.getByTestId('layer')).toHaveStyle({ visibility: 'hidden' })
    await waitFor(() => {
      expect(screen.getByTestId('layer')).toHaveAttribute(
        'data-positioned',
        'true',
      )
      expect(screen.getByTestId('layer').style.transform).not.toBe(oldTransform)
    })
  })

  it('recovers when a previous anchor calculation finishes after its replacement', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return new DOMRect(
          this.dataset.testid === 'after' ? 500 : 100,
          60,
          100,
          20,
        )
      },
    )
    const fixture = (anchorKey: string) => (
      <A.Root open>
        <A.Anchor key={anchorKey} data-testid={anchorKey}>
          Anchor
        </A.Anchor>
        <A.Content data-testid="layer" avoidCollisions={false}>
          Layer
        </A.Content>
      </A.Root>
    )
    const { rerender } = render(fixture('before'))
    await waitFor(() => {
      expect(screen.getByTestId('layer')).toHaveAttribute(
        'data-positioned',
        'true',
      )
    })

    let releaseOldCalculation: (() => void) | undefined
    let delayOldCalculation = true
    const getElementRects = platform.getElementRects.bind(platform)
    vi.spyOn(platform, 'getElementRects').mockImplementation(
      async (options) => {
        const rects = await getElementRects(options)
        if (
          delayOldCalculation &&
          options.reference instanceof HTMLElement &&
          options.reference.dataset.testid === 'before'
        ) {
          delayOldCalculation = false
          await new Promise<void>((resolve) => {
            releaseOldCalculation = resolve
          })
        }
        return rects
      },
    )
    window.dispatchEvent(new Event('resize'))
    await waitFor(() => {
      expect(releaseOldCalculation).toBeTypeOf('function')
    })

    rerender(fixture('after'))
    await waitFor(() => {
      expect(screen.getByTestId('layer')).toHaveAttribute(
        'data-positioned',
        'true',
      )
    })
    const replacementTransform = screen.getByTestId('layer').style.transform
    await act(async () => {
      releaseOldCalculation?.()
      await Promise.resolve()
    })
    await waitFor(() => {
      expect(screen.getByTestId('layer')).toHaveAttribute(
        'data-positioned',
        'true',
      )
      expect(screen.getByTestId('layer').style.transform).toBe(
        replacementTransform,
      )
    })
  })
})
