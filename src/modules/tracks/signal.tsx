import * as d3 from "d3"
import { useEffect, useRef, useState } from "react"
import { PADDING, type ISvgProps } from "./genes"

//const platform = "ChIP-seq"
//const dataType = "Signal"
//const genome = "Human"
//const assembly = "GRCh37"
//const sample = "CB4_BCL6_RK040"

export function Signal({
  data,
  loc,
  y = 0,
  w = 750,
  h = 100,
  padding = PADDING,
}: ISvgProps) {
  const ref = useRef(null)
  const dataRef = useRef(null)
  const [drag, setDrag] = useState(false)

  // function componentDidMount() {
  //   drawChart();
  // }

  useEffect(() => {
    if (!data || data.length == 0) {
      return
    }

    //const data = [12, 5, 6, 6, 9, 10];

    var xscl = d3
      .scaleLinear()
      .domain([loc.start, loc.end]) // This is what is written on the Axis: from 0 to 100
      .range([padding.left, w - padding.right])

    var yscl = d3
      .scaleLinear()
      .domain([0, 60]) // This is what is written on the Axis: from 0 to 100
      .range([h - padding.top, padding.bottom])

    var xy = [[loc.start, 0]] // start empty, add each element one at a time
    for (var i = 0; i < data[0].transcripts[0].exons.length; i++) {
      xy.push([
        (data[0].transcripts[0].exons[i].start +
          data[0].transcripts[0].exons[i].end) /
          2,
        data[0].transcripts[0].exons[i].value,
      ])
    }

    xy.push([loc.end, 0])

    var line = d3
      .line()
      .x(function (d) {
        return xscl(d[0])
      })
      .y(function (d) {
        return yscl(d[1])
      })
      .curve(d3.curveBasis)

    // d3.select(dataRef.current)
    //   .selectAll("rect")
    //   .data(data)
    //   .enter()
    //   .append("rect")
    //   .attr("x", (d, i) => xscl(d[0]))
    //   .attr("y", (d, i) => yscl(d[2]))
    //   .attr("width", (d, i) => xscl(d[1]) - xscl(d[0]))
    //   .attr("height", (d, i) => 150 - yscl(d[2]))
    //   .attr("fill", "green")

    // svg
    //   .selectAll("text")
    //   .data(data)
    //   .enter()
    //   .append("text")
    //   .text((d) => d[0])
    //   .attr("x", (d, i) => xscl(d[0]))
    //   .attr("y", (d, i) => 550 - yscl(d[2]));

    const svg = d3.select(ref.current)

    svg.selectAll("*").remove()

    svg
      .append("path")
      .data([xy])
      //@ts-ignore
      .attr("d", line)
      .attr("stroke", "black")
      .attr("fill", "red")

    // svg
    //   .append("g")
    //   .attr("transform", "translate(0,150)") // This controls the vertical position of the Axis
    //   .call(d3.axisBottom(xscl))

    svg
      .append("g")
      .attr("transform", `translate(${padding.left}, 0)`) // This controls the vertical position of the Axis
      .call(d3.axisLeft(yscl).ticks(3))
  }, [data, y, h])

  return (
    <g
      ref={ref}
      // onMouseDown={handleDragStart}
      // onMouseMove={handleDrag}
      // onMouseUp={handleDragEnd}
    >
      <g ref={dataRef} />
    </g>
  )
}
