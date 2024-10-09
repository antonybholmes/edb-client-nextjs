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
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { OpenIcon } from '@components/icons/open-icon'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'

import {
  OpenFiles,
  filesToDataFrames,
  type IFileOpen,
  type IParseOptions,
} from '@components/pages/open-files'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import { NO_DIALOG, TEXT_SAVE_AS, type IDialogParams } from '@consts'

import { FileImageIcon } from '@components/icons/file-image-icon'
import { FileLinesIcon } from '@components/icons/file-lines-icon'
import { SaveIcon } from '@components/icons/save-icon'

import { HistoryContext, HistoryProvider } from '@components/history-provider'
import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { useContext, useEffect, useRef, useState } from 'react'

import { ShortcutLayout } from '@layouts/shortcut-layout'

import { AccountSettingsProvider } from '@providers/account-settings-provider'
import axios from 'axios'

import { AlertsProvider } from '@components/alerts/alerts-provider'
import {
  MessageContext,
  MessagesProvider,
} from '@components/pages/message-context'
import {
  SelectionRangeContext,
  SelectionRangeProvider,
} from '@components/table/use-selection-range'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { findCol } from '@lib/dataframe/dataframe-utils'
import { DataPanel } from './data-panel'
import { LollipopPanelWrapper } from './lollipop-panel'
import { makeLollipopData, type ILollipopColumns } from './lollipop-utils'
import { PlotsContext, PlotsProvider } from './plots-context'

import { ChartIcon } from '@components/icons/chart-icon'

import { makeRandId, nanoid } from '@lib/utils'

import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import { FolderIcon } from '@components/icons/folder-icon'
import { UploadIcon } from '@components/icons/upload-icon'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { SlideBar } from '@components/slide-bar'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { range } from '@lib/math/range'
import {
  ProteinContext,
  ProteinProvider,
  searchProteins,
  type IProtein,
} from './protein-context'

import type { ITab } from '@components/tab-provider'
import { useQueryClient } from '@tanstack/react-query'
import MODULE_INFO from './module.json'

function LollipopPage() {
  const queryClient = useQueryClient()

  const [historyState, historyDispatch] = useContext(HistoryContext)

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)
  const [, selectionRangeDispatch] = useContext(SelectionRangeContext)

  const dataTab: ITab = {
    id: nanoid(),
    icon: <TableIcon />,
    name: 'Table 1',
    content: <DataPanel panelId="Table 1" />,
    isOpen: true,
  }

  const [foldersTab, setFoldersTab] = useState<ITab>(dataTab)
  const [tab, setTab] = useState<ITab | undefined>(dataTab)
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)
  const [tabName, setTabName] = useState('Table 1')

  const [toolbarTab, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])
  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [proteinState, proteinDispatch] = useContext(ProteinContext)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  //const [showLoadingDialog, setShowLoadingDialog] = useState(false)

  const [filesToOpen, setFilesToOpen] = useState<IFileOpen[]>([])

  const [plotState, plotDispatch] = useContext(PlotsContext)

  const [, messageDispatch] = useContext(MessageContext)

  //const [clusterFrame, setClusterFrame] = useState<IClusterFrameProps>(NO_CF)

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

  //const { data } = useFetch("/z_test.txt")

  async function loadTestData() {
    // try {
    //   let res = await queryClient.fetchQuery("test_data", async () => {
    //     return await axios.get(
    //       "/data/test/bcca2024_29cl_20icg_hg19_chr3-187451979-187469971.maf.txt",
    //     )
    //   })

    //   const lines = res.data
    //     .split(/[\r\n]+/g)
    //     .filter((line: string) => line.length > 0)

    //   const table = new DataFrameReader().read(lines)

    //   //resolve({ ...table, name: file.name })

    //   historyDispatch({
    //     type: "reset",
    //     name: `Load "Mutations"`,
    //     sheets: [table.setName("Mutations")],
    //   })
    // } catch (error) {
    //   console.log(error)
    // }

    const gene = 'BTG1'

    try {
      const proteins = await searchProteins(gene)

      const index = range(0, proteins.length).filter(
        i => proteins[i].organism === 'Human'
      )[0]

      proteinDispatch({
        type: 'set',
        search: { text: gene, results: proteins },
        index,
      })
    } catch (e) {
      console.log(e)
    }

    try {
      let res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/btg1_coding_mutations.txt'),
      })

      let lines = res.data
        .split(/[\r\n]+/g)
        .filter((line: string) => line.length > 0)

      let table = new DataFrameReader().keepDefaultNA(false).read(lines)

      historyDispatch({
        type: 'reset',
        name: `Load mutations`,
        sheets: [table.setName('Mutations')],
      })

      res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/btg1_features.txt'),
      })

      lines = res.data
        .split(/[\r\n]+/g)
        .filter((line: string) => line.length > 0)

      // //setLocations(lines.slice(1).map((l: string) => parseLocation(l)))

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      historyDispatch({
        type: 'replace_sheet',
        sheetId: 'Features',
        //name: "Load features",
        sheet: table.setName('Features'),
      })

      // get rid of the plot
      plotDispatch({ type: 'clear' })

      // const table = new DataFrameReader() .read(lines)

      // //resolve({ ...table, name: file.name })
    } catch (error) {
      console.log(error)
    }
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  useEffect(() => {
    setTab(dataTab)
    selectionRangeDispatch({ type: 'clear' })
  }, [historyState])

  // useEffect(() => {
  //   if (plotState.plots.length > 0) {
  //     setPanelTab(plotState.plots[plotState.plots.length - 1].name)
  //   }
  // }, [plotState])

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
          const buffer: string =
            typeof result === 'string' ? result : Buffer.from(result).toString()

          if (message.includes('location')) {
            const lines = buffer
              .split(/[\r\n]+/g)
              .filter((line: string) => line.length > 0)

            const locationTable = new DataFrameReader()
              .keepDefaultNA(false)
              .read(lines)

            historyDispatch({
              type: 'replace_sheet',
              sheetId: 'Locations',
              //name: "Load locations",
              sheet: locationTable.setName('Locations'),
            })
          } else {
            //setFilesToOpen([
            //  { name: "Mutations", text, ext: name.split(".").pop() || "" },
            //])

            openFiles(
              [
                {
                  name: 'Mutations',
                  text: buffer,
                  ext: name.split('.').pop() || '',
                },
              ],
              {
                colNames: 1,
                indexCols: 0,
                sep: '\t',
                keepDefaultNA: true,
              }
            )
          }
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

    setShowFileMenu(false)

    setFilesToOpen([])
  }

  function lollipopPlot() {
    const mutDf = historyState.currentStep.getSheet('Mutations') //history.currentStep.currentSheet

    let featuresDf: BaseDataFrame | null = null

    try {
      featuresDf = historyState.currentStep.getSheet('Features')
    } catch (e) {
      // ignore error
    }

    const protein: IProtein = proteinState.protein

    if (!protein.name) {
      return
    }

    const colMap: ILollipopColumns = {
      sample: findCol(mutDf, 'Sample'),
      aa: findCol(mutDf, 'protein_change'),
      variant: findCol(mutDf, 'Variant_Classification'),
    }

    const df = makeLollipopData(protein, mutDf, featuresDf, colMap)

    df.labels = [
      {
        id: nanoid(),
        name: `${protein.seq[0]}1`,
        start: 1,
        color: '#000000',
        show: true,
      },
      {
        id: nanoid(),
        name: `${protein.seq[1]}2`,
        start: 2,
        color: '#000000',
        show: true,
      },
      {
        id: nanoid(),
        name: `${protein.seq[9]}10`,
        start: 10,
        color: '#000000',
        show: true,
      },
    ]

    plotDispatch({
      type: 'set',
      plot: {
        df,
      },
    })

    // historyDispatch({
    //   type: "add_step",
    //   name: df.name,
    //   sheets: [df],
    // })
  }

  const tabs: ITab[] = [
    {
      id: nanoid(),
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
              aria-label="Save matrix to local file"
              onClick={() => {
                //save("txt")
                messageDispatch({
                  type: 'set',
                  message: {
                    source: 'lollipop',
                    target: tabName,
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
            <ToolbarButton
              aria-label="Open location data"
              onClick={() =>
                setShowDialog({ name: makeRandId('location'), params: {} })
              }
            >
              Locations
            </ToolbarButton>
            <ToolbarButton
              aria-label="Open features"
              onClick={() =>
                setShowDialog({ name: makeRandId('features'), params: {} })
              }
            >
              Features
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="grow">
            <ToolbarButton
              aria-label="Create an plot"
              onClick={() =>
                // setShowDialog({
                //   name: makeRandId("plot"),
                //   params: { type: "plot" },
                // })

                lollipopPlot()
              }
            >
              Plot
            </ToolbarButton>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  // const rightTabs: ITab[] = [
  //   {
  //     // id: randId(),
  //     icon: <LayerIcon />,
  //     name: "Groups",
  //     content: (
  //       <GroupsPanel
  //         df={history.step.dataframe}
  //         downloadRef={downloadRef}
  //         groups={groups}
  //         onGroupsChange={groupsDispatch}
  //         selection={selection}
  //       />
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     icon: <FilterIcon />,
  //     name: "Filter Table",
  //     content: (
  //       <FilterPanel
  //         df={history.step.dataframe}

  //       />
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     icon: <ClockRotateLeftIcon />,
  //     name: "History",
  //     content: (
  //       <HistoryPanel />
  //     ),
  //   },
  // ]

  // const plotRightTabs: ITab[] = [
  //   {
  //     icon: <SlidersIcon />,
  //     label: "Display",
  //     content: (
  //       <DisplayPropsPanel
  //         cf={clusterFrame.cf}
  //         displayProps={displayProps}
  //         onChange={props => setDisplayProps(props)}
  //       />
  //     ),
  //   },
  // ]

  // let svgPanel: ReactNode = null
  // if (clusterFrame.cf) {
  //   // switch (clusterFrame.type) {
  //   // case "heatmap":
  //   svgPanel = (
  //     <HeatMapSvg
  //       ref={svgRef}
  //       cf={clusterFrame.cf}
  //       groups={groups}
  //       search={search}
  //       displayProps={displayProps}
  //     />
  //   )

  // }

  // const topTabs: ITab[] = [
  //   {
  //     id: nanoid(),
  //     icon: <TableIcon className="fill-theme" />,
  //     name: "Data",
  //     content: (
  //       <DataPanel />

  //     ),
  //   },
  // ]

  // plotState.plots.forEach((plot: IPlot) => {
  //   topTabs.push({
  //     id: nanoid(),
  //     name: plot.name,
  //     icon: <ChartIcon className="fill-theme" />,
  //     onDelete: () => plotDispatch({ type: "remove", id: plot.id }),
  //     content: (
  //       <LollipopPanelWrapper
  //         panelId={plot.name}
  //         df={plot.df}
  //         canvasRef={canvasRef}
  //         downloadRef={downloadRef}
  //       />
  //     ),
  //   })
  // })

  useEffect(() => {
    const plotChildren: ITab[] = []

    plotState.plots.forEach((plot, pi) => {
      plotChildren.push({
        id: nanoid(),
        name: plot.name,
        icon: <ChartIcon className="fill-theme" />,
        onDelete: () => plotDispatch({ type: 'remove', id: plot.id }),
        content: (
          <LollipopPanelWrapper
            panelId={plot.name}
            df={plot.df}
            canvasRef={canvasRef}
            downloadRef={downloadRef}
          />
        ),
      })
    })

    const tab: ITab = {
      ...makeFoldersRootNode(),
      children: [
        {
          id: nanoid(),
          name: 'Data Tables',
          icon: <FolderIcon />,
          isOpen: true,
          children: [dataTab],
        },
        {
          id: nanoid(),
          name: 'Plots',
          icon: <FolderIcon />,
          isOpen: true,
          children: plotChildren,
        },
      ],
    }

    setFoldersTab(tab)

    // if the children
    if (plotChildren.length > 0) {
      setTab(plotChildren[plotChildren.length - 1])
    } else {
      setTab(dataTab)
    }
  }, [plotState])

  // plots.plots.forEach(plot => {
  //   switch (plot.type) {
  //     case "Heatmap":
  //     case "Dot Plot":
  //       topTabs.push({
  //         // id: randId(),
  //         name: plot.name,
  //         onDelete: () => plotDispatch({ type: "remove", id: plot.id }),
  //         content: (
  //           <OncoplotPanel
  //             id={plot.name}
  //             plot={plot}
  //             groups={groups}
  //             canvasRef={canvasRef}
  //             downloadRef={downloadRef}
  //           />
  //         ),
  //       })
  //       break
  //     case "Volcano Plot":
  //       topTabs.push({
  //         // id: randId(),
  //         name: plot.name,
  //         onDelete: () => plotDispatch({ type: "remove", id: plot.id }),
  //         content: (
  //           <VolcanoPanel
  //             id={plot.name}
  //             plot={plot}
  //             canvasRef={canvasRef}
  //             downloadRef={downloadRef}
  //           />
  //         ),
  //       })
  //       break
  //     default:
  //     // do nothing
  //   }
  // })

  // const fileMenuTabs: ITab[] = [
  //   {
  //     // id: randId(),
  //     name: "Open",
  //     icon: <OpenIcon fill="" w="w-5" />,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Open</h1>

  //         <ul className="flex flex-col gap-y-2 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Open file on your computer"
  //               onClick={() =>
  //                 setShowDialog({ name: makeRandId("open"), params: {} })
  //               }
  //             >
  //               <OpenIcon className="w-6" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Open local file
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Open a local file on your computer.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     name: TEXT_SAVE_AS,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Save text file"
  //               onClick={() => {
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "matcalc",
  //                     target: "Data",
  //                     text: "save:txt",
  //                   },
  //                 })
  //                 // save("txt")}
  //               }}
  //             >
  //               <FileLinesIcon className="w-6 fill-blue-300" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as TXT
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a tab-delimited text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Save CSV file"
  //               onClick={() => {
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "matcalc",
  //                     target: "Data",
  //                     text: "save:csv",
  //                   },
  //                 })
  //                 // save("txt")}
  //               }}
  //             >
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as CSV
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a comma separated text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     name: "Export",
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Export</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Download as PNG"
  //               onClick={() =>
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "lollipop",
  //                     target: panelTab,
  //                     text: "save:png",
  //                   },
  //                 })
  //               }
  //             >
  //               <FileImageIcon fill="" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as PNG
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save chart as PNG.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Download as SVG"
  //               onClick={() =>
  //                 messageDispatch({
  //                   type: "set",
  //                   message: {
  //                     source: "lollipop",
  //                     target: panelTab,
  //                     text: "save:svg",
  //                   },
  //                 })
  //               }
  //             >
  //               <></>
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as SVG
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save chart as SVG.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  // ]

  const fileMenuTabs: ITab[] = [
    {
      id: nanoid(),
      name: 'Open',
      icon: <OpenIcon fill="" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() =>
            setShowDialog({ name: makeRandId('open'), params: {} })
          }
        >
          <UploadIcon fill="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    { id: nanoid(), name: '<divider>' },
    {
      id: nanoid(),
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
      id: nanoid(),
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
                  target: tabName,
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
                  target: tabName,
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

  // const shortcuts: IUrlTab[] = [
  //   {
  //     // id: randId(),
  //     icon: <TableIcon className={cn(TOOLBAR_BUTTON_ICON_CLS)} />,
  //     name: "Heatmap",
  //     url: "/module/heatmap",
  //   },
  // ]

  return (
    <>
      {/* <OncoPlotDialog
        open={showDialog.name.includes("plot")}
        type={showDialog.params.type}
        onPlot={(
          type: OncoplotType,
          multi: MultiMode,
          sort: boolean,
          removeEmpty: boolean,
        ) => {
          setShowDialog(NO_DIALOG)

          lollipopPlot(multi, sort, removeEmpty)
        }}
        onCancel={() => setShowDialog(NO_DIALOG)}
      /> */}

      <ShortcutLayout info={MODULE_INFO}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Plot test
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  //save("txt")
                  messageDispatch({
                    type: 'set',
                    message: {
                      source: 'lollipop',
                      target: tabName,
                      text: 'show-sidebar',
                    },
                  })
                }}
              />
            }
          />
        </Toolbar>

        {/* <TopTabs tabs={topTabs} value={tabName} onValueChange={setTabName}>
          <Button
            variant="muted"
            rounded="md"
            size="md"
            padding="md"
            ripple={false}
            aria-label="Show options"
            onClick={() => {
              //save("txt")
              messageDispatch({
                type: "set",
                message: {
                  source: "lollipop",
                  target: tabName,
                  text: "show-sidebar",
                },
              })
            }}
            title="Show options"
          >
            <SplitIcon />
            <span>Options</span>
          </Button>
        </TopTabs> */}

        <SlideBar
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 90]}
          position={15}
          className="mt-2 mb-6"
        >
          <>{tab?.content}</>

          <CollapseTree
            tab={foldersTab}
            value={tab}
            onValueChange={t => {
              if (t && t.content) {
                // only use tabs from the tree that have content, otherwise
                // the ui will appear empty
                setTab(t)
              }
            }}
            className="pl-1"
          />
        </SlideBar>

        <OpenFiles
          open={
            showDialog.name.includes('open') ||
            showDialog.name.includes('location') ||
            showDialog.name.includes('clinical')
              ? showDialog.name
              : ''
          }
          //onOpenChange={() => setShowDialog(NO_DIALOG)}
          onFileChange={onFileChange}
        />

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

/** client:only component */
export function LollipopQueryPage() {
  return (
    <AlertsProvider>
      <AccountSettingsProvider>
        <HistoryProvider>
          <MessagesProvider>
            <SelectionRangeProvider>
              <ProteinProvider>
                <PlotsProvider>
                  <LollipopPage />
                </PlotsProvider>
              </ProteinProvider>
            </SelectionRangeProvider>
          </MessagesProvider>
        </HistoryProvider>
      </AccountSettingsProvider>
    </AlertsProvider>
  )
}
