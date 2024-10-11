'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'

import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { TableIcon } from '@components/icons/table-icon'

import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarOptionalDropdownButton } from '@components/toolbar/toolbar-optional-dropdown-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { OpenIcon } from '@components/icons/open-icon'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import { makeGCT } from '@lib/dataframe/dataframe-utils'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import {
  filesToDataFrames,
  OpenFiles,
  type IFileOpen,
  type IParseOptions,
} from '@components/pages/open-files'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import {
  APP_NAME,
  NO_DIALOG,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@consts'

import { FileImageIcon } from '@components/icons/file-image-icon'
import { FileLinesIcon } from '@components/icons/file-lines-icon'
import { SaveIcon } from '@components/icons/save-icon'

import { HistoryContext, HistoryProvider } from '@components/history-provider'
import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { MAIN_CLUSTER_FRAME, type ClusterFrame } from '@lib/math/hcluster'

import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'

import { OpenDialog } from '@components/pages/open-dialog'
import { ShortcutLayout } from '@layouts/shortcut-layout'

import { DotPlotDialog } from './dot-plot-dialog'
import { GeneConvertDialog } from './gene-convert-dialog'
import { HeatMapDialog } from './heatmap-dialog'
import { NumericalFilterDialog } from './numerical-filter-dialog'
import { SortRowDialog } from './sort-row-dialog'
import { VolcanoDialog } from './volcano-dialog'

import { AlertsProvider } from '@components/alerts/alerts-provider'
import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import { ChartIcon } from '@components/icons/chart-icon'
import { FolderIcon } from '@components/icons/folder-icon'
import { UploadIcon } from '@components/icons/upload-icon'
import { SlideBar, SlideBarContentFramer } from '@components/slide-bar'
import {
  SelectionRangeContext,
  SelectionRangeProvider,
} from '@components/table/use-selection-range'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { makeRandId } from '@lib/utils'
import { AccountSettingsProvider } from '@providers/account-settings-provider'
import axios from 'axios'

import { GroupsContext, GroupsProvider } from './groups-context'
import { HeatMapPanel, makeDefaultHeatmapProps } from './heatmap-panel'
import { MotifToGeneDialog } from './motif-to-gene-dialog'
import { PlotPropsContext, PlotPropsProvider } from './plot-props-context'
import { PlotsContext, PlotsProvider, type PlotStyle } from './plots-context'
import {
  makeDefaultVolcanoProps,
  VOLCANO_X,
  VOLCANO_Y,
  VolcanoPanel,
} from './volcano-panel'

import { ArrowUpWideShortIcon } from '@components/icons/arrow-up-wide-short'
import { FilterIcon } from '@components/icons/filter-icon'
import { TransposeIcon } from '@components/icons/transpose-icon'
import {
  MessageContext,
  MessagesProvider,
} from '@components/pages/message-context'
import {
  dfLog,
  dfRowZScore,
  dfStdev,
  dfTranspose,
} from '@components/pages/plot/dataframe-ui'
import { ShowSideButton } from '@components/pages/show-side-button'
import { Tabs, TabsContent } from '@components/shadcn/ui/themed/tabs'
import { type ITab } from '@components/tab-provider'
import { V_SCROLL_CHILD_CLS } from '@components/v-scroll-panel'
import { cn } from '@lib/class-names'
import { useQueryClient } from '@tanstack/react-query'
import { DataPanel } from './data-panel'
import { MatcalcSettingsProvider } from './matcalc-settings-provider'
import MODULE_INFO from './module.json'

interface IClusterFrameProps {
  cf: ClusterFrame | null
  type: PlotStyle
  //params: IFieldMap
}

export const NO_CF: IClusterFrameProps = {
  cf: null,
  type: 'Heatmap',
  //
}

interface IContentTab {
  id: string
  name: string
  content: ReactElement
}

interface IContentTabs {
  id: string
  name: string
  tabs: IContentTab[]
}

export const DEFAULT_TABLE_NAME = 'Table 1'

export const TAB_DATA_TABLES = 'Data Tables'
export const TAB_PLOTS = 'Plots'

const DATA_TAB: ITab = {
  //id: nanoid(),
  name: DEFAULT_TABLE_NAME,
  icon: <TableIcon />,

  //content: <DataPanel />,
  isOpen: true,
}

const DATA_TABLE_TAB: ITab = {
  //id: nanoid(),
  name: TAB_DATA_TABLES,
  icon: <FolderIcon />,

  //content: <DataPanel />,
  isOpen: true,
  children: [DATA_TAB],
}

const PLOTS_TAB: ITab = {
  //id: nanoid(),
  name: 'Plots',
  icon: <FolderIcon />,

  //content: <DataPanel />,
  isOpen: true,
}

function MatcalcPage() {
  const queryClient = useQueryClient()

  const [history, historyDispatch] = useContext(HistoryContext)

  const [plotState, plotDispatch] = useContext(PlotsContext)

  const [_, heatmapPropsDispatch] = useContext(PlotPropsContext)

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [foldersTab, setFoldersTab] = useState<ITab>(DATA_TABLE_TAB)
  const [selectedTab, setSelectedTab] = useState<ITab>(DATA_TAB)
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)

  const [selection, selectionRangeDispatch] = useContext(SelectionRangeContext)

  const [toolbarTabName, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])
  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  // const [displayProps, setDisplayProps] = useState<IHeatMapProps>(
  //   DEFAULT_DISPLAY_PROPS,
  // )

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const [filesToOpen, setFilesToOpen] = useState<IFileOpen[]>([])

  const [groups, groupsDispatch] = useContext(GroupsContext)

  const [, messageDispatch] = useContext(MessageContext)

  const [slidebarSide, setSlidebarSide] = useState<ReactElement | undefined>(
    undefined
  )

  async function loadZTestData() {
    let res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/z_table.txt'),
    })

    const lines = res.data
      .split(/[\r\n]+/g)
      .filter((line: string) => line.length > 0)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: 'reset',
      name: `Load "Z Test"`,
      sheets: [table.setName('Z Test')],
    })

    res = await queryClient.fetchQuery({
      queryKey: ['groups'],
      queryFn: () => axios.get('/data/test/groups.json'),
    })

    groupsDispatch({ type: 'set', groups: res.data })
  }

  async function loadDeseqTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/deseq2.tsv'),
    })

    const lines = res.data
      .split(/[\r\n]+/g)
      .filter((line: string) => line.length > 0)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: 'reset',
      name: `Load "Deseq Test"`,
      sheets: [table.setName('Deseq Test')],
    })
  }

  async function loadGeneTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/geneconv.txt'),
    })

    const lines = res.data
      .split(/[\r\n]+/g)
      .filter((line: string) => line.length > 0)

    console.log(lines)

    const table = new DataFrameReader().read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: 'reset',
      name: `Load "Gene Test"`,
      sheets: [table.setName('Gene Test')],
    })
  }

  useEffect(() => {
    //setTabName("Table 1")
    setSelectedTab(DATA_TAB)

    selectionRangeDispatch({ type: 'clear' })
    //setClusterFrame(NO_CF)
  }, [history])

  useEffect(() => {
    heatmapPropsDispatch({
      type: 'add',

      props: plotState.plots
        //.filter(plot => plot.style === "Heatmap" || plot.style === "Dot Plot")
        .map(plot => {
          const props =
            plot.style === 'Volcano Plot'
              ? makeDefaultVolcanoProps(
                  plot.cf.dataframes[MAIN_CLUSTER_FRAME],
                  VOLCANO_X,
                  VOLCANO_Y
                )
              : makeDefaultHeatmapProps(plot.style)

          return {
            id: plot.id,
            props,
          }
        }),
    })

    const plotChildren: ITab[] = plotState.plots.map(plot => ({
      id: plot.id,
      name: plot.name, //plot.name,
      icon: <ChartIcon />,
      onDelete: () => plotDispatch({ type: 'remove', id: plot.id }),
      // content: (
      //   <HeatMapPanel
      //     panelId={name}
      //     plot={plot}
      //     groups={groups}
      //     canvasRef={canvasRef}
      //     downloadRef={downloadRef}
      //   />
      // ),
      isOpen: true,
    }))

    const tab: ITab = {
      ...makeFoldersRootNode(),
      children: [DATA_TABLE_TAB, { ...PLOTS_TAB, children: plotChildren }],
    }

    setFoldersTab(tab)
  }, [plotState])

  useEffect(() => {
    // if folders change, then default to selecting the last
    // added plot
    if (
      foldersTab.children &&
      foldersTab.children.length > 1 &&
      foldersTab.children[1].children &&
      foldersTab.children[1].children.length > 0
    ) {
      setSelectedTab(
        foldersTab.children[1].children[
          foldersTab.children[1].children.length - 1
        ]
      )
    } else {
      setSelectedTab(DATA_TAB)
    }
  }, [foldersTab])

  function onFileChange(message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file = files[0]
    const name = file.name

    //setFile(files[0])
    //setShowLoadingDialog(true)

    const fileReader = new FileReader()

    fileReader.onload = e => {
      const result = e.target?.result

      if (result) {
        // since this seems to block rendering, delay by a second so that the
        // animation has time to start to indicate something is happening and
        // then finish processing the file
        setTimeout(() => {
          const text: string =
            typeof result === 'string' ? result : Buffer.from(result).toString()

          setFilesToOpen([{ name, text, ext: name.split('.').pop() || '' }])

          // historyState.current = {
          //   step: 0,
          //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
          // }

          //setShowLoadingDialog(false)
        }, 2000)
      }
    }

    fileReader.readAsText(file)

    //setShowFileMenu(false)
  }

  function openFiles(files: IFileOpen[], options: IParseOptions) {
    filesToDataFrames(files, historyDispatch, options)

    // remove existing plots
    plotDispatch({ type: 'clear' })

    setShowFileMenu(false)

    setFilesToOpen([])
  }

  function gct() {
    let df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    df = makeGCT(df)

    historyDispatch({
      type: 'add_step',
      name: df.name,
      sheets: [df],
    })

    // historyState.current = ({
    //   step: historyState.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function makeCluster(isClusterMap: boolean) {
    setShowDialog({ name: 'heatmap', params: { isClusterMap } })
  }

  function makeDotPlot() {
    if (groups.length === 0) {
      setShowDialog({
        name: 'alert',
        params: { title: APP_NAME, message: 'You must create some groups.' },
      })
      return
    }

    setShowDialog({ name: 'dotplot', params: {} })
  }

  function makeVolcanoPlot() {
    setShowDialog({ name: 'volcano', params: {} })
  }

  // useEffect(() => {
  //   if (dataFrames.length > 0) {
  //     let df: IDataFrame = dataFrames[0]

  //     if (getSize(df) == 0) {
  //       return
  //     }

  //     const h = new HCluster(completeLinkage, euclidean)

  //     const clusterRows = false
  //     const clusterCols = true
  //     const zScore = true

  //     const rowTree = clusterRows ? h.run(df) : null
  //     const colTree = clusterCols ? h.run(transpose(df)) : null

  //     if (zScore) {
  //       df = colZScore(df)
  //     }

  //     setClusterFrame({ ...df, rowTree, colTree })
  //   }
  // }, [dataFrames])

  // function adjustScale(index: number, scale: number) {
  //   setScaleIndex(index)
  //   setDisplayProps({ ...displayProps, scale })
  // }

  function transpose() {
    console.log(history.currentStep.currentSheet, 'df')
    dfTranspose(history.currentStep.currentSheet, historyDispatch)
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Home',
      size: 2.1,
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
            />

            <ToolbarIconButton
              title="Download"
              onClick={() => {
                console.log('save')
                messageDispatch({
                  type: 'set',
                  message: {
                    source: 'matcalc',
                    target: selectedTab?.name,
                    text: 'save',
                  },
                })
              }}
            >
              <SaveIcon className="-scale-100 fill-foreground" />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarOptionalDropdownButton
              icon="Heatmap"
              aria-label="Heatmap"
              onMainClick={() => makeCluster(false)}
            >
              <DropdownMenuItem
                arial-label="Create a clustermap"
                onClick={() => makeCluster(true)}
              >
                Clustermap
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="grow">
            <ToolbarButton aria-label="Dot Plot" onClick={() => makeDotPlot()}>
              Dot Plot
            </ToolbarButton>

            <ToolbarButton
              aria-label="Volcano Plot"
              onClick={() => makeVolcanoPlot()}
            >
              Volcano Plot
            </ToolbarButton>
          </ToolbarTabGroup>
        </>
      ),
    },
    {
      //id: nanoid(),
      name: 'Data',
      size: 2,
      content: (
        <>
          <ToolbarTabGroup>
            <ToolbarButton title="Transpose table" onClick={() => transpose()}>
              <TransposeIcon />
              <span>Transpose</span>
            </ToolbarButton>
            <ToolbarButton
              aria-label="Sort table columns by specific rows"
              onClick={() => setShowDialog({ name: 'sort-row', params: {} })}
            >
              <ArrowUpWideShortIcon />
              <span>Sort by rows</span>
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Filter rows using statistics"
              onClick={() => setShowDialog({ name: 'filter', params: {} })}
            >
              <FilterIcon />
              <span>Row Filter</span>
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Add row standard deviation"
              onClick={() =>
                dfStdev(history.currentStep.currentSheet, historyDispatch)
              }
            >
              Row stdev
            </ToolbarButton>
            <ToolbarButton
              aria-label="Row z-score current table"
              onClick={() =>
                dfRowZScore(history.currentStep.currentSheet, historyDispatch)
              }
            >
              Row Z-score
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarOptionalDropdownButton
              icon="Log2(table)"
              onMainClick={() =>
                dfLog(history.currentStep.currentSheet, historyDispatch, 2, 1)
              }
            >
              <DropdownMenuItem
                aria-label="Log2(table)"
                onClick={() =>
                  dfLog(history.currentStep.currentSheet, historyDispatch, 2, 0)
                }
              >
                Log2(table)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Add 1 to table then log2"
                onClick={() =>
                  dfLog(history.currentStep.currentSheet, historyDispatch, 2, 1)
                }
              >
                Log2(table+1)
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Log10(table)"
                onClick={() =>
                  dfLog(
                    history.currentStep.currentSheet,
                    historyDispatch,
                    10,
                    0
                  )
                }
              >
                Log10(table)
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Add 1 to matrix then log10"
                onClick={() =>
                  dfLog(
                    history.currentStep.currentSheet,
                    historyDispatch,
                    10,
                    1
                  )
                }
              >
                Log10(table+1)
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>
          </ToolbarTabGroup>
        </>
      ),
    },
    {
      //id: nanoid(),
      name: 'Gene',
      size: 2,
      content: (
        <>
          <ToolbarButton
            aria-label="Convert gene symbols between mouse and human"
            onClick={() => setShowDialog({ name: 'mouse-human', params: {} })}
          >
            Convert species
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton
            aria-label="Convert motif to gene"
            onClick={() => setShowDialog({ name: 'motif-to-gene', params: {} })}
          >
            Motif to gene
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Convert matrix to GCT format"
              onClick={() => gct()}
              tooltip="Convert matrix to GCT"
            >
              GSEA GCT
            </ToolbarButton>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Open',
      icon: <OpenIcon fill="" />,
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
      name: '<divider>',
    },
    {
      //id: nanoid(),
      name: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: 'Data',
                  text: 'save:txt',
                },
              })
              // save("txt")}
            }}
          >
            <FileLinesIcon fill="" />
            <span>Download as TXT</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: 'Data',
                  text: 'save:csv',
                },
              })
              // save("txt")}
            }}
          >
            <span>Download as CSV</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      //id: nanoid(),
      name: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: selectedTab.name,
                  text: 'save:png',
                },
              })
              // save("txt")}
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as CSV"
            onClick={() => {
              messageDispatch({
                type: 'set',
                message: {
                  source: 'matcalc',
                  target: selectedTab.name,
                  text: 'save:svg',
                },
              })
              // save("txt")}
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  const mainContent = useMemo(
    () => (
      <Tabs
        defaultValue={selectedTab.name}
        value={selectedTab.name}
        className="min-h-0 h-full flex flex-col grow"
      >
        <TabsContent value={DEFAULT_TABLE_NAME} asChild>
          <DataPanel />
        </TabsContent>

        {plotState.plots.map((plot, pi) => {
          //console.log(`${plot.name}:`, plot.style, plot.cf.dataframes)

          switch (plot.style) {
            case 'Volcano Plot':
              return (
                <TabsContent value={plot.name} key={pi} asChild>
                  <VolcanoPanel
                    plot={plot}
                    canvasRef={canvasRef}
                    downloadRef={downloadRef}
                  />
                </TabsContent>
              )

            default:
              return (
                <TabsContent value={plot.name} key={pi} asChild>
                  <HeatMapPanel
                    plot={plot}
                    groups={groups}
                    canvasRef={canvasRef}
                    downloadRef={downloadRef}
                  />
                </TabsContent>
              )
          }
        })}
      </Tabs>
    ),
    [selectedTab, plotState]
  )

  const sideContent = useMemo(
    () => (
      <CollapseTree
        tab={foldersTab}
        value={selectedTab}
        onValueChange={t => {
          if (t) {
            setSelectedTab(t)
          }
        }}
        className={cn(V_SCROLL_CHILD_CLS, 'pt-2')}
      />
    ),
    [foldersTab, selectedTab]
  )

  console.log('aa')

  return (
    <>
      {filesToOpen.length > 0 && (
        <OpenDialog
          files={filesToOpen}
          openFiles={openFiles}
          onCancel={() => setFilesToOpen([])}
        />
      )}

      {showDialog.name === 'filter' && (
        <NumericalFilterDialog
          df={history.currentStep.currentSheet}
          onFilter={() => {
            setShowDialog(NO_DIALOG)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'heatmap' && (
        <HeatMapDialog
          isClusterMap={showDialog.params!.isClusterMap}
          df={history.currentStep.currentSheet}
          onPlot={cf => {
            setShowDialog(NO_DIALOG)

            plotDispatch({ type: 'add', cf, style: 'Heatmap' })
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'dotplot' && (
        <DotPlotDialog
          df={history.currentStep.currentSheet}
          groups={groups}
          onPlot={cf => {
            setShowDialog(NO_DIALOG)
            plotDispatch({ type: 'add', cf, style: 'Dot Plot' })
            //setDisplayProps({ ...displayProps, style: "dot" })
          }}
          onReponse={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'volcano' && (
        <VolcanoDialog
          df={history.currentStep.currentSheet}
          groups={groups}
          onPlot={cf => {
            setShowDialog(NO_DIALOG)
            plotDispatch({ type: 'add', cf, style: 'Volcano Plot' })
            //setDisplayProps({ ...displayProps, style: "dot" })
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'mouse-human' && (
        <GeneConvertDialog
          df={history.currentStep.currentSheet}
          selection={selection}
          onConversion={() => setShowDialog(NO_DIALOG)}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'motif-to-gene' && (
        <MotifToGeneDialog
          df={history.currentStep.currentSheet}
          selection={selection}
          onConversion={() => setShowDialog(NO_DIALOG)}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'sort-row' && (
        <SortRowDialog
          df={history.currentStep.currentSheet}
          groups={groups}
          selection={selection}
          onSort={() => setShowDialog(NO_DIALOG)}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'alert' && (
        <BasicAlertDialog onReponse={() => setShowDialog(NO_DIALOG)}>
          {showDialog.params!.message}
        </BasicAlertDialog>
      )}

      <ShortcutLayout info={MODULE_INFO} signInEnabled={false}>
        <Toolbar
          value={toolbarTabName}
          onTabChange={selectedTab => {
            if (selectedTab) {
              setToolbarTab(selectedTab.tab.name)
            }
          }}
          tabs={tabs}
        >
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
            leftShortcuts={
              <>
                <ShowSideButton
                  onClick={() => setFoldersIsOpen(!foldersIsOpen)}
                />
                <UndoShortcuts />
              </>
            }
            rightShortcuts={
              <>
                <ToolbarTabButton
                  onClick={() => loadZTestData()}
                  role="button"
                  tooltip="Load test data to use features."
                >
                  Plot test
                </ToolbarTabButton>
                <ToolbarTabButton
                  onClick={() => loadDeseqTestData()}
                  role="button"
                  tooltip="Load test data to use features."
                >
                  Deseq test
                </ToolbarTabButton>
                <ToolbarTabButton
                  onClick={() => loadGeneTestData()}
                  role="button"
                  tooltip="Load genes to convert."
                >
                  Gene test
                </ToolbarTabButton>
              </>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  messageDispatch({
                    type: 'set',
                    message: {
                      source: 'matcalc',
                      target: selectedTab.name,
                      text: 'show-sidebar',
                    },
                  })
                }}
              />
            }
          />
        </Toolbar>

        <SlideBar
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 90]}
          position={15}
          side="left"
          mainContent={mainContent}
          sideContent={sideContent}
        >
          <SlideBarContentFramer className="grow px-2" />
        </SlideBar>

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

export function MatcalcQueryPage() {
  return (
    <AlertsProvider>
      <AccountSettingsProvider>
        <MatcalcSettingsProvider>
          <HistoryProvider>
            <SelectionRangeProvider>
              <PlotsProvider>
                <PlotPropsProvider>
                  <GroupsProvider>
                    <MessagesProvider>
                      <MatcalcPage />
                    </MessagesProvider>
                  </GroupsProvider>
                </PlotPropsProvider>
              </PlotsProvider>
            </SelectionRangeProvider>
          </HistoryProvider>
        </MatcalcSettingsProvider>
      </AccountSettingsProvider>
    </AlertsProvider>
  )
}
