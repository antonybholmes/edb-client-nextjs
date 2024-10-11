import { cn } from '@lib/class-names'
import { ComponentProps, useState } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

const CLS =
  'group flex shrink-0 grow-0 cursor-ns-resize flex-row items-center justify-center outline-none'

export function ThinVResizeHandle({
  id,
  h="py-4",
  lineClassName,
  className,
  ...props
}: ComponentProps<typeof PanelResizeHandle> & { h?:string, lineClassName?: string }) {
  const [drag, setDrag] = useState(false)

  return (
    <PanelResizeHandle
      id={id}
      className={cn(CLS, h, className)}
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
