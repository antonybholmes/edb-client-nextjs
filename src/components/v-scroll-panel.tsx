import { forwardRef, type ForwardedRef, type ReactNode } from 'react'

import { BaseCol } from '@components/base-col'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'

export const V_SCROLL_CHILD_CLS = 'absolute w-full'

export const VScrollPanel = forwardRef(function VScrollPanel(
  {
    asChild,
    innerClassName,
    className,
    children,
    ...props
  }: IDivProps & { asChild?: boolean; innerClassName?: string },
  ref: ForwardedRef<HTMLDivElement>
) {
  let ret: ReactNode = children

  if (!asChild) {
    ret = (
      <BaseCol className={cn(V_SCROLL_CHILD_CLS, innerClassName)}>
        {ret}
      </BaseCol>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0 min-h-0 w-full h-full grow',
        className
      )}
      {...props}
    >
      {ret}
    </div>
  )
})
