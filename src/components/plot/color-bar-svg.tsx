import type { IDim } from '@interfaces/dim'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { range } from '@lib/math/range'
import * as d3 from 'd3'
import { YAxis, type ILim } from './axis'

export function addHColorBar({
  domain = [0, 100],
  cmap = BWR_CMAP,
  steps = 15,
  size = { w: 160, h: 16 },
}: {
  domain?: ILim
  ticks?: number[]
  cmap?: ColorMap
  steps?: number
  size?: IDim
} = {}) {
  const xscl = d3
    .scaleLinear()
    .domain(domain) // This is what is written on the Axis: from 0 to 100
    .range([0, size.w])

  const inc = (domain[1] - domain[0]) / steps
  const inc2 = 2 * inc
  let start = domain[0] - inc

  const colorStep = 1 / (steps - 1)
  let colorStart = -colorStep

  return (
    <g>
      <g>
        {range(0, steps).map(step => {
          start += inc
          colorStart += colorStep
          const x1 = xscl(start)
          const x2 = xscl(start + (step < steps - 1 ? inc2 : inc))

          return (
            <rect
              key={step}
              x={x1}
              height={size.h}
              width={x2 - x1}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment

              fill={cmap.get(colorStart)}
              shapeRendering="crispEdges"
            />
          )
        })}

        <rect
          width={size.w}
          height={size.h}
          stroke="black"
          fill="none"
          shapeRendering="crispEdges"
        />
      </g>
      <g transform={`translate(0, ${size.h + 2})`}>
        <line y2={5} stroke="black" shapeRendering="crispEdges" />
        <line
          y2={5}
          transform={`translate(${0.5 * size.w}, 0)`}
          stroke="black"
          shapeRendering="crispEdges"
        />
        <line
          y2={5}
          transform={`translate(${size.w}, 0)`}
          stroke="black"
          shapeRendering="crispEdges"
        />
      </g>
      <g transform={`translate(0, ${size.h + 25})`}>
        <text textAnchor="middle">{domain[0]}</text>
        <text textAnchor="middle" transform={`translate(${0.5 * size.w}, 0)`}>
          0
        </text>
        <text textAnchor="middle" transform={`translate(${size.w}, 0)`}>
          {domain[1]}
        </text>
      </g>
    </g>
  )
}

export function addVColorBar(
  opts: {
    domain?: ILim
    ticks?: number[]
    cmap?: ColorMap
    steps?: number
    size?: IDim
  } = {}
) {
  const { domain, cmap, steps, size, ticks } = {
    domain: [0, 100] as ILim,
    cmap: BWR_CMAP,
    steps: 15,
    size: { w: 160, h: 16 },
    ...opts,
  }

  const xscl = d3
    .scaleLinear()
    .domain(domain) // This is what is written on the Axis: from 0 to 100
    .range([0, size.w])

  const colorStep = 1 / (steps - 1)
  const inc = (domain[1] - domain[0]) / steps
  const inc2 = 2 * inc
  let start = domain[0] - inc
  let colorStart = 1 + colorStep

  let axis = new YAxis().setDomain(domain).setRange([0, size.w]) //.setTicks(ticks)

  if (!ticks) {
    axis = axis.setTicks([domain[0], 0.5 * (domain[0] + domain[1]), domain[1]])
  }

  return (
    <g>
      <g>
        {range(0, steps).map(step => {
          start += inc
          colorStart -= colorStep
          const y1 = xscl(start)
          const y2 = xscl(start + (step < steps - 1 ? inc2 : inc))

          return (
            <rect
              key={step}
              y={y1}
              width={size.h}
              height={y2 - y1}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment

              fill={cmap.get(colorStart)}
              shapeRendering="crispEdges"
            />
          )
        })}

        <rect
          width={size.h}
          height={size.w}
          stroke="black"
          fill="none"
          shapeRendering="crispEdges"
        />
      </g>

      {axis.ticks.map((tick, ti) => {
        const y = axis.domainToRange(tick)

        return (
          <g transform={`translate(${size.h + 2}, ${y})`} key={ti}>
            <line x2={5} stroke="black" shapeRendering="crispEdges" />
            <g transform={`translate(10, 0)`}>
              <text dominantBaseline="central">{tick.toLocaleString()}</text>
            </g>
          </g>
        )
      })}
    </g>
  )
}
