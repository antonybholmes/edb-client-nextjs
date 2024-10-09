import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'

import { ThemeLink } from '@components/link/theme-link'
import { VCenterRow } from '@components/v-center-row'
import { useState, type MouseEventHandler } from 'react'

import { Popover, PopoverContent } from '@components/shadcn/ui/themed/popover'
import { HEADER_LINKS } from '@menus'

import { BaseLink } from '@components/link/base-link'
import { Button } from '@components/shadcn/ui/themed/button'

import { GLASS_CLS } from '@components/shadcn/ui/themed/glass'
import type { ILinkProps } from '@interfaces/link-props'
import { PopoverAnchor } from '@radix-ui/react-popover'
import { FOCUS_RING_CLS } from '@theme'
import { MenuButtonIcon } from './menu-button-icon'

export function ModuleButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  return (
    <BaseLink
      className={cn(
        'w-64 flex  flex-row items-center shrink-0 grow-0 justify-start gap-3 p-2 rounded-md group hover:bg-gray-200/50 trans-color',
        FOCUS_RING_CLS,
        className
      )}
      {...props}
    >
      {children}
    </BaseLink>
  )
}

interface IProps extends IElementProps {
  tab?: string
  onClick: MouseEventHandler<HTMLAnchorElement>
}

export function HeaderLinks({ onClick, className }: IProps) {
  // sort alphabetically and ignore sections
  const items = HEADER_LINKS.map(section => {
    return section.modules.filter(
      module => module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
    )
  })
    .flat()
    .sort((modA, modB) => modA.name.localeCompare(modB.name))
    .map((module, moduleIndex) => {
      let abbr = ''

      if (module.abbr) {
        abbr = module.abbr
      } else {
        abbr = `${module.name[0].toUpperCase()}${module.name[1].toLowerCase()}`
      }

      return (
        <li key={moduleIndex}>
          <ModuleButtonLink
            href={module.slug}
            onClick={onClick}
            aria-label={module.name}
            //target="_blank"
            title={module.description}
          >
            {/* <GearIcon className="mt-1"/> */}

            <div
              className="flex h-6 w-6 shrink-0 flex-row items-center justify-center rounded-full text-sm text-white/95 opacity-75 group-hover:opacity-100 group-focus:opacity-100 trans-opacity"
              style={{
                backgroundColor: module.color ?? 'lightslategray',
              }}
            >
              <span className="font-bold">{abbr[0].toUpperCase()}</span>
              <span>{abbr[1].toLowerCase()}</span>
            </div>

            <p className="text-xs text-center truncate">{module.name}</p>
            {/* <p className="text-xs text-foreground/50 text-center truncate">
                  {module.description}
                </p> */}
          </ModuleButtonLink>
        </li>
      )
    })

  return (
    <ul
      className={cn(
        'p-2 gap-y-2 overflow-y-auto custom-scrollbar flex flex-col',
        className
      )}
    >
      {items}
    </ul>
  )
}

interface IFileMenu extends IElementProps {
  tab?: string
}

export function HeaderMenuPopover({ tab }: IFileMenu) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>
        <Button
          id="header-menu-popover-button"
          variant="trans"
          size="none"
          rounded="none"
          ripple={false}
          selected={open}
          onClick={() => setOpen(!open)}
          className="h-11 w-11"
          aria-label={open ? 'Close Menu' : 'Open Menu'}
        >
          <MenuButtonIcon fill="fill-white/90" />
        </Button>
      </PopoverAnchor>

      <PopoverContent
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={e => {
          // @ts-ignore
          if (e.target?.id !== 'header-menu-popover-button') {
            setOpen(false)
          }
        }}
        align="start"
        alignOffset={8}
        className={cn(GLASS_CLS, 'text-xs flex flex-col ')}
      >
        <HeaderLinks tab={tab} onClick={() => setOpen(false)} />

        <VCenterRow className="px-4 pb-4 gap-x-5 justify-end">
          <ThemeLink href="/about" aria-label="About" className="text-xs">
            About
          </ThemeLink>
          <ThemeLink href="/privacy" aria-label="Privacy" className="text-xs">
            Privacy
          </ThemeLink>
        </VCenterRow>
      </PopoverContent>
    </Popover>
  )
}
