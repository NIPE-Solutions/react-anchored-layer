# React Anchored Layer

Anchored floating layers for React.

This repository is under active development toward `0.1.0-alpha.0`.

React Anchored Layer renders arbitrary content through a portal and keeps it
aligned with an anchor through scrolling, resizing, and layout changes. It does
not provide dropdown, combobox, menu, tooltip, dismissal, or focus semantics.

Positioning is powered by Floating UI. React Anchored Layer adds a focused React
composition model, portal behavior, and project-level defaults around that
positioning engine.

## Installation

```sh
npm install @nipe-solutions/react-anchored-layer
```

React and React DOM are peer dependencies. React 18.3 and React 19 are
supported.

## Quick start

```tsx
import { AnchoredLayer } from '@nipe-solutions/react-anchored-layer'
import '@nipe-solutions/react-anchored-layer/core.css'

;<AnchoredLayer.Root open={open} onOpenChange={setOpen}>
  <AnchoredLayer.Anchor asChild>
    <input aria-controls="address-results" aria-expanded={open} />
  </AnchoredLayer.Anchor>
  <AnchoredLayer.Content
    id="address-results"
    placement="bottom-start"
    offset={6}
    matchAnchorWidth
  >
    {results}
  </AnchoredLayer.Content>
</AnchoredLayer.Root>
```

`Content` portals to `document.body` by default. Wrap it in
`AnchoredLayer.Portal` to select a custom container, or provide a scoped default
with `AnchoredLayer.Provider`.

The core stylesheet contains positioning mechanics only. `theme.css` is an
optional visual starting point, and `styles.css` combines both.

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

## Compatibility and size

The package targets current Chromium, Firefox, and WebKit, with automated
Playwright coverage in all three engines. The published JavaScript is measured
with React, React DOM, and Floating UI external: the current build is about
2.2 kB gzip for ESM and 1.8 kB gzip for CommonJS. The packed prerelease artifact
is about 7.4 kB.

Known initial limitations are deliberate: there are no virtual anchors, arrow,
raw middleware API, automatic offscreen dismissal, vertical-writing-mode claim,
or global stacking coordinator.

## Development

Use Node 24 and npm 11.

```sh
npm install
npm run check
```

## License

MIT
