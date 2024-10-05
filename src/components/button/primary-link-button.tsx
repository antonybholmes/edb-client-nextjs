import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'
import { PRIMARY_LINK_CLS, ROUNDED_LG_CLS } from '@theme'
import { forwardRef, type ForwardedRef } from 'react'
import { BasicButton } from './basic-button'

const CLS = cn(PRIMARY_LINK_CLS, ROUNDED_LG_CLS, 'p-1')

export const PrimaryLinkButton = forwardRef(function PrimaryLinkButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <BasicButton ref={ref} className={cn(CLS, className)} {...props}>
      {children}
    </BasicButton>
  )
})

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
