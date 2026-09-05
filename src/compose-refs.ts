import type { Ref, RefCallback } from 'react'

function setRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref !== null && ref !== undefined) {
    ref.current = value
  }
}

export function composeRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): RefCallback<T> {
  return (value) => {
    for (const ref of refs) setRef(ref, value)
  }
}
