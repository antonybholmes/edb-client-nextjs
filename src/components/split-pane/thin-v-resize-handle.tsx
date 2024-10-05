import { cn } from '@lib/class-names'
import { TRANS_COLOR_CLS } from '@theme'
import { useState } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

const CLS =
  'group py-1 flex shrink-0 grow-0 cursor-ns-resize flex-row items-center justify-center gap-y-1 outline-none'

export function ThinVResizeHandle({
  id,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle>) {
  const [drag, setDrag] = useState(false)

  return (
    <PanelResizeHandle
      id={id}
      className={CLS}
      onDragging={drag => {
        setDrag(drag)
      }}
      {...props}
    >
      <span
        className={cn(TRANS_COLOR_CLS, 'w-full h-2px', [
          drag,
          'bg-ring',
          'group-hover:bg-ring',
        ])}
      />
    </PanelResizeHandle>
  )
}
