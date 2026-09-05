import type { HTMLAttributes, ReactNode } from 'react'

export type AnchoredLayerPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export type AnchoredLayerStrategy = 'absolute' | 'fixed'

export interface AnchoredLayerRootProps {
  children?: ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

export interface AnchoredLayerProviderProps {
  children?: ReactNode
  portalRoot?: HTMLElement | null
}

export interface AnchoredLayerPortalProps {
  children?: ReactNode
  container?: HTMLElement | null
}

export interface AnchoredLayerOffsetOptions {
  crossAxis?: number
  mainAxis?: number
}

export type AnchoredLayerOffset = number | AnchoredLayerOffsetOptions

export interface AnchoredLayerContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'content'
> {
  avoidCollisions?: boolean
  collisionBoundary?: HTMLElement | HTMLElement[]
  collisionPadding?: number
  matchAnchorWidth?: boolean
  offset?: AnchoredLayerOffset
  placement?: AnchoredLayerPlacement
  strategy?: AnchoredLayerStrategy
}

export interface AnchoredLayerAnchorProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  asChild?: boolean
  children?: ReactNode
}
