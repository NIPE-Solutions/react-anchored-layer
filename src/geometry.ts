import type { AnchoredLayerPlacement } from './contracts'

export interface PlacementData {
  align: 'start' | 'center' | 'end'
  side: 'top' | 'right' | 'bottom' | 'left'
  transformOrigin: string
}

export function getPlacementData(
  placement: AnchoredLayerPlacement,
): PlacementData {
  const [side, explicitAlign] = placement.split('-') as [
    PlacementData['side'],
    PlacementData['align'] | undefined,
  ]
  const align = explicitAlign ?? 'center'
  const originSide = {
    bottom: 'top',
    left: 'right',
    right: 'left',
    top: 'bottom',
  }[side]
  const originAlign =
    align === 'center'
      ? 'center'
      : side === 'top' || side === 'bottom'
        ? align === 'start'
          ? 'left'
          : 'right'
        : align === 'start'
          ? 'top'
          : 'bottom'

  return {
    align,
    side,
    transformOrigin:
      side === 'top' || side === 'bottom'
        ? `${originAlign} ${originSide}`
        : `${originSide} ${originAlign}`,
  }
}
