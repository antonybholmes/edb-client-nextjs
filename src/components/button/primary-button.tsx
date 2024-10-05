import { Button, type IButtonProps } from "@components/shadcn/ui/themed/button"

import { forwardRef, type ForwardedRef } from "react"

export const PrimaryButton = forwardRef(function PrimaryButton(
  { children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  )
})
