import { Index, type IIndexOptions } from '.'
import type { IndexType } from './dataframe-types'

export class DataIndex extends Index {
  _data: IndexType[]
  _name: IndexType

  constructor(data: IndexType[], options: IIndexOptions = {}) {
    super()

    const { name } = { name: '', ...options }

    this._data = data
    this._name = name
  }

  // setName(name: IndexType): DataIndex {
  //   this._name = name
  //   return this
  // }

  get name(): IndexType {
    return this._name
  }

  get values(): IndexType[] {
    return [...this._data]
  }

  get(index: number): IndexType {
    return this._data[index] ?? NaN
  }

  get size(): number {
    return this._data.length
  }

  filter(idx: number[]): Index {
    return new DataIndex(
      idx.map(i => this._data[i]),
      { name: this._name }
    )
  }

  isin(idx: IndexType[]): Index {
    const s = new Set(idx)
    return new DataIndex(
      this._data.filter(i => s.has(i)),
      { name: this._name }
    )
  }

  find(t: IndexType): number[] {
    const s = t.toString().toLowerCase()

    // console.log(
    //   "search col",
    //   s,
    //   this._data.map((v, i) => [v.toString().toLowerCase(), i]),
    //   this._data
    //     .map((v, i) => [v.toString().toLowerCase(), i])
    //     .filter((x: [string, number]) => x[0].includes(s))
    //     .map((x: [string, number]) => x[1]),
    // )

    return this._data
      .map((v, i) => [v.toString().toLowerCase(), i] as [string, number])
      .filter((x: [string, number]) => x[0].includes(s))
      .map((x: [string, number]) => x[1])
  }

  copy(): Index {
    console.log('copy index', this._name)
    return new DataIndex([...this._data], { name: this._name })
  }
}
