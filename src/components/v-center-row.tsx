import { forwardRef, type ForwardedRef } from 'react'

import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { V_CENTERED_ROW_CLS } from '@theme'

export const VCenterRow = forwardRef(function VCenterRow(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} className={cn(V_CENTERED_ROW_CLS, className)} {...props}>
      {children}
    </div>
  )
})
