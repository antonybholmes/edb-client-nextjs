import { fetchJson } from '@lib/download-utils'
import { type IURLFile } from '@modules/download'

import { useEffect, useState } from 'react'

export interface IDataSet {
  platform: string
  genome: string
  assembly: string
  name: string
  type: string
}

export interface IDataSetExt extends IDataSet {
  lab: string
  samples: string[]
  files: IURLFile[]
}

export type DataSet = 'RNASeq' | 'Microarray'

export type Species = 'Human' | 'Mouse'

export function useDataSets({ dataset = 'RNASeq', species = 'Human' } = {}) {
  const [dataSets, setDataSets] = useState<IDataSetExt[]>([])

  useEffect(() => {
    async function fetch() {
      const url = `/datasets/${dataset}/${species}/datasets.json`
      const response = await fetchJson(url)

      setDataSets(response)
    }
    fetch()
  }, [])

  return dataSets
}
