import { ICON_CLS, type IIconProps } from "@interfaces/icon-props"
import { cn } from "@lib/class-names"

export function LogoIcon({ w = "w-4", className }: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn(ICON_CLS, w, className)}
    >
      <circle cx="8" cy="16" r="8" className="fill-cyan-400" />
      <circle cx="8" cy="16" r="4" className="stroke-white/80" fill="none" />
      <circle cx="15" cy="16" r="8" className="fill-white" />
      <circle cx="16" cy="16" r="8" className="fill-blue-600" />
      <circle cx="16" cy="16" r="4" className="stroke-white/80" fill="none" />
      <circle cx="23" cy="16" r="8" className="fill-white" />
      <circle cx="24" cy="16" r="8" className="fill-indigo-300" />
      <circle cx="24" cy="16" r="4" className="stroke-white/80" fill="none" />
    </svg>
  )
}
