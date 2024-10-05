import { LN_LOOKUP } from './math'
import { range } from './range'

/**
 * Computes natural log (Math.log) of a number.
 * For speed, it uses a lookup table to
 * @param x
 * @returns
 */
export function getLn(x: number): number {
  if (x < 1) {
    return 0
  }

  if (x < LN_LOOKUP.length) {
    return LN_LOOKUP[x - 1]
  } else {
    return Math.log(x)
  }
}

/**
 * Computes the factorial in log space as a sum of logs.
 *
 * @param x an integer
 * @returns
 */
export function factorialLn(x: number): number {
  // for property 0! = 1 since exp(0) == 1
  if (x < 1) {
    return 0
  }

  return range(1, x + 1)
    .map(x => getLn(x))
    .reduce((total, v) => total + v)
}

export function factorial(x: number): number {
  if (x < 1) {
    return 1
  }

  return Math.round(Math.exp(factorialLn(x)))
}
