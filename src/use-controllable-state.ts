import { useCallback, useState } from 'react'

interface ControllableStateOptions {
  defaultValue: boolean
  onChange?: (value: boolean) => void
  value?: boolean
}

export function useControllableState({
  defaultValue,
  onChange,
  value,
}: ControllableStateOptions): readonly [boolean, (value: boolean) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const controlled = value !== undefined
  const currentValue = controlled ? value : uncontrolledValue

  const setValue = useCallback(
    (nextValue: boolean) => {
      if (!controlled) setUncontrolledValue(nextValue)
      if (nextValue !== currentValue) onChange?.(nextValue)
    },
    [controlled, currentValue, onChange],
  )

  return [currentValue, setValue] as const
}
