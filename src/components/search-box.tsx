import { CloseIcon } from '@components/icons/close-icon'
import { SearchIcon } from '@icons/search-icon'
import type { IInputProps } from '@interfaces/input-props'
import { cn } from '@lib/class-names'
import { BUTTON_H_CLS, CENTERED_ROW_CLS } from '@theme'

import { useState, type ChangeEvent } from 'react'
import { Input } from './shadcn/ui/themed/input'

interface IProps extends IInputProps {
  variant?: 'default' | 'translucent'
  onSearch?: (event: 'search' | 'clear', value: string) => void
}

export function SearchBox({
  variant = 'default',
  value,
  placeholder,
  onChange,
  onSearch,
  className,
  ...props
}: IProps) {
  const [_value, setValue] = useState('')

  function _onChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.currentTarget.value)
    onChange?.(e)
  }

  const v: string | number | readonly string[] =
    value !== undefined ? value : _value

  return (
    <Input
      value={v}
      variant={variant}
      data-mode={variant}
      placeholder={placeholder}
      onChange={_onChange}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onSearch?.('search', v.toString())
        }
      }}
      leftChildren={
        <button
          onClick={() => onSearch?.('search', v.toString())}
          data-variant={variant}
          data-value={v !== ''}
          className={cn(
            CENTERED_ROW_CLS,
            'w-4 aspect-square trans-color',
            'data-[variant=default]:hover:fill-foreground data-[variant=default]:fill-foreground/50',
            'data-[variant=translucent]:fill-white/70 data-[variant=translucent]:hover:fill-white'
          )}
          aria-label="Search"
        >
          <SearchIcon w="w-3" fill="" />
        </button>
      }
      rightChildren={
        value ? (
          <button
            data-variant={variant}
            onClick={() => onSearch?.('clear', '')}
            className={cn(
              CENTERED_ROW_CLS,
              'aspect-square w-4 data-[variant=default]:hover:stroke-foreground data-[variant=default]:stroke-foreground/50',
              'data-[variant=translucent]:stroke-white/70 data-[variant=translucent]:hover:stroke-white'
            )}
          >
            <CloseIcon w="w-2.5" fill="" />
          </button>
        ) : undefined
      }
      className={cn(BUTTON_H_CLS, 'rounded-md px-2', className)}
      {...props}
    />
  )
}
