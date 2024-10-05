import { useWindowListener } from "./use-window-listener"

export function useMouseMoveListener(handler: any) {
  useWindowListener("mousemove", handler)
}
