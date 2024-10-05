import { type ILinkProps } from "@interfaces/link-props"
import { cn } from "@lib/class-names"
import { FOCUS_RING_CLS } from "@theme"
import { forwardRef, type ForwardedRef } from "react"
import { BaseLink } from "./base-link"

export const BASE_THEME_LINK_CLS = cn(
  FOCUS_RING_CLS,
  "text-theme inline-block data-[underline=true]:hover:decoration-theme",
)

export const ThemeLink = forwardRef(function ThemeLink(
  { className, children, ...props }: ILinkProps,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <BaseLink
      ref={ref}
      className={cn(BASE_THEME_LINK_CLS, className)}
      {...props}
    >
      {children}
    </BaseLink>
  )
})
