import { pearson } from "./stats"

export function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(
    a
      .map((x, xi) => {
        const d = x - b[xi]
        return d * d
      })
      .reduce((x, y) => x + y),
  )
}

export function manhattan(a: number[], b: number[]): number {
  return a.map((x, xi) => Math.abs(x - b[xi])).reduce((x, y) => x + y)
}

export function pearsond(a: number[], b: number[]): number {
  return 1 - pearson(a, b)
}
