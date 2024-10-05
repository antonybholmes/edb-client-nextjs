import { type IButtonProps } from "@components/shadcn/ui/themed/button"
import { cn } from "@lib/class-names"
import { FOCUS_INSET_RING_CLS } from "@theme"
import { forwardRef, type ForwardedRef } from "react"
import { BaseButton } from "./base-button"

export const BasicButton = forwardRef(function BasicButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <BaseButton
      ref={ref}
      className={cn(FOCUS_INSET_RING_CLS, className)}
      {...props}
    >
      {children}
    </BaseButton>
  )
})
