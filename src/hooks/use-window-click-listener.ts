import { useWindowListener } from './use-window-listener'

export function useWindowClickListener(handler: any) {
  useWindowListener('click', handler)
}
