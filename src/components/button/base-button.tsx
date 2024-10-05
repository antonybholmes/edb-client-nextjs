import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { Tooltip } from '@components/tooltip'

import { cn } from '@lib/class-names'
import { BASE_BUTTON_CLS } from '@theme'

import { forwardRef, type ForwardedRef } from 'react'

export type ButtonType = 'button' | 'submit' | 'reset' | undefined

export const BaseButton = forwardRef(function BaseButton(
  {
    selected = false,
    tooltip,
    tooltipSide = 'right',
    type = 'button',
    className,
    children,
    ...props
  }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const button = (
    <button
      ref={ref}
      className={cn(BASE_BUTTON_CLS, className)}
      data-selected={selected}
      type={type}
      {...props}
    >
      {children}
    </button>
  )

  if (tooltip) {
    return (
      <Tooltip side={tooltipSide} content={tooltip}>
        {button}
      </Tooltip>
    )
  } else {
    return button
  }
})
