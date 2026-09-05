import { createRef, forwardRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Anchor } from '../../src/anchor'
import { useAnchoredLayerContext } from '../../src/context'
import { Root } from '../../src/root'

function RegisteredAnchor() {
  const { anchor } = useAnchoredLayerContext('RegisteredAnchor')
  return <output data-testid="registered">{anchor?.tagName ?? 'none'}</output>
}

describe('Anchor', () => {
  it('renders a span and registers it by default', () => {
    render(
      <Root>
        <Anchor data-testid="anchor">Reference</Anchor>
        <RegisteredAnchor />
      </Root>,
    )

    expect(screen.getByTestId('anchor').tagName).toBe('SPAN')
    expect(screen.getByTestId('registered')).toHaveTextContent('SPAN')
  })

  it('composes refs when rendering asChild', () => {
    const consumerRef = createRef<HTMLInputElement>()

    render(
      <Root>
        <Anchor asChild>
          <input ref={consumerRef} aria-label="Address" />
        </Anchor>
        <RegisteredAnchor />
      </Root>,
    )

    expect(consumerRef.current).toBe(screen.getByRole('textbox'))
    expect(screen.getByTestId('registered')).toHaveTextContent('INPUT')
  })

  it('preserves a child component callback ref', () => {
    let referencedNode: HTMLButtonElement | null = null
    const Button = forwardRef<HTMLButtonElement>((_, ref) => (
      <button ref={ref} type="button">
        Choose
      </button>
    ))

    render(
      <Root>
        <Anchor asChild>
          <Button
            ref={(node) => {
              referencedNode = node
            }}
          />
        </Anchor>
      </Root>,
    )

    expect(referencedNode).toBe(screen.getByRole('button'))
  })

  it('clears registration when the anchor unmounts', () => {
    function Fixture() {
      const [visible, setVisible] = useState(true)
      return (
        <Root>
          <button
            type="button"
            onClick={() => {
              setVisible(false)
            }}
          >
            Remove
          </button>
          {visible ? <Anchor>Reference</Anchor> : null}
          <RegisteredAnchor />
        </Root>
      )
    }

    render(<Fixture />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('registered')).toHaveTextContent('none')
  })

  it('requires exactly one valid element for asChild', () => {
    expect(() =>
      render(
        <Root>
          <Anchor asChild>text</Anchor>
        </Root>,
      ),
    ).toThrow('AnchoredLayer.Anchor with asChild requires one React element')
  })
})
