import type { ReactNode } from 'react'

import { AddressDemo } from './AddressDemo'
import { StressDemo } from './StressDemo'
import { apiRows, navigation, quickStart } from './content'

function Section({
  children,
  id,
  intro,
  title,
}: {
  children: ReactNode
  id: string
  intro: string
  title: string
}) {
  return (
    <section className="doc-section" id={id}>
      <h2>{title}</h2>
      <p className="section-intro">{intro}</p>
      {children}
    </section>
  )
}

export function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top">
          <span className="mark" aria-hidden="true">
            <i />
            <b />
          </span>
          <span>React Anchored Layer</span>
        </a>
        <nav aria-label="Primary">
          <a href="#quick-start">Docs</a>
          <a href="https://github.com/NIPE-Solutions/react-anchored-layer">
            GitHub
          </a>
        </nav>
      </header>
      <main id="content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="status-line">0.1 alpha · React 18.3 and 19</p>
            <h1>Floating content that stays attached.</h1>
            <p className="lede">
              A small React primitive for rendering content through a portal
              while keeping it aligned with its anchor through scroll, resize,
              content changes, and layout shifts.
            </p>
            <div className="install">
              <code>npm install @nipe-solutions/react-anchored-layer</code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    'npm install @nipe-solutions/react-anchored-layer',
                  )
                }}
              >
                Copy
              </button>
            </div>
          </div>
          <AddressDemo />
        </section>
        <div className="docs-layout">
          <aside className="docs-rail">
            <nav aria-label="Documentation">
              {navigation.map(([id, label]) => (
                <a href={`#${id}`} key={id}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>
          <article className="docs-content">
            <Section
              id="introduction"
              title="Introduction"
              intro="Portal floating content without rebuilding browser geometry."
            >
              <p>
                Use it for autocomplete suggestions, address results,
                date-picker surfaces, mention suggestions, custom popovers, and
                contextual tools.
              </p>
            </Section>
            <Section
              id="installation"
              title="Installation"
              intro="One positioning dependency; React stays a peer."
            >
              <pre>
                <code>npm install @nipe-solutions/react-anchored-layer</code>
              </pre>
              <p>
                Positioning is powered by Floating UI. React Anchored Layer adds
                a focused React composition model, portal behavior, and
                project-level defaults around that positioning engine.
              </p>
            </Section>
            <Section
              id="quick-start"
              title="Quick start"
              intro="The application owns open intent; the layer owns mechanics."
            >
              <pre>
                <code>{quickStart}</code>
              </pre>
            </Section>
            <Section
              id="scope"
              title="What Anchored Layer does not own"
              intro="Semantics stay with the feature that understands them."
            >
              <ul>
                <li>Open and close intent</li>
                <li>Outside press or Escape handling</li>
                <li>Focus movement and restoration</li>
                <li>Combobox state and keyboard selection</li>
                <li>Requests, loading state, menu roles, or listbox roles</li>
              </ul>
            </Section>
            <Section
              id="portal-model"
              title="Escape clipping, not context"
              intro="Choose a portal destination that matches the surrounding interaction layer."
            >
              <p>
                An explicit <code>Portal container</code> wins, followed by the
                nearest <code>Provider portalRoot</code>, then{' '}
                <code>document.body</code>. Detached custom roots suppress
                content instead of silently changing stacking context.
              </p>
              <div className="portal-strategies">
                <article>
                  <h3>Body portal</h3>
                  <p>Escapes clipping ancestors and is the simplest default.</p>
                  <p className="tradeoff">
                    It may sit outside a modal’s local layer or focus setup.
                  </p>
                </article>
                <article>
                  <h3>Custom modal portal root</h3>
                  <p>
                    Escapes inner clipping while staying in the modal layer.
                  </p>
                  <p className="tradeoff">
                    Often the right choice for focus-trapped modal content.
                  </p>
                </article>
                <article>
                  <h3>Local rendering</h3>
                  <p>Keeps a simple DOM relationship.</p>
                  <p className="tradeoff">
                    Overflow ancestors can clip the floating content.
                  </p>
                </article>
              </div>
            </Section>
            <Section
              id="positioning"
              title="Positioning"
              intro="Standard Floating UI placement names, with focused defaults."
            >
              <p>
                Choose top, right, bottom, or left with start, center, and end
                alignment. Use <code>absolute</code> by default or{' '}
                <code>fixed</code> for fixed-position application contexts.
              </p>
            </Section>
            <Section
              id="collision"
              title="Collision"
              intro="Flip and shift are enabled without exposing a middleware pipeline."
            >
              <p>
                The requested side flips when space is insufficient and shifts
                within the viewport or supplied boundary. Collision padding
                defaults to eight pixels.
              </p>
            </Section>
            <Section
              id="sizing"
              title="Sizing"
              intro="Anchor and available geometry stay in CSS."
            >
              <p>
                <code>matchAnchorWidth</code> applies measured width. Anchor
                width, anchor height, available width, available height, and
                transform origin are exposed as namespaced CSS variables.
              </p>
            </Section>
            <Section
              id="scroll-resize"
              title="Stay attached while layout moves"
              intro="The layer follows ordinary layout change automatically."
            >
              <p>
                Floating UI auto-update tracks ancestor scroll, ancestor resize,
                element resize, and layout shifts. Closed layers do not keep an
                update subscription.
              </p>
            </Section>
            <Section
              id="stress-test"
              title="Stress test"
              intro="Change the environment; the layer keeps tracking the same anchor."
            >
              <p>
                Grow asynchronous content, resize and scroll the clipped modal,
                move the anchor, change direction, or request another placement.
                The readout comes from the real positioned element.
              </p>
              <StressDemo />
              <pre className="sizing-code">
                <code>{`max-height: var(--anchored-layer-available-height);\noverflow: auto;`}</code>
              </pre>
            </Section>
            <Section
              id="nested-portals"
              title="Nested portals and modals"
              intro="Escape clipping while preserving the application’s logical layer root."
            >
              <p>
                Place a Provider inside the modal boundary or pass its layer
                root to Portal. The package does not alter the modal’s focus
                trap or outside-press model.
              </p>
            </Section>
            <Section
              id="accessibility"
              title="Accessibility"
              intro="No role is correct for every anchored surface."
            >
              <p>
                Content receives no automatic role and focus never moves. An
                autocomplete application can supply combobox, listbox, option,{' '}
                <code>aria-controls</code>, and{' '}
                <code>aria-activedescendant</code> semantics itself.
              </p>
            </Section>
            <Section
              id="styling"
              title="Styling and CSS variables"
              intro="Mechanical CSS is separate from an optional visual starting point."
            >
              <p>
                Import <code>core.css</code> for first-position visibility.
                Import <code>theme.css</code> only when its neutral surface is
                useful. Data attributes expose state, side, alignment, and
                positioned state.
              </p>
            </Section>
            <Section
              id="ssr"
              title="SSR"
              intro="Imports and server rendering do not require browser globals."
            >
              <p>
                The anchor can render on the server. Portal content is
                established after client mount, without module-scope access to
                window, document, or observers.
              </p>
            </Section>
            <Section
              id="performance"
              title="Performance"
              intro="Subscriptions exist only while a complete open layer is mounted."
            >
              <p>
                No global animation loop, polling service, or layer singleton is
                created. Coordinate changes are immediate and are not tweened
                during scrolling.
              </p>
            </Section>
            <Section
              id="api"
              title="API"
              intro="Five parts, each with one responsibility."
            >
              <div className="api-table" role="region" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th>Part</th>
                      <th>Responsibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiRows.map(([name, detail]) => (
                      <tr key={name}>
                        <th>{name}</th>
                        <td>{detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
            <Section
              id="examples"
              title="Position arbitrary content"
              intro="Autocomplete is the main proof case, not a component boundary."
            >
              <p>
                It combines modal clipping, a custom portal root, async-size
                changes, width matching, anchor movement, and collision
                handling. The same API covers basic anchored content, RTL,
                dynamic content, and custom roots.
              </p>
              <div className="surface-list" aria-label="Example layer content">
                <span>Color picker</span>
                <span>Date panel</span>
                <span>Mention suggestions</span>
                <span>Floating inspector</span>
              </div>
            </Section>
            <Section
              id="comparison"
              title="Choose the right tool"
              intro="Use the smallest abstraction that owns the behavior you need."
            >
              <dl>
                <dt>Floating UI</dt>
                <dd>Choose it for low-level geometry and custom middleware.</dd>
                <dt>Radix Popover</dt>
                <dd>
                  Choose it when popover interaction semantics match the
                  feature.
                </dd>
                <dt>React Anchored Layer</dt>
                <dd>
                  Choose it for a semantics-neutral anchored portal with focused
                  defaults.
                </dd>
              </dl>
              <p>
                Do not use this package when you need a complete accessible
                combobox, menu, tooltip, or date picker.
              </p>
            </Section>
            <Section
              id="faq"
              title="FAQ"
              intro="The narrow scope is intentional."
            >
              <h3>Does it close on outside press?</h3>
              <p>No. The consuming feature decides what outside means.</p>
              <h3>Does an offscreen anchor close the layer?</h3>
              <p>No. The layer remains mechanically positioned.</p>
            </Section>
            <Section
              id="contributing"
              title="Contributing"
              intro="Changes must preserve the small contract and browser evidence."
            >
              <p>
                Read the repository contribution guide, run{' '}
                <code>npm run check</code>, and run the browser matrix for
                geometry changes.
              </p>
            </Section>
          </article>
        </div>
      </main>
      <footer className="site-footer">
        <p>
          Part of{' '}
          <a href="https://opensource.nipesolutions.com">NIPE Open Source</a>.
        </p>
        <nav aria-label="Project links">
          <a href="https://github.com/NIPE-Solutions/react-anchored-layer">
            GitHub
          </a>
          <a href="https://github.com/NIPE-Solutions/react-anchored-layer/blob/main/CHANGELOG.md">
            Changelog
          </a>
          <a href="https://opensource.nipesolutions.com/impressum">Imprint</a>
          <a href="https://opensource.nipesolutions.com/privacy">Privacy</a>
          <a href="https://github.com/NIPE-Solutions/react-anchored-layer/blob/main/LICENSE">
            MIT License
          </a>
          <a href="https://github.com/NIPE-Solutions/react-anchored-layer/security/policy">
            Security
          </a>
        </nav>
      </footer>
    </div>
  )
}
