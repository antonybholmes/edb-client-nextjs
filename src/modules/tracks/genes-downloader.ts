import { type IDataTrack } from "@interfaces/data-track"

import { type ITranscript } from "@interfaces/transcript"
import { Buffer } from "buffer"

import { range } from "@lib/math/range"
import { GenomicLocation, locWithin } from "../genomic/genomic"
import type { ISetDataFunc } from "./signal-downloader"

//const PAGE_SIZE = 16384
//const PAGE_BUFFER_SIZE = 32
//const PAGE_BUFFER_BYTES = PAGE_BUFFER_SIZE * 4
//const BUFFER_SIZE = 64
const BUFFER_BYTES = 128

const CLOSEST_GENES_N = 11

export function getClosestGeneOffset(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  gbi: Uint32Array,
): number {
  //let response

  //let url = `${GENES_BASE_URL}/${dataSet.genome}/${dataSet.assembly}/${dataSet.track}/${loc.chr}.gbi`

  //console.log(url)

  let offset = 0

  // first 12 bytes are 3 ints representing the magic number, page_size and pages
  // page size is always 16384 (2^14) so we don't need to get that

  try {
    //console.log(url)

    // response = await axios.get(url, {
    //   headers: {
    //     Range: `bytes=0-11`,
    //     "Content-Type": "binary/octet-stream",
    //   },
    //   responseType: "arraybuffer",
    // })

    //const data = response.data
    //let a: any = new Uint32Array(data)
    let magic = gbi[0]
    const page_size = gbi[1]
    const pages = gbi[2]

    let start_page = Math.max(
      0,
      Math.min(pages - 1, Math.floor(loc.start / page_size)),
    )

    //console.log("genes", magic, start_page, page_size, pages)

    // picked something outside of range so give up
    if (start_page >= pages) {
      throw new Error(`${loc} not in range of chromosome.`)
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
    //let start_byte = 12 + start_page * 4

    //console.log("start", start_page)

    // read 32 offsets (128 bytes 32 * 4) at a time for speed
    // response = await axios.get(url, {
    //   headers: {
    //     Range: `bytes=${start_byte}-${start_byte + 3}`,
    //     "Content-Type": "binary/octet-stream",
    //   },
    //   responseType: "arraybuffer",
    // })

    //a = new Uint32Array(response.data)

    offset = gbi[3 + start_page] //a[0]
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

    //console.log("offset", offset)
  } catch (error) {
    console.warn(error)
  }

  return offset
}

export function getTranscriptUsingOffset(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  gb: Buffer,
  offset: number,
): [ITranscript[], number] {
  if (offset === 0) {
    return [[], offset]
  }

  //const url = `${GENES_BASE_URL}/${dataSet.genome}/${dataSet.assembly}/${dataSet.track}/${chr}.gb`

  //let buffer: Buffer

  //let gene: IGene
  //let exon: IExon
  let transcript: ITranscript
  let n: number

  let id: string
  let geneId: string
  let geneSymbol: string
  let start: number
  let end: number

  const ret: ITranscript[] = []

  try {
    // response = await axios.get(url, {
    //   headers: {
    //     Range: `bytes=${offset}-${offset + BUFFER_BYTES}`,
    //     "Content-Type": "binary/octet-stream",
    //   },
    //   responseType: "arraybuffer",
    // })

    let buffer_offset: number = offset

    //const buffer = Buffer.from(gb, offset) //Buffer.from(response.data)

    console.warn("----")

    console.warn("buff", buffer_offset)
    console.warn("===")
    const block_size_bytes = gb.readUInt32LE(buffer_offset)
    buffer_offset += 4
    // console.log(
    //   "buff",
    //   offset,
    //   block_size_bytes,
    //   `bytes=${offset}-${offset + block_size_bytes - 1}`
    // )

    // if (block_size_bytes < BUFFER_BYTES - 4) {
    //   // We have cached what we need so just use the cache as the block buffer
    //   //console.log("in buffer")
    //   buffer_offset = 4
    // } else {
    //   // need a second request to get the data
    //   response = await axios.get(url, {
    //     headers: {
    //       Range: `bytes=${offset + 4}-${offset + 4 + block_size_bytes - 1}`,
    //       "Content-Type": "binary/octet-stream",
    //     },
    //     responseType: "arraybuffer",
    //   })

    //   buffer = Buffer.from(response.data)
    //   buffer_offset = 0
    // }

    const index = gb.readUInt32LE(buffer_offset)
    buffer_offset += 4
    start = gb.readUInt32LE(buffer_offset)
    buffer_offset += 4
    end = gb.readUInt32LE(buffer_offset)
    buffer_offset += 4

    // if not within region, skip

    const strand = gb.readUInt8(buffer_offset) > 0 ? "+" : "-"
    buffer_offset += 1
    n = gb.readUInt8(buffer_offset)
    buffer_offset += 1
    id = n > 0 ? gb.toString("utf8", buffer_offset, buffer_offset + n) : ""
    buffer_offset += n

    n = gb.readUInt8(buffer_offset)
    buffer_offset += 1
    geneId = n > 0 ? gb.toString("utf8", buffer_offset, buffer_offset + n) : ""
    buffer_offset += n

    n = gb.readUInt8(buffer_offset)
    buffer_offset += 1
    geneSymbol =
      n > 0 ? gb.toString("utf8", buffer_offset, buffer_offset + n) : ""
    buffer_offset += n

    console.warn(geneSymbol)

    //gene = { index, name:geneSymbol, id, chr: chr, start, end, strand, transcripts: [] }

    //const tn = gb.readUInt32LE(buffer_offset)
    //buffer_offset += 4
    //console.log(name, tn, gene)

    //range(0, tn).forEach(ti => {
    //  start = gb.readUInt32LE(buffer_offset)
    //  buffer_offset += 4
    //  end = gb.readUInt32LE(buffer_offset)
    //  buffer_offset += 4

    //  n = gb.readUInt32LE(buffer_offset)
    //  buffer_offset += 4
    //  id = n > 0 ? gb.toString("utf8", buffer_offset, buffer_offset + n) : ""
    //  buffer_offset += n
    transcript = {
      index,
      id,
      geneId,
      geneSymbol,
      chr: loc.chr,
      start,
      end,
      strand,
      exons: [],
    }

    const en = gb.readUInt16LE(buffer_offset)
    buffer_offset += 2

    range(0, en).forEach(ei => {
      start = gb.readUInt32LE(buffer_offset)
      buffer_offset += 4
      end = gb.readUInt32LE(buffer_offset)
      buffer_offset += 4

      n = gb.readUInt8(buffer_offset)
      buffer_offset += 1
      id = n > 0 ? gb.toString("utf8", buffer_offset, buffer_offset + n) : ""
      buffer_offset += n

      //if (end >= loc.start && start <= loc.end) {
      transcript.exons.push({ chr: loc.chr, start, end, id, value: 1 })
      //}
    })

    if (transcript.exons.length > 0) {
      ret.push(transcript)
    }
    //})

    //if (gene.transcripts.length > 0) {
    //  ret.push(gene)
    //}

    // skip to next transcript data block
    offset += 4 + block_size_bytes
  } catch (error) {
    console.warn(`getTranscriptUsingOffset:${loc}: ${error}`)
  }

  return [ret, offset]
}

export function downloadGenes(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  gb: Buffer,
  gbi: Uint32Array,
  setData: ISetDataFunc,
): ITranscript[] {
  let offset: number = getClosestGeneOffset(dataSet, loc, gbi)

  //console.log("offset", offset)

  if (offset === 0) {
    return []
  }

  let start = -1

  const ret: ITranscript[] = []

  try {
    while (start < loc.end) {
      const [transcripts, nextOffset] = getTranscriptUsingOffset(
        dataSet,
        loc,
        gb,
        offset,
      )

      if (transcripts.length < 1) {
        throw new Error(`downloadGenes:Gene not found at offset ${offset}`)
      }

      ret.push(transcripts[0])
      start = transcripts[0].start

      offset = nextOffset

      // for testing purposes
      // const closestGenes = await getClosestGenesUsingGeneIndex(
      //   dataSet,
      //   loc.chr,
      //   genes[0].index
      // )
    }
  } catch (error) {
    console.warn(error)
  }

  setData(dataSet, ret)

  return ret
}

export function getWithinTranscripts(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  gb: Buffer,
  gbi: Uint32Array,
): ITranscript[] {
  let offset: number = getClosestGeneOffset(dataSet, loc, gbi)

  if (offset === 0) {
    return []
  }

  let start = -1

  const ret: ITranscript[] = []

  try {
    while (start < loc.end) {
      const [transcripts, nextOffset] = getTranscriptUsingOffset(
        dataSet,
        loc,
        gb,
        offset,
      )

      if (transcripts.length < 1) {
        throw new Error(`Gene not found at offset ${offset}`)
      }

      if (locWithin(transcripts[0], loc)) {
        ret.push(transcripts[0])
      }

      start = transcripts[0].start

      offset = nextOffset

      // for testing purposes
      // const closestGenes = await getClosestGenesUsingGeneIndex(
      //   dataSet,
      //   loc.chr,
      //   genes[0].index
      // )
    }

    //console.log(ret)
  } catch (error) {
    console.warn(`${loc}: ${error}`)
  }

  return ret
}

/**
 * Returns the closest gene to a location. To avoid null checks, the function
 * returns an array containing either 1 item, the closest gene or will be
 * empty to indicate no gene.
 *
 * @param dataSet
 * @param loc
 * @returns
 */
export function getClosestTranscript(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  gb: Buffer,
  gbi: Uint32Array,
): ITranscript[] {
  let offset: number = getClosestGeneOffset(dataSet, loc, gbi)

  //console.log("offset", offset)

  if (offset === 0) {
    return []
  }

  let start = -1

  const ret: ITranscript[] = []

  try {
    const [genes, nextOffset] = getTranscriptUsingOffset(
      dataSet,
      loc,
      gb,
      offset,
    )

    if (genes.length < 1) {
      throw new Error(`Gene not found at offset ${offset}`)
    }

    ret.push(genes[0])
  } catch (error) {
    console.warn(error)
  }

  return ret
}

export function getClosestTranscriptsUsingIndex(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  index: number,
  gb: Buffer,
  gbc: Uint32Array,
  n: number = 5,
): ITranscript[] {
  //const url = `${GENES_BASE_URL}/${dataSet.genome}/${dataSet.assembly}/${dataSet.track}/${chr}.gbc`

  //const offset = 8 + index * CLOSEST_GENES_BYTES

  // first 12 bytes are 3 ints representing the magic number, page_size and pages
  // page size is always 16384 (2^14) so we don't need to get that

  const ret: ITranscript[] = []

  try {
    // console.log(url, index, offset)

    // const response = await axios.get(url, {
    //   headers: {
    //     Range: `bytes=${offset}-${offset + CLOSEST_GENES_BYTES - 1}`,
    //     "Content-Type": "binary/octet-stream",
    //   },
    //   responseType: "arraybuffer",
    // })

    // const data = response.data
    //let a: any = gbc[2 + index] //new Uint32Array(data)

    // magic + number of items plus 1 since nearest is the tail of the block
    // the head is the actual gene we want to find the closest gene of
    // nearest are stored in blocks of 11 32 bit ints, the first is the
    // index of a gene, the next 10 are the indices of the closest 10 genes
    let offset = 3 + index * CLOSEST_GENES_N

    for (let ci = 0; ci < n; ++ci) {
      const [genes, nextOffset] = getTranscriptUsingOffset(
        dataSet,
        loc,
        gb,
        gbc[offset],
      )

      if (genes.length > 0) {
        ret.push(genes[0])
      }

      ++offset
    }
  } catch (error) {
    console.warn(error)
  }

  return ret
}

export function getClosestTranscripts(
  dataSet: IDataTrack,
  loc: GenomicLocation,
  gb: Buffer,
  gbi: Uint32Array,
  gbc: Uint32Array,
  n: number = 5,
): ITranscript[] {
  const closest = getClosestTranscript(dataSet, loc, gb, gbi)

  if (closest.length == 0) {
    return []
  }

  const index = closest[0].index

  //const within = getWithinTranscripts(dataSet, loc, gb, gbi)

  //console.log("within", within)

  const ret: ITranscript[] = getClosestTranscriptsUsingIndex(
    dataSet,
    loc,
    index,
    gb,
    gbc,
    n,
  )

  return ret
}
