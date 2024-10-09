import { VCenterCol } from '@components/v-center-col'
import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { motion } from 'framer-motion'

const LINE_CLS = 'w-full rounded-full h-[1px] bg-foreground/75'

export function HamburgerIcon({
  w = 'w-4',
  hover = false,
  className,
  style,
}: IIconProps) {
  return (
    // <svg
    //   viewBox="0 0 20 20"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={cn(ICON_CLS, w, fill, "group", className)}
    //   style={style}
    // >
    //   <rect
    //     x="2"
    //     y="5"
    //     width="18"
    //     height="2"
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //     className="group-hover:translate-y-[2px] trans-transform"
    //     shapeRendering="crispEdges"
    //   />
    //   <rect
    //     x="2"
    //     y="15"
    //     width="18"
    //     height="2"
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //     className="group-hover:-translate-y-[2px] trans-transform"
    //     shapeRendering="crispEdges"
    //   />
    // </svg>

    <VCenterCol
      className={cn(ICON_CLS, w, 'gap-y-1.5', className)}
      style={style}
    >
      <motion.span
        className={LINE_CLS}
        animate={{ scaleX: hover ? 0.75 : 1 }}
      />
      <motion.span
        className={LINE_CLS}
        animate={{ scaleX: hover ? 0.75 : 1 }}
      />
    </VCenterCol>
  )
}
