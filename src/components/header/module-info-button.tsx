import { Button, type IButtonProps } from "@components/shadcn/ui/themed/button"
import { cn } from "@lib/class-names"

import { forwardRef, type ForwardedRef } from "react"

export const ModuleInfoButton = forwardRef(function ModuleInfoButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Button
      ref={ref}
      variant="trans"
      rounded="sm"
      pad="sm"
      ripple={false}
      className={cn("gap-x-2 text-sm font-semibold truncate", className)}
      {...props}
    >
      {children}
    </Button>
  )
})
