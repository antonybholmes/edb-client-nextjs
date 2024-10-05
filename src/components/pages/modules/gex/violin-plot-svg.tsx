import { forwardRef, useMemo } from "react"

import { type IElementProps } from "@interfaces/element-props"

import { Axis, YAxis } from "@components/plot/axis"
import { KDE } from "@lib/math/kde"
import { linspace } from "@lib/math/linspace"
import { zip } from "@lib/utils"

interface IProps extends IElementProps {
  data: number[]
  xsmooth?: number[]
  ysmooth?: number[]
  xmax?: number
  yax?: Axis
  width?: number
  height?: number
  r?: number
  fill?: string
  stroke?: string
  fillOpacity?: number
}

export const ViolinPlotSvg = forwardRef<SVGElement, IProps>(
  function ViolinPlotSvg(
    {
      data,
      xsmooth,
      ysmooth,
      xmax,
      yax,
      width = 50,
      height = 500,
      fill = "none",
      stroke = "black",
      fillOpacity = 0.5,
      r = 5,
    }: IProps,
    svgRef,
  ) {
    const svg = useMemo(() => {
      // duplicate to mirror violin

      if (!yax) {
        yax = new YAxis()
          .autoDomain([0, Math.max(...data)])
          //.setDomain([0, plot.dna.seq.length])
          .setRange([0, height])
      }

      if (!xsmooth) {
        //let global_xsmooth_max = 0

        ysmooth = linspace(yax.domain[0], yax.domain[1])

        const kde = new KDE(data)

        xsmooth = kde.f(ysmooth)
      }

      if (!xmax) {
        xmax = Math.max(...xsmooth)
      }

      // normalize
      xsmooth = xsmooth.map(x => x / xmax!)

      xsmooth = xsmooth.concat(xsmooth.map(x => -x).toReversed())
      ysmooth = ysmooth!.concat(ysmooth!.toReversed())

      const points: string = zip(xsmooth, ysmooth)
        .map(p => `${0.5 * (p[0] * width)},${yax?.domainToRange(p[1])!}`)
        .join(" ")

      //console.log(points)

      // matching is case insensitive

      return (
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          fillOpacity={fillOpacity}
        />
      )
    }, [data, xsmooth, ysmooth, yax])

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
