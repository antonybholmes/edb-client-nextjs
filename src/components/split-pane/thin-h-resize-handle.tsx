import { useState } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

const CLS =
  'group px-2 flex shrink-0 grow-0 cursor-ew-resize flex-col items-center justify-center outline-none'

export function ThinHResizeHandle({
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
      <span className="h-full w-px group-hover:bg-ring trans-color" />
    </PanelResizeHandle>
  )
}
