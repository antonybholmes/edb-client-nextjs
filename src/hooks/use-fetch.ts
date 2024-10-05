import { type IFieldMap } from '@interfaces/field-map'
import { type INumberMap } from '@interfaces/number-map'
import { fetchData } from '@lib/download-utils'

import { useEffect, useState } from 'react'

export function useFetch(url: string, params: IFieldMap = {}) {
  const [data, setData] = useState<any>(undefined)
  const [error, setError] = useState<any>('')
  const [loading, setLoading] = useState(true)

  const useFetchData = async (url: string, params: IFieldMap) => {
    //console.log({ ...params, url })

    try {
      setData(await fetchData(url, params))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    useFetchData(url, params)
  }, []) // execute once only

  return { data, error, loading }
}

export function useGetFetch(url: string, params: IFieldMap) {
  return useFetch(url, { ...params, method: 'GET' })
}

export function usePostFetch(url: string, body: IFieldMap, headers: IFieldMap) {
  return useFetch(url, { body: JSON.stringify(body), headers, method: 'POST' })
}

export function useQueryPostFetch(
  url: string,
  body: IFieldMap,
  headers: IFieldMap
) {
  const [rows, setRows] = useState<any[]>([])
  const [stats, setStats] = useState<INumberMap>({})

  const { data, loading, error } = usePostFetch(url, body, headers)

  useEffect(() => {
    if (data?.length > 0) {
      setStats(data[0].stats)
      setRows(data[0].rows)
    }
  }, [data])

  return { stats, rows }
}
