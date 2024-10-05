import { VCenterRow } from '@components/v-center-row'
import { cn } from '@lib/class-names'
import { TRANS_COLOR_CLS } from '@theme'
import { useState } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'
import { RESIZE_DOT_CLS, RESIZE_DRAG_CLS } from './h-resize-handle'

const CLS = cn(
  TRANS_COLOR_CLS,
  'group m-1 flex shrink-0 grow-0 cursor-ns-resize flex-row items-center justify-center gap-x-1 rounded-full outline-none'
)

export function VResizeHandle({
  id = `hitbox-v`,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle>) {
  const [drag, setDrag] = useState(false)
  const resizeDotCls = cn(RESIZE_DOT_CLS, [drag, 'opacity-100'])

  return (
    <PanelResizeHandle
      id={id}
      className={cn(CLS, [drag, 'bg-accent/50', RESIZE_DRAG_CLS])}
      onDragging={drag => {
        setDrag(drag)
      }}
      {...props}
    >
      <VCenterRow
        className={cn(
          TRANS_COLOR_CLS,
          'gap-x-1 rounded-full px-2 py-0.5 group-hover:bg-accent/50'
        )}
      >
        <div className={resizeDotCls} />
        <div className={resizeDotCls} />
        <div className={resizeDotCls} />
      </VCenterRow>
    </PanelResizeHandle>
  )
}
