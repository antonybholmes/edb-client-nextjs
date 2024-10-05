import { Button, type IButtonProps } from "@components/shadcn/ui/themed/button"

import { forwardRef, type ForwardedRef } from "react"

export const ToolbarButton = forwardRef(function ToolbarButton(
  { className, children, ripple = false, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <Button
      ref={ref}
      multiVariants="toolbar"
      className={className}
      ripple={ripple}
      {...props}
    >
      {children}
    </Button>
  )
})
