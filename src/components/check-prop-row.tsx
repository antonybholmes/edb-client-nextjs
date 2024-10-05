import { forwardRef, type ForwardedRef } from 'react'

import { cn } from '@lib/class-names'
import { H2_CLS } from '@theme'
import { Checkbox, type ICheckboxProps } from './shadcn/ui/themed/check-box'
import { Label } from './shadcn/ui/themed/label'

import { BaseRow } from './base-row'
import { VCenterRow } from './v-center-row'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

export const CheckPropRow = forwardRef(function CheckPropRow(
  {
    title,
    labelClassName,
    checked,
    onCheckedChange,
    disabled,
    className,
    children,
  }: ICheckboxProps & { title: string; labelClassName?: string },
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseRow className="gap-x-2 justify-between items-start" ref={ref}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-enabled={!disabled}
      >
        <Label className={labelClassName}>{title}</Label>
      </Checkbox>

      <VCenterRow className={cn('gap-x-2', className)}>{children}</VCenterRow>
    </BaseRow>
  )
})
