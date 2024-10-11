import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

const toggleVariants = cva(
  'inline-flex items-center text-xs font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-accent',
        outline:
          'border border-border bg-transparent shadow-sm hover:bg-accent',
        tab: '',
      },
      size: {
        default: 'h-8 px-2',
        md: 'h-9 px-2',
        lg: 'h-10 px-3',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
      },
      rounded: {
        none: '',
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'none',
      justify: 'center',
    },
  }
)

const Toggle = forwardRef<
  ElementRef<typeof TogglePrimitive.Root>,
  ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ pressed, variant, size, className, children, ...props }, ref) => (
  <TogglePrimitive.Root
    pressed={pressed}
    ref={ref}
    className={toggleVariants({ variant, size, className })}
    {...props}
  >
    ss
    {pressed}
    {pressed && <span>c</span>}
    {children}
  </TogglePrimitive.Root>
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
