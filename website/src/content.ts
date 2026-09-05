export const navigation = [
  ['introduction', 'Introduction'],
  ['installation', 'Installation'],
  ['quick-start', 'Quick start'],
  ['scope', 'What it does not own'],
  ['portal-model', 'Portal model'],
  ['positioning', 'Positioning'],
  ['collision', 'Collision'],
  ['sizing', 'Sizing'],
  ['scroll-resize', 'Scroll and resize'],
  ['nested-portals', 'Nested portals'],
  ['accessibility', 'Accessibility'],
  ['styling', 'Styling'],
  ['ssr', 'SSR'],
  ['performance', 'Performance'],
  ['api', 'API'],
  ['examples', 'Examples'],
  ['comparison', 'Choose the right tool'],
  ['faq', 'FAQ'],
  ['contributing', 'Contributing'],
] as const

export const quickStart = `import { AnchoredLayer as A } from
  '@nipe-solutions/react-anchored-layer'
import '@nipe-solutions/react-anchored-layer/core.css'

<A.Root open={open} onOpenChange={setOpen}>
  <A.Anchor asChild>
    <input aria-controls="results" />
  </A.Anchor>
  <A.Content
    id="results"
    placement="bottom-start"
    offset={6}
    matchAnchorWidth
  >
    {results}
  </A.Content>
</A.Root>`

export const apiRows = [
  ['Root', 'Owns mechanical visibility and element registration.'],
  ['Anchor', 'Registers an HTMLElement; asChild composes the consumer ref.'],
  ['Content', 'Positions and portals a semantics-neutral div.'],
  ['Portal', 'Selects an explicit portal container for its branch.'],
  ['Provider', 'Sets a logical default portal root for a subtree.'],
] as const
