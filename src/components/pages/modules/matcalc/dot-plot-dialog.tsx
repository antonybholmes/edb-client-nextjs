import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { dfRowZScore } from '@components/pages/plot/dataframe-ui'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/shadcn/ui/themed/accordion'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { TEXT_CANCEL } from '@consts'
import { HistoryContext } from '@hooks/use-history'
import { getColIdxFromGroup, type IClusterGroup } from '@lib/cluster-group'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { DataFrame } from '@lib/dataframe/dataframe'
import { rowMean } from '@lib/dataframe/dataframe-utils'
import {
  HCluster,
  type ClusterFrame,
  type IClusterTree,
} from '@lib/math/hcluster'
import { useContext } from 'react'
import { MAX_CLUSTER_ITEMS } from './heatmap-dialog'
import { MatcalcSettingsContext } from './matcalc-settings-context'

export interface IProps extends IModalProps {
  open?: boolean
  df: BaseDataFrame | null
  groups: IClusterGroup[]
  minThreshold?: number
  onPlot: (cf: ClusterFrame) => void
}

export function DotPlotDialog({
  open = true,
  df,
  groups,
  minThreshold = 0,
  onPlot,
  onReponse,
}: IProps) {
  //const [zscore, setZscore] = useState(true)
  const [settings, settingsDispatch] = useContext(MatcalcSettingsContext)

  const [, historyDispatch] = useContext(HistoryContext)

  function _resp(resp: string) {
    onReponse?.(resp)
  }

  function makeDotPlot() {
    if (!df) {
      _resp(TEXT_CANCEL)
      return
    }

    // get group means
    const means: number[][] = []
    const percents: number[][] = []

    groups.forEach(group => {
      const colIdx = getColIdxFromGroup(df, group)

      const dfg = df!.iloc(':', colIdx)
      means.push(rowMean(dfg))

      // percentage in each group
      const p: number[] = df!.rowMap(
        row =>
          (row as number[]).filter(x => x > minThreshold).length / row.length
      )

      percents.push(p)
    })

    const index = groups.map(g => g.name)
    // build group mean row centric then transpose
    const groupMeanDf = new DataFrame({
      name: 'Group means',
      data: means,
      index,
      columns: df.index,
    }).t()

    const groupPercentDf = new DataFrame({
      name: 'Group percentages',
      data: percents,
      index,
      columns: df.index,
    }).t()

    historyDispatch({
      type: 'add_step',
      name: 'Dot stats',
      sheets: [groupMeanDf, groupPercentDf],
    })

    const dfZ = settings.heatmap.zscoreRows
      ? dfRowZScore(groupMeanDf, historyDispatch)
      : groupMeanDf

    if (!dfZ) {
      _resp(TEXT_CANCEL)
      return
    }

    const hc = new HCluster()

    let rowC: IClusterTree | null = null
    let colC: IClusterTree | null = null

    if (settings.heatmap.clusterRows && dfZ.shape[0] < MAX_CLUSTER_ITEMS) {
      rowC = hc.run(dfZ)
    }

    if (settings.heatmap.clusterCols && dfZ.shape[1] < MAX_CLUSTER_ITEMS) {
      colC = hc.run(dfZ.t())
    }

    const cf = {
      rowTree: rowC,
      colTree: colC,
      dataframes: { main: dfZ, percent: groupPercentDf },
    }

    onPlot(cf)

    //_resp(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Dot Plot"
      onReponse={r => {
        if (r === TEXT_CANCEL) {
          _resp(r)
        } else {
          makeDotPlot()
        }
      }}
      //className="w-3/4 text-sm md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <Accordion type="multiple" value={['transform', 'cluster']}>
        <AccordionItem value="transform">
          <AccordionTrigger>Transform</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            <Checkbox
              checked={settings.heatmap.zscoreRows}
              onCheckedChange={value => {
                settingsDispatch({
                  type: 'apply',
                  state: {
                    ...settings,
                    heatmap: { ...settings.heatmap, zscoreRows: value },
                  },
                })
              }}
            >
              Z-score rows
            </Checkbox>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cluster">
          <AccordionTrigger>Cluster</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            <Checkbox
              checked={settings.heatmap.clusterRows}
              onCheckedChange={value => {
                settingsDispatch({
                  type: 'apply',
                  state: {
                    ...settings,
                    heatmap: { ...settings.heatmap, clusterRows: value },
                  },
                })
              }}
            >
              Rows
            </Checkbox>

            <Checkbox
              checked={settings.heatmap.clusterCols}
              onCheckedChange={value => {
                settingsDispatch({
                  type: 'apply',
                  state: {
                    ...settings,
                    heatmap: { ...settings.heatmap, clusterCols: value },
                  },
                })
              }}
            >
              Columns
            </Checkbox>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
