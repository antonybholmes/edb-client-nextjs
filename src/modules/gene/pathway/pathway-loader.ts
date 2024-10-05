import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { IGeneSet, IGeneSetFile } from './pathway'

export async function loadGMT(file: IGeneSetFile): Promise<IGeneSet[]> {
  const queryClient = useQueryClient()

  const geneSets: IGeneSet[] = []

  try {
    //const content = await fetchData(file.url)

    const res = await queryClient.fetchQuery({
      queryKey: ['gmt'],
      queryFn: () => axios.get(file.url),
    })

    const content = res.data

    //const response = await axios.get(file.url);
    //const buffer = await response.data;
    //const content = await zlib.gunzipSync(buffer).toString();

    const lines: string[] = content
      .split(/[\r\n]+/g)
      .filter((line: string) => line.length > 0)
    //.slice(0, 100)

    console.log('loaded from', file.url, lines.length)

    lines.forEach(line => {
      const tokens = line.split('\t')

      geneSets.push({
        name: tokens[0],
        genes: tokens.slice(2),
      })

      // lines[0].split("\t").forEach(gs => {
      //   retMap[gs] = new Set<string>()
      // })

      // lines.slice(2).forEach(line => {
      //   line.split("\t").forEach((gene, genei) => {
      //     if (gene.length > 0 && gene !== "----") {
      //       retMap[geneSets[genei]].add(gene)
      //     }
      //   })
      // })
    })
  } catch (error) {
    console.error(error)
  }

  return geneSets
}
