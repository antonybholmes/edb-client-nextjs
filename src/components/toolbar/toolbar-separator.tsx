import { cn } from '@lib/class-names'
import { SMALL_BUTTON_H_CLS } from '@theme'

const CLS = cn(SMALL_BUTTON_H_CLS, 'my-1 border-l border-border')

export function ToolbarSeparator() {
  return <span className={CLS} />
}
