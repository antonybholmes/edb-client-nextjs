import { COLOR_BUTTON_CLS } from "@components/link/color-button-link"

import { type IButtonProps } from "@components/shadcn/ui/themed/button"
import { cn } from "@lib/class-names"
import { BaseButton } from "./base-button"

export function ColorButton({ className, children, ...props }: IButtonProps) {
  return (
    <BaseButton className={cn(COLOR_BUTTON_CLS, className)} {...props}>
      {children}
    </BaseButton>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
