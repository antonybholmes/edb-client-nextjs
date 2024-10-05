import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import { fetchPostBuffer } from '@lib/urls'
//import { zlib } from "zlib"
import zlib from 'zlib'

export interface IURLFile {
  type: string
  url: string
}

/**
 * Download tables from URLs.
 *
 * @param files
 * @param colNames
 * @param skipRows
 * @param indexCols
 * @returns
 */
export async function downloadTables(
  files: IURLFile[],
  { colNames = 1, skipRows = 0, indexCols = 1 } = {}
): Promise<BaseDataFrame[]> {
  const tables: BaseDataFrame[] = []

  try {
    for (const file of files) {
      const response = await fetchPostBuffer(file.url)

      if (response) {
        const buffer = Buffer.from(response)
        const content = zlib.gunzipSync(buffer).toString()

        const lines: string[] = content
          .split(/[\r\n]+/g)
          .filter((line: string) => line.length > 0)

        const table: BaseDataFrame = new DataFrameReader()
          .colNames(colNames)
          .skipRows(skipRows)
          .indexCols(indexCols)
          .read(lines)
          .setName(file.type)

        tables.push(table)
      }
    }
  } catch (error) {
    console.error(error)
  }

  return tables
}
