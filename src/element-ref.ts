import { version, type Ref } from 'react'

interface RefElementLike<T> {
  props: { ref?: Ref<T> }
  ref?: Ref<T>
}

export function getElementRef<T>(
  element: RefElementLike<T>,
  reactVersion = version,
): Ref<T> | undefined {
  const major = Number.parseInt(reactVersion, 10)
  return major >= 19 ? element.props.ref : element.ref
}
