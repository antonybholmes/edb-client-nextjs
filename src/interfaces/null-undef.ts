export type NullUndef = null | undefined

export function isUndef(v: any) {
  return v === undefined
}

export function isNullUndef(v: any) {
  return v === null || v === undefined
}
