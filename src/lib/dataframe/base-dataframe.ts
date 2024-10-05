/* eslint-disable @typescript-eslint/no-unused-vars */

import { range } from "@lib/math/range"

import { EMPTY_SERIES, type BaseSeries } from "./base-series"
import { cellStr } from "./cell"
import type { IndexType, SeriesType, Shape } from "./dataframe-types"
import { EXCEL_INDEX, Index, NUM_INDEX, type IndexFromType } from "./index"

export const DEFAULT_INDEX_NAME = "id"
// The default name of a sheet and useful for checking if
// table has been properly initialized with real data
export const DEFAULT_SHEET_NAME = "Sheet 1"

// For specifying a location in the dataframe
export type LocType = string | number | (number | string)[]

export type SheetId = string | number

export const NO_SHAPE: Shape = [-1, -1]

export class BaseDataFrame {
  protected _name: string

  constructor(name: string = "") {
    this._name = name
  }

  get name(): string {
    return this._name
  }

  setName(name: string, inplace: boolean = true): BaseDataFrame {
    return this
  }

  /**
   * Return a transpose of the matrix
   */
  t(): BaseDataFrame {
    return this
  }

  copy(): BaseDataFrame {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // addRow(col: BaseSeries): BaseDataFrame {
  //   return this
  // }

  // addCol(data: BaseSeries): BaseDataFrame {
  //   return this.setCol(-1, data)
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  col(col: IndexType): BaseSeries {
    return EMPTY_SERIES
  }

  setCol(col: IndexType = -1, data: BaseSeries | SeriesType[]): BaseDataFrame {
    return this
  }

  get(row: number, col: number): SeriesType {
    return NaN
  }

  get values(): SeriesType[][] {
    return []
  }

  row(row: IndexType): BaseSeries {
    return EMPTY_SERIES
  }

  setRow(
    row: IndexType = -1,
    data: BaseSeries | SeriesType[],
    inplace = true,
  ): BaseDataFrame {
    return this
  }

  set(row: number, col: number, v: SeriesType): BaseDataFrame {
    return this
  }

  setIndex(index: IndexFromType, inplace: boolean = false): BaseDataFrame {
    return this
  }

  // setCols(columns: IndexFromType): BaseDataFrame {
  //   return this
  // }

  get index(): Index {
    return NUM_INDEX
  }

  getRowName(index: number): string {
    return cellStr(this.index.get(index))
  }

  get rowNames(): string[] {
    return range(0, this.shape[0]).map(c => this.getRowName(c))
  }

  get cols(): BaseSeries[] {
    return []
  }

  get columns(): Index {
    return EXCEL_INDEX
  }

  getColName(index: number): string {
    return this.columns.get(index).toString()
  }

  /**
   * Get the names of the columns
   */
  get colNames(): string[] {
    return range(0, this.shape[1]).map(c => this.getColName(c))
  }

  setColNames(index: IndexFromType, inplace: boolean = false): BaseDataFrame {
    return this
  }

  get shape(): Shape {
    return NO_SHAPE
  }

  get size(): number {
    const s = this.shape
    return s[0] * s[1]
  }

  apply(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    f: (v: SeriesType, row: number, col: number) => SeriesType,
  ): BaseDataFrame {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<T>(f: (v: SeriesType, row: number, col: number) => T): T[][] {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rowApply(f: (row: SeriesType[], index: number) => SeriesType): BaseDataFrame {
    return this
  }

  /**
   * Apply a function to each row to transform them.
   *
   * @param f
   * @returns a list of T the size of the number of rows.
   */
  rowMap<T>(f: (row: SeriesType[], index: number) => T): T[] {
    return []
  }

  /**
   * Apply a function to each
   * @param f
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // colApply(f: (row: SeriesType[], index: number) => SeriesType): BaseDataFrame {
  //   return this
  // }

  /**
   * Apply a function to each column to transform them.
   *
   * @param f
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  colMap<T>(f: (col: SeriesType[], index: number) => T): T[] {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  iloc(rows: LocType = ":", cols: LocType = ":"): BaseDataFrame {
    return this
  }

  isin(rows: LocType = ":", cols: LocType = ":"): BaseDataFrame {
    return this
  }

  toString(): string {
    return this.toCsv()
  }

  toCsv(options: IDataFrameToStringOpts = {}): string {
    return toString(this, options)
  }
}

export function _findRow(
  df: BaseDataFrame,
  row: IndexType,
  lc: boolean = true,
): number[] {
  if (typeof row === "number") {
    return [row]
  }

  const ret: number[] = []

  let s = row.toString()

  if (lc) {
    s = s.toLowerCase()

    for (const c of range(0, df.shape[0])) {
      if (df.getRowName(c).toLowerCase().startsWith(s)) {
        ret.push(c)
      }
    }
  } else {
    for (const c of range(0, df.shape[1])) {
      if (df.getRowName(c).startsWith(s)) {
        ret.push(c)
      }
    }
  }

  return ret
}

export function _findCol(
  df: BaseDataFrame,
  col: IndexType,
  lc: boolean = true,
): number[] {
  if (typeof col === "number") {
    return [col]
  }

  const ret: number[] = []

  let s = col.toString()

  if (lc) {
    s = s.toLowerCase()

    for (const c of range(0, df.shape[1])) {
      if (df.getColName(c).toLowerCase().startsWith(s)) {
        ret.push(c)
      }
    }
  } else {
    for (const c of range(0, df.shape[1])) {
      if (df.getColName(c).startsWith(s)) {
        ret.push(c)
      }
    }
  }

  return ret
}

interface IDataFrameToStringOpts {
  sep?: string
  dp?: number
  index?: boolean
  header?: boolean
}

/**
 * Returns a string representation of a table for downloading
 *
 * @param df table
 * @param dp precision of numbers
 * @returns
 */
function toString(
  df: BaseDataFrame,
  options: IDataFrameToStringOpts = {},
): string {
  const { sep = "\t", dp = 4, index = true, header = true } = { ...options }

  let ret: string[] = []

  if (index) {
    ret = range(0, df.shape[0]).map(ri =>
      [df.getRowName(ri)]
        .concat(df.row(ri)!.values.map(v => cellStr(v)))
        .join(sep),
    )
  } else {
    ret = range(0, df.shape[0]).map(ri =>
      df
        .row(ri)!
        .values.map(v => cellStr(v))
        .join(sep),
    )
  }

  // add header if required
  if (header) {
    ret = [df.colNames.join(sep)].concat(ret)
  }

  return ret.join("\n")
}
