import { type IButtonProps } from "@components/shadcn/ui/themed/button"
import { cn } from "@lib/class-names"
import { ROUNDED_LG_CLS } from "@theme"
import { forwardRef, type ForwardedRef } from "react"
import { BaseButton } from "./base-button"

export const RoundedButton = forwardRef(function RoundedButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <BaseButton ref={ref} className={cn(ROUNDED_LG_CLS, className)} {...props}>
      {children}
    </BaseButton>
  )
})
