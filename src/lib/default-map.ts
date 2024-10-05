import { HashMap } from './hashmap'

export class DefaultMap<K, V> extends HashMap<K, V> {
  _default: () => V

  constructor(defaultFunction: () => V) {
    super()
    this._default = defaultFunction
  }

  get(key: K) {
    if (!this.has(key)) {
      this.set(key, this._default())
    }

    return super.get(key)
  }
}
