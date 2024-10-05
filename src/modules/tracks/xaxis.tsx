import * as d3 from "d3"
import { useEffect, useRef } from "react"
import { PADDING, type ISvgProps } from "./genes"

//const platform = "ChIP-seq"
//const dataType = "Signal"
//const genome = "Human"
//const assembly = "GRCh37"
//const sample = "CB4_BCL6_RK040"

export function XAxis({
  loc,
  y = 0,
  h = 200,
  w = 750,
  padding = PADDING,
}: ISvgProps) {
  const ref = useRef(null)

  useEffect(() => {
    const xscl = d3
      .scaleLinear()
      .domain([loc.start, loc.end]) // This is what is written on the Axis: from 0 to 100
      .range([padding.left, w - padding.right])

    const svg = d3.select(ref.current)

    svg.selectAll("*").remove()

    svg
      .append("g")
      .attr("transform", `translate(0,${y})`) // This controls the vertical position of the Axis
      .call(d3.axisBottom(xscl).ticks(2))
  }, [y, h, loc, padding])

  return <g ref={ref} />
}
