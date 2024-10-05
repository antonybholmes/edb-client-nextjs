import { type BaseDataFrame } from "@lib/dataframe/base-dataframe"

export interface IBaseClusterGroup {
  name: string
  search: string[]
  color: string
}

export interface IClusterGroup extends IBaseClusterGroup {
  id: string
  name: string
  search: string[]
  color: string
  //indices: number[]
}

export function getColIdxFromGroup(
  df: BaseDataFrame | null,
  g: IBaseClusterGroup,
  caseSensitive = false,
): number[] {
  if (!df) {
    return []
  }

  const lcSearch = caseSensitive ? g.search : g.search.map(s => s.toLowerCase())

  return df.columns.values
    .map((col, ci) => [ci, col.toString().toLowerCase()] as [number, string])
    .filter((c: [number, string]) => {
      for (const x of lcSearch) {
        if (c[1].includes(x)) {
          return true
        }
      }

      return false
    })
    .map((c: [number, string]) => c[0])
}

/**
 * Given a dataframe and a clustergroup, return the columns matching the group.
 *
 * @param df
 * @param g
 * @param caseSensitive
 * @returns
 */
export function getColNamesFromGroup(
  df: BaseDataFrame | null,
  g: IBaseClusterGroup,
  caseSensitive = false,
): string[] {
  if (!df) {
    return []
  }

  return getColIdxFromGroup(df, g, caseSensitive).map(i => df.getColName(i))
}
