import { ICON_CLS, type IIconProps } from "@interfaces/icon-props"
import { cn } from "@lib/class-names"

export function MinusIcon({
  w = "w-4",
  stroke = "stroke-2",
  fill = "fill-foreground",
  style,
  className,
  ...props
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={cn(ICON_CLS, w, stroke, fill, className)}
      style={{
        strokeLinecap: "round",
        strokeLinejoin: "round",
        fill: "none",
        ...style,
      }}
      {...props}
    >
      <path d="M 2,8 L 14,8" />
    </svg>
  )
}
