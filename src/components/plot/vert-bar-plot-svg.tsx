import { type IFieldMap } from '@interfaces/field-map'
import { forwardRef, useMemo } from 'react'

import { type IElementProps } from '@interfaces/element-props'
import { BLUES_CMAP, ColorMap } from '@lib/colormap'
import { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { Axis, YAxis, type ILim, type TickLabel } from './axis'
import { AxisBottomSvg, AxisLeftSvg } from './axis-svg'
import { addVColorBar } from './color-bar-svg'

import { fill } from '@lib/fill'
import { ones } from '@lib/math/ones'
import { range } from '@lib/math/range'

const margin = { top: 100, right: 100, bottom: 100, left: 200 }

export interface IDisplayAxis {
  domain: ILim
  range: ILim
  ticks: number[] | null
  tickLabels: string[] | null
}

export interface IDisplayProps {
  xdomain: ILim | undefined
  xrange: ILim | undefined
  xticks: number[] | undefined
  xtickLabels: TickLabel[] | undefined
  ydomain: ILim | undefined
  yrange: ILim | undefined
  yticks: number[] | undefined
  ytickLabels: TickLabel[] | undefined
  padding: number
  scale: number
  tickSize: number
  barWidth: number
}

export const DEFAULT_DISPLAY_PROPS: IDisplayProps = {
  xdomain: undefined,
  xrange: [0, 500],
  xticks: undefined,
  xtickLabels: undefined,
  ydomain: undefined,
  yrange: [0, 500],
  yticks: undefined,
  ytickLabels: undefined,
  padding: 10,
  scale: 5,
  tickSize: 5,
  barWidth: 2,
}

interface IProps extends IElementProps {
  df: BaseDataFrame
  x: string
  y: string
  hue?: string
  barWidth?: number
  hue_norm?: (x: number) => number
  displayProps?: IFieldMap
  cmap?: ColorMap
}

export const VertBarPlotSvg = forwardRef<SVGElement, IProps>(
  function VertBarPlotSvg(
    {
      df,
      x,
      y,
      hue,
      cmap = BLUES_CMAP,
      barWidth = 2,
      displayProps = {},
      hue_norm = x => x,
    }: IProps,
    svgRef
  ) {
    const _displayProps: IDisplayProps = {
      ...DEFAULT_DISPLAY_PROPS,
      ...displayProps,
    }

    const ycol = df.col(y)

    if (!ycol) {
      return null
    }

    const ydata = ycol.values as string[] //getNumCol(df, findCol(df, x))

    const xcol = df.col(x)

    if (!xcol) {
      return null
    }

    const xdata = x ? (xcol.values as number[]) : ones(df.shape[0])

    // give y a default name
    if (!x) {
      x = 'Data' //df.getColName(0)
    }

    const yax = new YAxis()
      .setDomain([0, ydata.length])
      .setDomain(_displayProps.ydomain!)
      .setRange(_displayProps.yrange!)
      .setTicks(range(0, ydata.length).map(x => x + 0.5))
      .setTickLabels(ydata)
    //.setTitle(y)

    // min and max must be different
    const xax = new Axis()
      .setDomain([Math.min(...xdata), Math.max(...xdata)])
      .setDomain(_displayProps.xdomain!)
      .setRange(_displayProps.xrange!)
    //.setTitle(x)

    const innerWidth = xax.range[1]
    const innerHeight = yax.range[1]
    const width = innerWidth + margin.left + margin.right
    const height = innerHeight + margin.top + margin.bottom

    const svg = useMemo(() => {
      let huedata: string[]

      if (hue) {
        const huecol = df.col(hue)!
        huedata = (huecol.values as number[]).map(x => cmap.get(hue_norm(x)))
      } else {
        huedata = fill('cornflowerblue', xdata.length)
      }

      return (
        <>
          <AxisLeftSvg
            ax={yax}
            pos={{ x: margin.left, y: margin.top }}
            tickSize={_displayProps.tickSize}
            //title={y}
          />
          <AxisBottomSvg
            ax={xax}
            pos={{ x: margin.left, y: margin.top + innerHeight }}
            tickSize={_displayProps.tickSize}
            title={x}
          />

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {ydata.map((y, yi) => {
              const y1 = yax.domainToRange(yi + 0.5)
              const x1 = xax.domainToRange(xdata[yi])

              const color = huedata[yi]
              return (
                <rect
                  x={0}
                  y={y1 - 0.5 * barWidth}
                  width={x1}
                  height={barWidth}
                  fill={color}
                  key={yi}
                />
              )
            })}
          </g>

          <g
            transform={`translate(${
              margin.left + innerWidth + _displayProps.padding
            }, ${margin.top})`}
          >
            {addVColorBar({ domain: [0, 10], cmap })}
          </g>
        </>
      )
    }, [df, y, displayProps])

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

    return (
      <svg
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={svgRef}
        width={width * _displayProps.scale}
        height={height * _displayProps.scale}
        viewBox={`0 0 ${width} ${height}`}
        //shapeRendering="crispEdges"
        className="absolute"
      >
        {svg}
      </svg>
    )
  }
)
