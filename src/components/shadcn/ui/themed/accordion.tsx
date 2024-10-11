import { ChevronRightIcon } from '@components/icons/chevron-right-icon'
import { V_SCROLL_CHILD_CLS, VScrollPanel } from '@components/v-scroll-panel'
import type { IChildrenProps } from '@interfaces/children-props'
import { cn } from '@lib/class-names'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementRef,
  type ReactNode,
} from 'react'

const Accordion = AccordionPrimitive.Root

interface IScrollAccordionProps extends IChildrenProps {
  value: string[]
  onValueChange?: (value: string[]) => void
}

export const ScrollAccordion = forwardRef<
  HTMLDivElement,
  IScrollAccordionProps
>(({ value, onValueChange, className, children }, ref) => {
  const [values, setValues] = useState<string[]>(value)

  useEffect(() => {
    setValues(value)
  }, [value])

  // if user doesn't supply a change monitor, we'll monitor
  // the accordion internally
  const v = onValueChange ? value : values

  return (
    <VScrollPanel asChild={true} ref={ref}>
      <Accordion
        type="multiple"
        value={v}
        // if user species onChange, let them handle which
        // accordions are open, otherwise we'll do it internally
        onValueChange={onValueChange ?? setValues}
        className={cn(V_SCROLL_CHILD_CLS, className)}
      >
        {children}
      </Accordion>
    </VScrollPanel>
  )
})

const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-t border-border ', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    leftChildren?: ReactNode
    rightChildren?: ReactNode
    arrowStyle?: CSSProperties
  }
>(
  (
    { className, arrowStyle, leftChildren, rightChildren, children, ...props },
    ref
  ) => (
    <AccordionPrimitive.Header className="flex flex-row items-center gap-x-1">
      {leftChildren}

      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between py-2.5 font-semibold hover:underline [&[data-state=open]>svg]:rotate-90',
          className
        )}
        {...props}
      >
        {children}
        {/* <ChevronDownIcon className="h-4 w-4 shrink-0 text-foreground/50 transition-transform duration-200" /> */}
        {!rightChildren && (
          <ChevronRightIcon
            className="h-4 w-4 shrink-0 trans-transform"
            style={arrowStyle}
          />
        )}
      </AccordionPrimitive.Trigger>

      {rightChildren && (
        <>
          {rightChildren}

          <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
              'flex flex-row items-center py-2.5 [&[data-state=open]>svg]:rotate-90',
              className
            )}
            {...props}
          >
            <ChevronRightIcon
              className="h-4 w-4 shrink-0 trans-transform"
              style={arrowStyle}
            />
          </AccordionPrimitive.Trigger>
        </>
      )}
    </AccordionPrimitive.Header>
  )
)
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
    innerClassName?: string
    innerStyle?: CSSProperties
  }
>(
  (
    {
      className,
      innerClassName = 'flex flex-col gap-y-1',
      innerStyle,
      children,
      ...props
    },
    ref
  ) => (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      {...props}
    >
      <div className={cn('pb-4', innerClassName)} style={innerStyle}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
)
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
