import { STATUS_FAIL, STATUS_SUCCESS } from "@consts"
import { type IFieldMap } from "@interfaces/field-map"
import { type IQueryStatus } from "@interfaces/query-status"
import { type IStringMap } from "@interfaces/string-map"

export const PATH_SEP = "/"

export function getUrlFriendlyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll(/[\ \-]+/g, "-")
}

export function getUrlFriendlyImg(
  img: string,
  ext = "avif",
  size: number | [number, number] = 800,
): string {
  if (!Array.isArray(size)) {
    size = [size, size]
  }

  return `${getUrlFriendlyTag(img)}-${size[0]}x${size[1]}.${ext}`
}

export function getUrlFriendlyTags(tags: string[]): string[] {
  return tags.map(tag => getUrlFriendlyTag(tag))
}

export function getSlug(path: string): string {
  return path
    .replace(/\.md$/, "")
    .replaceAll("\\", PATH_SEP)
    .split(PATH_SEP)
    .map(p => getUrlFriendlyTag(p))
    .join(PATH_SEP)
}

export function getSlugDir(path: string): string {
  // remove last entry to get the dir part of the name
  return getSlug(path).split(PATH_SEP).slice(0, -1).join(PATH_SEP)
}

export function getCanonicalSlug(path: string): string {
  return getSlug(path).replace(/^.+\//, "")
}

export function getDateFromSlug(slug: string): string {
  const match = slug.match(/(\d{4})-(\d{2})-(\d{2})/)
  return match ? match.slice(1, 4).join("-") : "2022-01-01"
}

export function makeGetUrl(
  baseUrl: string,
  params: IFieldMap | IFieldMap[] = [],
): string {
  if (!Array.isArray(params)) {
    params = [params]
  }

  if (params.length > 0) {
    return encodeURI(
      `${baseUrl}?${params
        .map((po: IStringMap) => Object.entries(po).map(p => `${p[0]}=${p[1]}`))
        .flat()
        .join("&")}`,
    )
  } else {
    return encodeURI(baseUrl)
  }
}

export type IFetchBody = IFieldMap | FormData

export function fetchPost(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
): Promise<Response> {
  //console.log(url, JSON.stringify(body), headers)

  return fetch(url, {
    headers: { "Content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    method: "POST",
  })
}

export async function fetchPostJson(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null | undefined> {
  try {
    //devlog(url, body, headers)
    const response = await fetchPost(url, body, headers)

    const ret = await response.json()

    return ret
  } catch (error) {
    console.error(error)
  }

  return { statusCode: 503 }
}

export async function fetchPostJsonQueryStatus(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
): Promise<IQueryStatus> {
  const json = await fetchPostJson(url, body, headers)

  return {
    message: json?.message ?? "",
    status: json?.status ?? STATUS_FAIL,
  }
}

export async function fetchPostJsonStatus(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
): Promise<boolean> {
  const status = await fetchPostJsonQueryStatus(url, body, headers)

  return status.status === STATUS_SUCCESS
}

export async function fetchPostJsonData(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null | undefined> {
  const json = await fetchPostJson(url, body, headers)

  return json?.data
}

export async function fetchPostJsonArray(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const json = await fetchPostJsonData(url, body, headers)

  return json?.items ?? []
}

export async function fetchPostBlob(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
): Promise<Blob | null> {
  try {
    //devlog(url, body, headers)
    const response = await fetchPost(url, body, headers)
    return response.blob()
  } catch (error) {
    console.error(error)
  }

  return null
}

export async function fetchPostBuffer(
  url: string,
  body: IFieldMap = {},
  headers: IFieldMap = {},
): Promise<ArrayBuffer | null> {
  try {
    //devlog(url, body, headers)
    const response = await fetchPost(url, body, headers)
    return response.arrayBuffer()
  } catch (error) {
    console.error(error)
  }

  return null
}

// export async function fetchPostJsonArrayQuery(
//   url: string,
//   body: IFieldMap,
//   headers: IFieldMap,
// ): Promise<ISearchResults> {
//   const json = await fetchPostJson(url, body, headers)

//   if (json.statusCode === STATUS_CODE_OK) {
//     return json.data
//   } else {
//     return { totalItems: 0, fields: [], items: [] }
//   }
// }

export function fetchPostForm(url: string, body: FormData): Promise<Response> {
  return fetch(url, {
    body,
    method: "post",
  })
}

export async function fetchPostFormJson(
  url: string,
  body: FormData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const response = await fetchPostForm(url, body)

    return response.json()
  } catch (error) {
    console.error(error)
  }

  return null
}
