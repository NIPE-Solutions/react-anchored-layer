import type {
  AnchoredLayerAnchorProps,
  AnchoredLayerContentProps,
  AnchoredLayerPlacement,
  AnchoredLayerStrategy,
} from '../../src/index'

const placement: AnchoredLayerPlacement = 'bottom-start'
const strategy: AnchoredLayerStrategy = 'fixed'
const anchorProps: AnchoredLayerAnchorProps = { asChild: true }
const contentProps: AnchoredLayerContentProps = {
  collisionPadding: 8,
  matchAnchorWidth: true,
  offset: { crossAxis: 0, mainAxis: 6 },
  placement: 'bottom-start',
  strategy: 'fixed',
}

export { anchorProps, contentProps, placement, strategy }
