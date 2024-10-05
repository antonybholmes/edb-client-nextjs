import { useWindowListener } from "./use-window-listener"

export function useWindowScrollListener(handler: any) {
  useWindowListener("scroll", handler)
}
