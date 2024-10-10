import { CheckIcon } from '@icons/check-icon'
import { ChevronRightIcon } from '@icons/chevron-right-icon'

import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'
import {
  FOCUS_RING_CLS,
  INPUT_BORDER_CLS,
  ROUNDED_MD_CLS,
  TRANS_COLOR_CLS,
} from '@theme'
import { Children, forwardRef, useState, type ForwardedRef } from 'react'
import { BaseDropDown } from './base-dropdown'
import { BaseButton } from './button/base-button'
import { DropdownMenuItem } from './shadcn/ui/themed/dropdown-menu'

const BUTTON_CLS = cn(
  ROUNDED_MD_CLS,
  INPUT_BORDER_CLS,
  FOCUS_RING_CLS,
  'h-9 justify-between gap-x-2 pl-2 flex flex-row justify-between items-center'
)

interface IProps extends IButtonProps {
  index: number
  onIndexChange: (index: number) => void
}

export const DropdownList = forwardRef(function DropdownList(
  { index, onIndexChange, className, children, ...props }: IProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const [_open, setOpen] = useState(false)
  const c = Children.toArray(children)

  return (
    <BaseDropDown onOpenChange={setOpen}>
      <BaseButton
        ref={ref}
        selected={true}
        className={cn(BUTTON_CLS, className)}
        {...props}
      >
        {c[index]}
        <span
          className={cn(
            TRANS_COLOR_CLS,
            'flex flex-col justify-center px-1.5',
            [_open, 'bg-muted', 'hover:bg-muted']
          )}
        >
          <ChevronRightIcon className="rotate-90 stroke-foreground" />
        </span>
      </BaseButton>
      <>
        {c.map((child, ci) => (
          <DropdownMenuItem key={ci} onClick={() => onIndexChange(ci)}>
            {ci === index && <CheckIcon />}
            {child}
          </DropdownMenuItem>
        ))}
      </>
    </BaseDropDown>
  )
})
