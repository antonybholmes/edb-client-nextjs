import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { PlayIcon } from '@icons/play-icon'

import { ZoomSlider } from '@components/toolbar/zoom-slider'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { type IModuleInfo } from '@interfaces/module-info'

import { OpenFiles } from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import { Tooltip } from '@components/tooltip'

import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { HistoryContext, HistoryProvider } from '@hooks/use-history'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { FileLinesIcon } from '@icons/file-lines-icon'
import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'

import { createAnnotationTable } from '@modules/genomic/annotate'
import { QCP, queryClient } from '@query'

import { useContext, useRef, useState } from 'react'

import { SlidersIcon } from '@components/icons/sliders-icon'

import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import {
  type IDialogParams,
  NO_DIALOG,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@consts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { API_GENES_ASSEMBLIES_URL } from '@modules/edb'
import axios from 'axios'

import { UploadIcon } from '@components/icons/upload-icon'
import { HistoryPanel } from '@components/pages/history-panel'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { Label } from '@components/shadcn/ui/themed/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@components/shadcn/ui/themed/radio-group'
import type { ITab } from '@components/tab-provider'
import { TabSlideBar } from '@components/tab-slide-bar'
import { VCenterRow } from '@components/v-center-row'
import { truncate } from '@lib/text/text'
import { makeRandId, nanoid } from '@lib/utils'
import { useQuery } from '@tanstack/react-query'

export const MODULE_INFO: IModuleInfo = {
  name: 'Annotation',
  description: 'Annotation',
  version: '1.0.0',
  copyright: 'Copyright (C) 2023 Antony Holmes',
}

function AnnotationPage() {
  //const [dataFrame, setDataFile] = useState<BaseDataFrame>(INF_DATAFRAME)

  //const [, setTestGeneCollection] = useState<IGeneSetCollection | null>(null)

  const downloadRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [assembly, setAssembly] = useState<string | null>(null)

  const [history, historyDispatch] = useContext(HistoryContext)

  const [rightTab, setRightTab] = useState('Settings')
  const [showSideBar, setShowSideBar] = useState(true)

  const [scale, setScale] = useState(3)
  const [selectedTab] = useState(0)
  const [displayProps, setDisplayProps] = useState({
    scale: 1,
    xrange: [0, 500],
    yrange: [0, 1000],
  })

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [showFileMenu, setShowFileMenu] = useState(false)

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

        //const locs = parseLocations(lines)
        const retMap: { [key: string]: Set<string> } = {}
        const geneSets: string[] = lines[0].split('\t')

        lines[0].split('\t').forEach(gs => {
          retMap[gs] = new Set<string>()
        })

        lines.slice(1).forEach(line => {
          line.split('\t').forEach((gene, genei) => {
            if (gene.length > 0 && gene !== '----') {
              retMap[geneSets[genei]].add(gene)
            }
          })
        })

        const table = new DataFrameReader()
          .indexCols(0)
          .ignoreRows(file.name.includes('gmx') ? [1] : [])
          .read(lines)
          .setName(file.name)

        //setDataFile(table)

        historyDispatch({
          type: 'reset',
          name: `Load ${name}`,
          sheets: [table.setName(truncate(name, { length: 16 }))],
        })

        // setTestGeneCollection({
        //   name,
        //   genesets: geneSets.map(geneSetName => ({
        //     name: geneSetName,
        //     genes: retMap[geneSetName],
        //   })),
        // })
      }
    }

    fileReader.readAsText(files[0])
  }

  async function annotate() {
    const df = history.currentStep.currentSheet

    const dfa = await createAnnotationTable(
      df,
      assembly ?? assembliesQuery.data[0]
    )

    if (dfa) {
      historyDispatch({
        type: 'add_step',
        name: `Annotated`,
        sheets: [dfa],
      })
    }
  }

  function save(format: 'txt' | 'csv') {
    const df = history.currentStep.currentSheet

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

  // useEffect(() => {
  //   //setFileData({})

  //   fileStore.files.forEach(async (file: IExtFile) => {
  //     switch (file.type) {
  //       case "local":
  //         const fileReader = new FileReader()

  //         fileReader.onload = e => {
  //           const result = e.target?.result

  //           if (result) {
  //             const text: string =
  //               typeof result === "string"
  //                 ? result
  //                 : Buffer.from(result).toString()

  //             // only load first 100
  //             const lines = text
  //               .split(/[\r\n]+/g)
  //               .filter(line => line.length > 0)
  //             //.slice(0, 100)

  //             setFileData(fileData => {
  //               return { ...fileData, [file.name]: lines }
  //             })
  //           }
  //         }

  //         if (file.file) {
  //           fileReader.readAsText(file.file)
  //         }
  //         break
  //       case "remote":
  //         if (file.url) {
  //           try {
  //             const response = await axios.get(file.url, {
  //               responseType: "text",
  //             })
  //             const data = response.data
  //             const lines = data
  //               .split(/[\r\n]+/g)
  //               .filter((line: string) => line.length > 0)
  //             //.slice(0, 100)

  //             setFileData(fileData => {
  //               return { ...fileData, [file.name]: lines }
  //             })
  //           } catch (error) {
  //             console.error(error)
  //           }
  //         }

  //         break
  //       default:
  //         break
  //     }
  //   })
  // }, [fileStore.files])

  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get("/data/modules/pathways/genesets.json")
  //     const data = response.data

  //     setGeneSets(data)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/annotate.txt'),
    })

    const lines = res.data
      .split(/[\r\n]+/g)
      .filter((line: string) => line.length > 0)

    const table = new DataFrameReader().indexCols(0).read(lines)

    //resolve({ ...table, name: file.name })

    historyDispatch({
      type: 'reset',
      name: `Load test locations`,
      sheets: [table.setName('Test Locations')],
    })
  }

  const assembliesQuery = useQuery({
    queryKey: ['databases'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await axios.post(
        API_GENES_ASSEMBLIES_URL,
        {},
        {
          headers: {
            //Authorization: bearerTokenHeader(token),
            'Content-Type': 'application/json',
          },
        }
      )

      return res.data.data
    },
  })

  //
  // Load available pathways
  //

  // const { data } = useQuery("pathways", async () => {
  //   const res = await fetch("/data/modules/pathways/genesets.json")

  //   if (!res.ok) {
  //     throw new Error("Network response was not ok")
  //   }

  //   return res.json()
  // })

  // let dimText = "Load a pathway file"

  // switch (activeSideTab) {
  //   case 0:
  //     if (df) {
  //       dimText = `${df.shape[0]} rows x ${df.shape[1]} cols`
  //     }
  //     break
  //   case 1:
  //     if (resultsDF) {
  //       dimText = `${resultsDF.shape[0]} rows x ${resultsDF.shape[1]} cols`
  //     }
  //     break
  //   default:
  //     break
  // }

  const tabs: ITab[] = [
    {
      id: nanoid(),
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
              <Tooltip content="Save table">
                <ToolbarIconButton
                  arial-label="Save table to local file"
                  onClick={() => save('txt')}
                >
                  <SaveIcon className="-scale-100 fill-foreground" />
                </ToolbarIconButton>
              </Tooltip>
            )}
          </ToolbarTabGroup>
          {/* {resultsDF && (
            <ToolbarButton
              aria-label="Download pathway table"
              onClick={() => downloadFile(resultsDF, downloadRef)}
            >
              <SaveIcon className="-scale-100 text-blue-400" />
              Save
            </ToolbarButton>
          )} */}
          <ToolbarSeparator />
          <ToolbarTabGroup>
            <Tooltip content="Run pathway analysis">
              <ToolbarIconButton
                aria-label="Pathway analysis"
                onClick={annotate}
              >
                <PlayIcon className="fill-foreground" />
              </ToolbarIconButton>
            </Tooltip>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      id: nanoid(),
      icon: <SlidersIcon />,
      name: 'Settings',
      content: (
        <PropsPanel>
          <ScrollAccordion value={['databases']}>
            <AccordionItem value="databases">
              <AccordionTrigger>Databases</AccordionTrigger>
              <AccordionContent>
                {assembliesQuery.data && (
                  <RadioGroup
                    defaultValue={assembly ?? assembliesQuery.data[0]}
                    className="flex flex-col gap-y-1.5"
                  >
                    {assembliesQuery.data.map(
                      (assembly: string, dbi: number) => (
                        <VCenterRow key={dbi} className="gap-x-1">
                          <RadioGroupItem
                            value={assembly}
                            onClick={() => setAssembly(assembly)}
                          />
                          <Label htmlFor={assembly}>{assembly}</Label>
                        </VCenterRow>
                      )
                    )}
                  </RadioGroup>
                )}
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
    {
      id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      name: 'History',
      content: <HistoryPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      id: nanoid(),
      name: 'Open',
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
      id: nanoid(),
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
      <BasicAlertDialog
        open={showDialog.name === 'alert'}
        onReponse={() => setShowDialog(NO_DIALOG)}
      >
        {showDialog.params!.message}
      </BasicAlertDialog>

      <ShortcutLayout info={MODULE_INFO} signInEnabled={false}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
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

        {/* <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            id="tables"
            defaultSize={75}
            minSize={50}
            className="flex flex-col pt-2 pl-2"
          >
            <TabbedDataFrames
              selectedSheet={history.currentStep.currentSheetIndex}
              dataFrames={history.currentStep.sheets}
              onTabChange={(tab: number) => {
                historyDispatch({ type: "change_sheet", sheetId: tab })
              }}
            />
          </ResizablePanel>
          <HResizeHandle />
          <ResizablePanel className="flex flex-col" id="right-tabs">
            <SideBarTextTabs
              tabs={rightTabs}
              value={rightTab}
              onTabChange={selectedTab=>setRightTab(selectedTab.tab.name)}
            />
          </ResizablePanel>
        </ResizablePanelGroup> */}

        <TabSlideBar
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={selectedTab => setRightTab(selectedTab.tab.name)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="mt-2 pb-6"
        >
          <TabbedDataFrames
            selectedSheet={history.currentStep.currentSheetIndex}
            dataFrames={history.currentStep.sheets}
            onTabChange={selectedTab => {
              historyDispatch({
                type: 'change_sheet',
                sheetId: selectedTab.index,
              })
            }}
            className="pl-2"
          />
        </TabSlideBar>

        <ToolbarFooter className="justify-end">
          <>
            <span>{getFormattedShape(history.currentStep.currentSheet)}</span>
          </>
          <></>
          <>
            <ZoomSlider scale={scale} onZoomChange={adjustScale} />
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

export function AnnotationQueryPage() {
  return (
    <HistoryProvider>
      <QCP>
        <AnnotationPage />
      </QCP>
    </HistoryProvider>
  )
}
