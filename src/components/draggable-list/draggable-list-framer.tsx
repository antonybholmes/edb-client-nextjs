import type { IElementProps } from "@interfaces/element-props"
import { cn } from "@lib/class-names"
import {
  animate,
  MotionValue,
  Reorder,
  useDragControls,
  useMotionValue,
} from "framer-motion"
import { Children, useEffect, type CSSProperties } from "react"

interface IProps extends IElementProps {
  order: number[]

  onOrderChange?: (order: number[]) => void
  h?: number
  itemClassName?: string
  itemStyle?: CSSProperties
}

export function DraggableListFramer({
  order,
  onOrderChange,
  h = 50,
  itemClassName,
  className,
  children,
}: IProps) {
  const items = Children.toArray(children)

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={order => {
        onOrderChange?.(order)
      }}
      className={className}
    >
      {order.map(i => (
        <Reorder.Item
          key={i}
          value={i}
          className={cn("overflow-hidden", itemClassName)}
        >
          {items[i]}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}

const INACTIVE_SHADOW = "0px 0px 0px rgba(0,0,0,0.8)"

export function useRaisedShadow(value: MotionValue<number>) {
  const boxShadow = useMotionValue(INACTIVE_SHADOW)

  useEffect(() => {
    let isActive = false
    value.onChange(latest => {
      const wasActive = isActive
      if (latest !== 0) {
        isActive = true
        if (isActive !== wasActive) {
          animate(boxShadow, "5px 5px 10px rgba(0,0,0,0.3)")
        }
      } else {
        isActive = false
        if (isActive !== wasActive) {
          animate(boxShadow, INACTIVE_SHADOW)
        }
      }
    })
  }, [value, boxShadow])

  return boxShadow
}

interface IDraggableListItemProps extends IElementProps {
  item: string | number
}

export const DraggableListItem = ({
  item,
  children,
}: IDraggableListItemProps) => {
  //const y = useMotionValue(0);
  //const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={item}
      key={item}
      //style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
      className="flex flex-row gap-x-1"
    >
      {children}
      {/* <GripVerticalIcon dragControls={dragControls} /> */}

      <div
        className="reorder-handle"
        onPointerDown={e => dragControls.start(e)}
      >
        d
      </div>
    </Reorder.Item>
  )
}
