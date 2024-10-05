import { range } from "@lib/math/range"
import { customAlphabet } from "nanoid"

const NANOID = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12)

export function isStr(x: unknown) {
  return typeof x === "string"
}

/**
 * #move - Moves an array item from one position in an array to another.
 * Note: This is a pure function so a new array will be returned, instead
 * of altering the array argument.
 *
 * https://github.com/granteagon/move
 *
 * @param array       Array in which to move an item
 * @param moveIndex   The index of the item to move.
 * @param toIndex     The index to move item at moveIndex to.
 * @returns
 */
export function move<T>(array: T[], moveIndex: number, toIndex: number) {
  const itemRemovedArray = [
    ...array.slice(0, moveIndex),
    ...array.slice(moveIndex + 1, array.length),
  ]
  return [
    ...itemRemovedArray.slice(0, toIndex),
    array[moveIndex],
    ...itemRemovedArray.slice(toIndex, itemRemovedArray.length),
  ]
}

/**
 * Force window url to change without using a router or other framework.
 *
 * @param url url to visit
 */
export function routeChange(url: string) {
  if (typeof window != "undefined") {
    window.location.assign(url)
  }
}

export function result<T>(f: () => T | null | undefined) {
  try {
    const result = f()
    return [result, null]
  } catch (error) {
    return [null, error]
  }
}

export function uuid(): string {
  return crypto.randomUUID()
}

export function nanoid(): string {
  return NANOID()
}

/**
 * Add a random id to the end of a prefix. Useful for when
 * we need to cause a state variable to repeatedly change,
 * e.g. click a button that sends an open message where
 * we want the message to be sent everytime and not cached
 * by react, so we add some randomness to it.
 * @param prefix
 * @returns
 */
export function makeRandId(prefix: string): string {
  return `${prefix}:${nanoid()}`
}

export function zip(...cols: any[]): any[][] {
  const colIdx = range(0, cols.length)

  return range(0, cols[0].length).map(i => colIdx.map(j => cols[j][i]))
}
