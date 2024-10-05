import { useState } from 'react'
import { RadioButton } from './radio-button'

interface RadioButtonGroupProps {
  items: string[]
  selected?: string
  onRadioClick: (index: number) => void
  prefix?: string
  className?: string
}

export function RadioButtonGroup({
  items,
  selected = '',
  onRadioClick,
  prefix = 'Sort',
  className,
}: RadioButtonGroupProps) {
  const [, setIndex] = useState(selected)

  function _onRadioClick(index: number) {
    setIndex(items[index])

    onRadioClick(index)
  }

  return (
    <ul className={className}>
      {items.map((item: string, index: number) => {
        return (
          <li key={index}>
            <RadioButton
              key={index}
              index={index}
              open={item === selected}
              onRadioClick={_onRadioClick}
              aria-label={`${prefix} by ${item}`}
            >
              {item}
            </RadioButton>
          </li>
        )
      })}
    </ul>
  )
}
