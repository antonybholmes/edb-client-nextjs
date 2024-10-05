import { range } from './math/range'

export const COLOR_REGEX = /^([a-zA-Z]+|#([0-9a-fA-F]{6}$|[0-9a-fA-F]{8}))$/i

export function randomHslColor(): string {
  return 'hsla(' + Math.random() * 360 + ', 100%, 50%, 1)'
}

export function randomHexColor(): string {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  )
}

export function randomRGBAColor(): IRGBA {
  return [...range(0, 3).map(i => Math.floor(Math.random() * 256)), 1] as IRGBA
}

export type IRGBA = [number, number, number, number]

export function rgb2float(rgba: IRGBA): IRGBA {
  return [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3]]
}

export function rgb2hex(rgba: IRGBA): string {
  let dig: string
  let hex = '#'

  for (let i = 0; i < 3; ++i) {
    dig = rgba[i].toString(16)
    hex += ('00' + dig).substring(dig.length)
  }

  hex += (255 * rgba[3]).toString(16)

  return hex
}

export function hexToRgb(hex: string): {
  r: number
  g: number
  b: number
  a: number
} {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
    hex
  )

  const ret = { r: 0, g: 0, b: 0, a: 1 }

  if (result) {
    ;(ret.r = parseInt(result[1], 16)),
      (ret.g = parseInt(result[2], 16)),
      (ret.b = parseInt(result[3], 16))

    if (result.length > 3) {
      ret.a = parseInt(result[4], 16) / 255
    }
  }

  return ret
}

export function rgbaStr(rgba: IRGBA): string {
  return 'rgba(' + rgba.join(',') + ')'
}
