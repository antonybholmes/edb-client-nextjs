import { type IButtonProps } from "@components/shadcn/ui/themed/button"
import { cn } from "@lib/class-names"
import { PILL_BUTTON_CLS } from "@theme"
import { BaseButton } from "./base-button"

export function PillButton({ className, children, ...props }: IButtonProps) {
  return (
    <BaseButton className={cn(PILL_BUTTON_CLS, className)} {...props}>
      {children}
    </BaseButton>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
