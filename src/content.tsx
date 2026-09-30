import {
  autoUpdate,
  flip,
  offset as floatingOffset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react-dom'
import {
  forwardRef,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { composeRefs } from './compose-refs'
import type { AnchoredLayerContentProps } from './contracts'
import { useAnchoredLayerContext, usePortalBoundary } from './context'
import { getPlacementData } from './geometry'
import { Portal } from './portal'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

type CustomProperties = CSSProperties &
  Record<`--anchored-layer-${string}`, string>

function getDirection(element: HTMLElement): 'ltr' | 'rtl' {
  return element.ownerDocument.defaultView?.getComputedStyle(element)
    .direction === 'rtl'
    ? 'rtl'
    : 'ltr'
}

export const Content = forwardRef<HTMLDivElement, AnchoredLayerContentProps>(
  function Content(
    {
      avoidCollisions = true,
      children,
      collisionBoundary,
      collisionPadding = 8,
      dir,
      matchAnchorWidth = false,
      offset = 4,
      placement = 'bottom-start',
      strategy = 'absolute',
      style,
      ...contentProps
    },
    forwardedRef,
  ): ReactElement | null {
    const { anchor, content, open, setContent } = useAnchoredLayerContext(
      'AnchoredLayer.Content',
    )
    const insidePortal = usePortalBoundary()
    const positionKey = useMemo(() => Symbol(), [anchor, content])
    const [anchorDirection, setAnchorDirection] = useState<'ltr' | 'rtl'>('ltr')
    const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
    // Portals retain React context but lose inherited DOM direction.
    useIsomorphicLayoutEffect(() => {
      if (anchor !== null) setAnchorDirection(getDirection(anchor))
      if (content !== null) setDirection(getDirection(content))
    })
    const middleware = useMemo(() => {
      const boundaryOptions = {
        ...(collisionBoundary === undefined
          ? {}
          : { boundary: collisionBoundary }),
        padding: collisionPadding,
      }

      return [
        floatingOffset(offset),
        avoidCollisions ? flip(boundaryOptions) : undefined,
        avoidCollisions ? shift(boundaryOptions) : undefined,
        size({
          ...boundaryOptions,
          apply({ availableHeight, availableWidth, elements, rects }) {
            elements.floating.style.setProperty(
              '--anchored-layer-anchor-width',
              `${String(rects.reference.width)}px`,
            )
            elements.floating.style.setProperty(
              '--anchored-layer-anchor-height',
              `${String(rects.reference.height)}px`,
            )
            elements.floating.style.setProperty(
              '--anchored-layer-available-width',
              `${String(availableWidth)}px`,
            )
            elements.floating.style.setProperty(
              '--anchored-layer-available-height',
              `${String(availableHeight)}px`,
            )
          },
        }),
        // A completed result must belong to the current elements, not a previous anchor.
        {
          name: 'anchoredLayer',
          options: positionKey,
          fn: () => ({ data: { key: positionKey } }),
        },
      ]
    }, [
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      offset,
      positionKey,
    ])
    const {
      floatingStyles,
      isPositioned,
      middlewareData,
      placement: finalPlacement,
      refs,
      update,
    } = useFloating({
      elements: { reference: anchor },
      middleware,
      open,
      placement,
      strategy,
      whileElementsMounted: autoUpdate,
    })
    const resolvedKey = (
      middlewareData.anchoredLayer as { key?: symbol } | undefined
    )?.key
    useIsomorphicLayoutEffect(() => {
      if (open && anchor !== null) update()
    }, [anchor, direction, open, positionKey, resolvedKey, update])
    const composedRef = useMemo(
      () => composeRefs(forwardedRef, refs.setFloating, setContent),
      [forwardedRef, refs.setFloating, setContent],
    )

    if (!open || anchor === null) return null

    const positioned = isPositioned && resolvedKey === positionKey
    const { align, side, transformOrigin } = getPlacementData(
      finalPlacement,
      direction === 'rtl',
    )
    const mergedStyle: CustomProperties = {
      ...style,
      ...floatingStyles,
      '--anchored-layer-transform-origin': transformOrigin,
      ...(matchAnchorWidth
        ? { width: 'var(--anchored-layer-anchor-width)' }
        : {}),
      ...(positioned ? {} : { pointerEvents: 'none', visibility: 'hidden' }),
    }
    const layer = (
      <div
        {...contentProps}
        dir={dir ?? anchorDirection}
        data-anchored-layer-content=""
        data-align={align}
        data-positioned={positioned ? 'true' : 'false'}
        data-side={side}
        data-state="open"
        ref={composedRef}
        style={mergedStyle}
      >
        {children}
      </div>
    )

    return insidePortal ? layer : <Portal>{layer}</Portal>
  },
)
