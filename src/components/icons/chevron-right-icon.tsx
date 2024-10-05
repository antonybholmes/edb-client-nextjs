import { ICON_CLS, type IIconProps } from "@interfaces/icon-props"
import { cn } from "@lib/class-names"

export function ChevronRightIcon({
  w = "w-3",
  fill = "stroke-foreground",
  stroke = "stroke-2",
  style,
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      className={cn(ICON_CLS, fill, stroke, w, className)}
      style={{
        strokeLinecap: "round",
        strokeLinejoin: "round",
        fill: "none",
        ...style,
      }}
    >
      <path d="M 7,4 L 12,9 L 7,14" />
    </svg>
  )
}
