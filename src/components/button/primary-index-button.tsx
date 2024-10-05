import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'
import { PRIMARY_LINK_CLS } from '@theme'
import { forwardRef, type ForwardedRef } from 'react'
import { IndexButton } from './index-button'

const CLS = cn(
  PRIMARY_LINK_CLS,
  'stroke-primary dark:text-foreground dark:stroke-foreground'
)

export const PrimaryIndexButton = forwardRef(function PrimaryIndexButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <IndexButton ref={ref} className={cn(CLS, className)} {...props}>
      {children}
    </IndexButton>
  )
})

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
