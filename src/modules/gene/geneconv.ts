import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { DataFrame } from '@lib/dataframe/dataframe'
import type { SeriesType } from '@lib/dataframe/dataframe-types'
import { capitalCase } from '@lib/text/capital-case'
import { API_GENECONV_URL } from '@modules/edb'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export async function createGeneConvTable(
  df: BaseDataFrame,
  fromSpecies: string = 'human',
  toSpecies: string = 'mouse',
  exact: boolean = true
): Promise<BaseDataFrame | null> {
  const queryClient = useQueryClient()

  const geneCol = 0

  //let assemblyCol = findCol(df, "assembly")

  const genes = df.col(geneCol)?.values

  try {
    const res = await queryClient.fetchQuery({
      queryKey: ['motiftogene'],
      queryFn: () =>
        axios.post(
          `${API_GENECONV_URL}/convert/${fromSpecies}/${toSpecies}`,
          {
            searches: genes,
            exact,
          },
          {
            headers: {
              //Authorization: bearerTokenHeader(token),
              'Content-Type': 'application/json',
            },
          }
        ),
    })

    let data = res.data.data

    console.log(data)

    // conversions store data in conversions entry,
    // but the entries are the same as for gene info
    // so we can just step 1 deeper into structure
    // and continue as normal
    // if (fromSpecies != toSpecies) {
    //  data = data.conversions
    // }

    data = data.conversions

    const table: SeriesType[][] = []

    for (const [ri, row] of df.values.entries()) {
      const conv = data[ri]

      let symbol = ''
      let entrez = ''
      //let refseq = ""
      let ensembl = ''

      if (conv.length > 0) {
        symbol = conv[0].symbol
        entrez = conv[0].entrez
        //refseq = conv[0].refseq.join("|")
        ensembl = conv[0].ensembl //.join("|")
      }

      table.push(row.concat(symbol, entrez, ensembl))
    }

    const speciesHeader = capitalCase(toSpecies)

    const header: string[] = df.colNames.concat([
      `${speciesHeader} Gene Symbol`,
      `${speciesHeader} Entrez`,
      `${speciesHeader} Ensembl`,
    ])

    return new DataFrame({ data: table, columns: header })

    //data.push(row.concat([dj.data.dna]))
  } catch (error) {
    //data.push(row.concat([""]))
  }

  return null
}
