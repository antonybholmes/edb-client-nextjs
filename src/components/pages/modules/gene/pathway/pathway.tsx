'use client'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'
import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { BaseCol } from '@components/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { PlayIcon } from '@icons/play-icon'

import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ZoomSlider } from '@components/toolbar/zoom-slider'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { OpenFiles } from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { HistoryContext, HistoryProvider } from '@components/history-provider'
import { LayersIcon } from '@components/icons/layers-icon'
import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { FileLinesIcon } from '@icons/file-lines-icon'
import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'
import {
  PATHWAY_TABLE_COLS,
  type IDataset,
  type IGeneSet,
} from '@modules/gene/pathway/pathway'

import { UploadIcon } from '@components/icons/upload-icon'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { TabSlideBar } from '@components/tab-slide-bar'

import {
  NO_DIALOG,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@consts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import {
  BaseDataFrame,
  DEFAULT_SHEET_NAME,
} from '@lib/dataframe/base-dataframe'

import { DataFrame } from '@lib/dataframe/dataframe'
import { makeRandId, nanoid } from '@lib/utils'
import {
  API_PATHWAY_DATASET_URL,
  API_PATHWAY_DATASETS_URL,
  API_PATHWAY_GENES_URL,
  API_PATHWAY_OVERLAP_URL,
  JSON_HEADERS,
} from '@modules/edb'
import { AccountSettingsProvider } from '@providers/account-settings-provider'
import axios from 'axios'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { range } from '@lib/math/range'
import { truncate } from '@lib/text/text'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { HistoryPanel } from '@components/pages/history-panel'
import type { ITab } from '@components/tab-provider'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { SHEET_PANEL_CLS } from '@components/pages/modules/matcalc/data-panel'

import {
  AlertsContext,
  AlertsProvider,
  makeAlert,
  makeErrorAlert,
  makeInfoAlert,
} from '@components/alerts/alerts-provider'
import LoadingSpinner from '@components/alerts/loading-spinner'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import type { SeriesType } from '@lib/dataframe/dataframe-types'
import { sum } from '@lib/math/sum'
import MODULE_INFO from './module.json'

const HELP_URL = '/help/modules/pathway'

const TIMEOUT_MS = 120000

interface IDatasetInfo {
  organization: string
  name: string
  pathways: number
}

interface IOrgInfo {
  name: string
  datasets: IDatasetInfo[]
}

function makeDatasetId(dataset: IDatasetInfo) {
  return `${dataset.organization}:${dataset.name}`
}

export function PathwayPage() {
  const queryClient = useQueryClient()

  const worker = useRef<Worker>()

  const [activeSideTab] = useState('Data')

  const [rightTab, setRightTab] = useState('Gene Sets')
  const [showSideBar, setShowSideBar] = useState(true)
  //const [showHelp, setShowHelp] = useState(false)

  const downloadRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [historyState, historyDispatch] = useContext(HistoryContext)

  const [_, alertDispatch] = useContext(AlertsContext)

  const [toolbarTab, setToolbarTab] = useState('Home')

  const [scale, setScale] = useState(3)
  const [selectedTab] = useState(0)
  const [displayProps, setDisplayProps] = useState({
    scale: 1,
    xrange: [0, 500],
    yrange: [0, 1000],
  })

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [selectAllDatasets, setSelectAllDatasets] = useState(true)

  // const [geneSets, setGeneSets] = useState<
  //   {
  //     database: string
  //     genesets: {
  //       name: string
  //       url: string
  //     }[]
  //   }[]
  // >([])

  const [datasetInfos, setDatasetInfos] = useState<IOrgInfo[]>([])

  const [datasetInfoTabs, setDatasetInfoTabs] = useState<string[]>([])

  const [datasetsForUse, setDatasetsForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [validGeneSet, setValidGeneSet] = useState(new Set<String>())

  /**
   * Lazy fetch valid genes if not already cached.
   */
  const getValidGenes = useCallback(async () => {
    if (validGeneSet.size > 0) {
      return validGeneSet
    }

    const ret = new Set<string>()

    // Only fetch if data is missing
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['genes'],
        queryFn: () =>
          axios.get(API_PATHWAY_GENES_URL, { headers: JSON_HEADERS }),
      })

      const dataset = res.data.data

      for (const gene of dataset.map((g: string) => g.toLowerCase())) {
        ret.add(gene)
      }
    } catch (e) {
      console.log(e)
    }

    setValidGeneSet(ret)
    return ret
  }, [validGeneSet])

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  function onFileChange(message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file: File = files[0] // OR const file = files.item(i);
    const name = file.name

    const fileReader = new FileReader()

    fileReader.onload = e => {
      const result = e.target?.result

      if (result) {
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        const lines = text.split(/[\r\n]+/g).filter(line => line.length > 0)
        //.slice(0, 100)

        const table = new DataFrameReader()
          .indexCols(0)
          .ignoreRows(file.name.includes('gmx') ? [1] : [])
          .read(lines)
          .setName(file.name)

        //setDataFile(table)

        open(table)
      }
    }

    fileReader.readAsText(files[0])
  }

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/pathway.txt'),
    })

    try {
      const lines = res.data
        .split(/[\r\n]+/g)
        .filter((line: string) => line.length > 0)

      const table = new DataFrameReader()
        .keepDefaultNA(false)
        .indexCols(0)
        .read(lines)
        .setName('Genesets')

      //resolve({ ...table, name: file.name })

      open(table)
    } catch (error) {
      // do nothing
    }
  }

  function open(table: BaseDataFrame) {
    if (worker.current) {
      worker.current.terminate()
    }

    alertDispatch({ type: 'clear' })

    historyDispatch({
      type: 'reset',
      name: `Load ${table.name}`,
      sheets: [table.setName(truncate(table.name, { length: 16 }))],
    })
  }

  async function runLocal() {
    //setIsRunning(true)

    const df = historyState.currentStep.currentSheet

    if (df.size === 0 || df.name === DEFAULT_SHEET_NAME) {
      alertDispatch({
        type: 'set',
        alert: makeErrorAlert({
          title: 'Pathway',
          content: 'You must load at least 1 geneset to test.',
          size: 'dialog',
        }),
      })

      return
    }

    const genes = await getValidGenes()

    // only keep genes in approved list
    const genesets: IGeneSet[] = range(0, df.shape[1]).map(col => {
      return {
        name: df.col(0).name.toString(),
        genes: df
          .col(0)
          .strs.filter(v => v !== '' && genes.has(v.toLowerCase())),
      }
    })

    if (sum(genesets.map(geneset => geneset.genes.length)) === 0) {
      // setShowDialog({
      //   name: "alert",
      //   params: {
      //     message: "You must load at least 1 geneset to test.",
      //   },
      // })

      alertDispatch({
        type: 'set',
        alert: makeErrorAlert({
          title: 'Pathway',
          content:
            'None of your gene sets appear to contain valid gene symbols.',
          size: 'dialog',
        }),
      })

      return
    }

    const queryDatasets = datasetInfos
      .map(org =>
        org.datasets.filter(dataset =>
          datasetsForUse.get(makeDatasetId(dataset))
        )
      )
      .flat()

    const datasets: IDataset[] = []

    console.log(API_PATHWAY_DATASET_URL)

    try {
      for (const qd of queryDatasets) {
        const res = await queryClient.fetchQuery({
          queryKey: ['dataset'],
          queryFn: () =>
            axios.post(
              API_PATHWAY_DATASET_URL,
              {
                organization: qd.organization,
                name: qd.name,
              },
              { headers: JSON_HEADERS }
            ),
        })

        console.log(res.data)

        const dataset = res.data.data

        datasets.push(dataset) //{organization:dataset.organization, name:dataset, genes:new Set<string>(dataset.genes)})
      }
    } catch (e) {
      console.log(e)
    }

    if (datasets.length < 1) {
      setShowDialog({
        name: 'alert',
        params: {
          message: 'You must select some datasets to test.',
        },
      })

      return
    }

    //const runningAlertId = nanoid()
    alertDispatch({
      type: 'set',
      alert: makeAlert({
        //id: runningAlertId,
        //title: "Pathway",
        icon: <LoadingSpinner />,
        content: 'Running pathway analysis, this may take a few seconds...',

        onClose: () => {
          //console.log("terminated")
          if (worker.current) {
            worker.current.terminate()
          }
        },
      }),
    })

    // stop any current jobs before continuing
    if (worker.current) {
      worker.current.terminate()
    }

    worker.current = new Worker(
      new URL('./pathway.worker.ts', import.meta.url),
      {
        type: 'module',
      }
    )

    worker.current.onmessage = function (e) {
      const { data, columns } = e.data

      const dfOut = new DataFrame({ data, columns }).setName('Pathways')

      console.log('pathway', e.data)

      // filter for log10q > 0

      historyDispatch({
        type: 'add_step',
        name: 'Pathway',
        sheets: [dfOut],
      })

      setTimeout(() => {
        const alertId = nanoid()

        alertDispatch({
          type: 'set',
          alert: makeInfoAlert({
            id: alertId,
            //title: "Pathway",
            content: 'Finished.',
          }),
        })

        // setTimeout(() => {
        //   alertDispatch({ type: "remove", id: runningAlertId })
        // }, 4000)

        setTimeout(() => {
          alertDispatch({ type: 'remove', id: alertId })
        }, 4000)
      }, 500)
    }

    worker.current.postMessage({ genesets, datasets })

    /* setTimeout(() => {
      let dfOut = overlap.test(genesets)

      if (!dfOut) {
        return
      }

       */
  }

  // export const PATHWAY_TABLE_COLS = [
  //   "Geneset",
  //   "Dataset",
  //   "Pathway",
  //   "# Genes in Gene Set (K)",
  //   "# Genes in Comparison (n)",
  //   "# Genes in overlap (k)",
  //   "# Genes in Universe",
  //   "# Gene Sets",
  //   "p",
  //   "q",
  //   "-log10q",
  //   "rank",
  //   "Ratio k/n",
  //   "Genes in overlap",
  // ]

  async function run() {
    const queryDatasets = datasetInfos
      .map(org =>
        org.datasets.filter(dataset =>
          datasetsForUse.get(makeDatasetId(dataset))
        )
      )
      .flat()
      .map(dataset => makeDatasetId(dataset))

    console.log(queryDatasets)

    if (queryDatasets.length === 0) {
      setShowDialog({
        name: 'alert',
        params: {
          message: 'You must select at least 1 dataset to test.',
        },
      })

      return
    }

    const df = historyState.currentStep.currentSheet

    if (df.size === 0 || df.name === DEFAULT_SHEET_NAME) {
      setShowDialog({
        name: 'alert',
        params: {
          message: 'You must load at least 1 geneset to test.',
        },
      })

      return
    }

    try {
      const out: SeriesType[][] = []

      for (const col of range(0, df.shape[1])) {
        const geneset = {
          name: df.col(col).name,
          genes: df.col(col).strs.filter(v => v !== ''),
        }

        const res = await queryClient.fetchQuery({
          queryKey: ['pathway'],
          queryFn: () =>
            axios.post(
              API_PATHWAY_OVERLAP_URL,
              {
                geneset,
                datasets: queryDatasets,
              },
              { timeout: TIMEOUT_MS }
              // {
              //   headers: {
              //     //Authorization: bearerTokenHeader(token),
              //     "Content-Type": "application/json",
              //   },
              // },
            ),
        })

        console.log(res.data)

        const data = res.data.data

        const datasets = data.datasets

        data.pathway.forEach((pathway: string, pi: number) => {
          const di = data.datasetIdx[pi]

          const row: SeriesType[] = new Array(PATHWAY_TABLE_COLS.length).fill(0)

          row[0] = geneset.name
          row[1] = datasets[di]
          row[2] = pathway
          row[3] = pi === 0 ? data.validGenes.join(',') : ''
          row[4] = data.validGenes.length
          row[5] = data.pathwayGeneCounts[pi]
          row[6] = data.overlapGeneCounts[pi]
          row[7] = data.genesInUniverseCount
          row[8] = data.pvalues[pi]
          row[9] = data.qvalues[pi]
          //row[9] = -Math.log10(row[8] as number)
          row[10] = data.kdivK[pi]
          row[11] = data.overlapGeneList[pi]
          out.push(row)
        })
      }

      const ret = new DataFrame({ data: out, columns: PATHWAY_TABLE_COLS })

      // console.log(ret)

      historyDispatch({
        type: 'replace_sheet',
        sheetId: `Pathways`,
        sheet: ret.setName('Pathways'),
      })
    } catch (e) {
      console.log(e)
    }
  }

  function save(format: 'txt' | 'csv') {
    const df = historyState.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  const datasetsQuery = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await axios.get(API_PATHWAY_DATASETS_URL, {
        headers: JSON_HEADERS,
      })

      return res.data.data
    },
  })

  useEffect(() => {
    if (datasetsQuery.data) {
      setDatasetInfos(datasetsQuery.data)
    }
  }, [datasetsQuery.data])

  useEffect(() => {
    setDatasetsForUse(
      new Map<string, boolean>(
        datasetInfos
          .map(org =>
            org.datasets.map(
              (dataset: IDatasetInfo) =>
                [makeDatasetId(dataset), true] as [string, boolean]
            )
          )
          .flat()
      )
    )

    setDatasetInfoTabs(datasetInfos.map((org: IOrgInfo) => org.name))
  }, [datasetInfos])

  useEffect(() => {
    console.log(
      new Map<string, boolean>(
        datasetInfos
          .map(org =>
            org.datasets.map(
              (dataset: IDatasetInfo) =>
                [makeDatasetId(dataset), selectAllDatasets] as [string, boolean]
            )
          )
          .flat()
      )
    )

    setDatasetsForUse(
      new Map<string, boolean>(
        datasetInfos
          .map(org =>
            org.datasets.map(
              (dataset: IDatasetInfo) =>
                [makeDatasetId(dataset), selectAllDatasets] as [string, boolean]
            )
          )
          .flat()
      )
    )
  }, [selectAllDatasets])

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Home',
      content: (
        <>
          <ToolbarTabGroup>
            <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  setShowDialog({
                    name: makeRandId('open'),
                  })
                }
              }}
              multiple={true}
              fileTypes={['txt', 'tsv', 'gmx']}
            />

            {selectedTab === 0 && (
              <ToolbarIconButton onClick={() => save('txt')} title="Save table">
                <SaveIcon className="-scale-100 fill-foreground" />
              </ToolbarIconButton>
            )}
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Pathway analysis"
              onClick={() => runLocal()}
              title="Run pathway analysis"
            >
              <PlayIcon />
              <span>Test Pathways</span>
            </ToolbarButton>

            {/* <Tooltip content="Create bar plot">
              <ToolbarButton aria-label="Create bar plot" onClick={makeBarPlot}>
                Bar Plot
              </ToolbarButton>
            </Tooltip> */}
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = useMemo(() => {
    return [
      {
        //id: nanoid(),
        icon: <LayersIcon />,
        name: 'Gene Sets',
        content: (
          <BaseCol className="grow gap-y-3 pt-2 text-xs">
            <Checkbox
              aria-label={`Select all gene sets`}
              checked={selectAllDatasets}
              onCheckedChange={() => setSelectAllDatasets(!selectAllDatasets)}
            >
              Select All
            </Checkbox>

            <ScrollAccordion
              value={datasetInfoTabs}
              onValueChange={setDatasetInfoTabs}
            >
              {datasetInfos.map((org: IOrgInfo, oi) => {
                return (
                  <AccordionItem value={org.name} key={oi}>
                    <AccordionTrigger>{org.name}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-y-1.5">
                        {org.datasets.map(
                          (dataset: IDatasetInfo, di: number) => (
                            <li key={di}>
                              <Checkbox
                                aria-label={`Use dataset ${dataset.name}`}
                                checked={datasetsForUse.get(
                                  makeDatasetId(dataset)
                                )}
                                onCheckedChange={() => {
                                  setDatasetsForUse(
                                    new Map<string, boolean>([
                                      ...datasetsForUse.entries(),
                                      [
                                        dataset.name,
                                        !datasetsForUse.get(dataset.name),
                                      ],
                                    ])
                                  )
                                }}
                              >
                                {`${dataset.name} (${dataset.pathways.toLocaleString()})`}
                              </Checkbox>
                            </li>
                          )
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </ScrollAccordion>
          </BaseCol>
        ),
      },
      {
        //id: nanoid(),
        icon: <ClockRotateLeftIcon />,
        name: 'History',
        content: <HistoryPanel />,
      },
    ]
  }, [datasetsForUse, datasetInfoTabs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      name: TEXT_OPEN,
      icon: <OpenIcon fill="" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() =>
            setShowDialog({ name: makeRandId('open'), params: {} })
          }
        >
          <UploadIcon fill="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      name: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('txt')}
          >
            <FileLinesIcon fill="" />
            <span>Download as TXT</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('csv')}
          >
            <span>Download as CSV</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.name === 'alert' && (
        <BasicAlertDialog onReponse={() => setShowDialog(NO_DIALOG)}>
          {showDialog.params!.message}
        </BasicAlertDialog>
      )}

      <ShortcutLayout info={MODULE_INFO} signInEnabled={false}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  setShowSideBar(!showSideBar)
                }}
              />
            }
          />
        </Toolbar>

        {/* <HelpSlideBar
          open={showHelp}
          onOpenChange={setShowHelp}
          helpUrl={HELP_URL}
          
        > */}
        <TabSlideBar
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={selectedTab => setRightTab(selectedTab.tab.name)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="pr-2"
        >
          <TabbedDataFrames
            selectedSheet={historyState.currentStep.currentSheetIndex}
            dataFrames={historyState.currentStep.sheets}
            onTabChange={selectedTab => {
              historyDispatch({
                type: 'goto_sheet',
                sheetId: selectedTab.index,
              })
            }}
            className={SHEET_PANEL_CLS}
          />
        </TabSlideBar>
        {/* </HelpSlideBar> */}

        <ToolbarFooter className="justify-end">
          <>
            {activeSideTab === 'Data' && (
              <span>
                {getFormattedShape(historyState.currentStep.currentSheet)}
              </span>
            )}
          </>
          <></>
          <>
            {activeSideTab === 'Chart' && (
              <ZoomSlider scale={scale} onZoomChange={adjustScale} />
            )}
          </>
        </ToolbarFooter>

        <OpenFiles
          open={showDialog.name.includes('open') ? showDialog.name : ''}
          //onOpenChange={() => setShowDialog(NO_DIALOG)}
          onFileChange={onFileChange}
        />

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function PathwayQueryPage() {
  return (
    <AccountSettingsProvider>
      <HistoryProvider>
        <AlertsProvider>
          <PathwayPage />
        </AlertsProvider>
      </HistoryProvider>
    </AccountSettingsProvider>
  )
}
