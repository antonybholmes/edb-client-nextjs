import { ICON_CLS, type IIconProps } from "@interfaces/icon-props"
import { cn } from "@lib/class-names"

export function HelpIcon({
  w = "w-5",
  fill = "fill-foreground stroke-foreground",
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className={cn(ICON_CLS, w, fill, className)}
    >
      <text
        textAnchor="middle"
        dominantBaseline="central"
        x="10"
        y="10"
        fontSize="small"
        className="font-bold stroke-none"
      >
        ?
      </text>
      <circle cx="10" cy="10" r="9" className="stroke-2 fill-none" />
    </svg>
  )
}
