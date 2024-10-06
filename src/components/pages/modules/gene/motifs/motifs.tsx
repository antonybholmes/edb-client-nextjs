'use client'

import {
  DEFAULT_DISPLAY_PROPS,
  MotifSvg,
  type IDisplayProps,
  type Mode,
} from '@components/pages/modules/gene/motifs/motif-svg'
import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'
import { ZoomSlider } from '@components/toolbar/zoom-slider'
import { cn } from '@lib/class-names'

import { BaseRow } from '@components/base-row'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@components/toolbar/toolbar'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { ArrowRightArrowLeftIcon } from '@components/icons/arrow-right-arrow-left-icon'
import { SlidersIcon } from '@components/icons/sliders-icon'
import { TableIcon } from '@components/icons/table-icon'
import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { HistoryContext, HistoryProvider } from '@hooks/use-history'
import { ChartIcon } from '@icons/chart-icon'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { SearchIcon } from '@icons/search-icon'
import { getDataFrameInfo } from '@lib/dataframe/dataframe-utils'

import { ROUNDED_CLS } from '@theme'
import { useContext, useEffect, useRef, useState } from 'react'

import { HistoryPanel } from '@components/pages/history-panel'

import { AlertsProvider } from '@components/alerts/alerts-provider'
import { BaseCol } from '@components/base-col'
import { FileImageIcon } from '@components/icons/file-image-icon'
import { FileLinesIcon } from '@components/icons/file-lines-icon'
import { SaveIcon } from '@components/icons/save-icon'
import {
  DATA_PANEL_CLS,
  SHEET_PANEL_CLS,
} from '@components/pages/modules/matcalc/data-panel'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { SearchBox } from '@components/search-box'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@components/shadcn/ui/themed/toggle-group'
import { TabContentPanel } from '@components/tab-content-panel'
import { TabProvider, type ITab } from '@components/tab-provider'
import { TabSlideBar } from '@components/tab-slide-bar'
import { Shortcuts } from '@components/toolbar/shortcuts'
import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { NO_DIALOG, TEXT_SAVE_AS, type IDialogParams } from '@consts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { DataFrame } from '@lib/dataframe/dataframe'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { downloadImageAutoFormat } from '@lib/image-utils'
import { makeRandId } from '@lib/utils'
import { API_MOTIF_DATASETS_URL, JSON_HEADERS } from '@modules/edb'
import { QCP } from '@query'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DisplayPropsPanel } from './display-props-panel'
import MODULE_INFO from './module.json'
import { MotifsPanel } from './motifs-panel'
import { MotifsContext, MotifsProvider } from './motifs-provider'

export function MotifsPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const { state, search, setSearch, setDatasets } = useContext(MotifsContext)!
  //const search = useContext(MotifSearchContext)!

  //const searchRef = useRef<HTMLTextAreaElement>(null)
  const [selectedTab, setSelectedTab] = useState('Plot')

  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [revComp, setRevComp] = useState(false)
  const [mode, setMode] = useState<Mode>('Bits')
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [scale, setScale] = useState(1)
  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [history, historyDispatch] = useContext(HistoryContext)

  //const [, setSelection] = useContext(SelectionRangeContext)

  const [displayProps, setDisplayProps] = useState<IDisplayProps>(
    DEFAULT_DISPLAY_PROPS
  )

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  function loadTestData() {
    setSearch({ search: 'BCL6', reverse: revComp, complement: revComp })
  }

  function save(format: string) {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: true,
      file: `motif.${format}`,
      sep,
    })

    //setShowFileMenu(false)
  }

  const datasetsQuery = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      //const token = await loadAccessToken()
      console.log(API_MOTIF_DATASETS_URL)
      const res = await axios.get(
        API_MOTIF_DATASETS_URL,

        {
          headers: JSON_HEADERS,
        }
      )

      return res.data.data
    },
  })

  useEffect(() => {
    if (datasetsQuery.data) {
      setDatasets(
        new Map<string, boolean>(
          datasetsQuery.data.map((dataset: string) => [dataset, true])
        )
      )
    }
  }, [datasetsQuery.data])

  // if (datasetsQuery.isPending) {
  //   return "Loading..."
  // }

  // if (datasetsQuery.error) {
  //   return "An error has occurred: " + datasetsQuery.error.message
  // }

  useEffect(() => {
    setSearch({ ...search, reverse: revComp, complement: revComp })
  }, [revComp])

  useEffect(() => {
    setDisplayProps({ ...displayProps, mode })
  }, [mode])

  useEffect(() => {
    const dataframes: BaseDataFrame[] = state.motifOrder.map(i => {
      const motif = state.motifs[i]

      const df = new DataFrame({
        name: motif.motifName,
        data: motif.weights,
        columns: ['A', 'C', 'G', 'T'],
      }).t()

      return df
    })

    if (dataframes.length > 0) {
      historyDispatch({
        type: 'reset',
        name: `Load`,
        sheets: dataframes,
      })
    }
  }, [state.motifOrder, state.motifs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      name: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              save('txt')
            }}
          >
            <FileLinesIcon fill="" />
            <span>Download as TXT</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('csv')
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
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `motifs.png`
              )
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as CSV"
            onClick={() => {
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `motifs.svg`
              )
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Home',
      content: (
        <>
          <BaseRow>
            <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  // setShowDialog({
                  //   name: makeRandId("open"),
                  //
                  // })
                }
              }}
              multiple={true}
              fileTypes={['motif', 'motifs']}
            />

            <ToolbarButton
              title="Save mutation table"
              onClick={() =>
                setShowDialog({
                  name: makeRandId('save'),
                })
              }
            >
              <SaveIcon className="-scale-100" />
            </ToolbarButton>
          </BaseRow>

          <ToolbarSeparator />

          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={value => {
              setMode(value as Mode)
            }}
            className="rounded-md overflow-hidden"
          >
            <ToggleGroupItem
              value="Prob"
              className="w-14"
              aria-label="Probability view"
            >
              Prob
            </ToggleGroupItem>

            <ToggleGroupItem
              value="Bits"
              className="w-14"
              aria-label="Bits view"
            >
              Bits
            </ToggleGroupItem>
          </ToggleGroup>

          <ToolbarIconButton
            selected={revComp}
            onClick={() => setRevComp(!revComp)}
            title="Reverse complement"
          >
            <ArrowRightArrowLeftIcon />
          </ToolbarIconButton>

          {/* <ToolbarSeparator />

          <ToggleGroup
            type="single"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="rounded-md overflow-hidden"
          >
            <ToggleGroupItem
              value="Plot"
              className="w-14"
              aria-label="Plot view"
            >
              Plot
            </ToggleGroupItem>

            <ToggleGroupItem
              value="Table"
              className="w-14"
              aria-label="Table view"
            >
              Table
            </ToggleGroupItem>
          </ToggleGroup> */}
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'History',
      icon: <ClockRotateLeftIcon />,

      content: <HistoryPanel />,
    },
  ]

  const chartTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Motifs',
      icon: <SearchIcon />,

      content: <MotifsPanel />,
    },
    {
      //id: nanoid(),
      name: 'Display',
      icon: <SlidersIcon />,

      content: (
        <DisplayPropsPanel
          displayProps={displayProps}
          onChange={props => setDisplayProps(props)}
        />
      ),
    },
  ]

  const sideTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Plot',
      icon: <ChartIcon fill="" w="w-5" />,

      content: (
        <TabSlideBar tabs={chartTabs} side="right">
          <div className={DATA_PANEL_CLS}>
            <div
              className={cn(
                ROUNDED_CLS,

                'custom-scrollbar relative overflow-scroll bg-background grow'
              )}
            >
              <MotifSvg
                ref={svgRef}
                //dfs={plotFrames}
                className="absolute"
                displayProps={displayProps}
              />
            </div>
          </div>
        </TabSlideBar>

        // <HSplitPane
        //   panels={[
        //     <div
        //       key="motif-svg"
        //       className={cn(
        //         ROUNDED_CLS,
        //         BORDER_CLS,
        //         "custom-scrollbar relative overflow-scroll border bg-background",
        //       )}
        //     >
        //       {plotFrames.length > 0 && (
        //         <MotifSvg
        //           ref={svgRef}
        //           dfs={plotFrames}
        //           className="absolute"
        //           displayProps={displayProps}
        //         />
        //       )}
        //     </div>,
        //     <SideBar side="right" key="sidebar-right-tabs" tabs={chartTabs} />,
        //   ]}
        // />
      ),
    },
    {
      //id: nanoid(),
      name: 'Table',
      icon: <TableIcon stroke="" fill="" w="w-5" />,

      content: (
        <TabSlideBar tabs={rightTabs} side="right">
          <TabbedDataFrames
            selectedSheet={history.currentStep.currentSheetIndex}
            dataFrames={history.currentStep.sheets}
            onTabChange={selectedTab => {
              historyDispatch({
                type: 'change_sheet',
                sheetId: selectedTab.index,
              })
            }}
            className={SHEET_PANEL_CLS}
          />
        </TabSlideBar>

        // <HSplitPane
        //   panels={[
        //     <TabbedDataFrames
        //       key="tabbed-data-frames"
        //       selectedSheet={history.step.sheetIndex}
        //       dataFrames={history.step.dataframes}
        //       onTabChange={(tab: number) => {
        //         historyDispatch({ type: "change_sheet", index: tab })
        //       }}
        //       onSelectionChange={setSelection}
        //     />,
        //     <SideBar side="right"
        //       key="sidebar-right"
        //       tabs={rightTabs}
        //       activeTabIndex={selectedRightTab}
        //       onTabChange={setSelectedRightTab}
        //     />,
        //   ]}
        // />
      ),
    },
  ]

  return (
    <>
      {showDialog.name.includes('save') && (
        <SaveImageDialog
          open="open"
          onSave={format => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `motifs.${format.ext}`
            )
            setShowDialog(NO_DIALOG)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        signInEnabled={false}
        headerCenterChildren={
          <SearchBox
            variant="translucent"
            value={search.search}
            onChange={e =>
              setSearch({
                search: e.target.value,
                reverse: revComp,
                complement: revComp,
              })
            }
            onSearch={(event, value) => {
              if (event === 'search') {
                setSearch({
                  search: value,
                  reverse: revComp,
                  complement: revComp,
                })
              } else {
                setSearch({ search: '', reverse: revComp, complement: revComp })
              }
            }}
            className="w-80 text-xs font-medium"
          />
        }
        shortcuts={
          <Shortcuts
            tabs={sideTabs}
            onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          />
        }
      >
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel />
        </Toolbar>

        <TabProvider
          value={selectedTab}
          //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          tabs={sideTabs}
        >
          <BaseCol className="grow pr-2">
            <TabContentPanel />
          </BaseCol>
        </TabProvider>

        <ToolbarFooter className="justify-between">
          <div>{getDataFrameInfo(history.currentStep.currentSheet)}</div>
          <></>
          <ZoomSlider scale={scale} onZoomChange={adjustScale} />
        </ToolbarFooter>

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function MotifsQueryPage() {
  return (
    <QCP>
      <AlertsProvider>
        <HistoryProvider>
          <MotifsProvider>
            <MotifsPage />
          </MotifsProvider>
        </HistoryProvider>
      </AlertsProvider>
    </QCP>
  )
}
