import type { Ref } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { getElementRef } from '../../src/element-ref'

describe('getElementRef', () => {
  it('reads the element ref for React 18 elements', () => {
    const legacyRef: Ref<HTMLElement> =
      vi.fn<(node: HTMLElement | null) => void>()
    const element = { props: {}, ref: legacyRef }
    expect(getElementRef(element, '18.3.1')).toBe(legacyRef)
  })

  it('reads props.ref without touching element.ref for React 19', () => {
    const currentRef: Ref<HTMLElement> =
      vi.fn<(node: HTMLElement | null) => void>()
    const element = {
      props: { ref: currentRef },
      get ref(): never {
        throw new Error('React 19 element.ref was read')
      },
    }
    expect(getElementRef(element, '19.2.0')).toBe(currentRef)
  })
})
