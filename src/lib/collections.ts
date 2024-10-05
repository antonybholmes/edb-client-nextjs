export const EMPTY_SET = new Set()

export function intersect1d(s1: Set<any>, s2: Set<any>): Set<any> {
  return new Set([...s1].filter(i => s2.has(i)))
}

export function argsort(d: any[]): number[] {
  return d
    .map((x, xi) => [x, xi])
    .sort((a, b) => a[0] - b[0])
    .map(x => x[1])
}
