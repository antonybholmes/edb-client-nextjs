import { type IButtonProps } from "@components/shadcn/ui/themed/button"
import { cn } from "@lib/class-names"
import { BASE_PRIMARY_BUTTON_CLS } from "@theme"
import { RedButton } from "./red-button"

export function PrimaryRedButton({
  className,
  children,
  ...props
}: IButtonProps) {
  return (
    <RedButton className={cn(BASE_PRIMARY_BUTTON_CLS, className)} {...props}>
      {children}
    </RedButton>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
