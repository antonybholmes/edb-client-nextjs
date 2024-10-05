import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@components/shadcn/ui/themed/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/shadcn/ui/themed/select'
import { TEXT_OK } from '@consts'
import { HistoryContext } from '@hooks/use-history'
import { type IClusterGroup } from '@lib/cluster-group'
import type { IndexFromType } from '@lib/dataframe'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { DataFrame } from '@lib/dataframe/dataframe'
import { filterNA, findCols, subset, zip } from '@lib/dataframe/dataframe-utils'
import { MAIN_CLUSTER_FRAME, type ClusterFrame } from '@lib/math/hcluster'
import { range } from '@lib/math/range'

import { SeriesType } from '@lib/dataframe/dataframe-types'
import { useContext, useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { MatcalcSettingsContext } from './matcalc-settings-context'

const MAX_COLS = 10
const FOLD_REGEX = /fold/
const P_REGEX = /(?:padj|fdr)/

interface IFormInput {
  foldChangeCol: string
  pValueCol: string
  applyLog2ToFoldChange: boolean
  applyLog10ToPValue: boolean
}

export interface IProps extends IModalProps {
  open?: boolean
  df: BaseDataFrame | null
  groups: IClusterGroup[]
  minThreshold?: number
  onPlot: (cf: ClusterFrame) => void
  onCancel: () => void
}

function findFoldChangeCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'Log2 Fold Change'
  }

  const cols = df.colNames.filter(c => FOLD_REGEX.test(c.toLowerCase()))

  if (cols.length === 0) {
    return 'Log2 Fold Change'
  }

  return cols[0]
}

function findPValueCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'FDR'
  }

  const cols = df.colNames.filter(c => P_REGEX.test(c.toLowerCase()))

  if (cols.length === 0) {
    return 'FDR'
  }

  return cols[0]
}

export function VolcanoDialog({ open = true, df, onPlot, onCancel }: IProps) {
  const [, historyDispatch] = useContext(HistoryContext)
  const [settings, settingsDispatch] = useContext(MatcalcSettingsContext)
  const btnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<IFormInput>({
    defaultValues: {
      foldChangeCol: findFoldChangeCol(df),
      pValueCol: findPValueCol(df),
      applyLog2ToFoldChange: settings.volcano.log2FC,
      applyLog10ToPValue: settings.volcano.log10P,
    },
  })

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()
    if (!df) {
      onCancel()
      return
    }

    let idx = findCols(df, data.foldChangeCol)

    if (idx.length === 0) {
      return
    }

    let foldChanges: SeriesType[] = df.col(idx[0])!.values

    idx = findCols(df, data.pValueCol)

    if (idx.length === 0) {
      return
    }

    let pvalues: SeriesType[] = df.col(idx[0])!.values

    // remove na
    idx = filterNA(pvalues)

    foldChanges = subset(foldChanges, idx)
    pvalues = subset(pvalues, idx)

    if (data.applyLog2ToFoldChange) {
      foldChanges = foldChanges.map(v => -Math.log2(v as number))
    }

    // label
    const idxUp = pvalues
      .map((v, vi) => [v, vi] as [number, number])
      .filter(v => v[0] < 0.05 && (foldChanges[v[1]] as number) >= 0)
      .map(v => v[1])
    const idxDown = pvalues
      .map((v, vi) => [v, vi] as [number, number])
      .filter(v => v[0] < 0.05 && (foldChanges[v[1]] as number) < 0)
      .map(v => v[1])

    const labels = range(0, foldChanges.length).map(() => 0.5)

    idxUp.forEach(i => {
      labels[i] = 1
    })

    idxDown.forEach(i => {
      labels[i] = 0
    })

    if (data.applyLog10ToPValue) {
      pvalues = pvalues.map(v => -Math.log10(v as number))
    }

    const vdf = new DataFrame({
      name: 'Volcano',
      data: zip(foldChanges, pvalues, labels),
      index: subset(df.index.values, idx) as IndexFromType,
      columns: ['Log2 fold change', '-log10 p-value', 'Label'],
    })

    historyDispatch({
      type: 'add_step',
      name: 'Volcano',
      sheets: [vdf],
    })

    const cf: ClusterFrame = {
      rowTree: null,
      colTree: null,
      dataframes: { [MAIN_CLUSTER_FRAME]: vdf },
    }

    settingsDispatch({
      type: 'apply',
      state: {
        ...settings,
        volcano: {
          ...settings.volcano,
          log2FC: settings.volcano.log2FC,
          log10P: data.applyLog10ToPValue,
        },
      },
    })

    onPlot(cf)

    //_resp(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Volcano Plot"
      onReponse={r => {
        if (r === TEXT_OK) {
          btnRef.current?.click()
        } else {
          onCancel()
        }
      }}
      //className="w-3/4 md:1/2 lg:1/3 2xl:w-1/4"
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2 text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="foldChangeCol"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormLabel className="w-24 shrink-0">Fold Change</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-42">
                      <SelectValue placeholder="Select the fold change column" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {df?.colNames.slice(0, MAX_COLS).map((name, ni) => (
                      <SelectItem value={name} key={ni}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pValueCol"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormLabel className="w-24 shrink-0">P-value</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Select the fold change column" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {df?.colNames.slice(0, MAX_COLS).map((name, ni) => (
                      <SelectItem value={name} key={ni}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applyLog2ToFoldChange"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <div className="w-24 shrink-0" />
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Apply log2 to fold change</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applyLog10ToPValue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <div className="w-24 shrink-0" />
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Apply log10 to p-value</FormLabel>
              </FormItem>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
