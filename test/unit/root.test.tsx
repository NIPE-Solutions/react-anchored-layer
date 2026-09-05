import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAnchoredLayerContext } from '../../src/context'
import { Root } from '../../src/root'

function StateProbe() {
  const { open, setOpen } = useAnchoredLayerContext('StateProbe')

  return (
    <button
      type="button"
      onClick={() => {
        setOpen(!open)
      }}
    >
      {open ? 'open' : 'closed'}
    </button>
  )
}

describe('Root', () => {
  it('reflects controlled state and requests changes', () => {
    const onOpenChange = vi.fn()

    const { rerender } = render(
      <Root open={false} onOpenChange={onOpenChange}>
        <StateProbe />
      </Root>,
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button')).toHaveTextContent('closed')

    rerender(
      <Root open onOpenChange={onOpenChange}>
        <StateProbe />
      </Root>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('open')
  })

  it('supports mechanical uncontrolled state', () => {
    render(
      <Root defaultOpen>
        <StateProbe />
      </Root>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('open')
    fireEvent.click(button)
    expect(button).toHaveTextContent('closed')
  })

  it('rejects compound children outside Root', () => {
    expect(() => render(<StateProbe />)).toThrow(
      'StateProbe must be used within AnchoredLayer.Root',
    )
  })
})
