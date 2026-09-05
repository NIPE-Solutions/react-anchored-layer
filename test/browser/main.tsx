import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { AnchoredLayer as A } from '../../src'
import '../../src/styles/core.css'
import './styles.css'

function Layer({ children = 'Result' }: { children?: React.ReactNode }) {
  return (
    <A.Content data-testid="layer" matchAnchorWidth offset={6} role="region">
      {children}
    </A.Content>
  )
}

function BasicFixture({ rtl = false }: { rtl?: boolean }) {
  return (
    <main className="fixture centered" dir={rtl ? 'rtl' : 'ltr'}>
      <A.Root open>
        <A.Anchor asChild>
          <input data-testid="anchor" aria-label="Address" />
        </A.Anchor>
        <Layer />
      </A.Root>
    </main>
  )
}

function ScrollFixture() {
  const [validation, setValidation] = useState(false)
  return (
    <main className="fixture">
      <button
        type="button"
        onClick={() => {
          setValidation(true)
        }}
      >
        Add validation message
      </button>
      <div className="clip-frame">
        <div className="scroller" data-testid="scroller">
          <div className="spacer" />
          {validation ? <p className="validation">Check this address</p> : null}
          <A.Root open>
            <A.Anchor asChild>
              <input data-testid="anchor" aria-label="Address" />
            </A.Anchor>
            <Layer />
          </A.Root>
          <div className="spacer" />
        </div>
      </div>
    </main>
  )
}

function CollisionFixture() {
  const [count, setCount] = useState(1)
  return (
    <main className="fixture collision-fixture">
      <button
        type="button"
        onClick={() => {
          setCount(12)
        }}
      >
        Show twelve results
      </button>
      <A.Root open>
        <A.Anchor asChild>
          <input data-testid="anchor" aria-label="Address" />
        </A.Anchor>
        <Layer>
          {Array.from({ length: count }, (_, index) => (
            <div className="result" key={index}>
              Result {index + 1}
            </div>
          ))}
        </Layer>
      </A.Root>
    </main>
  )
}

function LifecycleFixture() {
  const [open, setOpen] = useState(false)
  const [anchorVisible, setAnchorVisible] = useState(true)
  return (
    <main className="fixture centered">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value)
        }}
      >
        Toggle layer
      </button>
      <button
        type="button"
        onClick={() => {
          setAnchorVisible(false)
        }}
      >
        Remove anchor
      </button>
      <A.Root open={open}>
        {anchorVisible ? (
          <A.Anchor asChild>
            <input data-testid="anchor" aria-label="Address" />
          </A.Anchor>
        ) : null}
        <Layer />
      </A.Root>
    </main>
  )
}

const fixture = new URLSearchParams(window.location.search).get('fixture')
const content =
  fixture === 'scroll' ? (
    <ScrollFixture />
  ) : fixture === 'collision' ? (
    <CollisionFixture />
  ) : fixture === 'rtl' ? (
    <BasicFixture rtl />
  ) : fixture === 'lifecycle' ? (
    <LifecycleFixture />
  ) : (
    <BasicFixture />
  )

const root = document.getElementById('root')
if (root === null) throw new Error('Fixture root is missing')
createRoot(root).render(<StrictMode>{content}</StrictMode>)
