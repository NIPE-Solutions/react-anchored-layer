import { createContext, useContext } from 'react'

export interface AnchoredLayerContextValue {
  anchor: HTMLElement | null
  content: HTMLElement | null
  open: boolean
  setAnchor: (anchor: HTMLElement | null) => void
  setContent: (content: HTMLElement | null) => void
  setOpen: (open: boolean) => void
}

export const AnchoredLayerContext =
  createContext<AnchoredLayerContextValue | null>(null)

export const PortalRootContext = createContext<HTMLElement | null>(null)
export const PortalBoundaryContext = createContext(false)

export function useAnchoredLayerContext(
  component: string,
): AnchoredLayerContextValue {
  const context = useContext(AnchoredLayerContext)

  if (context === null) {
    throw new Error(`${component} must be used within AnchoredLayer.Root`)
  }

  return context
}

export function usePortalRoot(): HTMLElement | null {
  return useContext(PortalRootContext)
}

export function usePortalBoundary(): boolean {
  return useContext(PortalBoundaryContext)
}
