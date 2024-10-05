import { ButtonLink } from "@components/link/button-link"
import { type ILinkProps } from "@interfaces/link-props"
import { cn } from "@lib/class-names"
import {
  CENTERED_ROW_CLS,
  LARGE_BUTTON_H_CLS,
  ROUNDED_LG_CLS,
  SECONDARY_BUTTON_CLS,
} from "@theme"

export function SecondaryButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  return (
    <ButtonLink
      className={cn(
        SECONDARY_BUTTON_CLS,
        CENTERED_ROW_CLS,
        LARGE_BUTTON_H_CLS,
        ROUNDED_LG_CLS,
        className,
      )}
      {...props}
    >
      {children}
    </ButtonLink>
  )
}
