import { type HTMLAttributes, type PropsWithoutRef } from "react"

export interface IDivProps
  extends PropsWithoutRef<HTMLAttributes<HTMLDivElement>> {
  title?: string
  selected?: boolean
}
