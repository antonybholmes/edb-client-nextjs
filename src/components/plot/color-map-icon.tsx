import { type IElementProps } from '@interfaces/element-props'
import { ColorMap } from '@lib/colormap'
import { range } from '@lib/math/range'
import { useMemo } from 'react'

interface IProps extends IElementProps {
  cmap: ColorMap
  steps?: number
}

export function ColorMapIcon({ cmap, steps = 7, style, className }: IProps) {
  const svg = useMemo(() => {
    const colorSteps = steps - 1

    //const offset = 1 / steps

    return (
      <svg
        viewBox={`0 0 ${steps} ${steps}`}
        className={className}
        style={style}
        preserveAspectRatio="none"
      >
        <g>
          {range(0, steps).map(step => {
            //colorStart += colorStep

            return (
              <rect
                key={step}
                x={step}
                height={steps}
                width={2}
                fill={cmap.get(step / colorSteps)}
                stroke="none"
              />
            )
          })}
        </g>
      </svg>
    )
  }, [cmap, steps])

  return svg
}
