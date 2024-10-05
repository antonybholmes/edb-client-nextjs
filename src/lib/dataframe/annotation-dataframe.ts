import { range } from '@lib/math/range'
import { BaseDataFrame, type LocType } from './base-dataframe'

import { BaseSeries } from './base-series'
import { DataFrame, _t, type IDataFrameOptions } from './dataframe'
import { IndexType, SeriesType, Shape } from './dataframe-types'
import { Index, type IndexFromType } from './index'

export class AnnotationDataFrame extends BaseDataFrame {
  private _dataframe: DataFrame
  private _rowDataFrame: DataFrame
  private _colDataFrame: DataFrame

  constructor(options: IDataFrameOptions = {}) {
    super()
    this._dataframe = new DataFrame(options)
    this._rowDataFrame = new DataFrame({
      data: range(0, this._dataframe.shape[0]).map(() => []),
      index: this._dataframe.index,
    })
    this._colDataFrame = new DataFrame({
      data: range(0, this._dataframe.shape[1]).map(() => []),
      index: this._dataframe.columns,
    })
  }

  setName(name: string, inplace = true): BaseDataFrame {
    return this._dataframe.setName(name, inplace)
  }

  setCol(col: IndexType = -1, data: SeriesType[] | BaseSeries): BaseDataFrame {
    this._dataframe.setCol(col, data, true)

    this._colDataFrame.setRow(
      this._dataframe.col(col)?.name,
      range(0, this._colDataFrame.shape[1]).map(() => NaN)
    )

    return this
  }

  col(c: IndexType): BaseSeries {
    return this._colDataFrame.row(c)
  }

  colValues(c: IndexType): SeriesType[] {
    return this._dataframe.colValues(c)
  }

  // setCols(cols: Series[]): BaseDataFrame {
  //   this._cols = cols
  //   return this
  // }

  get(row: number, col: number): SeriesType {
    return this._dataframe.get(row, col)
  }

  row(row: IndexType): BaseSeries {
    return this._rowDataFrame.row(row)
  }

  rowValues(row: number): SeriesType[] {
    return this._dataframe.rowValues(row)
  }

  setRow(row: IndexType = -1, data: SeriesType[] | BaseSeries): BaseDataFrame {
    this._dataframe.setRow(row, data, true)

    this._rowDataFrame.setRow(
      this._dataframe.col(row)?.name,
      range(0, this._rowDataFrame.shape[1]).map(() => NaN)
    )

    return this
  }

  set(row: number, col: number, v: IndexType): BaseDataFrame {
    return this._dataframe.set(row, col, v)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIndex(index: IndexFromType, inplace = false): BaseDataFrame {
    this._dataframe.setIndex(index, true)
    this._rowDataFrame.setIndex(index, true)

    return this._dataframe
  }

  // setCols(columns: IndexFromType): DataFrame {
  //   const df = this //inplace ? this : this.copy()

  //   if (columns instanceof Index) {
  //     df._columns = columns
  //   } else if (Array.isArray(columns)) {
  //     df._columns = new DataIndex(columns)
  //   } else {
  //     df._columns = EXCEL_INDEX
  //   }

  //   return df
  // }

  get index(): Index {
    return this._rowDataFrame.index
  }

  get columns(): Index {
    return this._colDataFrame.index
  }

  getColName(col: number): string {
    return this._colDataFrame.getRowName(col)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setColNames(index: IndexFromType, inplace: boolean = true): BaseDataFrame {
    this._dataframe.setColNames(index, true)
    this._colDataFrame.setIndex(index, true)
    return this._dataframe
  }

  get cols(): BaseSeries[] {
    return this._dataframe.cols
  }

  get shape(): Shape {
    return this._dataframe.shape
  }

  get size(): number {
    return this._dataframe.size
  }

  get values(): SeriesType[][] {
    // return copy as we want dataframe to be immutable
    return this._dataframe.values
  }

  apply(
    f: (v: SeriesType, row: number, col: number) => SeriesType
  ): BaseDataFrame {
    return this._dataframe.apply(f)
  }

  map<T>(f: (v: SeriesType, row: number, col: number) => T): T[][] {
    return this._dataframe.map(f)
  }

  rowApply(f: (row: SeriesType[], index: number) => SeriesType): BaseDataFrame {
    return this._dataframe.rowApply(f)
  }

  rowMap<T>(f: (row: SeriesType[], index: number) => T): T[] {
    return this._dataframe.rowMap(f)
  }

  // colApply(f: (col: SeriesType[], index: number) => SeriesType): BaseDataFrame {
  //   return this._dataframe.colApply(f)
  // }

  colMap<T>(f: (col: SeriesType[], index: number) => T): T[] {
    return this._dataframe.colMap(f)
  }

  iloc(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
    return this._dataframe.iloc(rows, cols)
  }

  isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
    return this._dataframe.isin(rows, cols)
  }

  t(): BaseDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: _t(this._dataframe._data),
      columns: this.index,
      index: this.columns,
    })

    ret._rowDataFrame = this._colDataFrame
    ret._colDataFrame = this._rowDataFrame

    return ret
  }

  copy(): BaseDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: this._dataframe._data.map(r => [...r]),
      index: this.index,
      columns: this.columns,
    })

    ret._rowDataFrame = this._colDataFrame
    ret._colDataFrame = this._rowDataFrame

    return ret
  }
}
