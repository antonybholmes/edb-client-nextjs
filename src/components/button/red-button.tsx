import { RED_BUTTON_CLS } from '@components/link/red-button-link'
import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'
import { ColorButton } from './color-button'

export function RedButton({ className, children, ...props }: IButtonProps) {
  return (
    <ColorButton className={cn(RED_BUTTON_CLS, className)} {...props}>
      {children}
    </ColorButton>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
