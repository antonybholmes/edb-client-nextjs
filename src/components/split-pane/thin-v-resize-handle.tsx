import { cn } from '@lib/class-names'
import { ComponentProps, useState } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

const CLS =
  'group py-1 flex shrink-0 grow-0 cursor-ns-resize flex-row items-center justify-center gap-y-1 outline-none'

export function ThinVResizeHandle({
  id,
  lineClassName,
  ...props
}: ComponentProps<typeof PanelResizeHandle> & { lineClassName?: string }) {
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
        className={cn(
          'trans-color w-full h-px',
          [drag, 'bg-ring', 'group-hover:bg-ring'],
          lineClassName
        )}
      />
    </PanelResizeHandle>
  )
}
