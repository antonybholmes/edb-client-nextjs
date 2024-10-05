import {
  PathwayOverlap,
  type IDataset,
  type IGeneSet,
} from "../../../../../modules/gene/pathway/pathway"

self.onmessage = function (
  e: MessageEvent<{ genesets: IGeneSet[]; datasets: IDataset[] }>,
) {
  const { genesets, datasets } = e.data

  const overlap = new PathwayOverlap()

  for (const dataset of datasets) {
    overlap.addDataset(dataset)
  }

  console.log("worker", overlap)

  let [data, columns] = overlap.test(genesets)

  // let idx = where(
  //   range(0, data.length).map(i => data[i][10] as number),
  //   x => x > 0,
  // )
  // data = idx.map(i => data[i])

  self.postMessage({ data, columns })
}
