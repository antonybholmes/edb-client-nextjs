import { DefaultMap } from "@lib/default-map"
import { NA } from "@lib/text/text"

import { BaseDataFrame } from "@lib/dataframe/base-dataframe"
import { type SeriesType } from "@lib/dataframe/base-series"
import { cellStr, makeCell, makeCells } from "@lib/dataframe/cell"
import { DataFrame } from "@lib/dataframe/dataframe"

import { range } from "@lib/math/range"
import {
  GenomicLocation,
  convertDFToILocationFile,
  locStr,
  overlapFraction,
  overlaps,
  parseLocation,
} from "./genomic"

export const BIN_SIZE = 1000

function makeUid(sid: string, loc: GenomicLocation | null) {
  return `${sid}=${loc ? locStr(loc) : "none"}`
}

function parseUid(uid: string): string[] {
  return uid.split("=")
}

function getTestUids(
  uid1: string,
  loc1: GenomicLocation,
  binToUidsMap: Map<number, Set<string>>,
): Set<string> {
  const testLocations = new Set<string>()

  const binStart = Math.floor(loc1.start / BIN_SIZE)
  const binEnd = Math.floor(loc1.end / BIN_SIZE)

  range(binStart, binEnd + 1).forEach(bin => {
    binToUidsMap.get(bin)?.forEach(uid => {
      //const [sid2, l2] = parseUid(uid)
      if (uid !== uid1) {
        // only test samples from other file
        testLocations.add(uid)
      }
    })
  })

  return testLocations
}

/**
 * Calculates the maximum overlaps between a set of sample locations
 *
 * @param sampleIdMap
 * @param uidToLocMap
 * @param binToUidsMap
 * @param list
 * @param param4
 */
function _mcr(
  uids: string[],
  uidToLocMap: Map<string, GenomicLocation>,
  binToUidsMap: Map<number, Set<string>>,
): Map<string, Map<string, string>> {
  // lets see what overlaps

  const locationCoreMap = new DefaultMap<string, Map<string, string>>(
    () => new Map<string, string>(),
  )

  // debug for testing to end remove as it truncates list
  // locations = locations[1:(len(locations) / 4)]

  //console.warn(`Processing ${uids.length}...`)

  let loc1: GenomicLocation | undefined
  let loc2: GenomicLocation | undefined

  let overlapLocation: string

  // keep track of all locations that have been allocated at least once
  const allocated = new Set<string>()

  //test all locations in first sample
  uids.forEach((uid1: string) => {
    // of the form id=chrN:start-end, an lid

    if (allocated.has(uid1)) {
      return
    }

    const [sid1] = parseUid(uid1)

    // get its location
    loc1 = uidToLocMap.get(uid1)

    if (!loc1) {
      return
    }

    //group1 = location_group_map[uid1]

    const testUids = getTestUids(uid1, loc1, binToUidsMap)

    const used = new Set<string>()

    // Form the largest group of overlapping peaks
    let exhausted = false

    while (!exhausted) {
      const groupedLocations = [uid1]

      // reset for each group search
      loc1 = uidToLocMap.get(uid1)

      if (!loc1) {
        return
      }

      testUids.forEach(uid2 => {
        if (used.has(uid2)) {
          return
        }

        loc2 = uidToLocMap.get(uid2)

        const overlap = overlaps(loc1, loc2)

        if (overlap !== null) {
          loc1 = overlap
          groupedLocations.push(uid2)
        }
      })

      // now we have a list of all locations that overlap each other

      // if we have a group of entries, merge them, otherwise if the
      // location is by itself, only add it if it has not been allocated
      // to another group. This prevents duplicate entries of the whole
      // region by itself plus any overlapping regions
      if (groupedLocations.length > 1) {
        overlapLocation = loc1.toString() // f'{chr1}:{start1}-{end1}'

        groupedLocations.forEach(uid => {
          // sid is a sample id
          const [sid] = parseUid(uid)

          if (sid) {
            // .add(location)
            locationCoreMap.get(overlapLocation)?.set(sid, uid)

            used.add(uid)
            allocated.add(uid)
          }
        })
      } else {
        if (!allocated.has(uid1)) {
          locationCoreMap.get(overlapLocation)?.set(sid1, uid1)
          allocated.add(uid1)
        }

        // no more to add so quit looping
        exhausted = true
        break
      }
    }
  })

  // after iterating over everything, group locations by group

  return locationCoreMap
}

export function overlappingPeaks(
  fids: { fid: string; locations: GenomicLocation[] }[],
): [Map<string, Map<string, string>>, Map<string, GenomicLocation>] {
  const sampleIdMap = new Map<string, string>()
  const uidToLocMap = new Map<string, GenomicLocation>()
  const binToUidsMap = new Map<number, Set<string>>()
  const uids: string[] = []

  fids.forEach(entry => {
    const { fid, locations } = entry

    locations.forEach((location: GenomicLocation) => {
      const uid = makeUid(fid, location)

      uids.push(uid)

      // mapping from location id to sample id
      sampleIdMap.set(uid, fid)

      uidToLocMap.set(uid, location)

      const binStart = Math.floor(location.start / BIN_SIZE)
      const binEnd = Math.floor(location.end / BIN_SIZE)

      range(binStart, binEnd + 1).forEach(bin => {
        if (!binToUidsMap.has(bin)) {
          binToUidsMap.set(bin, new Set<string>())
        }

        binToUidsMap.get(bin)?.add(uid)
      })
    })
  })

  const locationCoreMap = _mcr(uids, uidToLocMap, binToUidsMap) //[fid[0] for fid in fids])

  return [locationCoreMap, uidToLocMap]
}

export function createOverlapTable(dataFrames: BaseDataFrame[]): DataFrame {
  const locationDFs = dataFrames.map(df => convertDFToILocationFile(df))

  const [locationCoreMap, locationMap] = overlappingPeaks(locationDFs)

  const fids = locationDFs.map(file => file.fid)

  const header: string[] = ["Genomic Location", "Width"]

  //for sid in sids:
  //	header.extend([f'{sid} {c}' for c in ext_cols])

  header.push("# Overlapping Peaks")

  header.push(...fids.map(fid => `Sample ${fid}`))
  header.push(...fids.map(fid => `Peak ${fid}`))
  header.push(...fids.map(fid => `Overlap % ${fid}`))

  header.push("Region")

  const data: SeriesType[][] = []

  Array.from(locationCoreMap.keys())
    .sort()
    .forEach(coreLocation => {
      const overlapLocation = parseLocation(coreLocation)!

      const overlap = overlapLocation.end - overlapLocation.start + 1

      const c = locationCoreMap.get(coreLocation)?.size || 0

      const row: SeriesType[] = makeCells(coreLocation, overlap)

      // for sid in sids:
      // 	if sid in locationCoreMap[coreLocation]:
      // 		# for location in locationCoreMap[coreLocation][id]:
      // 		uid = locationCoreMap[coreLocation][sid]
      // 		row.extend([str(ext_data[uid][col]) for col in ext_cols])
      // 	else:
      // 		row.extend([text.NA] * len(ext_cols))

      // 	# row.extend([str(ext_data[lid][col]) for col in ext_cols])

      // # add count/number of cols we appear in
      row.push(makeCell(c))

      //place ids in table
      fids.forEach(fid => {
        row.push(makeCell(locationCoreMap.get(coreLocation)?.get(fid) || NA))
      })

      const locs: GenomicLocation[] = []

      fids.forEach(fid => {
        const uid = locationCoreMap.get(coreLocation)?.get(fid) || NA
        const loc1 = locationMap.get(uid)

        if (loc1) {
          locs.push(loc1)
          row.push(makeCell(loc1.toString()))
        } else {
          row.push(makeCell(NA))
        }
      })

      // % overlap

      fids.forEach(fid => {
        const uid = locationCoreMap.get(coreLocation)?.get(fid) || NA
        const loc1 = locationMap.get(uid)

        if (loc1) {
          const of = overlapFraction(overlapLocation, loc1)

          row.push(makeCell(Math.min(100, Math.max(0, of * 100)).toFixed(2)))
        } else {
          row.push(makeCell(0))
        }
      })

      //find the spanning region of the two peaks
      // i.e. min start, max end
      const start = Math.min(...locs.map(loc => loc.start)) //[loc.start for loc in locs])
      const end = Math.max(...locs.map(loc => loc.end))

      const region = new GenomicLocation(locs[0].chr, start, end)

      row.push(makeCell(region.loc))

      data.push(row)
    })

  return new DataFrame({ data, columns: header })
}

export function createOverlapFile(files: BaseDataFrame[]): string {
  const df = createOverlapTable(files)

  return df.values
    .map(row => row.map(cell => cellStr(cell)).join("\t"))
    .join("\n")
}
