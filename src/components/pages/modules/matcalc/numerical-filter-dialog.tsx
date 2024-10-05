import { BaseCol } from '@components/base-col'

import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import {
  dfMean,
  dfMeanFilter,
  dfMedian,
  dfMedianFilter,
  dfStdev,
  dfStdevFilter,
} from '@components/pages/plot/dataframe-ui'
import { Input } from '@components/shadcn/ui/themed/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/shadcn/ui/themed/select'
import { VCenterRow } from '@components/v-center-row'
import { TEXT_OK } from '@consts'
import { HistoryContext } from '@hooks/use-history'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { useContext, useState } from 'react'

export interface IProps {
  open?: boolean
  df: BaseDataFrame | null
  onFilter: (df: BaseDataFrame) => void
  onCancel: () => void
}

export function NumericalFilterDialog({
  open = true,
  df,
  onFilter,
  onCancel,
}: IProps) {
  const [topRows, setTopRows] = useState(1000)
  const [method, setMethod] = useState('Stdev')
  const [, historyDispatch] = useContext(HistoryContext)

  function applyFilter() {
    if (!df) {
      onCancel()
      return
    }

    switch (method) {
      case 'Mean':
        //mean
        dfMean(df, historyDispatch)

        df = dfMeanFilter(df, historyDispatch, topRows)
        break
      case 'Median':
        dfMedian(df, historyDispatch)

        df = dfMedianFilter(df, historyDispatch, topRows)
        break
      default:
        // stdev
        dfStdev(df, historyDispatch)

        df = dfStdevFilter(df, historyDispatch, topRows)
        break
    }

    if (!df) {
      onCancel()
      return
    }

    onFilter(df)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Filter"
      onReponse={r => {
        if (r === TEXT_OK) {
          applyFilter()
        } else {
          onCancel()
        }
      }}
      className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <BaseCol className="gap-y-8 text-sm">
        <VCenterRow className="gap-x-2">
          <span>Top</span>
          <Input
            id="top-rows"
            value={topRows}
            onChange={e => setTopRows(Number.parseInt(e.target.value))}
            className="w-20 rounded-md"
            placeholder="Top rows..."
          />
          <span>rows using</span>
          <Select defaultValue={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select a statistic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Stdev">Stdev</SelectItem>
              <SelectItem value="Mean">Mean</SelectItem>
              <SelectItem value="Median">Median</SelectItem>
            </SelectContent>
          </Select>
        </VCenterRow>
      </BaseCol>
    </OKCancelDialog>
  )
}
