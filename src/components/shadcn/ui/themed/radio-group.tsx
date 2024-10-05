import { cn } from "@lib/class-names"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import {
  CENTERED_ROW_CLS,
  FOCUS_RING_CLS,
  TRANS_COLOR_CLS,
  V_CENTERED_ROW_CLS,
} from "@theme"
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react"

const RADIO_CLS = cn(
  V_CENTERED_ROW_CLS,
  "group gap-x-1.5 text-primary disabled:cursor-not-allowed disabled:opacity-50 min-w-0",
)

const RADIO_BUTTON_CLS = cn(
  FOCUS_RING_CLS,
  CENTERED_ROW_CLS,
  "aspect-square h-5 w-5 rounded-full bg-background border-2",
  "data-[state=unchecked]:border-input data-[state=checked]:border-theme",
  "data-[state=unchecked]:group-hover:border-theme/50",
  "trans-color",
)

const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={className} {...props} ref={ref} />
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(RADIO_CLS, className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        className={RADIO_BUTTON_CLS}
        forceMount={true}
      >
        <RadioGroupPrimitive.Indicator className="aspect-square h-3 w-3 rounded-full bg-theme"></RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Indicator>

      {children && children}
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

interface SideRadioGroupItemProps
  extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  currentValue?: string
}

const BASE_SIDE_CLS = cn(
  TRANS_COLOR_CLS,
  "relative aspect-square bg-background z-0 border border-dashed border-primary border-primary/50",
)

const SIDE_BUTTON_CLS = cn(
  TRANS_COLOR_CLS,
  "relative aspect-square overflow-hidden rounded border p-1 data-[state=checked]:border-input data-[state=unchecked]:border-transparent data-[state=checked]:bg-accent/50 data-[state=unchecked]:hover:border-input data-[state=unchecked]:hover:bg-accent/50",
)

const BORDER_MAP = {
  Off: "",
  Top: "-rotate-90",
  Bottom: "rotate-90",
  Left: "rotate-180",
  Right: "",
}

export const SideRadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  SideRadioGroupItemProps
>(({ value, currentValue, className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      value={value}
      {...props}
      className={SIDE_BUTTON_CLS}
      aria-label={value}
      //@ts-ignore
      title={value}
    >
      <div className={cn(BASE_SIDE_CLS, BORDER_MAP[value], className)}>
        {/* <span className="absolute left-0 top-0 z-10 border border-dashed border-primary border-primary/50 h-full" /> */}

        {value !== "Off" && (
          <span
            data-state={value === currentValue ? "checked" : "unchecked"}
            className="absolute -right-px top-0 z-20 w-[3px] h-full bg-foreground"
          ></span>
        )}
      </div>
    </RadioGroupPrimitive.Item>
  )
})
SideRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
