import { ICON_CLS, type IIconProps } from "@interfaces/icon-props"
import { cn } from "@lib/class-names"

export function SortIcon({
  w = "w-3",
  stroke = "stroke-foreground",
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, "stroke-3", stroke, w, className)}
      style={{ strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }}
    >
      <path d="M 6,7 L 12,1 L 18,7" />

      <path d="M 6,17 L 12,23 L 18,17" />
    </svg>
  )
}
