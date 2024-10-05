import { DEFAULT_DATE_FORMAT } from '@consts'
import { format, parseISO } from 'date-fns'
import type { IndexType, SeriesType } from './dataframe-types'

export const NA_REGEX = /^(NA|#?N\/A)$/i
export const NUMBER_REGEX = /^-?\d*\.?\d+([eE][-+]?\d+)?$/ ///^-?\d+\.?\d*$/

export function makeCell(
  arg: IndexType,
  keepDefaultNA: boolean = true
): SeriesType {
  // non strings are returned as their original type
  if (typeof arg !== 'string') {
    return arg
  }

  // convert NA and N/A to nan
  if (keepDefaultNA) {
    if (!arg || NA_REGEX.test(arg)) {
      return NaN
    }
  }

  // if empty return empty string
  if (!arg) {
    return ''
  }

  //if (NUMBER_REGEX.test(arg)) {

  // see if value is a number
  const v = Number(arg)

  if (!Number.isNaN(v)) {
    return v
  }
  //}

  // doesn't seem to be number, so see if it's a date

  const d = parseISO(arg)

  if (!Number.isNaN(d.getTime())) {
    return d
  }

  // treat it as an actual string
  return arg
}

export function makeCells(...args: IndexType[]): SeriesType[] {
  return args.map(arg => makeCell(arg))
}

interface ICellStrOpts {
  dp?: number
  defaultValue?: string
}

export function cellStr(cell: SeriesType, options: ICellStrOpts = {}): string {
  const { dp = 4, defaultValue = 'NA' } = { ...options }
  if (typeof cell === 'number') {
    if (Number.isInteger(cell)) {
      return cell.toFixed(0)
    } else {
      return dp !== -1 ? cell.toFixed(dp) : cell.toString()
    }
  } else if (cell instanceof Date) {
    return format(cell, DEFAULT_DATE_FORMAT)
  } else {
    return cell !== null ? cell.toString() : defaultValue
  }
}

/**
 * Convert a cell to a value
 *
 * @param cell A cell value
 * @returns A number representation of the cell or NaN if the value is not a number.
 */
export function cellNum(cell: SeriesType): number {
  const t = typeof cell

  switch (t) {
    case 'number':
      return cell as number
    case 'boolean':
      return cell ? 1 : 0
    default:
      return NaN
  }
}

/**
 * From a zero based col, return the Excel A,B,C...AA etc name
 * equivalent.
 *
 * @param col
 * @returns
 */
export function getExcelColName(col: number) {
  // this works assuming 1 based cols, but since I prefer 0 based
  // indexing for consistency, inc col
  ++col

  const res: number[] = []
  let rem: number

  while (col) {
    --col
    rem = col % 26
    col = Math.floor(col / 26)
    res.push(65 + rem)
  }

  return String.fromCharCode(...res.toReversed())
}
