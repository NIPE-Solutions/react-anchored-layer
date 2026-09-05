import type { ReactElement } from 'react'

import type { AnchoredLayerProviderProps } from './contracts'
import { PortalRootContext } from './context'

export function Provider({
  children,
  portalRoot = null,
}: AnchoredLayerProviderProps): ReactElement {
  return (
    <PortalRootContext.Provider value={portalRoot}>
      {children}
    </PortalRootContext.Provider>
  )
}
