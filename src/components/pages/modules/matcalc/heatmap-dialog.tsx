import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import {
  dfMean,
  dfMeanFilter,
  dfMedian,
  dfMedianFilter,
  dfRowZScore,
  dfStdev,
  dfStdevFilter,
} from '@components/pages/plot/dataframe-ui'
import { VCenterRow } from '@components/v-center-row'
import { TEXT_CANCEL } from '@consts'
import { HistoryContext } from '@hooks/use-history'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import {
  HCluster,
  MAIN_CLUSTER_FRAME,
  averageLinkage,
  singleLinkage,
  type ClusterFrame,
  type IClusterTree,
  type IDistFunc,
  type ILinkage,
} from '@lib/math/hcluster'
import { useContext, useEffect } from 'react'

import { Input } from '@components/shadcn/ui/themed/input'
import { SelectItem, SelectList } from '@components/shadcn/ui/themed/select'

import {
  euclidean as euclideanDist,
  pearsond as pearsonDist,
} from '@lib/math/distance'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/shadcn/ui/themed/accordion'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { MatcalcSettingsContext } from './matcalc-settings-context'

export const MAX_CLUSTER_ITEMS = 501

const LINKAGE_MAP: { [k: string]: ILinkage } = {
  Average: averageLinkage,
  Single: singleLinkage,
}

const DISTANCE_METRIC_MAP: { [k: string]: IDistFunc } = {
  Correlation: pearsonDist,
  Euclidean: euclideanDist,
}

export interface IProps {
  open?: boolean
  df: BaseDataFrame | null
  isClusterMap?: boolean
  onPlot: (cf: ClusterFrame) => void
  onCancel: () => void
}

export function HeatMapDialog({
  open = true,
  df,
  isClusterMap = true,
  onPlot,
  onCancel,
}: IProps) {
  //const [linkage, setLinkage] = useState("Average")
  //const [distanceMetric, setDistanceMetric] = useState("Correlation")

  //const [topRows, setTopRows] = useState(1000)
  //const [method, setMethod] = useState("Stdev")
  const [settings, settingsDispatch] = useContext(MatcalcSettingsContext)
  const [, historyDispatch] = useContext(HistoryContext)

  //console.log(settings)

  useEffect(() => {
    // In cluster mode, force column clustering
    if (isClusterMap) {
      settingsDispatch({
        type: 'apply',
        state: {
          ...settings,
          heatmap: { ...settings.heatmap, clusterCols: isClusterMap },
        },
      })
    }
  }, [isClusterMap])

  function makeCluster() {
    if (!df) {
      onCancel()
      return
    }

    if (settings.heatmap.filterRows) {
      switch (settings.heatmap.rowFilterMethod) {
        case 'Mean':
          dfMean(df, historyDispatch)

          df = dfMeanFilter(df, historyDispatch, settings.heatmap.topRows)
          break
        case 'Median':
          dfMedian(df, historyDispatch)

          df = dfMedianFilter(df, historyDispatch, settings.heatmap.topRows)
          break
        default:
          // stdev
          dfStdev(df, historyDispatch)

          df = dfStdevFilter(df, historyDispatch, settings.heatmap.topRows)
          break
      }

      if (!df) {
        onCancel()
        return
      }
    }

    if (settings.heatmap.zscoreRows) {
      df = dfRowZScore(df, historyDispatch)
    }

    if (!df) {
      onCancel()
      return
    }

    const linkageFunc: ILinkage = LINKAGE_MAP[settings.heatmap.linkage]
    const distFunc: IDistFunc = DISTANCE_METRIC_MAP[settings.heatmap.distance]

    //console.log(distanceMetric, distFunc)

    const hc = new HCluster(linkageFunc, distFunc)

    let rowC: IClusterTree | null = null
    let colC: IClusterTree | null = null

    if (settings.heatmap.clusterRows && df.shape[0] < MAX_CLUSTER_ITEMS) {
      rowC = hc.run(df)
    }

    if (settings.heatmap.clusterCols && df.shape[1] < MAX_CLUSTER_ITEMS) {
      colC = hc.run(df.t())
    }

    const cf: ClusterFrame = {
      rowTree: rowC,
      colTree: colC,
      dataframes: { [MAIN_CLUSTER_FRAME]: df },
    }

    onPlot(cf)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Heatmap"
      onReponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel()
        } else {
          makeCluster()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 3xl:w-1/4"
    >
      <Accordion type="multiple" defaultValue={['transform', 'cluster']}>
        <AccordionItem value="transform">
          <AccordionTrigger>Transform</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            <VCenterRow className="gap-x-2">
              <Checkbox
                checked={settings.heatmap.filterRows}
                onCheckedChange={value => {
                  settingsDispatch({
                    type: 'apply',
                    state: {
                      ...settings,
                      heatmap: { ...settings.heatmap, filterRows: value },
                    },
                  })
                }}
              />
              <span>Top</span>
              <Input
                id="top-rows"
                value={settings.heatmap.topRows.toString()}
                onChange={e => {
                  const v = Number.parseInt(e.target.value)

                  if (Number.isInteger(v)) {
                    settingsDispatch({
                      type: 'apply',
                      state: {
                        ...settings,
                        heatmap: { ...settings.heatmap, topRows: v },
                      },
                    })
                  }
                }}
                className="w-20 rounded-md"
              />
              <span className="shrink-0">rows using</span>
              <SelectList
                value={settings.heatmap.rowFilterMethod}
                onValueChange={value =>
                  settingsDispatch({
                    type: 'apply',
                    state: {
                      ...settings,
                      heatmap: { ...settings.heatmap, rowFilterMethod: value },
                    },
                  })
                }
                className="w-32"
              >
                <SelectItem value="Stdev">Stdev</SelectItem>
                <SelectItem value="Mean">Mean</SelectItem>
                <SelectItem value="Median">Median</SelectItem>
              </SelectList>
            </VCenterRow>

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

            <VCenterRow>
              <span className="w-24">Linkage</span>
              <SelectList
                value={settings.heatmap.linkage}
                onValueChange={value => {
                  settingsDispatch({
                    type: 'apply',
                    state: {
                      ...settings,
                      heatmap: { ...settings.heatmap, linkage: value },
                    },
                  })
                }}
                className="w-40"
              >
                <SelectItem value="Average">Average</SelectItem>

                <SelectItem value="Single">Single</SelectItem>
              </SelectList>
            </VCenterRow>

            <VCenterRow>
              <span className="w-24">Distance</span>
              <SelectList
                value={settings.heatmap.distance}
                onValueChange={value => {
                  settingsDispatch({
                    type: 'apply',
                    state: {
                      ...settings,
                      heatmap: { ...settings.heatmap, distance: value },
                    },
                  })
                }}
                className="w-40"
              >
                <SelectItem value="Correlation">Correlation</SelectItem>

                <SelectItem value="Euclidean">Euclidean</SelectItem>
              </SelectList>
            </VCenterRow>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
