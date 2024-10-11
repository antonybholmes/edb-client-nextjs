import { forwardRef, type ForwardedRef } from 'react'

import { BaseCol } from '@components/base-col'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { H2_CLS } from '@theme'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

export const PropsPanel = forwardRef(function PropsPanel(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseCol
      ref={ref}
      className={cn('min-h-0 overflow-hidden text-xs  grow ', className)}
      {...props}
    >
      {children}
    </BaseCol>
  )
})
