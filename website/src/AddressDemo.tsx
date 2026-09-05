import { useRef, useState } from 'react'
import { AnchoredLayer as A } from '@nipe-solutions/react-anchored-layer'

const addresses = Array.from(
  { length: 12 },
  (_, index) => `Mariahilfer Straße ${String(index + 1)}, 1060 Vienna`,
)

export function AddressDemo() {
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(3)
  const [validation, setValidation] = useState(false)
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className="coordinate-workspace"
      aria-label="Address search demonstration"
    >
      <div className="workspace-toolbar">
        <span>modal / address search</span>
        <span className="status">live geometry</span>
      </div>
      <div className="modal-clip">
        <div className="modal-scroll">
          <p className="field-label">Delivery details</p>
          {validation ? (
            <p className="validation-message">Apartment number is optional.</p>
          ) : null}
          <A.Provider portalRoot={portalRoot}>
            <A.Root open={open} onOpenChange={setOpen}>
              <A.Anchor asChild>
                <input
                  ref={inputRef}
                  aria-autocomplete="list"
                  aria-controls="demo-results"
                  aria-expanded={open}
                  aria-label="Delivery address"
                  placeholder="Start typing an address"
                  role="combobox"
                  onChange={() => {
                    setOpen(true)
                  }}
                  onFocus={() => {
                    setOpen(true)
                  }}
                />
              </A.Anchor>
              <A.Content
                className="address-results"
                collisionPadding={12}
                id="demo-results"
                matchAnchorWidth
                offset={7}
                role="listbox"
              >
                {loading ? (
                  <p className="loading" role="status">
                    Searching addresses
                  </p>
                ) : (
                  addresses.slice(0, count).map((address) => (
                    <div key={address} role="option" aria-selected="false">
                      {address}
                    </div>
                  ))
                )}
              </A.Content>
            </A.Root>
          </A.Provider>
          <div className="form-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className="portal-boundary" ref={setPortalRoot} />
      <div className="workspace-controls" aria-label="Demo controls">
        <button
          type="button"
          onClick={() => {
            setLoading(true)
            setOpen(true)
          }}
        >
          Show loading
        </button>
        <button
          type="button"
          onClick={() => {
            setLoading(false)
            setCount(12)
            setOpen(true)
          }}
        >
          Show 12 results
        </button>
        <button
          type="button"
          onClick={() => {
            setValidation((value) => !value)
          }}
        >
          Move anchor
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value)
          }}
        >
          {open ? 'Close layer' : 'Open layer'}
        </button>
      </div>
    </div>
  )
}
