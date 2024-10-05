import { BaseSeries, type SeriesType } from "./base-series"

export class InfSeries extends BaseSeries {
  protected _defaultValue: SeriesType
  protected _size: number

  constructor(size: number = 1000000, defaultValue: SeriesType = NaN) {
    super()
    this._defaultValue = defaultValue
    this._size = size
  }

  get defaultValue() {
    return this._defaultValue
  }

  setDefaultValue(v: SeriesType): BaseSeries {
    this._defaultValue = v

    return this
  }

  get size(): number {
    return this._size
  }
}
