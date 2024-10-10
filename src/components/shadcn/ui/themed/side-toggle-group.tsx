import { cn } from '@lib/class-names'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { BUTTON_H_CLS, V_CENTERED_ROW_CLS } from '@theme'
import { motion } from 'framer-motion'
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

//const TAB_LINE_CLS = "absolute left-0 block stroke-theme w-[3px] z-10"
const DEFAULT_H = 1.5

const SideToggleGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    h?: number
    padding?: number
    values: string[]
  }
>(
  (
    { values, h = DEFAULT_H, padding = 0.25, className, children, ...props },
    ref
  ) => {
    //const tabLineRef1 = useRef<HTMLSpanElement>(null)
    //const tabLineRef2 = useRef<HTMLSpanElement>(null)
    const [at, setAt] = useState<number>(0)
    const lineRef = useRef<SVGLineElement>(null)
    const currentStep = useRef<number>(-1)

    const itemHeight = h + 2 * padding

    const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
      y: '0rem',
      height: '0rem',
    })

    useEffect(() => {
      const x = at * itemHeight

      setTabPos({ y: `${x + padding}rem`, height: `${h}rem` })

      // if (h === 0) {
      //   return
      // }

      // // gsap.timeline().to([tabLineRef1.current], {
      // //   //height: `${defaultWidth}rem`,
      // //   transform: `translateY(${at * DEFAULT_H + 0.25}rem)`,
      // //   duration: ANIMATION_DURATION_S,
      // //   //stagger: STAGGER_ANIMATION_DURATION_S,
      // //   ease: "power2.inOut",
      // // })

      // const dir = at - currentStep.current
      // //const ext = _scale > 1 ? 0 : 2

      // const y1 = h * at + offset
      // const y2 = h * (at + 1) - offset
      // const duration = initial.current ? 0 : ANIMATION_DURATION_S

      // if (dir > 0) {
      //   gsap
      //     .timeline()
      //     .to(lineRef.current, {
      //       attr: { y2 },
      //       duration,
      //       ease: "power2.out",
      //     })
      //     .to(
      //       lineRef.current,
      //       {
      //         attr: { y1 },
      //         duration,
      //         ease: "power2.out",
      //       },
      //       "-=50%",
      //     )
      // } else if (dir < 0) {
      //   gsap
      //     .timeline()
      //     .to(lineRef.current, {
      //       attr: { y1 },
      //       duration,
      //       ease: "power2.out",
      //     })
      //     .to(
      //       lineRef.current,
      //       {
      //         attr: { y2 },
      //         duration,
      //         ease: "power2.out",
      //       },
      //       "-=50%",
      //     )
      // } else {
      //   gsap.timeline().to(lineRef.current, {
      //     attr: { y1, y2 },
      //     duration,
      //     ease: "power2.out",
      //   })
      // }

      // currentStep.current = at
      // initial.current = false
    }, [h, at])

    useEffect(() => {
      const v = props?.value?.toString() ?? ''

      const idx = values.indexOf(v)

      if (idx > -1) {
        setAt(idx)
      }
    }, [props.value])

    return (
      <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn('flex flex-col relative pl-1', className)}
        {...props}
      >
        {children}

        {/* <span
        className={TAB_LINE_CLS}
        ref={tabLineRef1}
        style={{
          height: H,
        }}
      /> */}
        {/* <span
        className={TAB_LINE_CLS}
        ref={tabLineRef2}
        style={{
          height: H,
        }}
      /> */}

        {/* <VToolbarTabLine ref={lineRef} w={3} lineClassName={TAB_LINE_CLS} /> */}
        <motion.span
          className="absolute left-0 w-[3px] z-0 bg-theme rounded-md"
          animate={{ ...tabPos }}
          transition={{ ease: 'easeInOut' }}
        />
      </ToggleGroupPrimitive.Root>
    )
  }
)

SideToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ITEM_CLS = cn(
  'flex flex-row text-xs font-medium hover:bg-muted w-full text-left px-2 rounded-md',
  V_CENTERED_ROW_CLS,
  BUTTON_H_CLS
)

const ToggleGroupItem = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  //const context = useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(ITEM_CLS, className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { SideToggleGroup, ToggleGroupItem }
