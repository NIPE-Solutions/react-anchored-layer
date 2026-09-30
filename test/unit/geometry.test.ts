import { describe, expect, it } from 'vitest'

import { getPlacementData } from '../../src/geometry'

describe('getPlacementData', () => {
  it.each([
    ['top-start', 'right bottom'],
    ['top-end', 'left bottom'],
    ['bottom-start', 'right top'],
    ['bottom-end', 'left top'],
    ['right-start', 'left top'],
    ['left-end', 'right bottom'],
  ] as const)('maps %s to the physical RTL origin', (placement, origin) => {
    expect(getPlacementData(placement, true).transformOrigin).toBe(origin)
  })
  it.each([
    ['top-start', 'top', 'start', 'left bottom'],
    ['top', 'top', 'center', 'center bottom'],
    ['top-end', 'top', 'end', 'right bottom'],
    ['right-start', 'right', 'start', 'left top'],
    ['right', 'right', 'center', 'left center'],
    ['right-end', 'right', 'end', 'left bottom'],
    ['bottom-start', 'bottom', 'start', 'left top'],
    ['bottom', 'bottom', 'center', 'center top'],
    ['bottom-end', 'bottom', 'end', 'right top'],
    ['left-start', 'left', 'start', 'right top'],
    ['left', 'left', 'center', 'right center'],
    ['left-end', 'left', 'end', 'right bottom'],
  ] as const)(
    'maps %s to stable placement metadata',
    (placement, side, align, transformOrigin) => {
      expect(getPlacementData(placement)).toEqual({
        align,
        side,
        transformOrigin,
      })
    },
  )
})
