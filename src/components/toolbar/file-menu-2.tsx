import { type IElementProps } from "@interfaces/element-props"
import { cn } from "@lib/class-names"

import { type IOpenChange } from "@interfaces/open-change"

import { CookieIcon } from "@components/icons/cookie-icon"
import { HelpIcon } from "@components/icons/help-icon"
import { InfoIcon } from "@components/icons/info-icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
} from "@components/shadcn/ui/themed/dropdown-menu"
import type { IModuleInfo } from "@interfaces/module-info"
import type { ITab } from "./toolbar"
import { ToolbarTabButton } from "./toolbar-tab-button"

export const SIDE_OVERLAY_CLS = cn(
  "fixed inset-0 z-overlay bg-overlay/30 backdrop-blur-sm duration-500 ease-in-out",
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
)

interface IFileMenu extends IElementProps, IOpenChange {
  tabs?: ITab[]
  info?: IModuleInfo
}

export function FileMenu({ open = false, onOpenChange, tabs = [] }: IFileMenu) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <ToolbarTabButton
          aria-label="Open File Menu"
          className="text-xs"
          size="sm"
          role="button"
          selected={open}
          onClick={() => onOpenChange?.(true)}
        >
          File
        </ToolbarTabButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onEscapeKeyDown={() => onOpenChange?.(false)}
        onInteractOutside={() => onOpenChange?.(false)}
        align="start"
        className="w-full"
      >
        {tabs.map((tab, ti) => {
          if (tab.name === "<divider>") {
            return <MenuSeparator key={ti} />
          }

          return (
            <DropdownMenuSub key={ti}>
              <DropdownMenuSubTrigger>
                {tab.icon && tab.icon}
                <span>{tab.name}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {tab.content && tab.content}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )
        })}

        <MenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <InfoIcon fill="none" />
            <span>Info</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => {
                  window.open("/privacy", "_blank")
                }}
                aria-label="Privacy"
              >
                <CookieIcon fill="" />
                <span>Privacy and cookies</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open("/about", "_blank")
                }}
                aria-label="About"
              >
                <HelpIcon fill="" />
                <span>About</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
