import { cn } from '@lib/class-names'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { FOCUS_RING_CLS, TRANS_COLOR_CLS } from '@theme'

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

const THUMB_CLS = cn(
  TRANS_COLOR_CLS,
  FOCUS_RING_CLS,
  'block h-4 w-4 rounded-full border border-border bg-background hover:border-theme disabled:pointer-events-none disabled:opacity-50'
)

const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex touch-none select-none flex-row items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[3px] grow overflow-hidden rounded-full bg-muted">
      <SliderPrimitive.Range className="absolute bg-theme" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={THUMB_CLS} aria-label="Slider control" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
