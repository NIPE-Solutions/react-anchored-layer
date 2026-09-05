import { Anchor } from './anchor'
import { Content } from './content'
import { Portal } from './portal'
import { Provider } from './provider'
import { Root } from './root'

export type {
  AnchoredLayerAnchorProps,
  AnchoredLayerContentProps,
  AnchoredLayerOffset,
  AnchoredLayerOffsetOptions,
  AnchoredLayerPlacement,
  AnchoredLayerPortalProps,
  AnchoredLayerProviderProps,
  AnchoredLayerRootProps,
  AnchoredLayerStrategy,
} from './contracts'
export { Anchor, Content, Portal, Provider, Root }

export const AnchoredLayer = Object.freeze({
  Anchor,
  Content,
  Portal,
  Provider,
  Root,
})
