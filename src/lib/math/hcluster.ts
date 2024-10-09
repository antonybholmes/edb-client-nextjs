import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { DataFrame } from '@lib/dataframe/dataframe'
import { pearsond } from './distance'
import { range } from './range'

export interface ICluster {
  id: number
  //name: string
  height: number
  indices: number[]
  children: ICluster[]
}

export type IBranchCoords = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
]

export interface IClusterTree {
  cluster: ICluster
  coords: IBranchCoords[]
  leaves: number[]
}

export const MAIN_CLUSTER_FRAME = 'main'

export interface ClusterFrame {
  dataframes: { [key: string]: BaseDataFrame }
  rowTree?: IClusterTree | null
  colTree?: IClusterTree | null
}

export type IDistFunc = (a: number[], b: number[]) => number

export type ILinkageFunc = (d: number[]) => number

export type ILinkage = (
  df: BaseDataFrame,
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc,
  dcache: Map<number, Map<number, number>>
) => number

/**
 * Returns the pairs of indices to compare to each other.
 *
 * @param n   size of square matrix
 * @returns   list of indices to check consisting of [a, b, inf]. The
 *            third element is the distance between them, initially
 *            set to infinity, but will be eventually be set to
 *            real distance in a later step.
 */
function squareMatrixPairs(n: number): [number, number, number][] {
  return range(0, n)
    .map(a => range(a + 1, n).map(b => [a, b, Infinity]))
    .flat() as [number, number, number][]
}

/**
 * Creates a linkage that is row oriented, i.e. you should
 * transpose the dataframe if you want to cluster columns.
 *
 * @param df Dataframe to process
 * @param c1
 * @param c2
 * @param distFunc
 * @returns
 */
function _linkage(
  df: BaseDataFrame,
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond,
  linkageFunc: ILinkageFunc,
  dcache: Map<number, Map<number, number>>
): number {
  if (!dcache.has(c1.id)) {
    dcache.set(c1.id, new Map<number, number>())
  }

  if (!dcache.get(c1.id)!.has(c2.id)) {
    const distances = c1.indices
      .map(c1i =>
        c2.indices.map(c2i => {
          return distFunc(
            (df.row(c1i)!.values as number[]) ?? [],
            (df.row(c2i)!.values as number[]) ?? []
          )
        })
      )
      .flat()

    // find the one we want to pick
    const l = linkageFunc(distances)

    dcache.get(c1.id)!.set(c2.id, l)
  }

  return dcache.get(c1.id)!.get(c2.id)!
}

/**
 * Pick the closest.
 *
 * @param df
 * @param c1
 * @param c2
 * @param distFunc
 * @param dcache
 * @returns
 */
export function singleLinkage(
  df: BaseDataFrame,
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond,
  dcache: Map<number, Map<number, number>>
): number {
  return _linkage(df, c1, c2, distFunc, (d: number[]) => d.sort()[0], dcache)
}

export function completeLinkage(
  df: BaseDataFrame,
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond,
  dcache: Map<number, Map<number, number>>
): number {
  return _linkage(
    df,
    c1,
    c2,
    distFunc,
    (d: number[]) => d.sort().toReversed()[0],
    dcache
  )
}

export function averageLinkage(
  df: BaseDataFrame,
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond,
  dcache: Map<number, Map<number, number>>
): number {
  return _linkage(
    df,
    c1,
    c2,
    distFunc,
    (d: number[]) =>
      d.reduce((x, y) => x + y) / (c1.indices.length * c2.indices.length),
    dcache
  )
}

export class HCluster {
  private _linkage: ILinkage
  private _distFunc: IDistFunc
  constructor(
    linkage: ILinkage = averageLinkage,
    distFunc: IDistFunc = pearsond
  ) {
    this._linkage = linkage
    this._distFunc = distFunc
  }

  run(df: BaseDataFrame): IClusterTree {
    // Row based so is faster if matrix is
    // row oriented

    const n = df.shape[0]

    const clusters: ICluster[] = range(0, n).map(i => ({
      id: i,
      //name: _df.rowIndex[0].ids[i].toString(),
      height: 0,
      indices: [i],
      children: [],
    }))

    // if we already know the dist, reuse it
    const dcache: Map<number, Map<number, number>> = new Map()

    //const dist: Map<number, Map<number, number>> = new Map()

    range(0, n - 1).forEach(i => {
      // since clusters change (gets smaller), calculate all pairwise combinations
      // we need to test
      const clusterPairs = squareMatrixPairs(clusters.length)

      clusterPairs.forEach(pair => {
        const c1 = clusters[pair[0]]
        const c2 = clusters[pair[1]]

        pair[2] = this._linkage(df, c1, c2, this._distFunc, dcache)

        // if (!dist.has(c1.id)) {
        //   dist.set(c1.id, new Map<number, number>())
        // }

        // if (!dist.get(c1.id)?.has(c2.id)) {
        //   dist.get(c1.id)!.set(c2.id, this._linkage(
        //     df,
        //     c1,
        //     c2,
        //     this._distFunc,
        //     dcache,
        //   ))
        // }

        //dist.get(c1.id)!.get(c2.id)!
      })

      //console.log('h2')

      // each time we find something closer, keep that
      // as the running 'sum'
      const nearestPair = clusterPairs.reduce(
        (pairA, pairB) => (pairA[2] <= pairB[2] ? pairA : pairB),
        [0, 0, Infinity]
      )

      // console.log(
      //   "her ",
      //   nearestPair,
      //   clusters[nearestPair[0]],
      //   clusters[nearestPair[1]],
      // )

      // console.log(
      //   "merge",
      //   clusters[nearestPair[0]].name,
      //   clusters[nearestPair[1]].name
      // )

      const newCluster: ICluster = {
        id: n + i,
        //name: "",
        height: nearestPair[2],
        indices: clusters[nearestPair[0]].indices
          .concat(clusters[nearestPair[1]].indices)
          .sort(),
        children: [clusters[nearestPair[0]], clusters[nearestPair[1]]],
      }

      // remove merged nodes and push new node
      clusters.splice(Math.max(nearestPair[0], nearestPair[1]), 1)
      clusters.splice(Math.min(nearestPair[0], nearestPair[1]), 1)
      clusters.push(newCluster)
    })

    const cluster = clusters[0]

    const leaves = getLeaves(cluster)

    const tree: IClusterTree = {
      cluster,
      coords: clusterToCoords(df, clusters[0], leaves),
      leaves,
    }

    return tree
  }

  // run(df: IDataFrame|IClusterFrame, axis:AxisDim): IClusterFrame {
  //   const rowTree = axis === 0 ? this.#_run(df) : null
  //   const colTree = axis === 1  ? this.#_run(transpose(df)) : null

  //   return {...df, rowTree, colTree }

  // }
}

export function getLeaves(cluster: ICluster): number[] {
  const stack: ICluster[] = [cluster]

  const ret: number[] = []

  while (stack.length > 0) {
    const c = stack.pop()

    if (c) {
      if (c.children.length > 0) {
        stack.push(...c.children.toReversed())
      } else {
        ret.push(c.id)
      }
    }
  }

  return ret
}

export function clusterToCoords(
  df: BaseDataFrame,
  cluster: ICluster,
  leaves: number[]
): IBranchCoords[] {
  if (!leaves) {
    leaves = getLeaves(cluster)
  }

  const leafMap = Object.fromEntries(leaves.map((leaf, li) => [leaf, li + 0.5]))

  const maxH = cluster.height
  const maxX = df.shape[0]

  const stack: ICluster[] = [cluster]

  const coords: IBranchCoords[] = []

  const xMap = {}

  while (stack.length > 0) {
    const c = stack.pop()

    if (c && c.children.length > 0) {
      const x1 = _getNodeX(c.children[0], leafMap, xMap) / maxX
      const x2 = _getNodeX(c.children[1], leafMap, xMap) / maxX
      const y = c.height / maxH

      coords.push([
        [x1, c.children[0].height / maxH],
        [x1, y],
        [x2, y],
        [x2, c.children[1].height / maxH],
      ])

      // depth first left tree first
      stack.push(...c.children.toReversed())
    }
  }

  return coords
}

export function _getNodeX(
  cluster: ICluster,
  leafMap: { [key: number]: number },
  xMap: { [key: number]: number } = {}
): number {
  // use cached coordinate if we already have it
  if (cluster.id in xMap) {
    return xMap[cluster.id]
  }

  if (cluster.children.length === 0) {
    xMap[cluster.id] = leafMap[cluster.id]
  } else {
    xMap[cluster.id] =
      (_getNodeX(cluster.children[0], leafMap, xMap) +
        _getNodeX(cluster.children[1], leafMap, xMap)) /
      2
  }

  return xMap[cluster.id]
}

/**
 * Using the row and col leaves of a cluster frame, reorder the main dataframe to
 * match
 * @param cf
 * @returns
 */
export function getClusterOrderedDataFrame(cf: ClusterFrame): BaseDataFrame {
  const df = cf.dataframes[MAIN_CLUSTER_FRAME]
  const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(0, df.shape[0])
  const colLeaves = cf.colTree ? cf.colTree.leaves : range(0, df.shape[1])

  const data = df.values

  const ret = new DataFrame({
    data: rowLeaves.map(r => colLeaves.map(c => data[r][c])),
    columns: colLeaves.map(c => df.colNames[c]),
    index: rowLeaves.map(r => df.rowNames[r]),
    name: df.name,
  })

  return ret
}
