import { type IDataTrack } from "@interfaces/data-track"

import { type ITranscript } from "@interfaces/transcript"
import { range } from "@lib/math/range"
import { fetchPostBuffer } from "@lib/urls"
import type { GenomicLocation } from "@modules/genomic/genomic"

const BASE_URL = "https://s3.amazonaws.com/files.rdf-lab.org/edb"
//const platform = "ChIP-seq"
//const dataType = "Signal"
//const genome = "Human"
//const assembly = "GRCh37"
//const sample = "CB4_BCL6_RK040"

const BUFFER_SIZE = 128
const BUFFER_BYTES = BUFFER_SIZE * 12

export type ISetDataFunc = (dataSet: IDataTrack, genes: ITranscript[]) => void

export async function downloadSignal(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  setData: ISetDataFunc,
): Promise<ITranscript[]> {
  let response: ArrayBuffer | null

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

  let url = `${BASE_URL}/${dataSet.platform}/${dataSet.genome}/${dataSet.assembly}/Signal/${dataSet.name}/${dataSet.name}.${loc.chr}.varstep.idx`

  try {
    //console.log(url)
    response = await fetchPostBuffer(url, {
      headers: {
        Range: "bytes=0-11",
        "Content-Type": "binary/octet-stream",
      },
      responseType: "arraybuffer",
    })

    if (!response) {
      return []
    }

    let a = new Uint32Array(response)
    //let magic = a[0]
    const page_size = a[1]
    const pages = a[2]
    const start_page = Math.floor(loc.start / page_size)

    //console.log(magic, start_page, page_size, pages)

    // picked something outside of range so give up
    if (start_page >= pages) {
      return []
    }

    //console.warn(magic)
    //console.warn(page_size)
    //console.warn(start_page, pages, 12 + start_page * 4)

    const startByte = 12 + start_page * 4
    //const end_byte = start_byte + 3;

    response = await fetchPostBuffer(url, {
      headers: {
        Range: `bytes=${startByte}-${startByte + 3}`,
      },
    })

    if (!response) {
      return []
    }

    a = new Uint32Array(response)
    let offset = a[0]

    if (offset === 0) {
      return []
    }

    // while (offset == 0) {
    //   start_byte += 4;
    //   console.warn("skipping", offset, start_byte);
    //   response = await axios.get(url,
    //     {
    //       headers: {
    //         Range: `bytes=${start_byte}-${start_byte + 3}`,
    //         "Content-Type": "binary/octet-stream",
    //       },
    //       responseType: "arraybuffer",
    //     }
    //   );
    //   a = new Uint32Array(response.data);
    //   offset = a[0];
    // }

    url = `${BASE_URL}/${dataSet.platform}/${dataSet.genome}/${dataSet.assembly}/Signal/${dataSet.name}/${dataSet.name}.${loc.chr}.varstep`

    response = await fetchPostBuffer(url, {
      headers: {
        Range: "bytes=0-11",
      },
    })

    if (!response) {
      return []
    }

    a = new Uint32Array(response)
    //magic = a[0]
    //const bin_size = a[1]
    //const n_reads = a[2]
    //const n = a[3]

    //console.log(magic, bin_size, n_reads, n)

    let s = -1
    let e
    let h

    //const read_ahead = 32;
    //const read_ahead_blocks = read_ahead * 3;

    // read ahead 4+4+4 bytes
    //const read_ahead_bytes = read_ahead * 12;

    //console.log(s, loc.start, loc.end)

    while (s < loc.end) {
      response = await fetchPostBuffer(url, {
        headers: {
          Range: `bytes=${offset}-${offset + BUFFER_BYTES - 1}`,
          "Content-Type": "binary/octet-stream",
        },
      })

      if (response) {
        a = new Uint32Array(response)

        range(0, a.length, 3).every(i => {
          s = a[i]
          e = a[i + 1]
          h = a[i + 2]

          if (s >= loc.end) {
            return false
          }

          //console.log(i, s, e, h)

          if (
            (s >= loc.start && s <= loc.end) ||
            (e >= loc.start && e <= loc.end)
          ) {
            //console.log(s, e, e - s + 1, h);

            ret[0].exons.push({
              id: dataSet.name,
              chr: loc.chr,
              start: Math.max(loc.start, s),
              end: Math.min(loc.end, e),
              value: h,
            })
          }

          return true
        })
      }

      offset += BUFFER_BYTES
    }

    //console.log(ret)
  } catch (error) {
    console.warn(error)
  }

  setData(dataSet, ret)

  return ret
}
