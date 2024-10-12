import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { DotFilledIcon } from '@radix-ui/react-icons'

import { CheckIcon } from '@components/icons/check-icon'
import { ChevronRightIcon } from '@components/icons/chevron-right-icon'
import { cn } from '@lib/class-names'
import {
  BUTTON_H_CLS,
  BUTTON_W_CLS,
  CENTERED_ROW_CLS,
  ROUNDED_CLS,
} from '@theme'
import {
  Children,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type PropsWithoutRef,
} from 'react'
import { GLASS_CLS } from './glass'

export const DROPDOWN_SHADOW_CLS = 'shadow-xl'

export const BASE_DROPDOWN_CONTENT_CLS = cn(
  GLASS_CLS,
  DROPDOWN_SHADOW_CLS,
  'rounded-md border border-border'
)

const DROPDOWN_MENU_CLS = cn(
  BUTTON_H_CLS,
  CENTERED_ROW_CLS,
  'relative rounded font-medium cursor-default select-none gap-x-1 outline-none',
  'fill-popover-foreground stroke-popover-foreground focus:bg-theme/60 focus:text-popover-alt',
  'focus:fill-popover-alt focus:stroke-popover-alt data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  'hover:bg-theme/60 hover:text-popover-alt hover:fill-popover-alt hover:stroke-popover-alt'
)

const CONTENT_CLS = cn(
  BASE_DROPDOWN_CONTENT_CLS,
  'flex flex-col text-xs px-0.5 py-1 z-modal overflow-hidden min-h-0 min-w-48 text-popover-foreground',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-1.5 data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
)

const CHECK_CLS = cn(
  DROPDOWN_MENU_CLS,
  'outline-none data-[state=checked]:text-popover-alt data-[state=checked]:fill-popover-alt',
  'data-[state=checked]:stroke-popover-alt data-[state=checked]:bg-theme/90'
)

export const DROPDOWN_MENU_ICON_CONTAINER_CLS = cn(
  BUTTON_W_CLS,
  'flex flex-row items-center shrink-0 grow-0 justify-center'
)

const SUBCONTENT_CLS = cn(
  BASE_DROPDOWN_CONTENT_CLS,
  'z-modal min-w-56 flex flex-col text-xs px-0.5 py-1 text-popover-foreground data-[state=open]:animate-in',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1.5',
  'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
)

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const TRIGGER_CLS = cn(
  DROPDOWN_MENU_CLS,
  'data-[state=open]:bg-theme/60 data-[state=open]:text-popover-alt data-[state=open]:stroke-popover-alt',
  'data-[state=open]:fill-popover-alt'
)

const DropdownMenuSubTrigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => {
  const c = Children.toArray(children)
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(TRIGGER_CLS, inset && 'pl-8', className)}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        <ChevronRightIcon fill="" />
      </span>
    </DropdownMenuPrimitive.SubTrigger>
  )
})

DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(SUBCONTENT_CLS, className)}
    {...props}
  />
))

DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(CONTENT_CLS, className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuPrimitiveItem = DropdownMenuPrimitive.Item

const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitiveItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveItem>
>(({ className, children, ...props }, ref) => {
  const c = Children.toArray(children)

  return (
    <DropdownMenuPrimitiveItem
      ref={ref}
      className={cn(
        DROPDOWN_MENU_CLS,

        className
      )}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 2 && c[2]}
      </span>
    </DropdownMenuPrimitiveItem>
  )
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuAnchorItem = forwardRef<
  HTMLAnchorElement,
  PropsWithoutRef<HTMLAttributes<HTMLAnchorElement>> & { href: string }
>(({ href, className, children, ...props }, ref) => {
  const c = Children.toArray(children)

  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        DROPDOWN_MENU_CLS,

        className
      )}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}

      {c.length > 2 && (
        <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>{c[2]}</span>
      )}
    </a>
  )
})

const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
  const c = Children.toArray(children)

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(CHECK_CLS, className)}
      checked={checked}
      {...props}
    >
      {/* <span className="inline-flex flex-row">
        <span className={DROPDOWN_MENU_ICON_CONT_CLS}>
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon w="w-4" fill="" />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>

        <span className={DROPDOWN_MENU_ICON_CONT_CLS}>
          {c.length > 1 && c[0]}
        </span>
      </span> */}

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {checked ? (
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon w="w-4" fill="" />
          </DropdownMenuPrimitive.ItemIndicator>
        ) : (
          <>{c.length > 1 && c[0]}</>
        )}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}

      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS} />
    </DropdownMenuPrimitive.CheckboxItem>
  )
})
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      ROUNDED_CLS,
      BUTTON_H_CLS,
      'relative flex cursor-default select-none items-center text-xs outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="h-4 w-4 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'py-1.5 pl-8.5 text-xs font-bold',

      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const MenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-border', className)}
    {...props}
  />
))
MenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuAnchorItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPrimitiveItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
}
