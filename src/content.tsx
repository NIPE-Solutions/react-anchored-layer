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
  useLayoutEffect,
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

type CustomProperties = CSSProperties &
  Record<`--anchored-layer-${string}`, string>

export const Content = forwardRef<HTMLDivElement, AnchoredLayerContentProps>(
  function Content(
    {
      avoidCollisions = true,
      children,
      collisionBoundary,
      collisionPadding = 8,
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
      ]
    }, [
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      matchAnchorWidth,
      offset,
    ])
    const {
      floatingStyles,
      isPositioned,
      placement: finalPlacement,
      refs,
    } = useFloating({
      elements: { reference: anchor },
      middleware,
      open,
      placement,
      strategy,
      whileElementsMounted(reference, floating, update) {
        return autoUpdate(reference, floating, update, {
          ancestorResize: true,
          ancestorScroll: true,
          elementResize: true,
          layoutShift: true,
        })
      },
    })
    const [positionedPair, setPositionedPair] = useState<{
      anchor: HTMLElement
      content: HTMLElement
    } | null>(null)

    useLayoutEffect(() => {
      if (isPositioned && anchor !== null && content !== null) {
        setPositionedPair({ anchor, content })
      } else {
        setPositionedPair(null)
      }
    }, [anchor, content, isPositioned])

    if (!open || anchor === null) return null

    const positioned =
      isPositioned &&
      positionedPair?.anchor === anchor &&
      positionedPair.content === content
    const { align, side, transformOrigin } = getPlacementData(finalPlacement)
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
        data-anchored-layer-content=""
        data-align={align}
        data-positioned={positioned ? 'true' : 'false'}
        data-side={side}
        data-state="open"
        ref={composeRefs(forwardedRef, refs.setFloating, setContent)}
        style={mergedStyle}
      >
        {children}
      </div>
    )

    return insidePortal ? layer : <Portal>{layer}</Portal>
  },
)
