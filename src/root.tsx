import { useMemo, useState, type ReactElement } from 'react'

import type { AnchoredLayerRootProps } from './contracts'
import { AnchoredLayerContext } from './context'
import { useControllableState } from './use-controllable-state'

export function Root({
  children,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen,
}: AnchoredLayerRootProps): ReactElement {
  const [open, setOpen] = useControllableState({
    defaultValue: defaultOpen,
    ...(onOpenChange === undefined ? {} : { onChange: onOpenChange }),
    ...(controlledOpen === undefined ? {} : { value: controlledOpen }),
  })
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [content, setContent] = useState<HTMLElement | null>(null)

  const context = useMemo(
    () => ({ anchor, content, open, setAnchor, setContent, setOpen }),
    [anchor, content, open, setOpen],
  )

  return (
    <AnchoredLayerContext.Provider value={context}>
      {children}
    </AnchoredLayerContext.Provider>
  )
}
