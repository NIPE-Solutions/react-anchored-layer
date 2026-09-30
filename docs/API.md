# API reference

The five components are available as named exports and through the frozen
`AnchoredLayer` namespace. React and React DOM 18.3 and 19 are supported.
Use one `Anchor` and one `Content` per `Root`; independent layers need independent
roots. Import `core.css` for positioning mechanics.

## Root

| Prop           | Default      | Meaning                                                                                                     |
| -------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| `open`         | Uncontrolled | Controlled visibility. A requested change invokes `onOpenChange` without changing this prop.                |
| `defaultOpen`  | `false`      | Initial uncontrolled visibility; subsequent prop changes do not reset it.                                   |
| `onOpenChange` | None         | Notification for a requested visibility change. Root does not add trigger, dismissal, or keyboard behavior. |

Choose controlled or uncontrolled state for the lifetime of a root. Closed
content unmounts, including its positioning subscriptions and refs.

## Anchor

The default anchor is a `span`. `asChild` uses exactly one element instead.
Pass a DOM element or a component that forwards its ref to an HTMLElement;
strings and fragments cannot register an anchor. The child's existing props
take precedence over props on `Anchor`, including event handlers. Event handlers
are not automatically combined.

The child ref, forwarded anchor ref, and internal registration are composed.
Unchanged refs remain attached during ordinary renders. React 19 callback-ref
cleanup runs on detach; refs without cleanup receive `null`. Replacing the anchor
hides content until positioning for the new element is established.

## Content

Content forwards its ref to a `div` and accepts normal div attributes, roles,
ARIA attributes, events, and styles. Positioning and first-position visibility
styles take precedence over conflicting consumer styles.

| Prop                | Default                        | Meaning                                                                         |
| ------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `placement`         | `bottom-start`                 | `top`, `right`, `bottom`, or `left`, optionally followed by `-start` or `-end`. |
| `strategy`          | `absolute`                     | CSS positioning strategy; `fixed` is also available.                            |
| `offset`            | `4`                            | Pixel gap, or `{ mainAxis, crossAxis }` offsets.                                |
| `avoidCollisions`   | `true`                         | Flip and shift against clipping boundaries.                                     |
| `collisionBoundary` | Floating UI clipping ancestors | One HTMLElement or an array of elements.                                        |
| `collisionPadding`  | `8`                            | Pixel inset from the collision boundary.                                        |
| `matchAnchorWidth`  | `false`                        | Apply measured anchor width, overriding a consumer width.                       |

Keep numeric geometry options finite. Supply connected elements for explicit
collision boundaries. Width matching and available-size variables do not add
scrolling or limit the content's height: set `max-height` and `overflow` as needed.

Content inherits the anchor's text direction across its portal unless an explicit
`dir` or directional style is supplied. Start/end and transform origin follow
that direction. Vertical writing modes are outside the supported contract.

Content is omitted while closed or without an anchor. Its first unpositioned
render is hidden and ignores pointer events. Once positioned it exposes
`data-positioned="true"`, `data-state="open"`, `data-side`, and `data-align`.

Measured CSS variables:

- `--anchored-layer-anchor-width`
- `--anchored-layer-anchor-height`
- `--anchored-layer-available-width`
- `--anchored-layer-available-height`
- `--anchored-layer-transform-origin`

## Portal and Provider

Content uses a body portal unless wrapped in an explicit `Portal`. The destination
is the Portal's `container`, then the nearest Provider's `portalRoot`, then
`document.body`. An undefined or null custom root falls back to the next choice.
A detached explicit root suppresses content instead of switching to another root.
After attaching or replacing a root, rerender the component so it can resolve the
destination again. The portal does not observe external removal of its container.

React context is preserved across a portal. DOM inheritance and modal focus
boundaries depend on the destination; choose a root within the modal when needed.
Server rendering omits portal children and establishes them after client mount.

## Application responsibilities

The package supplies no automatic role, focus movement, outside-press handling,
Escape dismissal, keyboard selection, or offscreen dismissal. Applications own
these behaviors and the semantics of the surface they render. Virtual anchors,
arrows, raw middleware, and global stacking coordination are not provided.
