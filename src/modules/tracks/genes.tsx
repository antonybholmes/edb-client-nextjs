import { type IDataTrack } from "@interfaces/data-track"
import { type IGene } from "@interfaces/gene"

import { type ITranscript } from "@interfaces/transcript"
import { GenomicLocation } from "@modules/genomic/genomic"
import * as d3 from "d3"
import { useEffect, useRef } from "react"

//const PAGE_SIZE = 16384
//const PAGE_BUFFER_SIZE = 32
//const PAGE_BUFFER_BYTES = PAGE_BUFFER_SIZE * 4
//const BUFFER_SIZE = 64
const BUFFER_BYTES = 128

//const dataType = "Peak"
const genome = "Human"
const assembly = "GRCh37"
const track = "UCSC"

export interface IBaseSvgProps {
  plot: IDataTrack
  loc: GenomicLocation
  y?: number
  h?: number
  w?: number
  padding?: { top: number; bottom: number; left: number; right: number }
}

export interface ISvgProps extends IBaseSvgProps {
  data?: IGene[]
}

export const PADDING = { top: 10, bottom: 10, left: 50, right: 200 }

interface IProps extends ISvgProps {
  bh?: number
  gap?: number
}

export function Genes({
  plot,
  data,
  loc,
  y = 0,
  h = 20,
  w = 750,
  padding = PADDING,
  bh = 20,
  gap = 5,
}: IProps) {
  const bhg = bh + gap

  const ref = useRef(null)

  // useEffect(() => {
  //   // if (svgRef.current) {
  //   //   drawChart();
  //   // }

  //   loadData()
  // }, [])

  useEffect(() => {
    if (!data || data.length == 0) {
      return
    }

    var xscl = d3
      .scaleLinear()
      .domain([loc.start, loc.end]) // This is what is written on the Axis: from 0 to 100
      .range([padding.left, w - padding.right])

    // var yscl = d3
    //   .scaleLinear()
    //   .domain([0, 50]) // This is what is written on the Axis: from 0 to 100
    //   .range([150, 50])

    let layer = 0
    const plotData: any[] = []
    const lineData: any[] = []
    const labelData: any[] = []

    data.forEach((gene, gi) => {
      gene.transcripts.forEach((transcript: ITranscript, ti: number) => {
        lineData.push([
          [transcript.start, layer, gene.strand === "+"],
          [transcript.end, layer, gene.strand === "+"],
        ])

        labelData.push([gene.name, transcript.id, layer])

        plotData.push(
          ...transcript.exons
            .filter(exon => exon.end >= loc.start && exon.start <= loc.end)
            .map((exon, ei) => [
              exon.start,
              exon.end,
              layer,
              gene.strand,
              (gene.strand === "+" && ei === 0) ||
                (gene.strand === "-" && ei === transcript.exons.length - 1),
            ]),
        )

        ++layer
      })
    })

    let line = d3
      .line()
      .x(function (d) {
        return Math.max(xscl(loc.start), Math.min(xscl(loc.end), xscl(d[0])))
      })
      .y(function (d) {
        return y + d[1] * bhg + 0.5 * bh
      })

    const svg = d3.select(ref.current)

    svg.selectAll("*").remove()

    svg
      .selectAll("path")
      .data(lineData)
      .enter()
      .append("path")
      .attr("d", (d, i) => line(d))
      .attr("stroke", "black")

    line = d3
      .line()
      .x(function (d) {
        return d[0]
      })
      .y(function (d) {
        return d[1]
      })

    lineData.forEach(l => {
      const g = svg.append("g")

      let y1 = y + l[0][1] * bhg + 0.5 * bh
      let y2 = y1 + 3
      let y3 = y1 - 3

      let start = Math.floor(xscl(l[0][0]) / 10) * 10 + 10
      let end = xscl(l[1][0])

      let arrowData: [number, number][][] = []

      while (start < end) {
        arrowData.push([
          [start + (l[0][2] ? -3 : 3), y3],
          [start, y1],
          [start + (l[0][2] ? -3 : 3), y2],
        ])

        start += 10

        //break
      }

      g.selectAll("path")
        .data(arrowData)
        .enter()
        .append("path")
        .attr("d", (d, i) => line(d))
        .attr("stroke", "black")
        .attr("fill", "none")
    })

    svg
      .selectAll("rect")
      .data(plotData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xscl(d[0]))
      .attr("y", (d, i) => y + d[2] * bhg)
      .attr("width", (d, i) => Math.max(1, xscl(d[1]) - xscl(d[0])))
      .attr("height", (d, i) => bh)
      .attr("fill", (d, i) => (d[4] ? "red" : "blue"))

    svg
      .selectAll("text")
      .data(labelData)
      .enter()
      .append("text")
      .text((d, i) => `${d[0]} ${d[1] !== "" ? `(${d[1]})` : ""}`)
      .attr("x", w - padding.right + 10)
      .attr("y", (d, i) => y + d[2] * bhg + 0.5 * bh)
      .attr("alignment-baseline", "middle")
      .attr("class", "text-xs")
  }, [data, y, h])

  return <g ref={ref} />
}
