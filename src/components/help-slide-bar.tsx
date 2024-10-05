import { forwardRef, useState, type ForwardedRef } from "react"

import type { IDivProps } from "@interfaces/div-props"
import { SlideBar, SlideBarContent } from "./slide-bar"

interface IProps extends IDivProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  helpUrl: string
  position?: number
  limits?: [number, number]
}

export const HelpSlideBar = forwardRef(function HelpSlideBar(
  {
    open,
    onOpenChange,
    helpUrl,
    position = 80,
    limits = [5, 85],
    className,
    children,
    ...props
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [isOpen, setIsOpen] = useState(true)

  //const _value = value ?? tabs[0].name // getTabValue(value, tabs)

  function _onOpenChange(state: boolean) {
    setIsOpen(state)
    onOpenChange?.(state)
  }

  const _open = open !== undefined ? open : isOpen

  return (
    <SlideBar
      open={_open}
      onOpenChange={_onOpenChange}
      side="right"
      position={position}
      limits={limits}
      //className={className}
      title="Help"
      mainContent={children}
      sideContent={
        <iframe
          src={helpUrl}
          className="min-w-0 grow overflow-x-hidden overflow-y-auto mt-4 custom-scrollbar"
        />
      }
    >
      <SlideBarContent className={className} />
    </SlideBar>
  )
})
