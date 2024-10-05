import type { BaseDataFrame } from "@lib/dataframe/base-dataframe"

import { DataFrame } from "@lib/dataframe/dataframe"
import { findCol } from "@lib/dataframe/dataframe-utils"
import { API_DNA_URL } from "@modules/edb"

import type { SeriesType } from "@lib/dataframe/dataframe-types"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { GenomicLocation } from "./genomic"

export const CHR_INDEX_MAP: { [key: string]: number } = {
  chr1: 1,
  chr2: 2,
  chr3: 3,
  chr4: 4,
  chr5: 5,
  chr6: 6,
  chr7: 7,
  chr8: 8,
  chr9: 9,
  chr10: 10,
  chr11: 11,
  chr12: 12,
  chr13: 13,
  chr14: 14,
  chr15: 15,
  chr16: 16,
  chr17: 17,
  chr18: 18,
  chr19: 19,
  chr20: 20,
  chr21: 21,
  chr22: 22,
  chrX: 23,
  chrY: 24,
  chrM: 25,
  chrMT: 25,
}

/**
 * Format chr so it is in the form 'chrx'.
 *
 * @param chr
 * @returns
 */
export function formatChr(chr: string | number): string {
  chr = chr.toString()

  if (!chr.startsWith("chr")) {
    chr = `chr${chr}`
  }

  return chr
}

export function humanChrToNum(chr: string): number {
  if (chr in CHR_INDEX_MAP) {
    return CHR_INDEX_MAP[chr]
  }

  return 1000
}

export interface IDNA {
  location: GenomicLocation
  seq: string
  //rev: boolean
  //comp: boolean
}

export type FORMAT_TYPE = "Auto" | "Lower" | "Upper"

interface IDNAOptions {
  assembly?: string
  format?: FORMAT_TYPE
  mask?: "" | "lower" | "n"
  reverse?: boolean
  complement?: boolean
}

export async function createDNATable(
  df: BaseDataFrame,
  params: IDNAOptions = {},
): Promise<BaseDataFrame | null> {
  const queryClient = useQueryClient()

  const { assembly, format, mask, reverse, complement } = {
    assembly: "grch38",
    format: "Auto",
    mask: "",
    reverse: false,
    complement: false,
    ...params,
  }

  const locCol = findCol(df, "location")

  if (locCol === -1) {
    return null
  }

  //let assemblyCol = findCol(df, "assembly")

  //if (assemblyCol === -1) {
  //  assemblyCol = findCol(df, "genome")
  //}

  const header: string[] = df.colNames.concat(["DNA"])

  const locs: string[] = df.col(locCol).strs

  //.map(v => parseLocation(v.toString()))
  //.map(v => v!.toJson())

  //const a = assemblyCol !== -1 ? df.get(0, assemblyCol).toString() : assembly

  try {
    const res = await queryClient.fetchQuery({
      queryKey: ["dna"],
      queryFn: () => {
        const params = new URLSearchParams([
          ["format", format.toLowerCase()],
          ["mask", mask],
          ["rev", reverse.toString()],
          ["comp", complement.toString()],
        ])

        return axios.post(
          `${API_DNA_URL}/${assembly}?${params}`,
          {
            locations: locs,
          },
          {
            headers: {
              //Authorization: bearerTokenHeader(token),
              "Content-Type": "application/json",
            },
          },
        )
      },
    })

    const data = res.data.data

    //console.log(data)

    const table: SeriesType[][] = []

    for (const [ri, row] of df.values.entries()) {
      table.push(row.concat([data.seqs[ri].seq]))
    }

    return new DataFrame({ data: table, columns: header })

    //data.push(row.concat([dj.data.dna]))
  } catch (error) {
    //data.push(row.concat([""]))
  }

  return null
}

export async function fetchDNA(
  location: GenomicLocation,
  params: IDNAOptions = {},
): Promise<IDNA> {
  const queryClient = useQueryClient()

  const { assembly, format, mask, reverse, compliment } = {
    assembly: "grch38",
    format: "Auto",
    mask: "",
    reverse: false,
    compliment: false,
    ...params,
  }

  const dna: IDNA = {
    location,
    seq: "",
  }

  try {
    const res = await queryClient.fetchQuery({
      queryKey: ["dna"],
      queryFn: () => {
        const params = new URLSearchParams([
          ["format", format],
          ["mask", mask],
          ["rev", reverse.toString()],
          ["comp", compliment.toString()],
        ])

        //console.log({ locations: [location.toString()] })

        return axios.post(
          `${API_DNA_URL}/${assembly}?${params}`,
          { locations: [location.toString()] },
          {
            headers: {
              //Authorization: bearerTokenHeader(token),
              "Content-Type": "application/json",
            },
          },
        )
      },
    })

    const data = res.data.data

    //console.log(data)

    return {
      location,
      seq: data.seqs[0].seq,
      //rev: data.isRev,
      //comp: data.isComp,
    }
  } catch (error) {
    console.log(error)
  }

  return dna
}

export function dnaToJson(seqs: IDNA[]): string {
  return JSON.stringify(
    seqs.map(seq => ({
      chr: seq.location.chr,
      start: seq.location.start,
      end: seq.location.end,
      dna: seq.seq,
      //rev: seq.rev,
      //comp: seq.comp,
    })),
  )
}
