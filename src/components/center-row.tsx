import { forwardRef, type ForwardedRef } from 'react'

import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { CENTERED_ROW_CLS } from '@theme'

export const CenterRow = forwardRef(function CenterRow(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} className={cn(CENTERED_ROW_CLS, className)} {...props}>
      {children}
    </div>
  )
})
