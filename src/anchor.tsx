import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
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

    if (!asChild) {
      return (
        <span {...anchorProps} ref={composeRefs(forwardedRef, setAnchor)}>
          {children}
        </span>
      )
    }

    let child: RefElement
    try {
      const onlyChild = Children.only(children)
      if (!isValidElement<{ ref?: Ref<HTMLElement> }>(onlyChild))
        throw new Error()
      child = onlyChild
    } catch {
      throw new Error(
        'AnchoredLayer.Anchor with asChild requires one React element',
      )
    }

    return cloneElement(child, {
      ...anchorProps,
      ...child.props,
      ref: composeRefs(getElementRef(child), forwardedRef, setAnchor),
    })
  },
)
