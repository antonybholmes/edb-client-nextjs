import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

interface ICheckProps extends IIconProps {
  checked?: boolean
}

export function CheckIcon({
  checked = true,
  w = 'w-4',
  fill = 'stroke-foreground',
  stroke = 'stroke-3',
  style,
  className,
  ...props
}: ICheckProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, fill, stroke, w, className)}
      style={{
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none',
        ...style,
      }}
      {...props}
    >
      {checked && <path d="M 5,14 L 10,18 L 18,6" />}
    </svg>
  )
}
