import { useRef, useState, type ReactNode } from 'react'

import { VCenterRow } from '@components/v-center-row'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'

import {
  DropdownMenu,
  DropdownMenuContent,
} from '@components/shadcn/ui/themed/dropdown-menu'

import { Button } from '@components/shadcn/ui/themed/button'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { ROUNDED_CLS, TRANS_COLOR_CLS } from '@theme'
import { ToolbarButton } from './toolbar-button'

const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,
  ROUNDED_CLS,
  //BUTTON_H_CLS,
  'overflow-hidden'
  //[open, "border-border", "border-transparent hover:border-border"],
)

interface IProps extends IElementProps {
  icon: ReactNode
  onMainClick: () => void
  menuClassName?: string
}

export function ToolbarOptionalDropdownButton({
  icon,
  onMainClick,
  tooltip,

  menuClassName,
  children,
  ...props
}: IProps) {
  const [open, setOpen] = useState(false)

  const anchorRef = useRef(null)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <VCenterRow className={CONTAINER_CLS} ref={anchorRef}>
        <DropdownMenuTrigger className="invisible w-0" aria-hidden="true" />
        <ToolbarButton
          onClick={() => onMainClick()}
          //rounded="none"
          selected={open}
          aria-label={props['aria-label']}
          tooltip={tooltip}
          className="rounded-r-none"
        >
          {icon}
        </ToolbarButton>

        <Button
          multiProps="dropdown"
          selected={open}
          ripple={false}
          className="rounded-l-none"
          aria-label="Show dropdown menu"
          onClick={() => setOpen(true)}
        >
          <ChevronRightIcon className="rotate-90 stroke-foreground" />
        </Button>
      </VCenterRow>

      <DropdownMenuContent
        onInteractOutside={() => setOpen(false)}
        onEscapeKeyDown={() => setOpen(false)}
        align="start"
        sideOffset={20}
        className={menuClassName}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
