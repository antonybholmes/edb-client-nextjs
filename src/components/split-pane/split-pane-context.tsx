import { createContext } from "react"

export const SplitPaneContext = createContext<{
  clientHeight: number | null
  setClientHeight: (v: number) => void
  clientWidth: number | null
  setClientWidth: (v: number) => void
  onMouseHoldDown: (e: MouseEvent | React.MouseEvent) => void
}>({
  clientHeight: 0,
  setClientHeight: (v: number) => {},
  clientWidth: 0,
  setClientWidth: (v: number) => {},
  onMouseHoldDown: (e: MouseEvent | React.MouseEvent) => {},
})
