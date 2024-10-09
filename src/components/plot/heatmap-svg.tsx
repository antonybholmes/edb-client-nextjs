import { type IFieldMap } from '@interfaces/field-map'
import { cellStr } from '@lib/dataframe/cell'

import type { ILim } from '@components/plot/axis'
import { type ICell } from '@interfaces/cell'
import { type IElementProps } from '@interfaces/element-props'
import { type IPos } from '@interfaces/pos'
import { getColIdxFromGroup, type IClusterGroup } from '@lib/cluster-group'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { MAIN_CLUSTER_FRAME, type ClusterFrame } from '@lib/math/hcluster'

import { IDim } from '@interfaces/dim'
import { range } from '@lib/math/range'
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { addHColorBar, addVColorBar } from './color-bar-svg'

export interface IBlock {
  w: number
  h: number
}

const BLOCK_SIZE: IBlock = { w: 30, h: 30 }

const MIN_INNER_HEIGHT: number = 200

export type ColorBarPos = 'Bottom' | 'Right' | 'Off'
export type LRPos = 'Left' | 'Right' | 'Off'
export type TBPos = 'Top' | 'Bottom' | 'Off'
export type LegendPos = 'Upper Right' | 'Off'

export interface IHeatMapProps {
  margin: { top: number; right: number; bottom: number; left: number }
  blockSize: IBlock
  grid: {
    show: boolean
    color: string
  }
  border: {
    show: boolean
    color: string
  }
  style: 'square' | 'dot'
  range: [number, number]
  rowLabels: { position: LRPos; width: number; isColored: boolean }
  colLabels: { position: TBPos; width: number; isColored: boolean }
  colorbar: {
    barSize: IDim
    width: number
    position: ColorBarPos
  }
  rowTree: {
    position: LRPos
    width: number
  }
  colTree: {
    position: TBPos
    width: number
  }
  legend: { position: LegendPos; width: number }
  dotLegend: {
    sizes: number[]
    lim: ILim
    type: string
  }
  groups: {
    show: boolean
    height: number
  }
  padding: number
  scale: number
  cmap: ColorMap
}

export const DEFAULT_HEATMAP_PROPS: IHeatMapProps = {
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  blockSize: BLOCK_SIZE,
  grid: { show: true, color: '#eeeeee' },
  border: { show: true, color: '#000000' },
  range: [-3, 3],
  style: 'square',
  rowLabels: { position: 'Right', width: 100, isColored: false },
  colLabels: { position: 'Top', width: 200, isColored: true },
  colorbar: { position: 'Right', barSize: { w: 160, h: 16 }, width: 100 },
  groups: { show: true, height: 0.5 * BLOCK_SIZE.h },
  legend: { position: 'Upper Right', width: 200 },
  dotLegend: {
    sizes: [25, 50, 75, 100],
    lim: [0, 100],
    type: '%',
  },
  rowTree: { width: 100, position: 'Left' },
  colTree: { width: 100, position: 'Top' },
  padding: 10,
  scale: 1,
  cmap: BWR_CMAP,
}

export interface ITooltip {
  pos: IPos
  cell: ICell
}

interface IProps extends IElementProps {
  cf: ClusterFrame
  groups?: IClusterGroup[]
  maxRows?: number
  maxCols?: number
  displayProps?: IFieldMap
}

export const HeatMapSvg = forwardRef<SVGElement, IProps>(function HeatMapSvg(
  { cf, groups = [], displayProps = {} }: IProps,
  ref
) {
  const _displayProps: IHeatMapProps = {
    ...DEFAULT_HEATMAP_PROPS,
    ...displayProps,
  }

  const blockSize = _displayProps.blockSize
  const halfBlockSize: IBlock = { w: 0.5 * blockSize.w, h: 0.5 * blockSize.h }
  const scaledBlockSize = {
    w: blockSize.w * _displayProps.scale,
    h: blockSize.h * _displayProps.scale,
  }

  const innerRef = useRef<SVGElement>(null)
  useImperativeHandle(ref, () => innerRef.current!, [])

  const tooltipRef = useRef<HTMLDivElement>(null)
  //const canvasRef = useRef(null)
  //const downloadRef = useRef<HTMLAnchorElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  //const [highlightCol, setHighlightCol] = useState(NO_SELECTION)
  //const [highlightRow, setHighlightRow] = useState(-1)

  let marginLeft =
    _displayProps.margin.left +
    (cf.rowTree && _displayProps.rowTree.position === 'Left'
      ? _displayProps.rowTree.width + _displayProps.padding
      : 0) +
    (_displayProps.rowLabels.position === 'Left'
      ? _displayProps.rowLabels.width + _displayProps.padding
      : 0)

  const marginRight =
    (_displayProps.rowLabels.position === 'Right'
      ? _displayProps.rowLabels.width + _displayProps.padding
      : 0) +
    (_displayProps.colorbar.position === 'Right'
      ? _displayProps.colorbar.width + _displayProps.padding
      : 0) +
    (cf.rowTree && _displayProps.rowTree.position === 'Right'
      ? _displayProps.rowTree.width + _displayProps.padding
      : 0) +
    (_displayProps.legend.position?.includes('Right')
      ? _displayProps.legend.width + _displayProps.padding
      : 0)

  const marginTop =
    _displayProps.margin.top +
    (cf.colTree && _displayProps.colTree.position === 'Top'
      ? _displayProps.colTree.width + _displayProps.padding
      : 0) +
    (_displayProps.colLabels.position === 'Top'
      ? _displayProps.colLabels.width + _displayProps.padding
      : 0) +
    (_displayProps.groups.show && groups.length > 0
      ? _displayProps.groups.height + _displayProps.padding
      : 0)

  const marginBottom =
    _displayProps.padding +
    (_displayProps.colLabels.position === 'Bottom'
      ? _displayProps.colLabels.width + _displayProps.padding
      : 0) +
    (_displayProps.colorbar.position === 'Bottom'
      ? _displayProps.colorbar.width + _displayProps.padding
      : 0)

  const innerWidth = cf.dataframes[MAIN_CLUSTER_FRAME].shape[1] * blockSize.w
  const innerHeight = cf.dataframes[MAIN_CLUSTER_FRAME].shape[0] * blockSize.h
  const width = innerWidth + marginLeft + marginRight
  const height =
    Math.max(MIN_INNER_HEIGHT, innerHeight) + marginTop + marginBottom

  const dfMain = cf.dataframes[MAIN_CLUSTER_FRAME]
  const dfPercent = cf.dataframes['percent']

  // const NO_TOOLTIP = {
  //   pos: {...ZERO_POS},
  //   cell: {...NO_CELL},
  //   visible: false,
  // }

  function bound(x: number) {
    const r = _displayProps.range[1] - _displayProps.range[0]

    return (
      (Math.max(_displayProps.range[0], Math.min(_displayProps.range[1], x)) -
        _displayProps.range[0]) /
      r
    )
  }

  const svg = useMemo(() => {
    if (!cf) {
      return null
    }

    // const colorMap = d3
    //   .scaleLinear()
    //   .domain([_displayProps.range[0], 0, _displayProps.range[1]])
    //   // @ts-ignore
    //   .range(["blue", "white", "red"])

    const s = dfMain.shape

    const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(0, s[0])
    const colLeaves = cf.colTree ? cf.colTree.leaves : range(0, s[1])

    const colColorMap = Object.fromEntries(
      groups
        .map(group =>
          getColIdxFromGroup(dfMain, group).map(c => [c, group.color])
        )
        .flat()
    )

    const legendBlockSize = Math.min(
      _displayProps.blockSize.w,
      _displayProps.blockSize.h
    )

    let legendPos = [0, 0]

    if (_displayProps.legend.position === 'Upper Right') {
      legendPos = [
        marginLeft +
          innerWidth +
          _displayProps.padding +
          (_displayProps.rowLabels.position === 'Right'
            ? _displayProps.rowLabels.width
            : 0) +
          (cf.rowTree && _displayProps.rowTree.position === 'Right'
            ? _displayProps.rowTree.width + _displayProps.padding
            : 0) +
          (_displayProps.colorbar.position === 'Right'
            ? _displayProps.colorbar.width
            : 0),
        marginTop,
      ]
    }

    let dotLegendPos = [0, 0]

    if (_displayProps.legend.position === 'Upper Right') {
      dotLegendPos = [
        legendPos[0],
        marginTop +
          (_displayProps.groups.show
            ? (legendBlockSize + _displayProps.padding) * (groups.length + 1)
            : 0),
      ]
    }

    return (
      <svg
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={innerRef}
        width={width * _displayProps.scale}
        height={height * _displayProps.scale}
        viewBox={`0 0 ${width} ${height}`}
        //shapeRendering="crispEdges"
        onMouseMove={onMouseMove}
        className="absolute"
      >
        {cf.colTree && _displayProps.colTree.position === 'Top' && (
          <g transform={`translate(${marginLeft}, ${_displayProps.padding})`}>
            {cf.colTree.coords.map((coords, ri) =>
              range(0, 3).map(i => {
                return (
                  <line
                    key={ri * 3 + i}
                    x1={coords[i][0] * innerWidth}
                    y1={
                      _displayProps.colTree.width -
                      coords[i][1] * _displayProps.colTree.width
                    }
                    x2={coords[i + 1][0] * innerWidth}
                    y2={
                      _displayProps.colTree.width -
                      coords[i + 1][1] * _displayProps.colTree.width
                    }
                    stroke="black"
                    shapeRendering="crispEdges"
                  />
                )
              })
            )}
          </g>
        )}

        {_displayProps.groups.show && groups.length > 0 && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop - _displayProps.padding - _displayProps.groups.height
            })`}
          >
            {colLeaves.map((col, ci) => {
              const fill: string = colColorMap[col]

              return (
                <rect
                  id={`color:${ci}`}
                  key={`color:${ci}`}
                  x={ci * blockSize.w}
                  y={0}
                  width={blockSize.w}
                  height={_displayProps.groups.height}
                  fill={fill}
                  shapeRendering="crispEdges"
                />
              )
            })}
          </g>
        )}

        {cf.rowTree && _displayProps.rowTree.position === 'Left' && (
          <g transform={`translate(${_displayProps.padding}, ${marginTop})`}>
            {cf.rowTree.coords.map((coords, ri) =>
              range(0, 3).map(i => {
                return (
                  <line
                    key={ri * 3 + i}
                    y1={coords[i][0] * innerHeight}
                    x1={
                      _displayProps.rowTree.width -
                      coords[i][1] * _displayProps.rowTree.width
                    }
                    y2={coords[i + 1][0] * innerHeight}
                    x2={
                      _displayProps.rowTree.width -
                      coords[i + 1][1] * _displayProps.rowTree.width
                    }
                    stroke="black"
                    shapeRendering="crispEdges"
                  />
                )
              })
            )}
          </g>
        )}

        {cf.rowTree && _displayProps.rowTree.position === 'Right' && (
          <g
            transform={`translate(${
              marginLeft +
              innerWidth +
              _displayProps.padding +
              (_displayProps.rowLabels.position === 'Right'
                ? _displayProps.rowLabels.width + _displayProps.padding
                : 0)
            }, ${marginTop})`}
          >
            {cf.rowTree.coords.map((coords, ri) =>
              range(0, 3).map(i => {
                return (
                  <line
                    key={ri * 3 + i}
                    y1={coords[i][0] * innerHeight}
                    x1={coords[i][1] * _displayProps.rowTree.width}
                    y2={coords[i + 1][0] * innerHeight}
                    x2={coords[i + 1][1] * _displayProps.rowTree.width}
                    stroke="black"
                    shapeRendering="crispEdges"
                  />
                )
              })
            )}
          </g>
        )}

        {_displayProps.rowLabels.position === 'Left' && (
          <g
            transform={`translate(${
              _displayProps.margin.left +
              _displayProps.rowLabels.width +
              (cf.rowTree && _displayProps.rowTree.position === 'Left'
                ? _displayProps.rowTree.width + _displayProps.padding
                : 0)
            }, ${marginTop})`}
          >
            {rowLeaves.map((row, ri) => {
              return (
                <text
                  key={ri}
                  x={0}
                  y={ri * blockSize.h + halfBlockSize.h}
                  fill="black"
                  dominantBaseline="central"
                  fontSize="smaller"
                  textAnchor="end"
                >
                  {cf.dataframes['main'].rowNames[row]}
                </text>
              )
            })}
          </g>
        )}

        {_displayProps.rowLabels.position === 'Right' && (
          <g
            transform={`translate(${
              marginLeft + innerWidth + _displayProps.padding
            }, ${marginTop})`}
          >
            {rowLeaves.map((row, ri) => {
              return (
                <text
                  key={ri}
                  x={0}
                  y={ri * blockSize.h + halfBlockSize.h}
                  fill="black"
                  dominantBaseline="central"
                  fontSize="smaller"
                >
                  {cf.dataframes['main'].rowNames[row]}
                </text>
              )
            })}
          </g>
        )}

        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          {rowLeaves.map((row, ri) => {
            return colLeaves.map((col, ci) => {
              const v = dfMain.get(row, col) as number

              const radius =
                _displayProps.style === 'dot' && dfPercent
                  ? (dfPercent.get(row, col) as number)
                  : 1

              const fill: string = !isNaN(v)
                ? _displayProps.cmap.get(bound(v))
                : 'white'

              switch (_displayProps.style) {
                case 'dot':
                  return (
                    <circle
                      id={`${ri}:${ci}`}
                      key={`${ri}:${ci}`}
                      cx={ci * blockSize.w + 0.5 * blockSize.w}
                      cy={ri * blockSize.h + 0.5 * blockSize.h}
                      r={0.5 * blockSize.w * radius}
                      fill={fill}
                    />
                  )
                default:
                  return (
                    <rect
                      id={`${ri}:${ci}`}
                      key={`${ri}:${ci}`}
                      x={ci * blockSize.w}
                      y={ri * blockSize.h}
                      width={blockSize.w}
                      height={blockSize.h}
                      fill={fill}
                      shapeRendering="crispEdges"
                    />
                  )
              }
            })
          })}
        </g>

        {/* grid */}

        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          {_displayProps.grid.show && (
            <>
              {range(blockSize.h, innerHeight, blockSize.h).map(y => (
                <line
                  key={y}
                  x1={0}
                  y1={y}
                  x2={innerWidth}
                  y2={y}
                  stroke={_displayProps.grid.color}
                  shapeRendering="crispEdges"
                />
              ))}
              {range(blockSize.w, innerWidth, blockSize.w).map(x => (
                <line
                  key={x}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={innerHeight}
                  stroke={_displayProps.grid.color}
                  shapeRendering="crispEdges"
                />
              ))}
            </>
          )}

          {_displayProps.border.show && (
            <rect
              x={0}
              y={0}
              width={innerWidth}
              height={innerHeight}
              stroke={_displayProps.border.color}
              fill="none"
              shapeRendering="crispEdges"
            />
          )}
        </g>

        {_displayProps.colLabels.position === 'Top' && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop -
              _displayProps.padding -
              (_displayProps.groups.show && groups.length > 0
                ? _displayProps.groups.height + _displayProps.padding
                : 0)
            })`}
          >
            {colLeaves.map((col, ci) => {
              return (
                <text
                  key={ci}
                  transform={`translate(${
                    ci * blockSize.w + halfBlockSize.w
                  }, 0) rotate(270)`}
                  fill={
                    _displayProps.colLabels.isColored
                      ? colColorMap[col]
                      : 'black'
                  } //"black"
                  dominantBaseline="central"
                  fontSize="smaller"
                >
                  {cf.dataframes['main'].getColName(col)}
                </text>
              )
            })}
          </g>
        )}

        {_displayProps.colLabels.position === 'Bottom' && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop + innerHeight + _displayProps.padding
            })`}
          >
            {colLeaves.map((col, ci) => {
              return (
                <text
                  key={ci}
                  transform={`translate(${
                    ci * blockSize.w + halfBlockSize.w
                  }, 0) rotate(270)`}
                  fill={
                    _displayProps.colLabels.isColored
                      ? colColorMap[col]
                      : 'black'
                  }
                  dominantBaseline="central"
                  textAnchor="end"
                  fontSize="smaller"
                >
                  {cf.dataframes['main'].getColName(col)}
                </text>
              )
            })}
          </g>
        )}

        {_displayProps.colorbar.position === 'Right' && (
          <g
            transform={`translate(${
              marginLeft +
              innerWidth +
              _displayProps.padding +
              (_displayProps.rowLabels.position === 'Right'
                ? _displayProps.rowLabels.width
                : 0) +
              (cf.rowTree && _displayProps.rowTree.position === 'Right'
                ? _displayProps.rowTree.width + _displayProps.padding
                : 0)
            }, ${marginTop})`}
          >
            {addVColorBar({
              domain: _displayProps.range,
              cmap: _displayProps.cmap,
              size: _displayProps.colorbar.barSize,
            })}
          </g>
        )}

        {_displayProps.colorbar.position === 'Bottom' && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop +
              innerHeight +
              _displayProps.padding +
              (_displayProps.colLabels.position === 'Bottom'
                ? _displayProps.colLabels.width
                : 0)
            })`}
          >
            {addHColorBar({
              domain: _displayProps.range,
              cmap: _displayProps.cmap,
              size: _displayProps.colorbar.barSize,
            })}
          </g>
        )}

        {/* Plot the legend */}

        {_displayProps.groups.show &&
          groups.length > 0 &&
          _displayProps.legend.position === 'Upper Right' && (
            <g transform={`translate(${legendPos[0]}, ${legendPos[1]})`}>
              {groups.map((g, gi) => {
                return (
                  <g
                    key={`group:${gi}`}
                    transform={`translate(0, ${
                      (legendBlockSize + _displayProps.padding) * gi
                    })`}
                  >
                    <rect
                      x={0}
                      y={0}
                      width={legendBlockSize}
                      height={legendBlockSize}
                      fill={g.color}
                      stroke="black"
                      shapeRendering="crispEdges"
                    />

                    <text
                      x={legendBlockSize + _displayProps.padding}
                      y={0.5 * legendBlockSize}
                      fill="black"
                      dominantBaseline="central"
                      fontSize="smaller"
                    >
                      {g.name}
                    </text>
                  </g>
                )
              })}
            </g>
          )}

        {/* Plot the dor legend */}

        {dfPercent && _displayProps.legend.position === 'Upper Right' && (
          <g transform={`translate(${dotLegendPos[0]}, ${dotLegendPos[1]})`}>
            {_displayProps.dotLegend.sizes.map((ds, dsi) => {
              return (
                <g
                  key={`dot:${dsi}`}
                  transform={`translate(0, ${
                    (legendBlockSize + _displayProps.padding) * dsi
                  })`}
                >
                  <circle
                    cx={0.5 * legendBlockSize}
                    cy={0.5 * legendBlockSize}
                    r={
                      (halfBlockSize.w *
                        (ds - _displayProps.dotLegend.lim[0])) /
                      (_displayProps.dotLegend.lim[1] -
                        _displayProps.dotLegend.lim[0])
                    }
                    fill={'gray'}
                  />

                  <text
                    x={legendBlockSize + _displayProps.padding}
                    y={0.5 * legendBlockSize}
                    fill="black"
                    dominantBaseline="central"
                    fontSize="smaller"
                  >
                    {`${ds} ${_displayProps.dotLegend.type}`}
                  </text>
                </g>
              )
            })}
          </g>
        )}
      </svg>
    )
  }, [cf, displayProps])

  // useEffect(() => {
  //   //if (dataFiles.length > 0) {

  //   async function fetch() {
  //     const svg = d3.select(svgRef.current) //.attr("width", 700).attr("height", 300);

  //     svg.selectAll("*").remove()

  //     const g = svg.append("g")

  //     // set the dimensions and margins of the graph
  //     var margin = { top: 10, right: 200, bottom: 30, left: 100 }

  //     g.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  //     //   .attr("height", height + margin.top + margin.bottom)

  //     const innerWidth = 1000 - margin.left - marginRight
  //     const innerHeight = 1000 - margin.top - margin.bottom

  //     // append the svg object to the body of the page
  //     // svg
  //     //   .attr("width", width + margin.left + marginRight)
  //     //   .attr("height", height + margin.top + margin.bottom)
  //     //   .append("g")
  //     //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  //     //Read the data
  //     //const data = await d3.csv(
  //     //  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv"
  //     //)

  //     let df: IDataFrame = dataFile

  //     if (search.length > 0) {
  //       const idxMap = rowIdxMap(df, true)

  //       const idx = search
  //         .map(term => idxMap[term])
  //         .filter(x => x !== undefined)

  //       df = filterRows(df, idx)
  //     }

  //     df = sliceCols(sliceRows(df))

  //     // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  //     // var myGroups = d3.map(data, (d, i) => {
  //     //   console.log("dd", d.group)
  //     //   return d.group
  //     // })

  //     const myGroups: string[] = range(0, df.data[0].length).map(i => `col${i}`) //data.colIndex //Array.from(
  //     // new Set(data.colIndex)) //.map((d, i) => d.group || "").filter(x => x !== ""))

  //     const myVars = df.rowIndex[0].ids.map(rowId => rowId)
  //     myVars.toReversed()
  //     //Array.from(
  //     //new Set(data.rowIndex)) //data.map((d, i) => d.variable || "").filter(x => x !== ""))
  //     //d3.map(data, (d, i) => d.variable)

  //     const plotData: {
  //       group: string
  //       colId: string
  //       variable: string
  //       value: number
  //     }[] = []

  //     df.data.forEach((row, ri) => {
  //       row.forEach((cell, ci) => {
  //         plotData.push({
  //           group: df.colIndex[0].ids[ci],
  //           colId: `col${ci}`,
  //           variable: df.rowIndex[0].ids[ri],
  //           value: getCellValue(cell),
  //         })
  //       })
  //     })

  //     // Build X scales and axis:
  //     var x = d3
  //       .scaleBand()
  //       .range([0, innerWidth])
  //       .domain(myGroups)
  //       .padding(0.05)

  //     g.append("g")
  //       .style("font-size", 15)
  //       .attr("font-family", "Arial, Helvetica, sans-serif")
  //       .attr("transform", "translate(0," + innerHeight + ")")
  //       .call(
  //         d3
  //           .axisBottom(x)
  //           .tickSize(0)
  //           .tickFormat((x, xi) => df.colIndex[0].ids[xi])
  //       )
  //       .select(".domain")
  //       .remove()

  //     // Build Y scales and axis:
  //     var y = d3
  //       .scaleBand()
  //       .range([innerHeight, 0])
  //       .domain(myVars)
  //       .padding(0.05)

  //     g.append("g")
  //       .style("font-size", 15)

  //       .attr("font-family", "Arial, Helvetica, sans-serif")
  //       .call(d3.axisLeft(y).tickSize(0))
  //       .select(".domain")
  //       .remove()

  //     // Build color scale
  //     // var myColor = d3
  //     //   .scaleSequential()
  //     //   .interpolator(["blue", "white", "red"]) //d3.interpolateRdBu)
  //     //   .domain([1, 100])

  //     var myColor = d3
  //       .scaleLinear()
  //       .domain([-3, 0, 3])
  //       // @ts-ignore
  //       .range(["blue", "white", "red"])

  //     // Three function that change the tooltip when user hover / move / leave a cell
  //     function mouseover(e: any, d: any) {
  //       d3.select(tooltipRef.current).style("opacity", 1)
  //       d3.select(e.target).style("stroke", "black").style("opacity", 1)
  //     }

  //     function mousemove(e: any, d: any) {
  //       d3.select(tooltipRef.current)
  //         .html(`${d.group}<br/>${d.variable}<br/>${d.value.toFixed(4)}`)
  //         .style("Left", e.offsetX + 5 + "px")
  //         .style("Top", e.offsetY + 5 + "px")
  //     }

  //     function mouseleave(e: any, d: any) {
  //       d3.select(tooltipRef.current).style("opacity", 0)
  //       //d3.select(this).style("stroke", "none").style("opacity", 0.8)
  //       d3.select(e.target).style("stroke", "none").style("opacity", 0.8)
  //     }

  //     // add the squares
  //     const g2 = g.append("g")
  //     g2.selectAll()
  //       .data(plotData)
  //       .enter()
  //       .append("rect")
  //       .attr("x", (d, i) => x(d.colId || "") || "")
  //       .attr("y", (d, i) => y(d.variable || "") || "")
  //       .attr("width", x.bandwidth())
  //       .attr("height", y.bandwidth())
  //       .style("fill", (d, i) => (d.value ? myColor(d.value) : "white"))
  //       .style("stroke-width", 1)
  //       .style("stroke", "none")
  //       .style("opacity", 1)
  //       .on("mouseover", mouseover)
  //       .on("mousemove", mousemove)
  //       .on("mouseleave", mouseleave)

  //     addVColorBar(g, [-3, 3], myColor).attr(
  //       "transform",
  //       `translate(${innerWidth + 20}, 0)`
  //     )
  //   }

  //   if (dataFile) {
  //     fetch()
  //   }
  // }, [dataFile, search])

  function onMouseMove(e: { pageX: number; pageY: number }) {
    if (!innerRef.current) {
      return
    }

    const rect = innerRef.current.getBoundingClientRect()

    let c = Math.floor(
      (e.pageX -
        marginLeft * _displayProps.scale -
        rect.left -
        window.scrollX) /
        scaledBlockSize.w
    )

    if (c < 0 || c > dfMain.shape[1] - 1) {
      c = -1
    }

    let r = Math.floor(
      (e.pageY - marginTop * _displayProps.scale - rect.top - window.scrollY) /
        scaledBlockSize.h
    )

    if (r < 0 || r > dfMain.shape[0] - 1) {
      r = -1
    }

    if (r === -1 || c === -1) {
      setToolTipInfo(null)
    } else {
      setToolTipInfo({
        ...toolTipInfo,
        pos: {
          x: (marginLeft + c * blockSize.w) * _displayProps.scale,
          y: (marginTop + r * blockSize.h) * _displayProps.scale,
        },
        cell: { r, c },
      })
    }
  }

  //const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  return (
    <>
      {svg}

      {toolTipInfo && (
        <>
          <div
            ref={tooltipRef}
            className="absolute z-50 rounded-md bg-black/60 p-3 text-xs text-white opacity-100"
            style={{
              left: toolTipInfo.pos.x + scaledBlockSize.w,
              top: toolTipInfo.pos.y + scaledBlockSize.h,
            }}
          >
            <p className="font-semibold">{`${dfMain.getColName(
              toolTipInfo.cell.c
            )} (${toolTipInfo.cell.r + 1}, ${toolTipInfo.cell.c + 1})`}</p>
            <p>{cellStr(dfMain.get(toolTipInfo.cell.r, toolTipInfo.cell.c))}</p>
            {/* <p>
          row: {toolTipInfo.cell.r + 1}, col: {toolTipInfo.cell.c + 1}
        </p> */}
          </div>

          <span
            ref={highlightRef}
            className="absolute z-40 border-black"
            style={{
              top: `${toolTipInfo.pos.y - 1}px`,
              left: `${toolTipInfo.pos.x - 1}px`,
              width: `${scaledBlockSize.w + 1}px`,
              height: `${scaledBlockSize.h + 1}px`,
              borderWidth: `${Math.max(1, _displayProps.scale)}px`,
            }}
          />
        </>
      )}
    </>
  )
})
