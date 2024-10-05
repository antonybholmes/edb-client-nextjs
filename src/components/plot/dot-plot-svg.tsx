import { cn } from "@lib/class-names"

import { type IFieldMap } from "@interfaces/field-map"
import { cellStr } from "@lib/dataframe/cell"

import { type IElementProps } from "@interfaces/element-props"
import { getColIdxFromGroup, type IClusterGroup } from "@lib/cluster-group"
import { BWR_CMAP, ColorMap } from "@lib/colormap"
import type { ClusterFrame } from "@lib/math/hcluster"
import { range } from "@lib/math/range"
import { forwardRef, useMemo, useRef, useState } from "react"
import { addHColorBar, addVColorBar } from "./color-bar-svg"
import { IDim } from "@interfaces/dim"

interface IBlock {
  w: number
  h: number
}

const BLOCK_SIZE: IBlock = { w: 30, h: 30 }
const NO_SELECTION = [-1, -1]

const margin = { top: 10, right: 10, bottom: 10, left: 10 }

export interface IDotPlotProps {
  blockSize: IBlock
  grid: {
    show: boolean
    color: string
  }
  border: {
    show: boolean
    color: string
  }
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
  groups: {
    show: boolean
    height: number
  }
  padding: number
  scale: number
  cmap: ColorMap
}

export const DEFAULT_DISPLAY_PROPS: IDotPlotProps = {
  blockSize: BLOCK_SIZE,
  grid: { show: true, color: "#eeeeee" },
  border: { show: true, color: "#000000" },
  range: [-3, 3],
  rowLabels: { position: "right", width: 100 },
  colLabels: { position: "top", width: 100 },
  colorbar: { position: "right", barSize: {w:160, h:16}, width: 100 },
  groups: { show: true, height: 0.5 * BLOCK_SIZE.h },
  legend: { position: "upper right", width: 200 },
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

export const DotPlotSvg = forwardRef<SVGElement, IProps>(function DotPlotSvg(
  { cf, groups = [], displayProps = {} }: IProps,
  svgRef,
) {
  const _displayProps: IDotPlotProps = {
    ...DEFAULT_DISPLAY_PROPS,
    ...displayProps,
  }

  const blockSize = _displayProps.blockSize
  const blockSize2: IBlock = { w: 0.5 * blockSize.w, h: 0.5 * blockSize.h }

  //const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  //const canvasRef = useRef(null)
  //const downloadRef = useRef<HTMLAnchorElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)

  const [highlightCol, setHighlightCol] = useState(NO_SELECTION)
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

  const [toolTipInfo, setToolTipInfo] = useState({
    left: -1,
    top: -1,
    visible: false,
    seqIndex: 0,
    pos: -1,
  })

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

    const dfMain = cf.dataframes["main"]
    const dfPercent = cf.dataframes["percent"]

    const s = cf.dataframes["main"].shape

    const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(0, s[0])
    const colLeaves = cf.colTree ? cf.colTree.leaves : range(0, s[1])

    const colColorMap = Object.fromEntries(
      groups
        .map(group =>
          getColIdxFromGroup(cf.dataframes["main"], group).map(c => [
            c,
            group.color,
          ]),
        )
        .flat(),
    )

    const legendBlockSize = Math.min(
      _displayProps.blockSize.w,
      _displayProps.blockSize.h,
    )

    return (
      <svg
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={svgRef}
        width={width * _displayProps.scale}
        height={height * _displayProps.scale}
        viewBox={`0 0 ${width} ${height}`}
        shapeRendering="crispEdges"
        onMouseMove={onMouseMove}
        className="absolute"
      >
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
            {cf.dataframes["main"].rowNames.map((index, ri) => {
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

        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          {rowLeaves.map(ri => {
            return colLeaves.map(ci => {
              const v = dfMain.get(ri, ci) as number
              const p = dfPercent.get(ri, ci) as number

              const fill: string = !isNaN(v)
                ? _displayProps.cmap.get(bound(v))
                : "white"

              return (
                <circle
                  id={`${ri}:${ci}`}
                  key={`${ri}:${ci}`}
                  cx={ci * blockSize.w + 0.5 * blockSize.w}
                  cy={ri * blockSize.h + 0.5 * blockSize.h}
                  r={0.5 * blockSize.w * p}
                  fill={fill}
                />
              )
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
                />
              ))}{" "}
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
                  : 0) +
                (_displayProps.colorbar.position === "right"
                  ? _displayProps.colorbar.width
                  : 0)
              }, ${marginTop})`}
            >
              {groups.map((g, gi) => {
                return (
                  <g
                    key={`group:${gi}`}
                    transform={`translate(0, ${
                      gi > 0 ? _displayProps.padding * gi : 0
                    })`}
                  >
                    <rect
                      x={0}
                      y={gi * legendBlockSize}
                      width={legendBlockSize}
                      height={legendBlockSize}
                      fill={g.color}
                      stroke="black"
                    />

                    <text
                      x={legendBlockSize + _displayProps.padding}
                      y={gi * legendBlockSize + 0.5 * legendBlockSize}
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
      </svg>
    )
  }, [cf, displayProps])

  function onMouseMove(e: { pageX: number; pageY: number }) {
    if (!svgRef) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!svgRef.current) {
      return
    }

    let c = Math.floor(
      (e.pageX -
        marginLeft * _displayProps.scale -
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        svgRef.current.getBoundingClientRect().left -
        window.scrollX) /
        (blockSize.w * _displayProps.scale),
    )

    if (c < 0 || c > cf.dataframes["main"].shape[1] - 1) {
      c = -1
    }

    let r = Math.floor(
      (e.pageY -
        marginTop * _displayProps.scale -
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        svgRef.current.getBoundingClientRect().top -
        window.scrollY) /
        (blockSize.h * _displayProps.scale),
    )

    if (r < 0 || r > cf.dataframes["main"].shape[0] - 1) {
      r = -1
    }

    setHighlightCol([r, c])

    if (r > -1 && c > -1) {
      setToolTipInfo({
        ...toolTipInfo,
        seqIndex: r,
        pos: c,
        left: (marginLeft + (c + 1) * blockSize.w) * _displayProps.scale,
        top: (marginTop + (r + 1) * blockSize.h) * _displayProps.scale,
        visible: true,
      })
    }
  }

  const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  return (
    <>
      {svg}

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
            (marginTop + highlightCol[0] * blockSize.h) * _displayProps.scale -
            1
          }px`,
          left: `${
            (marginLeft + highlightCol[1] * blockSize.w) * _displayProps.scale -
            1
          }px`,
          width: `${blockSize.w * _displayProps.scale + 1}px`,
          height: `${blockSize.h * _displayProps.scale + 1}px`,
          borderWidth: `${Math.max(1, _displayProps.scale)}px`,
        }}
      />
    </>
  )
})
