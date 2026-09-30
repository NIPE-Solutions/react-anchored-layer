import { createRef } from 'react'
import { describe, expect, it } from 'vitest'

import { composeRefs } from '../../src/compose-refs'

describe('composed ref cleanup', () => {
  it('releases callback resources and clears object and legacy callback refs', () => {
    const node = document.createElement('button')
    const objectRef = createRef<HTMLButtonElement>()
    const legacyValues: (HTMLButtonElement | null)[] = []
    const released: HTMLButtonElement[] = []
    const ref = composeRefs(
      (value) =>
        value === null
          ? undefined
          : () => {
              released.push(value)
            },
      objectRef,
      (value) => {
        legacyValues.push(value)
      },
    )
    const cleanup = ref(node)
    expect(objectRef.current).toBe(node)
    expect(legacyValues).toEqual([node])
    expect(cleanup).toBeTypeOf('function')
    if (typeof cleanup !== 'function') throw new Error('Missing ref cleanup')
    cleanup()
    expect(released).toEqual([node])
    expect(objectRef.current).toBeNull()
    expect(legacyValues).toEqual([node, null])
  })
})
