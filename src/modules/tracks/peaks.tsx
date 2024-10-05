import { type ITranscript } from "@interfaces/transcript"
import * as d3 from "d3"
import { useEffect, useRef } from "react"
import { PADDING, type IBaseSvgProps } from "./genes"

//const PAGE_SIZE = 16384O
//const PAGE_BUFFER_SIZE = 32
//const PAGE_BUFFER_BYTES = PAGE_BUFFER_SIZE * 4
const BUFFER_SIZE = 64

// const BASE_URL = "https://s3.amazonaws.com/files.rdf-lab.org/edb"
// const platform = "ChIP-seq"
// //const dataType = "Peak"
// const genome = "Human"
// const assembly = "GRCh37"
// const sample = "Peaks_CB4_BCL6_RK040_vs_Input_RK063_p12"

export interface ISvgProps extends IBaseSvgProps {
  data?: ITranscript[]
}

export function Peaks({
  plot,
  data,
  loc,
  y = 0,
  h = 20,
  w = 750,
  padding = PADDING,
}: ISvgProps) {
  const ref = useRef(null)

  // function componentDidMount() {
  //   drawChart();
  // }

  // first 12 bytes are 3 ints representing the magic number, page_size and pages
  // page size is always 16384 (2^14) so we don't need to get that
  useEffect(() => {
    if (!data || data.length == 0) {
      return
    }

    const xscl = d3
      .scaleLinear()
      .domain([loc.start, loc.end]) // This is what is written on the Axis: from 0 to 100
      .range([padding.left, w - padding.right])

    // var yscl = d3
    //   .scaleLinear()
    //   .domain([0, 50]) // This is what is written on the Axis: from 0 to 100
    //   .range([150, 50])

    const svg = d3.select(ref.current)

    svg.selectAll("*").remove()

    svg
      .selectAll("rect")
      .data(data[0].exons)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xscl(d.start))
      .attr("y", (d, i) => y)
      .attr("width", (d, i) => Math.max(1, xscl(d.end) - xscl(d.start)))
      .attr("height", (d, i) => h)
      .attr("fill", "green")
  }, [data, y, h])

  return <g ref={ref} />
}
