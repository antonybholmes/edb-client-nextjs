import { forwardRef, type ForwardedRef } from "react"

import type { IDivProps } from "@interfaces/div-props"
import { cn } from "@lib/class-names"
import { H2_CLS } from "@theme"
import { BaseRow } from "./base-row"
import { Label } from "./shadcn/ui/themed/label"
import { VCenterRow } from "./v-center-row"

export const PROPS_TITLE_CLS = cn(H2_CLS, "py-2")

export const PropRow = forwardRef(function PropRow(
  {
    title,
    labelCls = "w-16",
    justify = "justify-between",
    items = "items-center",
    className,
    children,
    ...props
  }: IDivProps & {
    title: string
    justify?: string
    items?: string
    labelCls?: string
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <BaseRow className={cn("gap-x-2 ", justify, items)} ref={ref}>
      <Label className={labelCls}>{title}</Label>

      <VCenterRow className="gap-x-2">{children}</VCenterRow>
    </BaseRow>
  )
})
