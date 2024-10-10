import { type IButtonProps } from '@components/shadcn/ui/themed/button'

import { Tooltip } from '@components/tooltip'
import { forwardRef, type ForwardedRef } from 'react'
import { ToolbarButton } from './toolbar-button'

export const ToolbarTabButton = forwardRef(function ToolbarTabButton(
  {
    variant = 'muted-theme',
    size = 'tab',
    role = 'tab',
    font = 'normal',
    tooltip,
    className,
    children,
    ...props
  }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const button = (
    <ToolbarButton
      variant={variant}
      ref={ref}
      className={className}
      font={font}
      size={size}
      role={role}
      ripple={false}
      {...props}
    >
      {children}
    </ToolbarButton>
  )

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>
  } else {
    return button
  }
})
