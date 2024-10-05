import { forwardRef, useMemo } from "react"

import { type IElementProps } from "@interfaces/element-props"

import { Axis, YAxis } from "@components/plot/axis"

interface IProps extends IElementProps {
  data: number[]
  q1: number
  median: number
  q3: number
  yax?: Axis
  width?: number
  height?: number
  stroke?: string
  medianStroke?: string
  fill?: string
  fillOpacity?: number
  strokeWidth?: number
}

export const BoxWhiskerPlotSvg = forwardRef<SVGElement, IProps>(
  function BoxWhiskerPlotSvg(
    {
      data,
      q1,
      median,
      q3,
      yax,
      width = 50,
      height = 500,
      stroke = "black",
      strokeWidth = 1.5,
      medianStroke = "red",
      fill = "none",
      fillOpacity = 1,
    }: IProps,
    svgRef,
  ) {
    const svg = useMemo(() => {
      const iqr = q3 - q1
      const iqr15 = 1.5 * iqr
      const q0 = q1 - iqr15
      const q4 = q3 + iqr15

      const w1 = data.filter(x => x >= q0)[0]
      // reverse copy of array
      const w2 = data.toReversed().filter(x => x <= q4)[0]

      //console.log(maxHeightMap)

      if (!yax) {
        yax = new YAxis()
          .autoDomain([0, Math.max(...data)])
          //.setDomain([0, plot.dna.seq.length])
          .setRange([0, height])
      }

      const xHalf = 0.5 * width

      const y1 = yax.domainToRange(w1)
      const y2 = yax.domainToRange(w2)

      //console.log("med", q1, median, q3, w1, w2)
      // console.log("med", y1, y2)

      const yq1 = yax.domainToRange(q1)
      const yq3 = yax.domainToRange(q3)
      const ymed = yax.domainToRange(median)
      // matching is case insensitive

      return (
        <>
          <line
            x1={xHalf}
            x2={xHalf}
            y1={y1}
            y2={y2}
            strokeWidth={strokeWidth}
            stroke={stroke}
          />
          <line
            x1={0}
            x2={width}
            y1={y1}
            y2={y1}
            strokeWidth={strokeWidth}
            stroke={stroke}
          />
          <line
            x1={0}
            x2={width}
            y1={y2}
            y2={y2}
            strokeWidth={strokeWidth}
            stroke={stroke}
          />

          {/* iqr */}
          <rect
            x={0}
            y={yq3}
            height={yq1 - yq3}
            width={width}
            strokeWidth={strokeWidth}
            stroke={stroke}
            fill={fill}
            fillOpacity={fillOpacity}
          />

          {/* median */}
          <line
            x1={0}
            x2={width}
            y1={ymed}
            y2={ymed}
            strokeWidth={strokeWidth}
            stroke={medianStroke}
          />
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
