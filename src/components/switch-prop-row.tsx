import { forwardRef, type ForwardedRef } from "react"

import { cn } from "@lib/class-names"
import { H2_CLS } from "@theme"
import { BaseRow } from "./base-row"
import type { ICheckboxProps } from "./shadcn/ui/themed/check-box"
import { Label } from "./shadcn/ui/themed/label"
import { Switch } from "./shadcn/ui/themed/switch"
import { VCenterRow } from "./v-center-row"

export const PROPS_TITLE_CLS = cn(H2_CLS, "py-2")

export const SwitchPropRow = forwardRef(function SwitchPropRow(
  {
    title,
    labelClassName,
    checked,
    onCheckedChange,
    disabled,
    className,
    children,
  }: ICheckboxProps & { title: string; labelClassName?: string },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <BaseRow className="gap-x-2 justify-between items-start" ref={ref}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      >
        <Label className={labelClassName}>{title}</Label>
      </Switch>

      <VCenterRow className={cn("gap-x-2", className)}>{children}</VCenterRow>
    </BaseRow>
  )
})
