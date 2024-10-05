import { forwardRef, useMemo } from "react"

import { type IElementProps } from "@interfaces/element-props"

import { YAxis } from "@components/plot/axis"
import { AxisLeftSvg } from "@components/plot/axis-svg"
import type { IPos } from "@interfaces/pos"
import { KDE } from "@lib/math/kde"
import { linspace } from "@lib/math/linspace"
import { median } from "@lib/math/median"
import { q25, q75 } from "@lib/math/quartiles"
import { formatPValue } from "@lib/math/stats"
import { truncate } from "@lib/text/text"
import { BoxWhiskerPlotSvg } from "./box-whisker-plot-svg"

import { useGexPlotStore } from "./gex-plot-store"
import { useGexStore } from "./gex-store"
import {
  DEFAULT_GEX_PLOT_DISPLAY_PROPS,
  type GexPlotPropMap,
  type IGexDataset,
  type IGexResultGene,
  type IGexStats,
  type IGexValueType,
} from "./gex-utils"
import { SwarmPlotSvg } from "./swarm-plot-svg"
import { ViolinPlotSvg } from "./violin-plot-svg"

const margin = { top: 100, right: 100, bottom: 200, left: 150 }

const TOOLTIP_OFFSET = 20

export interface ITooltip {
  pos: IPos
  //mutation: IMutation
}

interface IProps extends IElementProps {
  plot: IGexResultGene[]
  //datasets: IGexDataset[]
  datasetMap: Map<number, IGexDataset>
  //displayProps: IGexDisplayProps
  gexValueType?: IGexValueType
  allStats: IGexStats[][]
}

export const GexBoxWhiskerPlotSvg = forwardRef<SVGElement, IProps>(
  function GexBoxWhiskerPlotSvg(
    { plot, datasetMap, gexValueType, allStats }: IProps,
    svgRef,
  ) {
    //const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

    //const tooltipRef = useRef<HTMLDivElement>(null)
    //const highlightRef = useRef<HTMLSpanElement>(null)

    const [displayProps] = useGexStore()
    const { gexPlotSettings } = useGexPlotStore()

    // const displayProps: IGexDisplayProps = {
    //   ...DEFAULT_GEX_DISPLAY_PROPS,
    //   ...displayProps,
    // }

    const svg = useMemo(() => {
      if (plot.length === 0 || datasetMap.size === 0) {
        return null
      }

      const plotDisplayProps: GexPlotPropMap = gexPlotSettings

      //
      // how many rows and cols
      //

      const rows = Math.floor((plot.length - 1) / displayProps.page.cols) + 1
      const cols = Math.min(displayProps.page.cols, plot.length)

      // for all results calculate the max number of significant
      // comparisons. This can be used to work out how much space
      // to allocate to stats whilst keeping the plots aligned
      let globalMaxStatComparisons = 0

      if (displayProps.stats.show && allStats.length > 0) {
        globalMaxStatComparisons = Math.max(
          ...allStats.map(
            stats =>
              stats.filter(stat => stat.p < displayProps.stats.p.cutoff).length,
          ),
        )
      }

      const statsHeight =
        globalMaxStatComparisons * displayProps.stats.line.offset

      //
      // how big is the canvas
      //
      const plotWidth =
        plot[0].datasets.length * displayProps.plot.bar.width +
        (plot[0].datasets.length - 1) * displayProps.plot.gap

      const innerWidth = plotWidth * cols + displayProps.page.gap.x * (cols - 1)
      const innerHeight =
        (displayProps.plot.height + statsHeight) * rows +
        displayProps.page.gap.y * (rows - 1)

      //const innerWidth =
      // result.datasets.length * displayProps.plot.bar.width + (result.datasets.length-1)*displayProps.plot.gap
      //const innerHeight = displayProps.plot.height
      const width = innerWidth + margin.left + margin.right
      const height = innerHeight + margin.top + margin.bottom

      let globalYAxis: YAxis | undefined = undefined

      if (displayProps.axes.y.globalMax) {
        const allValues: number[] = plot
          .map(result =>
            result.datasets
              .map(dataset =>
                dataset.samples.map(sample =>
                  displayProps.tpm.log2Mode
                    ? Math.log2(sample.value + 1)
                    : sample.value,
                ),
              )
              .flat(),
          )
          .flat()

        globalYAxis = new YAxis()
          .autoDomain([
            Math.min(...allValues.flat()),
            Math.max(...allValues.flat()),
          ])
          .setRange([0, displayProps.plot.height])
      }

      return (
        <svg
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          fontFamily="Arial, Helvetica, sans-serif"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ref={svgRef}
          width={width * displayProps.page.scale}
          height={height * displayProps.page.scale}
          viewBox={`0 0 ${width} ${height}`}
          //shapeRendering="crispEdges"
          className="absolute"
        >
          {plot.map((result, ri) => {
            // get the min/max height

            const geneStats: IGexStats[] =
              allStats.length >= ri ? allStats[ri] : []

            const allValues: number[][] = result.datasets.map(dataset =>
              dataset.samples
                .map(sample =>
                  displayProps.tpm.log2Mode
                    ? Math.log2(sample.value + 1)
                    : sample.value,
                )
                .sort(),
            )

            let yax: YAxis

            if (globalYAxis) {
              yax = globalYAxis
            } else {
              yax = new YAxis()
                .autoDomain([
                  Math.min(...allValues.flat()),
                  Math.max(...allValues.flat()),
                ])
                //.setDomain([0, plot.dna.seq.length])
                .setRange([0, displayProps.plot.height])
            }

            const medians: number[] = allValues.map(values => median(values)[0])

            const q1s: number[] = allValues.map(values => q25(values)[0])

            const q3s: number[] = allValues.map(values => q75(values)[0])

            //console.log("medians", medians, q1s, q3s)

            //
            // violin data
            //

            let global_xsmoothed_max = 0

            let ysmoothed = linspace(yax.domain[0], yax.domain[1])

            let xsmoothed = allValues.map(data => {
              const kde = new KDE(data)

              let xs = kde.f(ysmoothed)

              global_xsmoothed_max = Math.max(global_xsmoothed_max, ...xs)

              // zero the ends
              //xsmooth = [xsmooth[0]].concat(xsmooth).concat([xsmooth[xsmooth.length-1]])

              return xs
            })

            let yTitle: string | undefined = undefined

            if (gexValueType) {
              if (gexValueType.name === "TPM") {
                if (displayProps.tpm.log2Mode) {
                  yTitle = "log2(TPM + 1)"
                }
              } else {
                yTitle = gexValueType.name
              }
            }

            const c = ri % displayProps.page.cols
            const r = Math.floor(ri / displayProps.page.cols)

            const transX =
              margin.left + c * (plotWidth + displayProps.page.gap.x)

            const transY =
              margin.top +
              r *
                (displayProps.plot.height +
                  displayProps.page.gap.y +
                  statsHeight) +
              statsHeight

            let xLabelN = -1

            switch (displayProps.axes.x.labels.truncate) {
              case -2:
                // guess a reasonable number of chars to show
                xLabelN = Math.round(displayProps.plot.bar.width / 5)
                break
              case -1:
                // no truncation, (this is reserved by truncation function)
                break
              default:
                // some truncation
                xLabelN = Math.max(0, displayProps.axes.x.labels.truncate)
                break
            }

            return (
              <g transform={`translate(${transX}, ${transY})`} key={ri}>
                <g
                  transform={`translate(${plotWidth / 2}, ${displayProps.title.offset - statsHeight})`}
                >
                  <text textAnchor="middle">{result.gene.geneSymbol}</text>
                </g>
                <g transform={`translate(${displayProps.axes.y.offset}, 0)`}>
                  <AxisLeftSvg ax={yax} title={yTitle} />
                </g>

                {result.datasets.map((resultDataset, di) => {
                  // the default props are needed for instances where the number of
                  // datasets changes, but the props for each plot are still be updated
                  // in which case the default props prevents undefined, though in the
                  // final state the ui will be synchronized so that get(di) will work

                  const plotProps = plotDisplayProps[
                    resultDataset.id.toString()
                  ] ?? { ...DEFAULT_GEX_PLOT_DISPLAY_PROPS }

                  if (!datasetMap.has(resultDataset.id)) {
                    return null
                  }

                  const dataset: IGexDataset = datasetMap.get(resultDataset.id)!

                  return (
                    <g
                      key={di}
                      transform={`translate(${di * (displayProps.plot.bar.width + displayProps.plot.gap)}, 0)`}
                    >
                      {plotProps.violin.show && (
                        <g
                          transform={`translate(${0.5 * displayProps.plot.bar.width}, 0)`}
                        >
                          <ViolinPlotSvg
                            data={allValues[di]}
                            xsmooth={xsmoothed[di]}
                            ysmooth={ysmoothed}
                            xmax={
                              displayProps.violin.globalNorm
                                ? global_xsmoothed_max
                                : undefined
                            }
                            yax={yax}
                            width={displayProps.plot.bar.width}
                            height={displayProps.plot.height}
                            stroke={
                              plotProps.violin.stroke.show
                                ? plotProps.violin.stroke.color
                                : "none"
                            }
                            fill={
                              plotProps.violin.fill.show
                                ? plotProps.violin.fill.color
                                : "none"
                            }
                            fillOpacity={plotProps.violin.fill.opacity}
                          />
                        </g>
                      )}

                      {plotProps.box.show && (
                        <g
                          transform={`translate(${(displayProps.plot.bar.width - plotProps.box.width) / 2}, 0)`}
                        >
                          <BoxWhiskerPlotSvg
                            data={allValues[di]}
                            q1={q1s[di]}
                            median={medians[di]}
                            q3={q3s[di]}
                            yax={yax}
                            width={plotProps.box.width}
                            height={displayProps.plot.height}
                            fill={
                              plotProps.box.fill.show
                                ? plotProps.box.fill.color
                                : "none"
                            }
                            fillOpacity={plotProps.box.fill.opacity}
                            stroke={
                              plotProps.box.stroke.show
                                ? plotProps.box.stroke.color
                                : "none"
                            }
                            strokeWidth={plotProps.box.stroke.width}
                            medianStroke={plotProps.box.median.stroke}
                          />
                        </g>
                      )}

                      {plotProps.swarm.show && (
                        <g
                          transform={`translate(${0.5 * displayProps.plot.bar.width}, 0)`}
                        >
                          <SwarmPlotSvg
                            data={allValues[di]}
                            yax={yax}
                            width={displayProps.plot.bar.width}
                            height={displayProps.plot.height}
                            r={plotProps.swarm.r}
                            fill={
                              plotProps.swarm.fill.show
                                ? plotProps.swarm.fill.color
                                : "none"
                            }
                            fillOpacity={plotProps.swarm.fill.opacity}
                            stroke={
                              plotProps.swarm.stroke.show
                                ? plotProps.swarm.stroke.color
                                : "none"
                            }
                          />
                        </g>
                      )}

                      <g
                        transform={`translate(${0.5 * displayProps.plot.bar.width}, ${displayProps.plot.height + displayProps.plot.gap / 2})`}
                      >
                        {displayProps.axes.x.labels.rotate ? (
                          <text
                            transform="rotate(270)"
                            //text-anchor="middle"
                            dominantBaseline="central"
                            fontSize="smaller"
                            textAnchor="end"
                          >
                            {`${datasetMap.get(resultDataset.id)?.name} (${datasetMap.get(resultDataset.id)?.samples.length})`}
                          </text>
                        ) : (
                          <text textAnchor="middle" fontSize="smaller">
                            <tspan x="0" textAnchor="middle" dy="15">
                              {truncate(dataset.name ?? "", {
                                length: xLabelN,
                              })}
                            </tspan>
                            <tspan x="0" textAnchor="middle" dy="15">
                              ({dataset.samples.length})
                            </tspan>
                          </text>
                        )}
                      </g>
                    </g>
                  )
                })}

                {geneStats && (
                  <>
                    {geneStats
                      .filter(stat => stat.p < displayProps.stats.p.cutoff)
                      .map((stat, si) => {
                        const x1 =
                          displayProps.plot.bar.width / 2 +
                          stat.idx1 *
                            (displayProps.plot.bar.width +
                              displayProps.plot.gap)

                        const x2 =
                          displayProps.plot.bar.width / 2 +
                          stat.idx2 *
                            (displayProps.plot.bar.width +
                              displayProps.plot.gap)

                        const y1 = si * -displayProps.stats.line.offset
                        return (
                          <g key={si}>
                            <line
                              x1={x1}
                              x2={x2}
                              y1={y1}
                              y2={y1}
                              stroke="black"
                            />
                            <line
                              x1={x1}
                              x2={x1}
                              y1={y1}
                              y2={y1 + displayProps.stats.line.tail}
                              stroke="black"
                            />
                            <line
                              x1={x2}
                              x2={x2}
                              y1={y1}
                              y2={y1 + displayProps.stats.line.tail}
                              stroke="black"
                            />
                            <text
                              x={(x1 + x2) / 2}
                              y={y1 + displayProps.stats.line.tail - 1}
                              textAnchor="middle"
                              fontSize="smaller"
                            >
                              {formatPValue(stat.p)}
                            </text>
                          </g>
                        )
                      })}
                  </>
                )}
              </g>
            )
          })}
        </svg>
      )
    }, [plot, datasetMap, displayProps, gexPlotSettings, allStats])

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
