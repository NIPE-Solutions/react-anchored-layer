import { useEffect, useRef, useState } from 'react'
import {
  AnchoredLayer as A,
  type AnchoredLayerPlacement,
} from '@nipe-solutions/react-anchored-layer'

const results = Array.from(
  { length: 16 },
  (_, index) => `Vienna result ${String(index + 1)}`,
)

const placements = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
] as const satisfies readonly AnchoredLayerPlacement[]

function useLayerMetrics(layer: HTMLDivElement | null) {
  const [metrics, setMetrics] = useState({
    anchorWidth: '—',
    availableHeight: '—',
    resolved: 'waiting',
  })

  useEffect(() => {
    if (layer === null) return

    const read = () => {
      const style = getComputedStyle(layer)
      const side = layer.dataset.side ?? 'waiting'
      const align = layer.dataset.align
      setMetrics({
        anchorWidth:
          style.getPropertyValue('--anchored-layer-anchor-width').trim() || '—',
        availableHeight:
          style.getPropertyValue('--anchored-layer-available-height').trim() ||
          '—',
        resolved:
          side === 'waiting' || align === undefined || align === 'center'
            ? side
            : `${side}-${align}`,
      })
    }
    const observer = new MutationObserver(read)
    observer.observe(layer, {
      attributeFilter: ['data-align', 'data-positioned', 'data-side', 'style'],
      attributes: true,
    })
    read()

    return () => {
      observer.disconnect()
    }
  }, [layer])

  return metrics
}

export function StressDemo() {
  const [compact, setCompact] = useState(false)
  const [count, setCount] = useState(3)
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
  const [layer, setLayer] = useState<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [moved, setMoved] = useState(false)
  const [placement, setPlacement] =
    useState<AnchoredLayerPlacement>('bottom-start')
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null)
  const [stage, setStage] = useState<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const metrics = useLayerMetrics(layer)

  return (
    <div
      className="stress-demo"
      dir={direction}
      aria-label="Positioning stress test"
      role="region"
    >
      <div className="stress-readout">
        <span>requested: {placement}</span>
        <span>resolved: {metrics.resolved}</span>
        <span>anchor width: {metrics.anchorWidth}</span>
        <span>available height: {metrics.availableHeight}</span>
        <span>collision padding: 8px</span>
      </div>
      <div
        className={`stress-stage${compact ? ' is-compact' : ''}${moved ? ' anchor-moved' : ''}`}
        ref={setStage}
      >
        <span className="stage-note" aria-hidden="true">
          clipping boundary
        </span>
        <div className="stress-modal">
          <div className="stress-scroll" ref={scrollRef}>
            <div className="stress-spacer" aria-hidden="true" />
            <A.Provider portalRoot={portalRoot}>
              <A.Root open>
                <A.Anchor asChild>
                  <input
                    aria-controls="stress-results"
                    aria-expanded="true"
                    aria-label="Stress test anchor"
                    readOnly
                    role="combobox"
                    value="Vienna"
                  />
                </A.Anchor>
                <A.Content
                  {...(stage === null ? {} : { collisionBoundary: stage })}
                  className="stress-results"
                  collisionPadding={8}
                  id="stress-results"
                  matchAnchorWidth
                  offset={6}
                  placement={placement}
                  ref={setLayer}
                  role="listbox"
                >
                  {loading ? (
                    <p role="status">Loading results…</p>
                  ) : (
                    results.slice(0, count).map((result) => (
                      <div aria-selected="false" key={result} role="option">
                        {result}
                      </div>
                    ))
                  )}
                </A.Content>
              </A.Root>
            </A.Provider>
            <div className="stress-spacer lower" aria-hidden="true" />
          </div>
        </div>
        <div className="stress-portal-root" ref={setPortalRoot} />
        <div className="portal-trace" aria-hidden="true">
          <span>portal root</span>
        </div>
      </div>
      <p className="stress-state" aria-live="polite">
        {compact ? 'compact container' : 'wide container'} ·{' '}
        {direction.toUpperCase()}
      </p>
      <div className="stress-controls" aria-label="Stress test controls">
        <button
          type="button"
          onClick={() => {
            setLoading((value) => !value)
          }}
        >
          Toggle loading
        </button>
        <button
          type="button"
          onClick={() => {
            setCount((value) => Math.min(16, value + 1))
          }}
        >
          Add result
        </button>
        <button
          type="button"
          onClick={() => {
            setCount((value) => Math.max(1, value - 1))
          }}
        >
          Remove result
        </button>
        <button
          type="button"
          onClick={() => {
            setCompact((value) => !value)
          }}
        >
          Resize modal
        </button>
        <button
          type="button"
          onClick={() => {
            setMoved((value) => !value)
          }}
        >
          Move anchor
        </button>
        <button
          type="button"
          onClick={() => {
            const scroll = scrollRef.current
            if (scroll !== null) {
              scroll.scrollTop = scroll.scrollTop > 40 ? 0 : 118
            }
          }}
        >
          Scroll container
        </button>
        <button
          type="button"
          onClick={() => {
            setDirection((value) => (value === 'ltr' ? 'rtl' : 'ltr'))
          }}
        >
          Toggle RTL
        </button>
        <label className="placement-control">
          <span>Requested placement</span>
          <select
            value={placement}
            onChange={(event) => {
              setPlacement(event.currentTarget.value as AnchoredLayerPlacement)
            }}
          >
            {placements.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
