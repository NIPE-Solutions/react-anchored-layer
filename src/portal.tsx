import { useState, type ReactPortal } from 'react'
import { createPortal } from 'react-dom'

import type { AnchoredLayerPortalProps } from './contracts'
import { PortalBoundaryContext, usePortalRoot } from './context'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

export function Portal({
  children,
  container,
}: AnchoredLayerPortalProps): ReactPortal | null {
  const providerRoot = usePortalRoot()
  const [mounted, setMounted] = useState(false)

  useIsomorphicLayoutEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  if (!mounted) return null

  const destination = container ?? providerRoot ?? document.body
  if (!destination.isConnected) return null

  return createPortal(
    <PortalBoundaryContext.Provider value>
      {children}
    </PortalBoundaryContext.Provider>,
    destination,
  )
}
