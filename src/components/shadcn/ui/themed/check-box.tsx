import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { forwardRef, type ForwardedRef } from 'react'

import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { CheckIcon } from '@icons/check-icon'
import { cn } from '@lib/class-names'
import { CENTERED_ROW_CLS, GROUP_FOCUS_RING_CLS } from '@theme'

export type ICheckedChange = (state: boolean) => void

export interface ICheckboxProps extends IButtonProps {
  index?: number
  checked?: boolean
  gap?: string
  onCheckedChange?: ICheckedChange
}

export const CHECK_CLS = cn(
  'group flex flex-row shrink-0 cursor-pointer whitespace-nowrap text-left items-center outline-none'
)

export const TICK_CLS = cn(
  GROUP_FOCUS_RING_CLS,
  CENTERED_ROW_CLS,
  'rounded aspect-square w-5 h-5 shrink-0 trans-color',
  'data-[checked=false]:bg-background',
  'data-[enabled=true]:data-[checked=true]:bg-theme data-[enabled=false]:data-[checked=true]:bg-accent',
  'border data-[checked=false]:border-border data-[checked=true]:border-transparent'
)

export const Checkbox = forwardRef(function Checkbox(
  {
    checked = false,
    gap = 'gap-x-1.5',
    onCheckedChange,
    className,
    children,
    ...props
  }: ICheckboxProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      onCheckedChange={state =>
        onCheckedChange?.(state === 'indeterminate' ? false : state)
      }
      className={cn(CHECK_CLS, gap, className)}
      {...props}
    >
      <span
        className={TICK_CLS}
        data-checked={checked}
        data-enabled={!props.disabled}
      >
        <CheckboxPrimitive.Indicator>
          <CheckIcon stroke="stroke-3" w="w-4" fill="stroke-white/90" />
        </CheckboxPrimitive.Indicator>
      </span>

      {children && children}
    </CheckboxPrimitive.Root>
  )
})
