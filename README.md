# React Anchored Layer

Keep floating React content aligned with its anchor, even when the page scrolls
or the layout changes.

Use it for a positioned surface whose interaction you already own: contextual
help beside a button, results below an input, or a panel attached to a control.
The library handles measurement, collision avoidance, and portals. Your
application decides what the surface means and how people interact with it.

[Documentation and demos](https://react-anchored-layer.nipesolutions.com) ·
[API reference](docs/API.md) ·
[npm](https://www.npmjs.com/package/@nipe-solutions/react-anchored-layer)

## Why use it

- Keep an anchor and floating surface in sync through scrolling, resizing,
  and layout changes without maintaining positioning listeners yourself.
- Match an input's width, choose a placement and offset, and let collision
  handling flip or shift the surface when space is limited.
- Render through a body portal or a container you choose, including one inside
  an existing modal's focus boundary.
- Supply ordinary React content and your own CSS. No menu, tooltip, or combobox
  behavior is imposed on it.

Positioning uses Floating UI. This package adds a small React composition API
and portal lifecycle around that engine; it does not replace Floating UI's
full middleware API.

## Installation

```sh
npm install --save-exact @nipe-solutions/react-anchored-layer
```

Stable version: **1.0.0**. React 18.3 or 19 and the matching React DOM version
are peer dependencies. The package requires Node.js 24 for installation and
repository development.

## Show a note beside a button

```tsx
import { useId, useState } from 'react'
import { AnchoredLayer } from '@nipe-solutions/react-anchored-layer'
import '@nipe-solutions/react-anchored-layer/styles.css'

export function BillingHelp() {
  const [open, setOpen] = useState(false)
  const noteId = useId()

  return (
    <AnchoredLayer.Root open={open} onOpenChange={setOpen}>
      <AnchoredLayer.Anchor asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? noteId : undefined}
          onClick={() => setOpen((value) => !value)}
          onBlur={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
        >
          How does billing work?
        </button>
      </AnchoredLayer.Anchor>
      <AnchoredLayer.Content
        id={noteId}
        role="note"
        placement="bottom-start"
        offset={8}
      >
        Your next invoice includes usage from the previous billing period.
      </AnchoredLayer.Content>
    </AnchoredLayer.Root>
  )
}
```

This example supplies its own toggle, Escape handling, and blur dismissal.
Anchored Layer does not add them automatically. Interactive popups need their
own focus and keyboard behavior; this non-interactive note is not a menu or
combobox recipe.

`Content` portals to `document.body` by default. Wrap it in
`AnchoredLayer.Portal` to select a custom container, or provide a scoped default
with `AnchoredLayer.Provider`.

`styles.css` combines positioning mechanics and an optional default theme.
For your own visual design, import `core.css` instead. `theme.css` is also
available separately.

## Choose the right abstraction

Use Anchored Layer when positioning and portals are the missing pieces, while
your application already owns open state and interaction semantics. Use a
complete accessible menu, tooltip, or combobox implementation when you need
those behaviors provided for you. Use Floating UI directly when you need
virtual anchors, arrows, or custom middleware.

## Responsibility

The package owns positioning, portal placement, measurement, collision
handling, and first-position visibility. Applications own open intent,
outside-press and Escape behavior, focus, keyboard selection, request state,
and ARIA semantics.

Content exposes `data-state`, `data-side`, `data-align`, `data-positioned`, and
the following CSS variables:

- `--anchored-layer-anchor-width`
- `--anchored-layer-anchor-height`
- `--anchored-layer-available-width`
- `--anchored-layer-available-height`
- `--anchored-layer-transform-origin`

Module import and server rendering are safe without DOM globals. Portal content
is established on the client after mounting.

See the [API reference](docs/API.md) for prop defaults, ref behavior, and portal
lifecycle details. Applications should render one anchor and one content per
root. Child components used with `asChild` must forward a ref to an HTMLElement.

For a results panel, combine `matchAnchorWidth` with your own `max-height` and
`overflow` rules; measurement does not make content scrollable automatically.

## Compatibility and size

The package targets current Chromium, Firefox, and WebKit, with automated
Playwright coverage in all three engines. The published JavaScript is measured
with React, React DOM, and Floating UI external: the current build is about
2.5 kB gzip for ESM and 2.1 kB gzip for CommonJS. The packed artifact is kept
below 15 kB.

The scope is deliberate: there are no virtual anchors, arrow,
raw middleware API, automatic offscreen dismissal, vertical-writing-mode claim,
or global stacking coordinator.

## Development

Use Node 24 and npm 11.

```sh
npm ci
npm run check
npm run test:e2e
npm run test:website:e2e
```

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. Report reproducible
problems through [GitHub Issues](https://github.com/NIPE-Solutions/react-anchored-layer/issues)
and vulnerabilities through the route in [SECURITY.md](SECURITY.md).

Part of [NIPE Open Source](https://opensource.nipesolutions.com).

## License

[MIT](LICENSE)
