import { forwardRef, type ForwardedRef } from "react"

import { type IDivProps } from "@interfaces/div-props"
import { cn } from "@lib/class-names"

export const GLASS_CLS = "bg-popover/10 backdrop-blur-md"

export const Glass = forwardRef(function Glass(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={cn(GLASS_CLS, className)} {...props}>
      {children}
    </div>
  )
})
