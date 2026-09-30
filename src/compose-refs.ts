import type { Ref, RefCallback } from 'react'

function setRef<T>(
  ref: Ref<T> | undefined,
  value: T | null,
): ReturnType<RefCallback<T>> {
  if (typeof ref === 'function') {
    return ref(value)
  }

  if (ref !== null && ref !== undefined) {
    ref.current = value
  }
}

export function composeRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): RefCallback<T> {
  return (value) => {
    const cleanups = refs.map((ref) => setRef(ref, value))
    // React 19 replaces the null callback with cleanup when any ref owns one.
    // The remaining refs still need their normal detach notification.
    if (cleanups.some((cleanup) => typeof cleanup === 'function')) {
      return () => {
        for (const [index, ref] of refs.entries()) {
          const cleanup = cleanups[index]
          if (typeof cleanup === 'function') cleanup()
          else setRef(ref, null)
        }
      }
    }
  }
}
