import { cn } from "@lib/class-names"

import { type IFieldMap } from "@interfaces/field-map"
import { cellStr } from "@lib/dataframe/cell"

import type { ILim } from "@components/plot/axis"
import { type IElementProps } from "@interfaces/element-props"
import { getColIdxFromGroup, type IClusterGroup } from "@lib/cluster-group"
import { BWR_CMAP, ColorMap } from "@lib/colormap"
import { dataframeToD3 } from "@lib/dataframe/dataframe-utils"
import type { ClusterFrame } from "@lib/math/hcluster"
import { range } from "@lib/math/range"
import * as d3 from "d3"
import { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import { addHColorBar, addVColorBar } from "./color-bar-svg"
import { IDim } from "@interfaces/dim"

interface IBlock {
  w: number
  h: number
}

const BLOCK_SIZE: IBlock = { w: 30, h: 30 }
const NO_SELECTION = [-1, -1]

const margin = { top: 10, right: 10, bottom: 10, left: 10 }

export interface IDisplayProps {
  blockSize: IBlock
  grid: {
    show: boolean
    color: string
  }
  border: {
    show: boolean
    color: string
  }
  style: "square" | "dot"
  range: [number, number]
  rowLabels: { position: "left" | "right" | null; width: number }
  colLabels: { position: "top" | "bottom" | null; width: number }
  colorbar: {
    barSize: IDim
    width: number
    position: "bottom" | "right" | null
  }
  rowTree: {
    position: "left" | "right" | null
    width: number
  }
  colTree: {
    position: "top" | "bottom" | null
    width: number
  }
  legend: { position: "upper right" | null; width: number }
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

export const DEFAULT_DISPLAY_PROPS: IDisplayProps = {
  blockSize: BLOCK_SIZE,
  grid: { show: true, color: "#eeeeee" },
  border: { show: true, color: "#000000" },
  range: [-3, 3],
  style: "square",
  rowLabels: { position: "right", width: 100 },
  colLabels: { position: "top", width: 100 },
  colorbar: { position: "right", barSize: {w:160, h:16}, width: 100 },
  groups: { show: true, height: 0.5 * BLOCK_SIZE.h },
  legend: { position: "upper right", width: 200 },
  dotLegend: {
    sizes: [25, 50, 75, 100],
    lim: [0, 100],
    type: "%",
  },
  rowTree: { width: 100, position: "left" },
  colTree: { width: 100, position: "top" },
  padding: 10,
  scale: 1,
  cmap: BWR_CMAP,
}

interface IProps extends IElementProps {
  cf: ClusterFrame
  groups?: IClusterGroup[]
  maxRows?: number
  maxCols?: number
  search?: string[]
  displayProps?: IFieldMap
}

export const D3HeatMapSvg = forwardRef<SVGElement, IProps>(
  function D3HeatMapSvg(
    { cf, groups = [], displayProps = {} }: IProps,
    svgRef,
  ) {
    const _displayProps: IDisplayProps = {
      ...DEFAULT_DISPLAY_PROPS,
      ...displayProps,
    }

    const blockSize = _displayProps.blockSize ?? BLOCK_SIZE
    const blockSize2: IBlock = { w: 0.5 * blockSize.w, h: 0.5 * blockSize.h }

    //const svgRef = useRef<SVGSVGElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    //const canvasRef = useRef(null)
    //const downloadRef = useRef<HTMLAnchorElement>(null)
    const highlightRef = useRef<HTMLSpanElement>(null)

    const [highlightCol] = useState(NO_SELECTION)
    //const [highlightRow, setHighlightRow] = useState(-1)

    const marginLeft =
      margin.left +
      (cf.rowTree && _displayProps.rowTree.position === "left"
        ? _displayProps.rowTree.width + _displayProps.padding
        : 0) +
      (_displayProps.rowLabels.position === "left"
        ? _displayProps.rowLabels.width + _displayProps.padding
        : 0)

    const marginRight =
      (_displayProps.rowLabels.position === "right"
        ? _displayProps.rowLabels.width + _displayProps.padding
        : 0) +
      (_displayProps.colorbar.position === "right"
        ? _displayProps.colorbar.width + _displayProps.padding
        : 0) +
      (cf.rowTree && _displayProps.rowTree.position === "right"
        ? _displayProps.rowTree.width + _displayProps.padding
        : 0) +
      (_displayProps.legend.position?.includes("right")
        ? _displayProps.legend.width + _displayProps.padding
        : 0)

    const marginTop =
      margin.top +
      (cf.colTree && _displayProps.colTree.position === "top"
        ? _displayProps.colTree.width + _displayProps.padding
        : 0) +
      (_displayProps.colLabels.position === "top"
        ? _displayProps.colLabels.width + _displayProps.padding
        : 0) +
      (_displayProps.groups.show && groups.length > 0
        ? _displayProps.groups.height + _displayProps.padding
        : 0)

    const marginBottom =
      _displayProps.padding +
      (_displayProps.colLabels.position === "bottom"
        ? _displayProps.colLabels.width + _displayProps.padding
        : 0) +
      (_displayProps.colorbar.position === "bottom"
        ? _displayProps.colorbar.width + _displayProps.padding
        : 0)

    const innerWidth = cf.dataframes["main"].shape[1] * blockSize.w
    const innerHeight = cf.dataframes["main"].shape[0] * blockSize.h
    const width = innerWidth + marginLeft + marginRight
    const height = innerHeight + marginTop + marginBottom

    useEffect(() => {
      if (!cf) {
        return
      }

      const data = dataframeToD3(cf.dataframes["main"])

      const svg = d3.select("#svg-plot")!

      const width = cf.dataframes["main"].shape[1] * blockSize.w
      const height = cf.dataframes["main"].shape[0] * blockSize.h

      const myGroups = cf.dataframes["main"].colNames //Array.from(new Set(data.map(d => d.group)))
      const myVars = cf.dataframes["main"].rowNames //Array.from(new Set(data.map(d => d.variable)))
      console.log(myGroups, width, height)

      // Build X scales and axis:
      const x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.05)
      svg
        .append("g")
        .style("font-size", 15)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain")
        .remove()

      // Build Y scales and axis:
      const y = d3.scaleBand().range([height, 0]).domain(myVars).padding(0.05)
      svg
        .append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain")
        .remove()

      // Build color scale
      const myColor = d3
        .scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([-3, 3])

      // create a tooltip
      const tooltip = d3
        .select("#svg-plot-container")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .attr("class", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

      // Three function that change the tooltip when user hover / move / leave a cell
      const mouseover = function () {
        tooltip.style("opacity", 1).style("stroke", "black")
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mousemove = function (event: any, d: any) {
        const p = d3.pointer(event)

        const p2 = [
          blockSize.w * (Math.floor(p[0] / blockSize.w) + 1) + marginLeft,
          blockSize.h * (Math.floor(p[1] / blockSize.h) + 1) + marginTop,
        ]

        tooltip
          .html("The exact value of<br>this cell is: " + d.value)
          .style("left", p2[0] + "px")
          .style("top", p2[1] + "px")
      }
      const mouseleave = function () {
        tooltip.style("opacity", 0).style("stroke", "none")
      }

      // add the squares
      svg
        .select("#rects")
        .selectAll()
        .data(data)
        .join("rect")
        .attr("x", function (d) {
          return x(d.group)!
        })
        .attr("y", function (d) {
          return y(d.variable)!
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("class", "cursor-pointer")
        .style("fill", function (d) {
          return myColor(d.value)
        })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

      // Add title to graph
      svg
        .append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("A d3.js heatmap")

      // Add subtitle to graph
      svg
        .append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("A short description of the take-away message of this chart.")
    }, [cf])

    const [toolTipInfo] = useState({
      left: -1,
      top: -1,
      visible: false,
      seqIndex: 0,
      pos: -1,
    })

    // function bound(x: number) {
    //   const r = _displayProps.range[1] - _displayProps.range[0]

    //   return (
    //     (Math.max(_displayProps.range[0], Math.min(_displayProps.range[1], x)) -
    //       _displayProps.range[0]) /
    //     r
    //   )
    // }

    const svgChildren = useMemo(() => {
      if (!cf) {
        return null
      }

      // const colorMap = d3
      //   .scaleLinear()
      //   .domain([_displayProps.range[0], 0, _displayProps.range[1]])
      //   // @ts-ignore
      //   .range(["blue", "white", "red"])
      const dfMain = cf.dataframes["main"]
      const dfPercent = cf.dataframes["percent"]

      const s = dfMain.shape

      const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(0, s[0])
      const colLeaves = cf.colTree ? cf.colTree.leaves : range(0, s[1])

      const colColorMap = Object.fromEntries(
        groups
          .map(group =>
            getColIdxFromGroup(dfMain, group).map(c => [c, group.color]),
          )
          .flat(),
      )

      const legendBlockSize = Math.min(
        _displayProps.blockSize.w,
        _displayProps.blockSize.h,
      )

      let legendPos = [0, 0]

      if (_displayProps.legend.position === "upper right") {
        legendPos = [
          marginLeft +
            innerWidth +
            _displayProps.padding +
            (_displayProps.rowLabels.position === "right"
              ? _displayProps.rowLabels.width
              : 0) +
            (cf.rowTree && _displayProps.rowTree.position === "right"
              ? _displayProps.rowTree.width + _displayProps.padding
              : 0) +
            (_displayProps.colorbar.position === "right"
              ? _displayProps.colorbar.width
              : 0),
          marginTop,
        ]
      }

      let dotLegendPos = [0, 0]

      if (_displayProps.legend.position === "upper right") {
        dotLegendPos = [
          legendPos[0],
          marginTop +
            (_displayProps.groups.show
              ? (legendBlockSize + _displayProps.padding) * (groups.length + 1)
              : 0),
        ]
      }

      return (
        <>
          {cf.colTree && _displayProps.colTree.position === "top" && (
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
                }),
              )}
            </g>
          )}

          {_displayProps.groups.show && groups.length > 0 && (
            <g
              transform={`translate(${marginLeft}, ${
                marginTop - _displayProps.padding - _displayProps.groups.height
              })`}
            >
              {colLeaves.map(ci => {
                const fill: string = colColorMap[ci]

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

          {cf.rowTree && _displayProps.rowTree.position === "left" && (
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
                }),
              )}
            </g>
          )}

          {cf.rowTree && _displayProps.rowTree.position === "right" && (
            <g
              transform={`translate(${
                marginLeft +
                innerWidth +
                _displayProps.padding +
                (_displayProps.rowLabels.position === "right"
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
                }),
              )}
            </g>
          )}

          {_displayProps.rowLabels.position === "left" && (
            <g
              transform={`translate(${
                cf.rowTree && _displayProps.rowTree.position === "left"
                  ? _displayProps.rowTree.width +
                    _displayProps.padding +
                    margin.left
                  : margin.left
              }, ${marginTop})`}
            >
              {dfMain.rowNames.map((index, ri) => {
                return (
                  <text
                    key={ri}
                    x={0}
                    y={ri * blockSize.h + blockSize2.h}
                    fill="black"
                    dominantBaseline="central"
                    fontSize="smaller"
                  >
                    {index}
                  </text>
                )
              })}
            </g>
          )}

          {_displayProps.rowLabels.position === "right" && (
            <g
              transform={`translate(${
                marginLeft + innerWidth + _displayProps.padding
              }, ${marginTop})`}
            >
              {rowLeaves.map(ri => {
                return (
                  <text
                    key={ri}
                    x={0}
                    y={ri * blockSize.h + blockSize2.h}
                    fill="black"
                    dominantBaseline="central"
                    fontSize="smaller"
                  >
                    {cf.dataframes["main"].rowNames[ri]}
                  </text>
                )
              })}
            </g>
          )}

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

          {_displayProps.colLabels.position === "top" && (
            <g
              transform={`translate(${marginLeft}, ${
                marginTop -
                _displayProps.padding -
                (_displayProps.groups.show && groups.length > 0
                  ? _displayProps.groups.height + _displayProps.padding
                  : 0)
              })`}
            >
              {cf.dataframes["main"].colNames.map((index, ri) => {
                return (
                  <text
                    key={ri}
                    transform={`translate(${
                      ri * blockSize.w + blockSize2.w
                    }, 0) rotate(270)`}
                    fill="black"
                    dominantBaseline="central"
                    fontSize="smaller"
                  >
                    {index}
                  </text>
                )
              })}
            </g>
          )}

          {_displayProps.colLabels.position === "bottom" && (
            <g
              transform={`translate(${marginLeft}, ${
                marginTop + innerHeight + _displayProps.padding
              })`}
            >
              {colLeaves.map(ci => {
                return (
                  <text
                    key={ci}
                    transform={`translate(${
                      ci * blockSize.w + blockSize2.w
                    }, 0) rotate(270)`}
                    fill="black"
                    dominantBaseline="central"
                    textAnchor="end"
                    fontSize="smaller"
                  >
                    {cf.dataframes["main"].getColName(ci)}
                  </text>
                )
              })}
            </g>
          )}

          {_displayProps.colorbar.position === "right" && (
            <g
              transform={`translate(${
                marginLeft +
                innerWidth +
                _displayProps.padding +
                (_displayProps.rowLabels.position === "right"
                  ? _displayProps.rowLabels.width
                  : 0) +
                (cf.rowTree && _displayProps.rowTree.position === "right"
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

          {_displayProps.colorbar.position === "bottom" && (
            <g
              transform={`translate(${marginLeft}, ${
                marginTop +
                innerHeight +
                _displayProps.padding +
                (_displayProps.colLabels.position === "bottom"
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
            _displayProps.legend.position === "upper right" && (
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

          {dfPercent && _displayProps.legend.position === "upper right" && (
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
                        (blockSize2.w * (ds - _displayProps.dotLegend.lim[0])) /
                        (_displayProps.dotLegend.lim[1] -
                          _displayProps.dotLegend.lim[0])
                      }
                      fill={"gray"}
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
        </>
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
    //         .style("left", e.offsetX + 5 + "px")
    //         .style("top", e.offsetY + 5 + "px")
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

    // function onMouseMove(e: { pageX: number; pageY: number }) {
    //   if (!svgRef) {
    //     return
    //   }

    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-expect-error
    //   if (!svgRef.current) {
    //     return
    //   }

    //   let c = Math.floor(
    //     (e.pageX -
    //       marginLeft * _displayProps.scale -
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-expect-error
    //       svgRef.current.getBoundingClientRect().left -
    //       window.scrollX) /
    //       (blockSize.w * _displayProps.scale),
    //   )

    //   if (c < 0 || c > cf.dataframes["main"].shape[1] - 1) {
    //     c = -1
    //   }

    //   let r = Math.floor(
    //     (e.pageY -
    //       marginTop * _displayProps.scale -
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-expect-error
    //       svgRef.current.getBoundingClientRect().top -
    //       window.scrollY) /
    //       (blockSize.h * _displayProps.scale),
    //   )

    //   if (r < 0 || r > cf.dataframes["main"].shape[0] - 1) {
    //     r = -1
    //   }

    //   setHighlightCol([r, c])

    //   if (r > -1 && c > -1) {
    //     setToolTipInfo({
    //       ...toolTipInfo,
    //       seqIndex: r,
    //       pos: c,
    //       left: (marginLeft + (c + 1) * blockSize.w) * _displayProps.scale,
    //       top: (marginTop + (r + 1) * blockSize.h) * _displayProps.scale,
    //       visible: true,
    //     })
    //   }
    // }

    const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

    return (
      <div id="svg-plot-container" className="relative">
        <svg
          id="svg-plot"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          fontFamily="Arial, Helvetica, sans-serif"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ref={svgRef}
          width={width * _displayProps.scale}
          height={height * _displayProps.scale}
          viewBox={`0 0 ${width} ${height}`}
          className="z-30"
          //onMouseMove={onMouseMove}
        >
          <g id="rects" transform={`translate(${marginLeft}, ${marginTop})`} />
          {/* {rowLeaves.map(ri => {
              return colLeaves.map(ci => {
                const v = dfMain.get(ri, ci) as number

                const r =
                  _displayProps.style === "dot" && dfPercent
                    ? (dfPercent.get(ri, ci) as number)
                    : 1

                const fill: string = !isNaN(v)
                  ? _displayProps.cmap.get(bound(v))
                  : "white"

                switch (_displayProps.style) {
                  case "dot":
                    return (
                      <circle
                        id={`${ri}:${ci}`}
                        key={`${ri}:${ci}`}
                        cx={ci * blockSize.w + 0.5*blockSize.w}
                        cy={ri * blockSize.h + 0.5*blockSize.h}
                        r={(0.5*blockSize.w) * r}
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
            })} */}

          {svgChildren}
        </svg>

        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 rounded-md bg-black/60 p-3 text-xs text-white",
            [inBlock && toolTipInfo.visible, "opacity-100", "opacity-0"],
          )}
          style={{ left: toolTipInfo.left, top: toolTipInfo.top }}
        >
          {inBlock && (
            <>
              <p className="font-semibold">
                {cf.dataframes["main"].getColName(toolTipInfo.pos)}
              </p>
              <p>
                {cellStr(
                  cf.dataframes["main"].get(
                    toolTipInfo.seqIndex,
                    toolTipInfo.pos,
                  ),
                )}
              </p>
              <p>
                x: {toolTipInfo.pos + 1}, y: {toolTipInfo.seqIndex + 1}
              </p>
            </>
          )}
        </div>

        <span
          ref={highlightRef}
          className={cn("absolute z-40 border-black", [
            inBlock,
            "opacity-100",
            "opacity-0",
          ])}
          style={{
            top: `${
              (marginTop + highlightCol[0] * blockSize.h) *
                _displayProps.scale -
              1
            }px`,
            left: `${
              (marginLeft + highlightCol[1] * blockSize.w) *
                _displayProps.scale -
              1
            }px`,
            width: `${blockSize.w * _displayProps.scale + 1}px`,
            height: `${blockSize.h * _displayProps.scale + 1}px`,
            borderWidth: `${Math.max(1, _displayProps.scale)}px`,
          }}
        />
      </div>
    )
  },
)
