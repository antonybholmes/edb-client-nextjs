import { type IFieldMap } from "@interfaces/field-map"
import { MIME_JSON } from "@modules/edb"
import type { RefObject } from "react"

export function downloadJson(
  data: unknown,
  downloadRef: RefObject<HTMLAnchorElement>,
  file: string = "data.json",
) {
  const s = JSON.stringify(data, null, 2)

  download(s, downloadRef, file, MIME_JSON)
}

export function download(
  data: string,
  downloadRef: RefObject<HTMLAnchorElement>,
  file: string = "data.txt",
  mime: string = "text/plain",
) {
  const blob = new Blob([data], { type: mime })

  const url = URL.createObjectURL(blob)

  //console.log(downloadRef)

  if (downloadRef && downloadRef.current) {
    downloadRef.current.href = url
    downloadRef.current.download = file
    //document.body.appendChild(element); // Required for this to work in FireFox
    downloadRef.current.click()
  }
}

export const fetchData = async (
  url: string,
  params: IFieldMap = {},
): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      "Content-Encoding": "gzip",
    },
    ...params,
  })
  const data = await response.text()
  return data
}

export const fetchJson = async (
  url: string,
  params: IFieldMap = {},
): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      "Content-Encoding": "gzip",
      "Content-Type": "application/json",
    },
    ...params,
  })

  const data = await response.json()

  return data
}
