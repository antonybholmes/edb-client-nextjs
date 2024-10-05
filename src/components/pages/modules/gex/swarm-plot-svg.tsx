import { forwardRef, useMemo } from "react"

import { type IElementProps } from "@interfaces/element-props"

import { Axis, YAxis } from "@components/plot/axis"
import { histogram } from "@lib/math/histogram"
import { range } from "@lib/math/range"

interface IProps extends IElementProps {
  data: number[]

  yax?: Axis
  width?: number
  height?: number
  r?: number
  fill?: string
  stroke?: string
  fillOpacity?: number
}

export const SwarmPlotSvg = forwardRef<SVGElement, IProps>(
  function SwarmPlotSvg(
    {
      data,
      yax,
      width = 50,
      height = 500,
      r = 5,
      fill = "black",
      stroke = "none",
      fillOpacity = 1,
    }: IProps,
    svgRef,
  ) {
    const svg = useMemo(() => {
      const hist = histogram(data)

      const d = r * 2

      //console.log(maxHeightMap)

      if (!yax) {
        yax = new YAxis()
          .autoDomain([0, Math.max(...data)])
          //.setDomain([0, plot.dna.seq.length])
          .setRange([0, height])
      }

      // matching is case insensitive

      return (
        <>
          {hist
            .filter(bin => bin.values.length > 0)
            .map((bin, bi) => {
              // width required for all circles in bin
              let w = bin.values.length * d

              //actual amount we need to move each circle
              const dx = d * (width / Math.max(width, w))

              w = dx * (bin.values.length - 1)

              let x1 = -(0.5 * w) //(width - w)

              // reverse sort as we want higher y on the outside
              let values = bin.values.toReversed()

              values = range(0, values.length, 2)
                .map(i => values[i])
                .concat(
                  range(1, values.length, 2)
                    .map(i => values[i])
                    .toReversed(),
                )

              return (
                <g key={bi}>
                  {values.map((v, vi) => {
                    return (
                      <circle
                        key={`${bi}:${vi}`}
                        cx={x1 + vi * dx}
                        cy={yax?.domainToRange(v)}
                        r={r}
                        fill={fill}
                        stroke={stroke}
                        fillOpacity={fillOpacity}
                      />
                    )
                  })}
                </g>
              )
            })}
        </>
      )
    }, [data, yax])

    return (
      <>
        {svg}

        {/* {toolTipInfo && (
          <>
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-50 rounded-md bg-black/60 p-3 text-xs text-white opacity-100"
              style={{
                left: toolTipInfo.pos.x + TOOLTIP_OFFSET,
                top: toolTipInfo.pos.y + TOOLTIP_OFFSET,
              }}
            >
              <p className="font-semibold">
                {`${sampleMap.get(toolTipInfo.mutation.sample)!.name} (${sampleMap.get(toolTipInfo.mutation.sample)!.coo}, ${sampleMap.get(toolTipInfo.mutation.sample)!.lymphgen})`}
              </p>
              <p>Type: {toolTipInfo.mutation.type.split(":")[1]}</p>
              <p>
                {`Loc: ${toolTipInfo.mutation.chr}:${toolTipInfo.mutation.start.toLocaleString()}-${toolTipInfo.mutation.end.toLocaleString()}`}
              </p>
              <p>
                {`ref: ${toolTipInfo.mutation.ref}, tumor: ${toolTipInfo.mutation.tum.replace("^", "")}`}
              </p>
            </div>

            <span
              ref={highlightRef}
              className="pointer-events-none absolute z-40 border-black"
              style={{
                top: `${toolTipInfo.pos.y - 1}px`,
                left: `${toolTipInfo.pos.x - 1}px`,
                width: `${BASE_W + 1}px`,
                height: `${BASE_H + 1}px`,
                borderWidth: `1px`,
              }}
            />
          </>
        )} */}
      </>
    )
  },
)
