import { HCenterRow } from '@components/h-center-row'
import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import type { CSSProperties } from 'react'

const LINE_CLS = 'h-full rounded-full w-px'

const R = 3
const X1 = 4
const X2 = 14
const Y1 = 6
const Y2 = 34
const YM = 20

interface IProps extends IIconProps {
  lineClassName?: string
  lineStyle?: CSSProperties
}

export function VerticalGripIcon({
  w = 'h-4',
  //fill = "fill-foreground",
  lineClassName,
  lineStyle,
  className,
}: IProps) {
  return (
    // <svg
    //   viewBox="0 0 20 40"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={cn(BASE_ICON_CLS, fill, w, className)}
    //   style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
    //   //shapeRendering="crispEdges"
    // >
    //   <circle cx={X1} cy={Y1} r={R} />
    //   <circle cx={X1} cy={YM} r={R} />
    //   <circle cx={X1} cy={Y2} r={R} />

    //   <circle cx={X2} cy={Y1} r={R} />
    //   <circle cx={X2} cy={YM} r={R} />
    //   <circle cx={X2} cy={Y2} r={R} />
    // </svg>

    <HCenterRow
      className={cn('shrink-0', w, 'gap-x-0.5', className)}
      //onPointerDown={event => dragControls?.start(event)}
    >
      <span className={cn(LINE_CLS, lineClassName)} style={lineStyle} />
      <span className={cn(LINE_CLS, lineClassName)} style={lineStyle} />
    </HCenterRow>
  )
}
