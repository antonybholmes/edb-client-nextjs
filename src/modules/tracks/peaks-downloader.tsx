import { type IDataTrack } from "@interfaces/data-track"

import { type ITranscript } from "@interfaces/transcript"

import { fetchPostBuffer } from "@lib/urls"

import { range } from "@lib/math/range"
import type { GenomicLocation } from "@modules/genomic/genomic"
import type { ISetDataFunc } from "./signal-downloader"

//const PAGE_SIZE = 16384
//const PAGE_BUFFER_SIZE = 32
//const PAGE_BUFFER_BYTES = PAGE_BUFFER_SIZE * 4
const BUFFER_SIZE = 64
const BUFFER_BYTES = BUFFER_SIZE * 4

const BASE_URL = "https://files.rdf-lab.org/edb"
//const platform = "ChIP-seq"
//const dataType = "Peak"
//const genome = "Human"
//const assembly = "GRCh37"
//const sample = "Peaks_CB4_BCL6_RK040_vs_Input_RK063_p12"

export async function downloadPeaks(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  setData: ISetDataFunc,
) {
  let response

  let url = `${BASE_URL}/${dataSet.platform}/${dataSet.genome}/${dataSet.assembly}/Peak/${dataSet.name}/${dataSet.name}.${loc.chr}.locstep.idx`

  //console.log(url)

  const ret: ITranscript[] = [
    {
      ...loc,
      index: -1,
      geneId: dataSet.name,
      id: dataSet.name,
      geneSymbol: dataSet.name,
      strand: "+",
      exons: [],
    },
  ]

  // first 12 bytes are 3 ints representing the magic number, page_size and pages
  // page size is always 16384 (2^14) so we don't need to get that

  try {
    //console.log(url)

    response = await fetchPostBuffer(url, {
      headers: {
        Range: `bytes=0-11`,
      },
    })

    if (!response) {
      return []
    }

    let a = new Uint32Array(response)
    //let magic = a[0]
    const page_size = a[1]
    const pages = a[2]
    const startPage = Math.floor(loc.start / page_size)

    // picked something outside of range so give up
    if (startPage >= pages) {
      return []
    }

    //console.warn(magic)

    //const end_byte = start_byte + 3;

    // console.warn(start_page, pages, start_byte)

    // response = await axios.get(url, {
    //   headers: {
    //     Range: `bytes=${start_byte}-${start_byte + 3}`,
    //     "Content-Type": "binary/octet-stream",
    //   },
    //   responseType: "arraybuffer",
    // })

    //a = new Uint32Array(response.data)
    let offset = 0 //a[0]
    const startByte = 12 + startPage * 4

    //while (start_page < pages) {
    console.log("start", startPage)
    // read 32 offsets (128 bytes 32 * 4) at a time for speed
    response = await fetchPostBuffer(url, {
      headers: {
        Range: `bytes=${startByte}-${startByte + 3}`,
      },
    })

    a = new Uint32Array(response.data)

    offset = a[0]
    // console.log('a', a.length)
    // a.every((o: number, index: number) => {
    //   console.log('o', o, index)
    //   if (o > 0) {
    //     console.log('f', o)
    //     offset = o
    //     return false
    //   }

    //   return true
    // })

    //if (offset > 0) {
    //  break
    // }

    //  start_page += PAGE_BUFFER_SIZE
    //  start_byte += PAGE_BUFFER_BYTES
    //}

    console.log("offset", offset)

    if (offset === 0) {
      return []
    }

    url = `${BASE_URL}/${dataSet.platform}/${dataSet.genome}/${dataSet.assembly}/Peak/${dataSet.name}/${dataSet.name}.${loc.chr}.locstep`

    // response = await axios.get(url, {
    //   headers: {
    //     Range: "bytes=0-7",
    //     "Content-Type": "binary/octet-stream",
    //   },
    //   responseType: "arraybuffer",
    // })

    // a = new Uint32Array(response.data)
    // magic = a[0]
    // const n = a[1]

    // console.log(magic, n)

    let s = -1
    let e

    while (s < loc.end) {
      response = await fetchPostBuffer(url, {
        headers: {
          Range: `bytes=${offset}-${offset + BUFFER_BYTES - 1}`,
        },
      })

      if (!response) {
        return []
      }

      a = new Uint32Array(response)

      range(0, a.length, 2).every(i => {
        s = a[i]

        if (s >= loc.end) {
          return false
        }

        e = a[i + 1]

        if (
          (s >= loc.start && s <= loc.end) ||
          (e >= loc.start && e <= loc.end)
        ) {
          ret[0].exons.push({
            id: dataSet.name,
            chr: loc.chr,
            start: Math.max(loc.start, s),
            end: Math.min(loc.end, e),
            value: 1,
          })
        }

        return true
      })

      offset += BUFFER_BYTES
    }
  } catch (error) {
    console.warn(error)
  }

  setData(dataSet, ret)

  return ret
}
