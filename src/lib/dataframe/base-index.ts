import type { IndexType, Shape } from "./dataframe-types"

export class BaseIndex {
  // setName(name: string): BaseIndex {
  //   return this
  // }

  get name(): IndexType {
    return ""
  }

  get size(): number {
    return -1
  }

  /**
   * Returns the shape of the index, typically n x 1
   */
  get shape(): Shape {
    return [this.size, 0]
  }

  /**
   * Synonym for size
   */
  get length(): number {
    return this.size
  }
}
