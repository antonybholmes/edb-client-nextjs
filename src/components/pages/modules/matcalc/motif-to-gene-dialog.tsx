import { BaseCol } from "@components/base-col"

import { OKCancelDialog } from "@components/dialog/ok-cancel-dialog"
import type { ISelectionRange } from "@components/table/use-selection-range"
import { TEXT_CANCEL } from "@consts"
import { HistoryContext } from "@hooks/use-history"
import { type BaseDataFrame } from "@lib/dataframe/base-dataframe"

import { DataFrame } from "@lib/dataframe/dataframe"

import { useContext, useEffect, useState } from "react"

import { Checkbox } from "@components/shadcn/ui/themed/check-box"
import type { SeriesType } from "@lib/dataframe/dataframe-types"
import { NA } from "@lib/text/text"
import { API_MOTIF_SEARCH_URL, JSON_HEADERS } from "@modules/edb"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface IMotif {
  db: string[]
  genes: string[]
}

type IMotifToGeneDb = { [key: string]: IMotif }

export interface IProps {
  open?: boolean
  df: BaseDataFrame | null
  selection: ISelectionRange
  onConversion: () => void
  onCancel: () => void
}

export function MotifToGeneDialog({
  open = true,
  df,
  selection,
  onConversion,
  onCancel,
}: IProps) {
  const queryClient = useQueryClient()

  const [useIndex, setUseIndex] = useState(false)
  const [useColumns, setUseColumns] = useState(false)
  const [db, setDb] = useState<IMotifToGeneDb | null>(null)
  const [, historyDispatch] = useContext(HistoryContext)

  useEffect(() => {
    setUseIndex(selection.start.c === -1)
    setUseColumns(selection.start.c !== -1)
  }, [df, selection])

  // const dbQuery = useQuery({
  //   queryKey: ["database"],
  //   queryFn: async () => {
  //     const res = await axios.get("/data/modules/motifs/motif_to_gene.json")

  //     return res.data
  //   },
  // })

  //console.log(dbQuery)

  async function convert() {
    if (!df || df.size === 0) {
      return
    }
    try {
      // const res = await queryClient.fetchQuery("database", async () => {
      //   return axios.get("/data/modules/motifs/motif_to_gene.json")
      // })

      let rename: string[]

      if (useIndex) {
        // convert index
        rename = df.index.strs
      } else {
        rename = df.col(useColumns ? selection.start.c : 0)!.strs
      }

      const table: SeriesType[][] = []

      for (const [ri, row] of df.values.entries()) {
        let id = rename[ri] ?? NA

        const res = await queryClient.fetchQuery({
          queryKey: ["motiftogene"],
          queryFn: () =>
            axios.post(
              API_MOTIF_SEARCH_URL,
              {
                search: id,
                reverse: false,
                complement: false,
              },
              {
                headers: JSON_HEADERS,
              },
            ),
        })

        let data = res.data.data

        const genes = new Set<String>()

        // for every entry, get all the gesns and assemble into a set
        for (const motif of data.motifs) {
          for (const gene of motif.genes) {
            genes.add(gene)
          }
        }

        //if (data[ri].conversions.length > 0) {
        //  id = data[ri].conversions[0].genes.join("|")
        //}

        table.push(row.concat([...genes].sort().join(",")))
      }

      const header: string[] = df.colNames.concat(["Motif to gene"])

      let df_out = new DataFrame({
        data: table,
        index: df.index,
        columns: header,
      })

      historyDispatch({
        type: "add_step",
        name: "Motif to gene",
        sheets: [df_out.setName("Motif to gene")],
      })
    } catch (error) {
      console.log(error)
    }

    onConversion?.()
  }

  return (
    <OKCancelDialog
      open={open}
      title="Motif To Gene"
      onReponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel()
        } else {
          convert()
        }
      }}
      className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <BaseCol className="gap-y-2 text-sm">
        <BaseCol className="gap-y-1">
          <Checkbox checked={useIndex} onCheckedChange={setUseIndex}>
            Convert index
          </Checkbox>

          <Checkbox checked={useColumns} onCheckedChange={setUseColumns}>
            Convert selected column
          </Checkbox>
        </BaseCol>
      </BaseCol>
    </OKCancelDialog>
  )
}
