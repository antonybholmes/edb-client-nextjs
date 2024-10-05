// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
export function range(start: number, stop?: number, step?: number) {
  if (!stop) {
    stop = start
    start = 0
  }

  if (!step) {
    step = 1
  }

  // we want to end on the index before the stop,
  // e.g. stop = 5 -> [0,1,2,3,4]
  --stop

  return Array.from(
    { length: (stop - start) / step + 1 },
    (_, i) => start + i * step,
  )
}
