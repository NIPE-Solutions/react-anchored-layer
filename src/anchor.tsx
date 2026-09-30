import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  useMemo,
  type ReactElement,
  type Ref,
} from 'react'

import { composeRefs } from './compose-refs'
import type { AnchoredLayerAnchorProps } from './contracts'
import { useAnchoredLayerContext } from './context'
import { getElementRef } from './element-ref'

type RefElement = ReactElement<{ ref?: Ref<HTMLElement> }>

export const Anchor = forwardRef<HTMLElement, AnchoredLayerAnchorProps>(
  function Anchor({ asChild = false, children, ...anchorProps }, forwardedRef) {
    const { setAnchor } = useAnchoredLayerContext('AnchoredLayer.Anchor')

    let child: RefElement | undefined
    if (asChild) {
      try {
        const onlyChild = Children.only(children)
        if (
          !isValidElement<{ ref?: Ref<HTMLElement> }>(onlyChild) ||
          onlyChild.type === Fragment
        )
          throw new Error()
        child = onlyChild
      } catch {
        throw new Error(
          'AnchoredLayer.Anchor with asChild requires one React element',
        )
      }
    }
    const childRef = child === undefined ? undefined : getElementRef(child)
    const composedRef = useMemo(
      () => composeRefs(childRef, forwardedRef, setAnchor),
      [childRef, forwardedRef, setAnchor],
    )

    if (child === undefined) {
      return (
        <span {...anchorProps} ref={composedRef}>
          {children}
        </span>
      )
    }

    return cloneElement(child, {
      ...anchorProps,
      ...child.props,
      ref: composedRef,
    })
  },
)
