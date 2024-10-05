import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export function CloseIcon({
  w = 'w-3',
  stroke = 'stroke-2',
  fill = 'stroke-foreground',
  selected = false,
  className,
  style,
}: IIconProps) {
  //const lineCls = cn("rounded-full absolute left-0.25 right-0.25 top-1/2 -translate-y-1/2", fill)
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, w, stroke, fill, className)}
      style={{ ...style, strokeLinecap: 'round', strokeLinejoin: 'round' }}
      data-selected={selected}
    >
      <path d="M 1,1 L 15,15 M 15,1 L 1,15" />
    </svg>
  )

  {
    /* <div className={cn(ICON_CLS, w, className)} style={style}>
<span className={cn(lineCls, "-rotate-45")}  />
<span className={cn(lineCls, "rotate-45")}/>
</div> */
  }
}
