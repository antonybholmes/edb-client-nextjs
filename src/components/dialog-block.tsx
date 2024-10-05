import { BaseCol } from '@components/base-col'
import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { H3_CLS } from '@theme'

interface IProps extends IElementProps {
  title?: string
  gap?: string
}

export function DialogBlock({ title, gap = 'gap-y-2', children }: IProps) {
  return (
    <BaseCol className="gap-y-2 rounded-lg border border-border/25 bg-background/75 p-2">
      {title && <h3 className={H3_CLS}>{title}</h3>}

      <BaseCol className={cn(gap, 'flex flex-col gap-y-1')}>{children}</BaseCol>
    </BaseCol>
  )
}
