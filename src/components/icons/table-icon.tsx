import { type IIconProps } from "@interfaces/icon-props"
import { cn } from "@lib/class-names"

export function TableIcon({
  w = "w-3.5",
  stroke = "stroke-theme/75",
  fill = "fill-theme/75",
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn(w, "stroke-2", stroke, fill, className)}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="28"
        rx="3"
        fill="white"
        stroke="none"
      />

      {/* <rect
      rx="2"
        x="4"
        y="4"
        width="24"
        height="5"
        stroke="none"
        //className="fill-blue-400"
      />  */}
      <rect
        x="1"
        y="1"
        width="30"
        height="28"
        rx="3"
        fill="none"
        //className="stroke-blue-400"
      />
      <line x1="5" x2="14" y1="9" y2="9" />
      <line x1="18" x2="27" y1="9" y2="9" />

      <line x1="5" x2="14" y1="15" y2="15" />
      <line x1="18" x2="27" y1="15" y2="15" />

      <line x1="5" x2="14" y1="21" y2="21" />
      <line x1="18" x2="27" y1="21" y2="21" />
    </svg>
    // <div className="bg-white w-4 h-4 shrink-0 rounded border border-theme/75 relative">
    //   <span className="bg-theme/75 h-1 w-full absolute" />
    // </div>
  )
}
