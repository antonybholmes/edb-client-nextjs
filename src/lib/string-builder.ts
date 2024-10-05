export class StringBuilder {
  private _values: string[]

  constructor(v: string | null = null) {
    this._values = []

    if (v) {
      this.append(v)
    }
  }

  add(v: string) {
    this._values.push(v)
  }

  append(v: string) {
    this.add(v)
  }

  toString(): string {
    return this._values.join("")
  }

  clear() {
    this._values = []
  }
}
