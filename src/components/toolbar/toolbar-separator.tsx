import { cn } from '@lib/class-names'
import { SM_BUTTON_H_CLS } from '@theme'

const CLS = cn(SM_BUTTON_H_CLS, 'my-1 border-l border-border-dark')

export function ToolbarSeparator() {
  return <span className={CLS} />
}
