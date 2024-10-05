import { TEXT_OPEN_FILE } from '@consts'
import { argSort } from '@lib/math/argsort'

import { ZScore } from '@lib/math/zscore'

import { mean } from '@lib/math/mean'
import { median } from '@lib/math/median'
import { range } from '@lib/math/range'
import { std } from '@lib/math/stats'
import { BaseDataFrame, type SheetId } from './base-dataframe'

import { download } from '@lib/download-utils'
import type { RefObject } from 'react'
import { cellNum, cellStr } from './cell'
import { DataIndex } from './data-index'
import { DataFrame } from './dataframe'
import type { IndexType, SeriesType } from './dataframe-types'
import { DataFrameWriter, type IDataFrameWriterOpts } from './dataframe-writer'

// export const TEST_DATAFRAME: DataFrame = {
//   name: "",
//   rowIndex: [],
//   colIndex: [],
//   data: range(0, 50).map(r =>
//     range(0, 20).map(c => `${r}:${c} Lorem ipsum dolor sit amet`)
//   ),
// }

export type AxisDim = 0 | 1

export interface ILineFile {
  fid: string
  lines: string[]
}

// export class TableCell {
//   #value: number
//   #text: string
//   #type: number

//   constructor(
//     value: number = 0,
//     text: string = "",
//     type: number = TABLE_CELL_TYPE_NUM
//   ) {
//     this.#value = value
//     this.#text = text
//     this.#type = type
//   }

//   getNum(): number {
//     return this.#value
//   }

//   getStr(): string {
//     return this.#text
//   }

//   getType(): number {
//     return this.#type
//   }

//   toString(): string {
//     switch (this.#type) {
//       case TABLE_CELL_TYPE_NUM:
//         return this.#value.toString()
//       default:
//         return this.#text
//     }
//   }

//   static makeNumCell(v: number): TableCell {
//     return new TableCell(v)
//   }

//   static makeTextCell(text: string): TableCell {
//     return new TableCell(NaN, text, TABLE_CELL_TYPE_STR)
//   }

//   static makeCell(arg: any): TableCell {
//     const v = parseFloat(arg.toString())
//     if (!isNaN(v)) {
//       return TableCell.makeNumCell(v)
//     }
//     return TableCell.makeTextCell(arg.toString())
//   }

//   static makeCells(...args: any[]): TableCell[] {
//     return args.map(arg => TableCell.makeCell(arg))
//   }
// }

// export function makeNumCell(v: number): ITableCell {
//   return { num: v, str: "", type: TABLE_CELL_TYPE_NUM } //new TableCell(v)
// }

// export function makeTextCell(text: string): ITableCell {
//   return { num: NaN, str: text, type: TABLE_CELL_TYPE_STR } //new TableCell(NaN, text, TABLE_CELL_TYPE_STR)
// }

// export function toNumeric(files: ILineFile[],): IDataFrame[] {
//   const ret: IDataFrame[] = []

//   files.forEach(file => {
//     const { fid, lines } = file

//     const tokens = lines[0].trim().split("\t")
//     const rowName = tokens[0]
//     const hasColNames: string[] = tokens.slice(1)
//     const hasRowIndex: string[] = []

//     const data: number[][] = []

//     lines.slice(1).forEach((line: string) => {
//       const tokens = line.trim().split("\t")

//       if (tokens.length > 0) {
//         hasRowIndex.push(tokens[0])

//         if (tokens.length > 1) {
//           data.push(tokens.slice(1).map(token => parseFloat(token)))
//         }
//       }
//     })

//     ret.push({ fid, hasColNames, rowName, hasRowIndex, data })

//     //const uid = getUid(fid, location)

//     // range(colStart, tokens.length).forEach(col => {
//     // 	extData.get(uid)?.set(col, tokens[ext_col_indexes[col]])
//     // })
//   })

//   return ret
// }

// export function createEmptyDataFrame(
//   size: [number, number] = [0, 0]
// ): IDataFrame {
//   return {
//     colIndex: makeEmptyIndex(),
//     rowIndex: makeEmptyIndex(),
//     data: Array(size[0])
//       .fill(undefined)
//       .map(entry => Array(size[1])),
//   }
// }

// export function setCol(
//   df: IDataFrame,
//   id: number | string,
//   data: IDataFrameCell[]
// ) {
//   const col = findCol(df, id)
//   const s = df.shape

//   if (col === -1 || col >= s[1]) {
//     // add mode if we can't find the column
//     // or it exceeds the current matrix dimensions

//     if (!isStr(id)) {
//       // if the id is a number, create a default
//       // column name
//       id = `Column ${s[1] + 1}`
//     }

//     df.colIndex[0].ids.push(id)

//     // if there are more col indexes, fill with blanks
//     df.colIndex.slice(1).forEach(idx => {
//       idx.ids.push("")
//     })

//     if (s[0] === 0) {
//       // table empty so just add data as is
//       df.data = data.map(v => [v])
//     } else {
//       // add data based on existing rows
//       df.data.forEach((row, ri) => {
//         row.push(data[ri])
//       })
//     }
//   } else {
//     // update

//     df.data.forEach((row, ri) => {
//       row[col] = data[ri]
//     })
//   }
// }

export type IApplyFunc = (x: number) => number

// export function apply(df: BaseDataFrame, f: IApplyFunc): BaseDataFrame {
//   //const data = df.data.map(row => (<number[]>row).map(cell => f(cell)))

//   const ret = new DataFrame({ name: df.name })

//   range(0, df.shape[1]).forEach(col => {
//     const c = df.col(col)

//     const d = new DataSeries(
//       (c.values as number[]).map(cell => f(cell)),
//       { name: c.name },
//     )

//     ret.setCol(d)
//   })

//   return ret.setIndex(df.index)
// }

export function add(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(x => (x as number) + a)
}

// export function colNames(df: IDataFrame): string[] {
//   return df.colIndex[0].ids.map(v => v.toString())
// }

// export function col(
//   df: IDataFrame,
//   col: number | string
// ): IDataFrame | null {
//   const _col: number = findCol(df, col)

//   return {
//     ...df,
//     colIndex: filterIndex(df.colIndex, [_col]),
//     data: getColValues(df, _col).map(v => [v]),
//   }
// }

// /**
//  * Get a column as a list.
//  *
//  * @param df
//  * @param col
//  * @returns
//  */
// export function getColValues(
//   df: IDataFrame,
//   col: number | string = 0
// ): IDataFrameCell[] {
//   const _col: number = findCol(df, col)

//   if (_col === -1) {
//     return []
//   }

//   return df.data.map(row => row[_col])
// }

export function getNumCol(df: BaseDataFrame, col: IndexType = 0): number[] {
  const c = df.col(col)
  return c ? c.values.map((v: SeriesType) => cellNum(v)) : []
}

export function getStrCol(df: BaseDataFrame, col = 0): string[] {
  const c = df.col(col)
  return c ? c.values.map((v: SeriesType) => cellStr(v)) : []
}

export function getNumRow(df: BaseDataFrame, row: number = 0): number[] {
  return df.cols.map(col => cellNum(col.get(row)))
}

/**
 * Return the indices of non NA values
 * @param data
 * @returns
 */
export function filterNA(data: SeriesType[]): number[] {
  return data
    .map((v, vi) => [v, vi] as [SeriesType, number])
    .filter(v => typeof v[0] !== 'number' || !isNaN(v[0] as number))
    .map(v => v[1])
}

export function subset(data: SeriesType[], idx: number[]): SeriesType[] {
  return idx.map(i => data[i])
}

export function zip(...cols: SeriesType[][]): SeriesType[][] {
  const colIdx = range(0, cols.length)

  return range(0, cols[0].length).map(i => colIdx.map(j => cols[j][i]))
}

/**
 * Returns the indices of an array that would make it sorted.
 *
 * @param data an array to sort
 * @returns The indices of the array to make it sorted
 */

export function rowSums(df: BaseDataFrame): number[] {
  return df.rowMap((row: SeriesType[]) =>
    row.reduce((a: number, b: SeriesType) => a + (b as number), 0)
  )

  // return range(0, df.shape[0]).map(row =>
  //   df.cols.map(col => cellNum(col.get(row))).reduce((a, b) => a + b),
  // )
}

export function rowDiv(df: BaseDataFrame, values: number[]): BaseDataFrame {
  const data = df.map(
    (v: SeriesType, row: number) => (v as number) / values[row]
  )

  return new DataFrame({
    name: df.name,
    data,
    columns: df.columns,
    index: df.index,
  })
}

export function colSums(df: BaseDataFrame): number[] {
  return df.cols.map(col =>
    col.values.map(v => cellNum(v)).reduce((a, b) => a + b)
  )
}

// /**
//  *
//  * @param index an index to filter
//  * @param idx the rows or columns to extract
//  * @returns
//  */
// export function filterIndex(
//   index: Series[],
//   indices: number[]
// ): Series[] {
//   return index.map(idx => ({
//     name: idx.name,
//     ids: _boundIdx(indices, idx.ids).map(ri => idx.ids[ri]),
//   }))
// }

// export function filterRows(df: BaseDataFrame, idx: number[]): DataFrame {
//   return new DataFrame({
//     data: idx.map(i => df.values[i]),
//     name: df.name,
//     columns: df.columns,
//   })
// }

// export function filterCols(df: BaseDataFrame, idx: number[]): DataFrame {
//   return new DataFrame({
//     data: df.values.map(row => idx.map(i => row[i])),
//     name: df.name,
//     columns: df.columns.filter(idx),
//   })
// }

// export function sliceRows(
//   df: DataFrame,
//   start: number = 0,
//   end: number = 100,
// ): BaseDataFrame {
//   return filterRows(df, range(start, end))
// }

// export function filterCols(df: BaseDataFrame, idx: number[]): BaseDataFrame {
//   idx = _boundIdx(idx, df.shape[1])

//   return DataFrame.fromSeries(
//     idx
//       .map(i => df.col(i))
//       .filter(x => x)
//       .map(x => x as BaseSeries),
//   )
//     .setName(df.name)
//     .setIndex(df.index)
// }

// /**
//  * Slice columns out of data files.
//  *
//  * @param files
//  * @param cols
//  * @returns
//  */
// export function sliceCols(
//   df: BaseDataFrame,
//   start = 0,
//   end = 100,
// ): BaseDataFrame {
//   return filterCols(df, range(start, end))
// }

export function rowIdxMap(
  df: BaseDataFrame,
  lowercase: boolean = false
): { [key: string]: number } {
  const ret: { [key: string]: number } = {}

  df.index?.values.map((rowId, rowi) => {
    if (rowId) {
      const s = rowId.toString()
      ret[lowercase ? s.toLowerCase() : s] = rowi
    }
  })

  return ret
}

interface IMatchOptions {
  caseSensitive?: boolean
  entireCell?: boolean
  keepOrder?: boolean
}

const DEFAULT_MATCH_OPTIONS = {
  caseSensitive: false,
  entireCell: false,
  keepOrder: false,
}

export function filterColsById(
  df: BaseDataFrame,
  ids: string[],
  options: IMatchOptions
): BaseDataFrame {
  const { caseSensitive, entireCell, keepOrder } = {
    ...DEFAULT_MATCH_OPTIONS,
    ...options,
  }

  let idx: number[] = []

  if (keepOrder) {
    const colMap = Object.fromEntries(
      df.colNames.map((v, i) => [
        caseSensitive ? v.toString() : v.toString().toLowerCase(),
        i,
      ])
    )

    idx = ids
      .map(id => {
        const lid = caseSensitive ? id : id.toLowerCase()

        if (lid in colMap) {
          return colMap[lid]
        } else {
          return -1
        }
      })
      .filter(x => x !== -1)
  } else {
    const lids = Array.from(ids).map(id =>
      caseSensitive ? id : id.toLowerCase()
    )

    if (entireCell) {
      idx = range(0, df.shape[1]).filter(i => {
        const n = caseSensitive
          ? df.getColName(i)
          : df.getColName(i).toLowerCase()
        return lids.includes(n) // lids.has(df.index.get(i).toString().toLowerCase())
      })
    } else {
      idx = range(0, df.shape[1]).filter(i => {
        const n = caseSensitive
          ? df.columns.get(i).toString()
          : df.columns.get(i).toString().toLowerCase()
        return lids.filter(id => n.includes(id)).length > 0 // lids.has(df.index.get(i).toString().toLowerCase())
      })
    }
  }

  return df.iloc(':', idx)
}

export function filterRowsById(
  df: BaseDataFrame,
  ids: string[],
  options: IMatchOptions
): BaseDataFrame {
  const { caseSensitive, entireCell, keepOrder } = {
    ...DEFAULT_MATCH_OPTIONS,
    ...options,
  }

  let idx: number[] = []

  if (keepOrder) {
    const rowMap = Object.fromEntries(
      df.index.map((v, i) => [
        caseSensitive ? v.toString() : v.toString().toLowerCase(),
        i,
      ])
    )

    idx = ids
      .map(id => {
        const lid = caseSensitive ? id : id.toLowerCase()

        if (lid in rowMap) {
          return rowMap[lid]
        } else {
          return -1
        }
      })
      .filter(x => x !== -1)
  } else {
    const lids = Array.from(ids).map(id =>
      caseSensitive ? id : id.toLowerCase()
    )
    if (entireCell) {
      idx = range(0, df.shape[0]).filter(i => {
        const n = caseSensitive
          ? df.index.get(i).toString()
          : df.index.get(i).toString().toLowerCase()
        return lids.includes(n) // lids.has(df.index.get(i).toString().toLowerCase())
      })
    } else {
      idx = range(0, df.shape[0]).filter(i => {
        const n = caseSensitive
          ? df.index.get(i).toString()
          : df.index.get(i).toString().toLowerCase()
        return lids.filter(id => n.includes(id)).length > 0 // lids.has(df.index.get(i).toString().toLowerCase())
      })
    }
  }

  return df.iloc(idx, ':')
}

export function findCols(df: BaseDataFrame, id: string): number[] {
  const s: string = id.toLowerCase()
  return df.colNames
    .map((c, ci) => (c && c.toLowerCase().includes(s) ? ci : -1))
    .filter(x => x !== -1)
}

export function findCol(df: BaseDataFrame, ids: SheetId | SheetId[]): number {
  if (Number.isInteger(ids)) {
    return ids as number
  }

  if (!Array.isArray(ids)) {
    ids = [ids]
  }

  const ret: number[] = []

  for (const id of ids) {
    const idx = findCols(df, id.toString())

    if (idx.length > 0) {
      ret.push(idx[0])
      break
    }
  }

  if (ret.length > 0) {
    return ret[0]
  }

  return -1
}

// /**
//  * Returns the size of the data frame.
//  * @param df a dataframe
//  * @returns the dimensions (rowsxcols) of the dataframe.
//  */
// export function getShape(df: IDataFrame): [number, number] {
//   return [df.data.length, df.data.length > 0 ? df.data[0].length : 0]
// }

export function getFormattedShape(df: BaseDataFrame | null): string {
  if (!df) {
    return ''
  }

  const s = df.shape
  return `${s[0].toLocaleString()} rows x ${s[1].toLocaleString()} cols`
}

// export function getSize(df: IDataFrame): number {
//   return df.data.length * (df.data.length > 0 ? df.data[0].length : 0)
// }

export function rowJoinDataFrames(dataFrames: DataFrame[]): DataFrame {
  const countMap: { [key: string]: number } = {}

  dataFrames.forEach(df => {
    const cols = range(0, df.shape[1])

    cols.forEach(c => {
      const id = df.getColName(c)
      countMap[id] = (countMap[id] ?? 0) + 1
    })
  })

  const ids = new Set(
    Object.entries(countMap)
      .filter(entry => entry[1] === dataFrames.length)
      .map(entry => entry[0])
  )

  // get the ids in order from first table
  const orderedIds = dataFrames[0].colNames.filter(c => ids.has(c))

  // sort other tables using these ids
  dataFrames = dataFrames.map(df => {
    const indexMap = Object.fromEntries(
      df.colNames.map((colId, ci) => [colId, ci])
    )

    const indices = orderedIds.map(id => indexMap[id])

    return df.iloc(':', indices) as DataFrame
  })

  return new DataFrame({
    data: dataFrames.map(df => df._data).flat(),
    columns: dataFrames[0].columns,
    index: new DataIndex(dataFrames.map(df => df._index.values).flat()),
  })
}

export function colJoinDataFrames(dataFrames: DataFrame[]): DataFrame {
  const countMap: { [key: string]: number } = {}

  dataFrames.forEach(df => {
    df.rowNames.forEach(id => {
      countMap[id] = (countMap[id] || 0) + 1
    })
  })

  const ids = new Set(
    Object.entries(countMap)
      .filter(entry => entry[1] === dataFrames.length)
      .map(entry => entry[0])
  )

  // get the ids in order from first table
  const orderedIds = dataFrames[0].rowNames.filter(rowId => ids.has(rowId))

  // sort other tables using these ids
  dataFrames = dataFrames.map(df => {
    const indexMap = Object.fromEntries(
      df.rowNames.map((rowId, rowi) => [rowId, rowi])
    )

    const indices = orderedIds.map(id => indexMap[id])

    return df.iloc(indices, ':') as DataFrame //filterRows(df, indices)
  })

  return new DataFrame({
    data: range(0, dataFrames[0].shape[0]).map(r =>
      dataFrames.map(df => df._data[r]).flat()
    ),
    index: dataFrames[0].index,
    columns: new DataIndex(dataFrames.map(df => df.colNames).flat()),
  })
}

export function joinDataFrames(
  df: DataFrame[],
  axis: AxisDim = 0
): BaseDataFrame {
  if (axis === 0) {
    return rowJoinDataFrames(df)
  } else {
    return colJoinDataFrames(df)
  }
}

export function log2(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(v => Math.log2((v as number) + a))
}

export function log10(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(v => Math.log10((v as number) + a))
}

export function log(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(v => Math.log((v as number) + a))
}

export function ln(df: BaseDataFrame, a = 0): BaseDataFrame {
  return log(df, a)
}

export function rowStdev(df: BaseDataFrame): number[] {
  return df.rowMap(row => std(row as number[]))
}

export function rowMean(df: BaseDataFrame): number[] {
  return df.rowMap(row => mean(row as number[]))
}

export function rowMedian(df: BaseDataFrame): number[] {
  return df.rowMap(row => median(row as number[])[0])
}

/**
 * Returns the column means for a dataframe.
 *
 * @param df a table to process
 * @returns
 */
export function colMean(df: BaseDataFrame): number[] {
  return df.colMap(col => mean(col as number[]))
}

export function stdevFilter(df: BaseDataFrame, top = 1000) {
  const sd = rowStdev(df)

  // order from greatest std to smallest
  const idx = argSort(sd).toReversed()

  // pick the top
  const topIdx = idx.slice(0, top)

  // return a filtered matrix
  return df
    .iloc(topIdx, ':')
    .setName(`Filter rows using stdev, top ${top}`, true)
}

export function meanFilter(df: BaseDataFrame, top = 1000) {
  const sd = rowMean(df)

  // order from greatest std to smallest
  const idx = argSort(sd).toReversed()

  // pick the top
  const topIdx = idx.slice(0, top)

  // return a filtered matrix
  return df
    .iloc(topIdx, ':')
    .setName(`Filter rows using mean, top ${top}`, true)
}

export function medianFilter(df: BaseDataFrame, top = 1000) {
  const sd = rowMedian(df)

  // order from greatest std to smallest
  const idx = argSort(sd).toReversed()

  // pick the top
  const topIdx = idx.slice(0, top)

  // return a filtered matrix
  return df
    .iloc(topIdx, ':')
    .setName(`Filter rows using median, top ${top}`, true)
}

export function rowZScore(df: BaseDataFrame): BaseDataFrame {
  const z = df.values.map(row => new ZScore().fitTransform(row as number[]))

  return new DataFrame({
    name: 'z-score',
    data: z,
    columns: df.columns,
    index: df.index,
  })
}

export function colZScore(df: BaseDataFrame): BaseDataFrame {
  // do not generate a new motif for the second transpose since
  // me made a clone for the first
  return rowZScore(df.t()).t()
}

export function makeGCT(df: BaseDataFrame): BaseDataFrame {
  const s = df.shape

  const l1 = new Array(s[1] + 2).fill('')
  l1[0] = '#1.2'
  const l2 = new Array(s[1] + 2).fill('')
  l2[0] = s[0].toString()
  l2[1] = s[1].toString()

  const l3 = ['Name', 'Description'].concat(df.colNames)

  const d: SeriesType[][] = df.rowMap((row: SeriesType[], index: number) => {
    const n = df.index.get(index) as SeriesType
    return [n, n].concat(row)
  })

  // const d = df.values.map((r, ri) => {
  //   const n = df.index.get(ri)

  //   return [n, n].concat(r as )
  // })

  return new DataFrame({
    name: 'GCT',
    data: [l1, l2, l3].concat(d),
  })
}

export function getDataFrameInfo(df: BaseDataFrame | null): string {
  return df !== null ? getFormattedShape(df) : TEXT_OPEN_FILE
}

export interface ID3Item {
  cell: [number, number]
  group: string
  variable: string
  value: number
}

/**
 * Convert dataframe to a d3 structure.
 *
 * @param df  a dataframe
 * @returns   data as an array of maps suitable for d3
 */
export function dataframeToD3(df: BaseDataFrame): ID3Item[] {
  const groups = df.colNames
  const variables = df.rowNames

  return df.values
    .map((row, ri) =>
      row.map((value, ci) => ({
        cell: [ri, ci] as [number, number],
        group: groups[ci],
        variable: variables[ri],
        value: value as number,
      }))
    )
    .flat()
}

interface IDownloadOptions extends IDataFrameWriterOpts {
  file?: string
}

export function downloadDataFrame(
  df: BaseDataFrame | null | undefined,
  downloadRef: RefObject<HTMLAnchorElement>,
  options: IDownloadOptions = {}
) {
  if (!df) {
    return
  }

  const { file, sep, hasHeader, hasIndex } = {
    file: 'table.txt',
    sep: '\t',
    hasHeader: true,
    hasIndex: true,
    ...options,
  }

  const f = new DataFrameWriter({ sep, hasHeader, hasIndex }).toString(df)

  if (!f) {
    return
  }

  download(f, downloadRef, file)
}
