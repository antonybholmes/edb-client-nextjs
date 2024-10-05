import { VCenterRow } from "@components/v-center-row"
import { type IDivProps } from "@interfaces/div-props"
import { cn } from "@lib/class-names"

interface IProps extends IDivProps {
  name?: string
}

export function ToolbarTabGroup({
  name,
  className,
  children,
  ...props
}: IProps) {
  return (
    <VCenterRow
      id={name}
      aria-label={name}
      className={cn("shrink-0 text-xs", className)}
      {...props}
    >
      {children}
    </VCenterRow>
  )
}
