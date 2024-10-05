import { Button, type IButtonProps } from "@components/shadcn/ui/themed/button"
import { forwardRef, type ForwardedRef } from "react"

export const WarningButton = forwardRef(function WarningButton(
  { variant = "destructive", children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <Button variant={variant} ref={ref} {...props}>
      {children}
    </Button>
  )
})
