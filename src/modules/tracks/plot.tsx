import { GENES_BASE_URL } from "@consts"
import { type IDataTrack } from "@interfaces/data-track"
import { type ILocation } from "@interfaces/location"
import { fetchPostBuffer } from "@lib/urls"
import * as d3 from "d3"
import { useEffect, useReducer, useRef, useState, type MouseEvent } from "react"
import { Genes, PADDING } from "./genes"
import { downloadGenes } from "./genes-downloader"
import { Peaks } from "./peaks"
import { downloadPeaks } from "./peaks-downloader"
import { Signal } from "./signal"
import { downloadSignal } from "./signal-downloader"
import { XAxis } from "./xaxis"

///const genome = "Human"
//const assembly = "GRCh38"
const chr = "chr3"
const start = 187342350
const end = 187466698

interface IProps {
  w?: number
}

export function Plot({ w = 900 }: IProps) {
  const svgRef = useRef(null)
  const [loc] = useState<ILocation>({ chr, start, end })
  const [h, setH] = useState(800)
  const [, setDragPlot] = useState<unknown[]>([])

  const [plots] = useState<IDataTrack[]>([
    // {
    //   name: "CB4_BCL6_RK040",
    //   platform: "ChIP-seq",
    //   genome: "Human",
    //   assembly: "GRCh37",
    //   dataType: "Peak",
    // },
    {
      name: "Peaks_CB4_BCL6_RK040_vs_Input_RK063_p12",
      platform: "ChIP-seq",
      dataType: "Peak",
      genome: "Human",
      assembly: "GRCh37",
    },
    // {
    //   name: "UCSC Genes GRCh37",
    //   platform: "Gene",
    //   genome: "Human",
    //   assembly: "GRCh37",
    //   track: "UCSC",
    //   dataType: "Peak",
    // },
    {
      name: "YAxis",
      platform: "YAxis",
      dataType: "YAxis",
      genome: "",
      assembly: "",
    },
  ])

  function setData(plot: IDataTrack, data: any[]) {
    dataSetsDispatch({ type: "add", plot, data })

    //setDatasets(dataSets => {return { ...dataSets, [plot.name]: data }})
  }

  function dataSetReducer(
    state: any,
    action: { type: string; plot: any; data: any },
  ) {
    const plot = action.plot
    const data = action.data

    switch (action.type) {
      case "add":
        return { ...state, [plot.name]: data }
      default:
        return state
    }
  }

  const [dataSets, dataSetsDispatch] = useReducer(dataSetReducer, {})

  function plotLayoutReducer(
    state: any,
    action: { type: string; plot: any; y: number; h: number },
  ) {
    switch (action.type) {
      case "add":
        return { ...state, [action.plot.name]: { y: action.y, h: action.h } }
      default:
        return state
    }
  }

  const [plotLayout, plotLayoutDispatch] = useReducer(plotLayoutReducer, {})

  const [svgs, setSvgs] = useState<any[]>([])

  useEffect(() => {
    drawChart()
  }, [])

  useEffect(() => {
    //const ret = []

    async function fetchData() {
      for (let pi = 0; pi < plots.length; ++pi) {
        const plot = plots[pi]
        switch (plots[pi].dataType) {
          case "Signal":
            downloadSignal(plot, loc, setData)
            break
          case "Peak":
            downloadPeaks(plot, loc, setData)
            break
          case "Gene":
            // eslint-disable-next-line no-case-declarations
            let url = `${GENES_BASE_URL}/${plot.genome}/${plot.assembly}/${plot.name}/${loc.chr}.gb`
            // eslint-disable-next-line no-case-declarations
            let response = await fetchPostBuffer(url)

            // eslint-disable-next-line no-case-declarations
            if (response) {
              const gb = Buffer.from(response)

              url = `${GENES_BASE_URL}/${plot.genome}/${plot.assembly}/${plot.name}/${loc.chr}.gbi`
              response = await fetchPostBuffer(url)

              if (response) {
                const gbi: Uint32Array = new Uint32Array(response)

                downloadGenes(plot, loc, gb, gbi, setData)
              }
            }
            break
          default:
            // do nothing
            break
        }
      }
    }

    fetchData()
  }, [loc])

  useEffect(() => {
    let y = 0

    plots.forEach(plot => {
      const data = dataSets[plot.name]

      //console.log("dd", plot.dataType, y)

      switch (plot.dataType) {
        case "Signal":
          plotLayoutDispatch({ type: "add", plot, y, h: 100 })
          if (data) {
            y += 100
          }

          break
        case "Peak":
          plotLayoutDispatch({ type: "add", plot, y, h: 20 })

          if (data) {
            y += 50
          }

          break
        case "Gene":
          // eslint-disable-next-line no-case-declarations
          let h = 0

          if (data) {
            data.forEach((gene: { transcripts: unknown[] }) => {
              h += gene.transcripts.length * 25
            })
          }

          plotLayoutDispatch({ type: "add", plot, y, h })

          y += h

          break

        case "YAxis":
          plotLayoutDispatch({ type: "add", plot, y, h: 50 })

          y += 50

          break
        default:
          break
      }
    })

    setH(y)
  }, [plots, dataSets])

  useEffect(() => {
    const ret: unknown[] = []

    plots.forEach(plot => {
      const data = dataSets[plot.name]
      const yPos = plotLayout[plot.name]

      switch (plot.dataType) {
        case "Signal":
          if (data && yPos) {
            ret.push(
              <Signal
                key={ret.length}
                plot={plot}
                data={data}
                y={yPos.y}
                h={yPos.h}
                w={w}
                loc={loc}
                padding={PADDING}
              />,
            )
          }

          break
        case "Peak":
          if (data && yPos) {
            ret.push(
              <Peaks
                key={ret.length}
                plot={plot}
                data={data}
                y={yPos.y}
                h={yPos.h}
                w={w}
                loc={loc}
                padding={PADDING}
              />,
            )
          }

          break
        case "Gene":
          if (data && yPos) {
            ret.push(
              <Genes
                key={ret.length}
                plot={plot}
                data={data}
                y={yPos.y}
                h={yPos.h}
                w={w}
                loc={loc}
                padding={PADDING}
              />,
            )
          }

          break

        case "YAxis":
          if (yPos) {
            ret.push(
              <XAxis
                key={ret.length}
                plot={plot}
                y={yPos.y}
                h={yPos.h}
                w={w}
                loc={loc}
                padding={PADDING}
              />,
            )
          }

          break
        default:
          break
      }
    })

    setSvgs(ret)
  }, [plotLayout])

  function download() {
    //get svg element.
    const svg = svgRef.current //d3.select("svg") //document.getElementById("svg");

    if (svg) {
      //get svg source.
      let source = new XMLSerializer().serializeToString(svg)

      //add name spaces.
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"',
        )
      }
      if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
        )
      }

      //add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source

      const url = window.URL.createObjectURL(
        new Blob([source], { type: "image/svg+xml" }),
      ) //["data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)]));
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `chart.svg`)
      document.body.appendChild(link)
      link.click()
    }

    // Clean up and remove the link
    //link.parentNode.removeChild(link)
  }

  function drawChart() {
    //const data = [12, 5, 6, 6, 9, 10];

    const svg = d3.select("svg") //.attr("width", 700).attr("height", 300);

    svg.selectAll("*").remove()

    // svg
    //   .append("g")
    //   .attr("transform", "translate(50,0)") // This controls the vertical position of the Axis
    //   .call(d3.axisLeft(yscl))
  }

  function onMouseDown(e: MouseEvent) {
    let y1 = 0
    let y2 = 0

    plots.every(plot => {
      const yPos = plotLayout[plot.name]

      if (yPos) {
        y1 = yPos.y
        y2 = y1 + yPos.h
      }

      if (e.nativeEvent.offsetY >= y1 && e.nativeEvent.offsetY <= y2) {
        setDragPlot([plot, e.nativeEvent.offsetY])
        return false
      }

      y1 = y2

      return true
    })
  }

  function onMouseUp() {
    setDragPlot([])
  }

  function onMouseMove() {}

  return (
    <>
      <div>{svgs.length}</div>
      <svg
        ref={svgRef}
        width={w}
        height={h}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {/* <Signal loc={loc}/>
       <Peaks y={200} loc={loc}/> */}
        {/* <Genes y={400} loc={loc} /> */}

        {svgs}
      </svg>
      <button onClick={download}>download</button>
    </>
  )
}
