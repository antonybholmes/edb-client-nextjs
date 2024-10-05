import { forwardRef, useMemo } from 'react'

import { type IElementProps } from '@interfaces/element-props'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { findCol, getNumCol } from '@lib/dataframe/dataframe-utils'

import { IndexType } from '@lib/dataframe/dataframe-types'
import { range } from '@lib/math/range'
import { Axis, YAxis, type ILim, type TickLabel } from './axis'
import { AxisBottomSvg, AxisLeftSvg } from './axis-svg'

const margin = { top: 100, right: 100, bottom: 100, left: 100 }

export interface IDisplayAxis {
  domain: ILim
  range: ILim
  ticks: number[] | null
  tickLabels: string[] | null
}

export interface IScatterProps {
  axes: {
    xaxis: {
      domain: ILim
      range: ILim
      ticks: number[]
      tickLabels: TickLabel[]
      tickSize: number
      strokeWidth: number
      color: string
    }
    yaxis: {
      domain: ILim
      range: ILim
      ticks: number[]
      tickLabels: TickLabel[]
      tickSize: number
      strokeWidth: number
      color: string
    }
  }

  padding: number

  cmap: ColorMap
  scale: number

  dots: {
    color: string
    size: number
    opacity: number
  }

  labels: {
    color: string
    offset: number
    line: {
      color: string
      opacity: number
    }
    values: string[]
  }
}

export const DEFAULT_SCATTER_PROPS: IScatterProps = {
  axes: {
    xaxis: {
      domain: [-20, 20],
      range: [0, 500],
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      strokeWidth: 2,
      color: 'black',
    },
    yaxis: {
      domain: [0, 10],
      range: [0, 400],
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      strokeWidth: 2,
      color: 'black',
    },
  },
  padding: 10,
  dots: {
    size: 3,
    color: '#d9d9d9',
    opacity: 0.75,
  },
  cmap: BWR_CMAP,
  scale: 1,
  labels: {
    color: 'black',
    offset: 15,
    line: {
      color: 'black',
      opacity: 0.25,
    },
    values: [''],
  },
}

export function makeDefaultScatterProps(xlim: ILim, ylim: ILim): IScatterProps {
  let props: IScatterProps = { ...DEFAULT_SCATTER_PROPS }

  props = {
    ...props,
    axes: {
      ...props.axes,
      xaxis: {
        ...props.axes.xaxis,
        domain: xlim,
      },
      yaxis: {
        ...props.axes.yaxis,
        domain: ylim,
      },
    },
  }

  return props
}

interface IProps extends IElementProps {
  df: BaseDataFrame
  x: string
  y?: string
  hue?: string
  size?: string
  sizeFunc?: (x: number) => number
  displayProps?: IScatterProps
  cmap?: ColorMap
}

export const ScatterPlotSvg = forwardRef<SVGElement, IProps>(
  function ScatterPlotSvg(
    {
      df,
      x,
      y,
      hue,
      size,
      cmap = BWR_CMAP,
      displayProps,
      sizeFunc = (x: number) => x,
    }: IProps,
    svgRef
  ) {
    const _displayProps: IScatterProps = {
      ...DEFAULT_SCATTER_PROPS,
      ...displayProps,
    }

    const svg = useMemo(() => {
      if (!df) {
        return null
      }

      console.log(df.colNames, x)

      const xdata = getNumCol(df, findCol(df, x))

      const ydata = y ? getNumCol(df, findCol(df, y)) : range(0, df.shape[0])

      // give y a default name
      if (!y) {
        y = df.getColName(0)
      }

      const huedata = hue ? getNumCol(df, findCol(df, hue)) : []
      const sizedata = size ? getNumCol(df, findCol(df, size)) : []

      const xax = new Axis()
        //.autoDomain([Math.min(...xdata), Math.max(...xdata)])
        .setDomain(_displayProps.axes.xaxis.domain)
        .setRange(_displayProps.axes.xaxis.range)

      const yax = new YAxis()
        //.autoDomain([Math.min(...ydata), Math.max(...ydata)])
        .setDomain(_displayProps.axes.yaxis.domain)
        .setRange(_displayProps.axes.yaxis.range)

      const innerWidth = xax.range[1]
      const innerHeight = yax.range[1]
      const width = innerWidth + margin.left + margin.right
      const height = innerHeight + margin.top + margin.bottom

      // matching is case insensitive
      const labelSet = new Set<string>(
        _displayProps.labels.values.map(x => x.toLowerCase())
      )
      const labelIdx = df.index.values
        .map((v, vi) => [v, vi] as [IndexType, number])
        .filter(v => labelSet.has(v[0].toString().toLowerCase()))
        .map(v => v[1])

      return (
        <svg
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          fontFamily="Arial, Helvetica, sans-serif"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ref={svgRef}
          width={width} //* _displayProps.scale}
          height={height} //* _displayProps.scale}
          viewBox={`0 0 ${width} ${height}`}
          //shapeRendering="crispEdges"
          className="absolute"
        >
          <AxisLeftSvg
            ax={yax}
            pos={{ x: margin.left, y: margin.top }}
            tickSize={_displayProps.axes.yaxis.tickSize}
            title={y}
          />
          <AxisBottomSvg
            ax={xax}
            pos={{ x: margin.left, y: margin.top + innerHeight }}
            tickSize={_displayProps.axes.xaxis.tickSize}
            title={x}
          />

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {xdata.map((x, xi) => {
              const x1 = xax!.domainToRange(x)
              const y1 = yax!.domainToRange(ydata[xi])
              const r =
                sizedata.length > 0
                  ? sizeFunc(sizedata[xi])
                  : _displayProps.dots.size
              const color = huedata.length > 0 ? cmap.get(huedata[xi]) : 'black'
              return <circle cx={x1} cy={y1} r={r} fill={color} key={xi} />
            })}
          </g>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {labelIdx.map(i => {
              const x1 = xax!.domainToRange(xdata[i])
              const y1 = yax!.domainToRange(ydata[i])

              return (
                <text x={x1} y={y1} key={i}>
                  {df.index.get(i).toString()}
                </text>
              )
            })}
          </g>
        </svg>
      )
    }, [df, y, displayProps, sizeFunc])

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

    return <>{svg}</>
  }
)
