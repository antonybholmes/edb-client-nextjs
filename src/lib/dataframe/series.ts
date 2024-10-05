import { Index, NUM_INDEX, type IIndexOptions, type IndexFromType } from '.'
import { BaseSeries } from './base-series'

import { DataIndex } from './data-index'
import { IndexType, SeriesType } from './dataframe-types'

export interface ISeriesOptions extends IIndexOptions {
  index?: IndexFromType
}

export class Series extends BaseSeries {
  protected _data: SeriesType[]
  protected _name: IndexType
  protected _index: Index = NUM_INDEX

  constructor(data: SeriesType[], options: ISeriesOptions = {}) {
    super()

    const { index, name } = { name: '', index: NUM_INDEX, ...options }

    this._data = data
    this._name = name
    this.setIndex(index, true)
  }

  setName(name: string): BaseSeries {
    this._name = name
    return this
  }

  get name(): IndexType {
    return this._name
  }

  get index(): Index {
    return this._index
  }

  setIndex(index: IndexFromType, inplace: boolean = false): BaseSeries {
    const series: Series = inplace ? this : (this.copy() as Series)

    if (index instanceof Index) {
      series._index = new DataIndex(index.values)
    } else if (Array.isArray(index)) {
      series._index = new DataIndex(index)
    } else {
      series._index = NUM_INDEX
    }

    return this
  }

  get values(): SeriesType[] {
    return [...this._data]
  }

  get(index: number): SeriesType {
    return this._data[index]
  }

  set(index: number, v: SeriesType): BaseSeries {
    this._data[index] = v
    return this
  }

  get size() {
    return this._data.length
  }

  filter(idx: number[]): BaseSeries {
    return new Series(
      idx.map(i => this._data[i]),
      { name: this._name, index: this._index.filter(idx) }
    )
  }

  copy(): BaseSeries {
    return new Series(this._data, { name: this._name, index: this._index })
  }
}
