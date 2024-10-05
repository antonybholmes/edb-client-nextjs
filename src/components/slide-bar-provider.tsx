import type { IElementProps } from "@interfaces/element-props"
import { createContext, useState, type ReactNode } from "react"

export interface ISlidebarContext {
  title?: string
  side?: "left" | "right"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  position: number
  limits: [number, number]
  mainContent?: ReactNode
  sideContent?: ReactNode
}

export const DEFAULT_SLIDEBAR_CONTEXT: ISlidebarContext = {
  position: 80,
  limits: [10, 90],
}

export const SlidebarContext = createContext<ISlidebarContext>(
  DEFAULT_SLIDEBAR_CONTEXT,
)

interface IProps extends ISlidebarContext, IElementProps {}

export function SlidebarProvider({
  title,
  side = "left",
  open = true,
  onOpenChange,
  position = 80,
  limits = [5, 85],
  mainContent,
  sideContent,
  children,
}: IProps) {
  const [_open, setOpen] = useState(false)

  function _onOpenChange(state: boolean) {
    setOpen(state)

    onOpenChange?.(state)
  }

  const o = open !== undefined ? open : _open

  return (
    <SlidebarContext.Provider
      value={{
        title,
        side,
        open: o,
        onOpenChange: _onOpenChange,
        position,
        limits,
        mainContent,
        sideContent,
      }}
    >
      {children}
    </SlidebarContext.Provider>
  )
}
