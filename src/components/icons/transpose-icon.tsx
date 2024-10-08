import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export function TransposeIcon({
  w = 'w-3.5',
  stroke = 'stroke-foreground',
  //fill = "fill-theme/75",
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn(w, stroke, className)}
    >
      <path d="M19,26H14V24h5a5.0055,5.0055,0,0,0,5-5V14h2v5A7.0078,7.0078,0,0,1,19,26Z" />
      <path d="M8,30H4a2.0023,2.0023,0,0,1-2-2V14a2.0023,2.0023,0,0,1,2-2H8a2.0023,2.0023,0,0,1,2,2V28A2.0023,2.0023,0,0,1,8,30ZM4,14V28H8V14Z" />
      <path d="M28,10H14a2.0023,2.0023,0,0,1-2-2V4a2.0023,2.0023,0,0,1,2-2H28a2.0023,2.0023,0,0,1,2,2V8A2.0023,2.0023,0,0,1,28,10ZM14,4V8H28V4Z" />
    </svg>
  )
}
