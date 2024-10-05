import { TabbedDataFrames } from "@components/table/tabbed-dataframes"

import { Toolbar, ToolbarMenu, ToolbarPanel } from "@components/toolbar/toolbar"

import { ToolbarFooter } from "@components/toolbar/toolbar-footer"

import { ArrowRotateRightIcon } from "@icons/arrow-rotate-right"

import { TableIcon } from "@components/icons/table-icon"
import { LineChartIcon } from "@icons/line-chart-icon"

import { BaseCol } from "@components/base-col"
import { MenuButton } from "@components/toolbar/menu-button"
import { ToolbarButton } from "@components/toolbar/toolbar-button"
import { ToolbarIconButton } from "@components/toolbar/toolbar-icon-button"
import { ToolbarOptionalDropdownButton } from "@components/toolbar/toolbar-optional-dropdown-button"
import { ToolbarSeparator } from "@components/toolbar/toolbar-separator"

import { ZoomSlider } from "@components/toolbar/zoom-slider"
import { Tooltip } from "@components/tooltip"
import { VCenterRow } from "@components/v-center-row"
import { OpenIcon } from "@icons/open-icon"
import { type IModuleInfo } from "@interfaces/module-info"
import { cn } from "@lib/class-names"
import {
  BaseDataFrame,
  DEFAULT_SHEET_NAME,
} from "@lib/dataframe/base-dataframe"
import { DataFrameReader } from "@lib/dataframe/dataframe-reader"
import {
  downloadDataFrame,
  getFormattedShape,
} from "@lib/dataframe/dataframe-utils"

import {
  OpenFiles,
  type IFileOpen,
  type IParseOptions,
} from "@components/pages/open-files"

import { ToolbarTabGroup } from "@components/toolbar/toolbar-tab-group"
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
// import {
//   faClockRotateLeft,
//   faLayerGroup,
//   faPaintBrush,
// } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFetch } from "@hooks/use-fetch"

import {
  FILE_MENU_ITEM_DESC_CLS,
  FILE_MENU_ITEM_HEADING_CLS,
  TOOLBAR_BUTTON_ICON_CLS,
} from "@theme"

import { useEffect, useRef, useState } from "react"

import { FileImageIcon } from "@components/icons/file-image-icon"
import { ScatterPlotCanvas } from "@components/plot/scatter-plot-canvas"
import { useHistory } from "@hooks/use-history"
import { type IClusterGroup } from "@lib/cluster-group"
import { BWR_CMAP, ColorMap } from "@lib/colormap"
import { downloadCanvasAsPng } from "@lib/image-utils"
import { dfLog } from "../dataframe-ui"

import { ClockIcon } from "@components/icons/clock-icon"
import { LayersIcon } from "@components/icons/layers-icon"
import { PlayIcon } from "@components/icons/play-icon"
import { DEFAULT_SCATTER_PROPS } from "@components/plot/scatter-plot-svg"

import { HistoryPanel } from "@components/pages/history-panel"
import {
  DATA_PANEL_CLS,
  SHEET_PANEL_CLS,
} from "@components/pages/modules/matcalc/data-panel"
import { OpenDialog } from "@components/pages/open-dialog"
import { DropdownMenuItem } from "@components/shadcn/ui/themed/dropdown-menu"
import { TabContentPanel } from "@components/tab-content-panel"
import { TabProvider, type ITab } from "@components/tab-provider"
import { TabSlideBar } from "@components/tab-slide-bar"
import { Shortcuts } from "@components/toolbar/shortcuts"
import { TEXT_SAVE_AS } from "@consts"
import { ShortcutLayout } from "@layouts/shortcut-layout"
import { truncate } from "@lib/text/text"
import { makeRandId } from "@lib/utils"
import { ClustersPanel } from "./clusters-panel"

export const MODULE_INFO: IModuleInfo = {
  name: "UMAP",
  description: "Plot UMAP",
  version: "1.0.0",
  copyright: "Copyright (C) 2023 Antony Holmes",
}

export function UMAPPage() {
  const [history, historyDispatch] = useHistory()

  const [clusterFrame, setClusterFrame] = useState<BaseDataFrame | null>(null)
  const [cmap, setCMap] = useState<ColorMap>(BWR_CMAP)
  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)

  const [selectedTab, setSelectedTab] = useState("Data")
  //const [selectedRightTab, setSelectedRightTab] = useState(0)
  const [selectedPlotTab, setSelectedPlotTab] = useState("Clusters")
  const [search] = useState<string[]>([])

  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  const [scale, setScale] = useState(1)

  const [displayProps, setDisplayProps] = useState({ ...DEFAULT_SCATTER_PROPS })

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<string>("")

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const [filesToOpen, setFilesToOpen] = useState<IFileOpen[]>([])

  const [groups, setGroups] = useState<IClusterGroup[]>([])

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

  const { data } = useFetch("/data/modules/sc_rna/large/umap.txt.gz")

  useEffect(() => {
    if (data) {
      const lines = data
        .split(/[\r\n]+/g)
        .filter((line: string) => line.length > 0)

      const table = new DataFrameReader()
        .indexCols(1)
        .read(lines)
        .setName("Z Tesst dfdfdf")

      //resolve({ ...table, name: file.name })

      historyDispatch({
        type: "reset",
        name: `Load "Z Test"`,
        sheets: [table],
      })
    }
  }, [data])

  useEffect(() => {
    //setSelectedSheet(0) //history.currentStep.df.length - 1)
  }, [history])

  useEffect(() => {
    if (clusterFrame) {
      setSelectedTab("Chart")
    }
  }, [clusterFrame])

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
            typeof result === "string" ? result : Buffer.from(result).toString()

          setFilesToOpen([{ name, text, ext: name.split(".").pop() || "" }])

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
    if (files.length < 1) {
      return
    }

    const file = files[0]
    const name = file.name

    const { indexCols, colNames } = options

    const lines = file.text.split(/[\r\n]+/g).filter(line => line.length > 0)

    const sep = name.endsWith("csv") ? "," : "\t"

    const table = new DataFrameReader()
      .sep(sep)
      .colNames(colNames)
      .indexCols(indexCols)
      .read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: "reset",
      name: `Load ${name}`,
      sheets: [table.setName(truncate(name, { length: 16 }))],
    })

    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }

    //setShowLoadingDialog(false)

    setShowFileMenu(false)

    setFilesToOpen([])
  }

  function getCurrentDataFrame(): BaseDataFrame | null {
    const ret = history.currentStep.currentSheet

    if (ret.size == 0) {
      return null
    }

    if (ret.name === DEFAULT_SHEET_NAME) {
      return null
    }

    return ret
  }

  function makeUMAP() {
    let df = getCurrentDataFrame()

    if (!df) {
      return null
    }

    const clusters = df.col("Cluster")!.values
    // add hue col
    const uniqueClusters = [...new Set(df.col("Cluster")!.values)].sort()

    // scale indices between 0-1
    const n = uniqueClusters.length - 1

    const indexMap = Object.fromEntries(uniqueClusters.map((x, i) => [x, i]))
    const normMap = Object.fromEntries(uniqueClusters.map((x, i) => [x, i / n]))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cmap = uniqueClusters.map(_x => "gray") //JET_CMAP.get(i / n))

    // modify palette for custom groups

    groups.forEach(group => {
      if (group.search.filter(s => s in normMap).length > 0) {
        cmap[indexMap[group.name]] = group.color
      }
    })

    const colorMap = new ColorMap(cmap)

    setCMap(colorMap)

    df = df.copy()
    df.setCol(
      "Hue",
      clusters.map(c => normMap[c.toString()] ?? -1),
    )

    historyDispatch({
      type: "add_step",
      name: "Add Hue",
      sheets: [df],
    })

    setClusterFrame(df)
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

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  function save(format: "txt" | "csv") {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === "csv" ? "," : "\t"
    const hasHeader = !df.name.includes("GCT")
    const hasIndex = !df.name.includes("GCT")

    downloadDataFrame(df, downloadRef, {
      hasHeader,
      hasIndex,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      name: "Home",
      content: (
        <>
          {" "}
          <ToolbarTabGroup>
            {/* <ToolbarOpenFile
                
                onOpenChange={open => setShowDialog(open ? "open" : "")}
                onFileChange={onFileChange}
                multiple={true}
              /> */}

            {/* <ToolbarButton
                arial-label="Save matrix to local file"
                onClick={() => save("txt")}
              >
                <FloppyDiskIcon className="-scale-100 fill-blue-400" />
                Save
              </ToolbarButton>

              {selectedTab === 1 && (
                <ToolbarSaveSvg
                  svgRef={svgRef}
                  canvasRef={svgCanvasRef}
                  downloadRef={downloadRef}
                />
              )} */}

            <ToolbarButton arial-label="Create UMAP" onClick={() => makeUMAP()}>
              <PlayIcon />
              UMAP
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <VCenterRow>
            <Tooltip content="Undo">
              <ToolbarIconButton
                aria-label="Undo action"
                onClick={() => {
                  historyDispatch({
                    type: "undo",
                  })
                }}
                className="fill-foreground"
              >
                <ArrowRotateRightIcon className="-scale-x-100" />
              </ToolbarIconButton>
            </Tooltip>
            <Tooltip content="Redo">
              <ToolbarIconButton
                aria-label="Redo action"
                onClick={() => {
                  historyDispatch({
                    type: "redo",
                  })
                }}
                className="fill-foreground"
              >
                <ArrowRotateRightIcon />
              </ToolbarIconButton>
            </Tooltip>
          </VCenterRow>
        </>
      ),
    },
    {
      //id: nanoid(),
      name: "Chart",
      content: (
        <>
          <ToolbarOptionalDropdownButton
            icon="Right"
            onMainClick={() =>
              dfLog(getCurrentDataFrame(), historyDispatch, 2, 1)
            }
          >
            <DropdownMenuItem
              aria-label="Top"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 2, 0)
              }
            >
              Top
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Add 1 to matrix then log2"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 2, 1)
              }
            >
              Left
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Log10"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 10, 0)
              }
            >
              Bottom
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label="Add 1 to matrix then log10"
              onClick={() =>
                dfLog(getCurrentDataFrame(), historyDispatch, 10, 1)
              }
            >
              Right
            </DropdownMenuItem>
          </ToolbarOptionalDropdownButton>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      name: "Clusters",
      content: (
        <ClustersPanel
          df={history.currentStep.currentSheet}
          onGroupsChange={setGroups}
          downloadRef={downloadRef}
          groups={groups}
        />
      ),
    },
    {
      //id: nanoid(),
      icon: <ClockIcon />,
      name: "History",
      content: <HistoryPanel />,
    },
  ]

  //const plotTabs: ITab[] = useMemo(() => [], [filterRowMode, history, groups])

  const sideTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <TableIcon className={cn(TOOLBAR_BUTTON_ICON_CLS)} />,
      name: "Data",
      content: (
        <>
          <TabSlideBar
            side="right"
            key="sidebar-table"
            tabs={rightTabs}
            value={selectedPlotTab}
            onTabChange={selectedTab =>
              setSelectedPlotTab(selectedTab.tab.name)
            }
          >
            <TabbedDataFrames
              key="tabbed-data-frames"
              selectedSheet={history.currentStep.currentSheetIndex}
              dataFrames={history.currentStep.sheets}
              onTabChange={selectedTab => {
                historyDispatch({
                  type: "change_sheet",
                  sheetId: selectedTab.index,
                })
              }}
              className={SHEET_PANEL_CLS}
            />
          </TabSlideBar>

          <ToolbarFooter className="justify-between">
            <div>
              <button onClick={() => setSelectedTab("Data")}>
                {getFormattedShape(history.currentStep.currentSheet)}
              </button>
            </div>
          </ToolbarFooter>
        </>
      ),
    },
    {
      //id: nanoid(),
      icon: <LineChartIcon className={cn(TOOLBAR_BUTTON_ICON_CLS)} />,
      name: "Chart",
      content: (
        <>
          <TabSlideBar
            side="right"
            key="sidebar-table"
            tabs={rightTabs}
            value={selectedPlotTab}
            onTabChange={selectedTab =>
              setSelectedPlotTab(selectedTab.tab.name)
            }
          >
            <div className={cn(DATA_PANEL_CLS, "p-2")}>
              <div
                key="scatter"
                className={"relative overflow-scroll custom-scrollbar grow"}
              >
                {clusterFrame && (
                  <ScatterPlotCanvas
                    onCanvasChange={e => {
                      setCanvas(e)
                    }}
                    df={clusterFrame}
                    cmap={cmap}
                    x="UMAP1"
                    y="UMAP2"
                    hue="Hue"
                    displayProps={displayProps}
                    className="absolute bottom-0 left-0 right-0 top-0"
                  />
                )}
              </div>
            </div>
          </TabSlideBar>

          <ToolbarFooter className="justify-between">
            <></>

            <></>
            <ZoomSlider
              scale={scale}
              onZoomChange={adjustScale}
              className={cn([selectedTab === "Chart", "visible", "invisible"])}
            />
          </ToolbarFooter>
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      name: "Open",
      icon: <OpenIcon className="fill-white" w="w-5" />,
      content: (
        <BaseCol className="gap-y-6 p-6">
          <h1 className="text-2xl">Open</h1>

          <ul className="flex flex-col gap-y-2 text-xs">
            <li>
              <MenuButton
                aria-label="Open file on your computer"
                onClick={() => setShowDialog(makeRandId("open"))}
              >
                <OpenIcon className="text-amber-300" />
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Open local file
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Open a local file on your computer.
                  </span>
                </p>
              </MenuButton>
            </li>
          </ul>
        </BaseCol>
      ),
    },
    {
      //id: nanoid(),
      name: TEXT_SAVE_AS,
      content: (
        <BaseCol className="gap-y-6 p-6">
          <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

          <ul className="flex flex-col gap-y-1 text-xs">
            <li>
              <MenuButton
                aria-label="Save text file"
                onClick={() => save("txt")}
              >
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as TXT
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save table as a tab-delimited text file.
                  </span>
                </p>
              </MenuButton>
            </li>
            <li>
              <MenuButton
                aria-label="Save CSV file"
                onClick={() => save("csv")}
              >
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as CSV
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save table as a comma separated text file.
                  </span>
                </p>
              </MenuButton>
            </li>
          </ul>
        </BaseCol>
      ),
    },
    {
      //id: nanoid(),
      name: "Export",
      content: (
        <BaseCol className="gap-y-6 p-6">
          <h1 className="text-2xl">Export</h1>

          <ul className="flex flex-col gap-y-1 text-xs">
            <li>
              <MenuButton
                aria-label="Download as PNG"
                onClick={() =>
                  //drawScatter(canvas, df, x, y, hue, size, cmap, displayProps)
                  downloadCanvasAsPng(canvas, downloadRef)
                }
              >
                <FileImageIcon fill="" />
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as PNG
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save chart as PNG.
                  </span>
                </p>
              </MenuButton>
            </li>
            {/* <li>
                <MenuButton
                  aria-label="Download SVG"
                  onClick={() => downloadCanvasAsPng(canvasRef, downloadRef)}
                >
                  <></>
                  <p>
                    <span>
                      <strong>Download as SVG</strong>
                    </span>
                    <br />
                    <span>Save chart as SVG file.</span>
                  </p>
                </MenuButton>
              </li> */}
          </ul>
        </BaseCol>
      ),
    },
  ]

  return (
    <>
      {filesToOpen && (
        <OpenDialog
          files={filesToOpen}
          openFiles={openFiles}
          onCancel={() => setFilesToOpen([])}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        signInEnabled={false}
        shortcuts={
          <Shortcuts
            tabs={sideTabs}
            onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          />
        }
      >
        {/* <LoadingDialog visible={showLoadingDialog} /> */}

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
          <ToolbarPanel />
        </Toolbar>

        {/* <TabSlideBar
          tabs={sideTabs}
          value={selectedTab}
          onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
        /> */}

        <TabProvider
          value={selectedTab}
          //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
          tabs={sideTabs}
        >
          <BaseCol className="grow pr-2">
            <TabContentPanel />
          </BaseCol>
        </TabProvider>

        <OpenFiles
          open={showDialog.includes("open") ? showDialog : ""}
          //onOpenChange={open => setShowDialog(open ? "open" : "")}
          onFileChange={onFileChange}
        />

        <a ref={downloadRef} className="hidden" />
      </ShortcutLayout>
    </>
  )
}
