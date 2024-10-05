import { BaseDataFrame } from "@lib/dataframe/base-dataframe"
import { cellNum, cellStr } from "@lib/dataframe/cell"

import { range } from "@lib/math/range"
import { formatChr } from "./dna"

export class GenomicLocation {
  private _chr: string
  private _start: number
  private _end: number

  constructor(chr: string | number, start: number, end: number) {
    this._chr = formatChr(chr)
    this._start = start
    this._end = end
  }

  get chr(): string {
    return this._chr
  }

  get start(): number {
    return this._start
  }

  get end(): number {
    return this._end
  }

  /**
   * Returns a string representation of the location
   * in the form chr:start-end
   */
  get loc() {
    return `${this.chr}:${this.start}-${this.end}`
  }

  toString() {
    return this.loc
  }

  toJson() {
    return { chr: this._chr, start: this._start, end: this._end }
  }
}

export interface ILocationFile {
  fid: string
  locations: GenomicLocation[]
}

export function locStr(loc: GenomicLocation): string {
  return `${loc.chr}:${loc.start}-${loc.end}`
}

export function isLocation(location: string): boolean {
  return /(chr.+):(\d+)-(\d+)/.test(location)
}

export function isChr(location: string): boolean {
  return /chr.+/.test(location)
}

// export class Location {
//   _chr: string
//   _start: number
//   _end: number
//   _length: number

//   constructor(chr: string, start: number, end: number) {
//     this._chr = chr
//     this._start = Math.max(1, start)
//     this._end = Math.max(start, end)
//     this._length = this._end - this._start + 1
//   }

//   get chr() {
//     return this._chr
//   }

//   get start() {
//     return this._start
//   }

//   get end() {
//     return this._end
//   }

//   get length() {
//     return this._length
//   }

//   toString() {
//     return locationString(this._chr, this._start, this._end)
//   }

//   equals(l: Location): boolean {
//     return this.chr === l.chr && this.start === l.start && this.end === l.end
//   }
// }

//export const NULL_LOCATION: Location = new Location("chr-", -1, -1)
const LOC_REGEX = /(chr.+)-(\d+)-(\d+)/

export function parseLocation(
  location: string,
  padding5p: number = 0,
  padding3p: number = 0,
): GenomicLocation {
  const matcher = location
    .replaceAll(",", "")
    .replaceAll(":", "-")
    .match(LOC_REGEX)

  if (!matcher) {
    throw new Error("invalid location")
  }

  const chr = matcher[1]
  const start = parseInt(matcher[2])
  const end = parseInt(matcher[3])

  return new GenomicLocation(chr, start - padding5p, end + padding3p)
}

export function overlapFraction(
  location1: GenomicLocation | undefined,
  location2: GenomicLocation | undefined,
): number {
  if (!location1 || !location2) {
    return 0
  }

  if (location1.chr !== location2.chr) {
    return 0
  }

  const maxStart = Math.max(location1.start, location2.start)
  const minEnd = Math.min(location1.end, location2.end)

  if (minEnd < maxStart) {
    return 0
  }

  return (minEnd - maxStart + 1) / (location2.end - location2.start + 1)
}

/**
 * Parse a genomic location.
 *
 * @param loc a string of the form chr:100-1000
 * @returns a location object if the string is parsable, null otherwise
 */
export function parseLoc(loc: string): GenomicLocation | null {
  const tokens = loc.trim().replace(":", "-").split("-")

  if (tokens.length < 3 || !isChr(tokens[0])) {
    return null
  }

  const start = parseInt(tokens[1].replaceAll(/,/g, ""), 10)

  if (isNaN(start)) {
    return null
  }

  const end = parseInt(tokens[2].replaceAll(/,/g, ""), 10)

  if (isNaN(end)) {
    return null
  }

  return new GenomicLocation(tokens[0], start, end)
}

export function parseLocations(lines: string[]): GenomicLocation[] {
  const ret: GenomicLocation[] = []
  let location: GenomicLocation

  lines.forEach((line: string) => {
    const tokens = line.trim().split("\t")

    if (isLocation(tokens[0])) {
      location = parseLocation(tokens[0])!
    } else if (isChr(tokens[0])) {
      location = new GenomicLocation(
        tokens[0],
        parseInt(tokens[1].replaceAll(/,/g, "")),
        parseInt(tokens[2].replaceAll(/,/g, "")),
      )
    } else {
      return
    }

    ret.push(location)
  })

  return ret
}

export function convertDFToILocationFile(df: BaseDataFrame): ILocationFile {
  let location: GenomicLocation

  const ret: { fid: string; locations: GenomicLocation[] } = {
    fid: df.name,
    locations: [],
  }

  df.values.forEach(row => {
    const c1 = cellStr(row[0])
    if (isLocation(c1)) {
      location = parseLocation(c1)!
    } else if (isChr(c1)) {
      location = new GenomicLocation(c1, cellNum(row[1]), cellNum(row[2]))
    } else {
      return
    }

    ret.locations.push(location)
  })

  //const uid = getUid(fid, location)

  // range(colStart, tokens.length).forEach(col => {
  // 	extData.get(uid)?.set(col, tokens[ext_col_indexes[col]])
  // })

  return ret
}

/**
 * Returns true if loc1 is within loc2.
 *
 * @param loc1
 * @param loc2
 */
export function locWithin(loc1: GenomicLocation, loc2: GenomicLocation) {
  if (loc1.chr !== loc2.chr) {
    return false
  }

  return loc1.end >= loc2.start && loc1.start <= loc2.end
}

export function overlaps(
  loc1: GenomicLocation | undefined,
  loc2: GenomicLocation | undefined,
): GenomicLocation | null {
  if (loc1 === undefined || loc2 === undefined) {
    return null
  }

  if (loc1.chr != loc2.chr) {
    return null
  }

  const max_start = Math.max(loc1.start, loc2.start)
  const min_end = Math.min(loc1.end, loc2.end)

  if (min_end < max_start) {
    return null
  }

  return new GenomicLocation(loc1.chr, max_start, min_end)
}

export function locWidth(loc: GenomicLocation) {
  return loc.end - loc.start + 1
}

export class LocationBinMap {
  private _binSize: number
  private _binMap: Map<String, Map<number, GenomicLocation[]>>

  constructor(locations: GenomicLocation[], binSize: number = 1000) {
    this._binSize = binSize
    this._binMap = new Map<String, Map<number, GenomicLocation[]>>()

    locations.forEach(location => {
      const s = Math.floor(location.start / binSize)
      const e = Math.floor(location.end / binSize)

      if (!this._binMap.has(location.chr)) {
        this._binMap.set(location.chr, new Map<number, GenomicLocation[]>())
      }

      range(s, e + 1).forEach(b => {
        //console.log(location, s, e)
        if (!this._binMap.get(location.chr)?.has(b)) {
          this._binMap.get(location.chr)?.set(b, [])
        }

        this._binMap.get(location.chr)?.get(b)?.push(location)
      })
    })
  }

  /**
   * Returns genomic locations overlapping the search location
   *
   * @param location location to search for
   * @returns
   */
  search(location: GenomicLocation): GenomicLocation[] {
    const ret: GenomicLocation[] = []

    if (this._binMap.has(location.chr)) {
      const s = Math.floor(location.start / this._binSize)
      const e = Math.floor(location.end / this._binSize)

      range(s, e + 1).forEach(b => {
        if (this._binMap.get(location.chr)?.has(s)) {
          this._binMap
            .get(location.chr)
            ?.get(s)
            ?.forEach(l => {
              if (overlaps(location, l)) {
                ret.push(l)
              }
            })
        }
      })
    }

    return ret
  }
}
