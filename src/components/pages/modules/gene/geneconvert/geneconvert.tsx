import { ToolbarOpenFile } from "@components/toolbar/toolbar-open-files"

import { TabbedDataFrames } from "@components/table/tabbed-dataframes"

import { ToolbarFooter } from "@components/toolbar/toolbar-footer"

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from "@components/toolbar/toolbar"
import { ToolbarSeparator } from "@components/toolbar/toolbar-separator"
import { PlayIcon } from "@icons/play-icon"

import { ToolbarButton } from "@components/toolbar/toolbar-button"

import { DataFrameReader } from "@lib/dataframe/dataframe-reader"
import {
  downloadDataFrame,
  getFormattedShape,
} from "@lib/dataframe/dataframe-utils"

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onFileChange,
  OpenFiles,
  type IFileOpen,
  type IParseOptions,
} from "@components/pages/open-files"

import { BasicAlertDialog } from "@components/dialog/basic-alert-dialog"
import { ToolbarTabGroup } from "@components/toolbar/toolbar-tab-group"

import { ToolbarTabButton } from "@components/toolbar/toolbar-tab-button"
import { HistoryContext, HistoryProvider } from "@hooks/use-history"
import { ClockRotateLeftIcon } from "@icons/clock-rotate-left-icon"
import { FileLinesIcon } from "@icons/file-lines-icon"
import { OpenIcon } from "@icons/open-icon"
import { SaveIcon } from "@icons/save-icon"

import { useContext, useRef, useState } from "react"

import {
  NO_DIALOG,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from "@consts"

import { UploadIcon } from "@components/icons/upload-icon"
import { DropdownMenuItem } from "@components/shadcn/ui/themed/dropdown-menu"
import { TabSlideBar } from "@components/tab-slide-bar"
import { UndoShortcuts } from "@components/toolbar/undo-shortcuts"
import { ShortcutLayout } from "@layouts/shortcut-layout"
import { makeRandId } from "@lib/utils"
import { createGeneConvTable } from "@modules/gene/geneconv"
import { AccountSettingsProvider } from "@providers/account-settings-provider"
import axios from "axios"

import { HistoryPanel } from "@components/pages/history-panel"

import { Label } from "@components/shadcn/ui/themed/label"
import type { ITab } from "@components/tab-provider"
import {
  ToggleButtons,
  ToggleButtonTriggersFramer,
} from "@components/toggle-buttons"
import { cn } from "@lib/class-names"
import { QCP } from "@query"
import { useQueryClient } from "@tanstack/react-query"
import { DATA_PANEL_CLS } from "../../matcalc/data-panel"
import MODULE_INFO from "./module.json"

function GeneConvPage() {
  const queryClient = useQueryClient()

  const [activeSideTab] = useState(0)
  const downloadRef = useRef<HTMLAnchorElement>(null)

  const [history, historyDispatch] = useContext(HistoryContext)

  //const [filesToOpen, setFilesToOpen] = useState<IFileOpen[]>([])

  const [fromSpecies, setFromSpecies] = useState("Human")
  const [toSpecies, setToSpecies] = useState("Mouse")
  const [exact, setExact] = useState(true)

  const [rightTab, setRightTab] = useState("Options")
  const [showSideBar, setShowSideBar] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const speciesTabs = [
    { id: "human", name: "Human" },
    { id: "mouse", name: "Mouse" },
  ]

  function openFiles(
    files: IFileOpen[],
    options: IParseOptions = DEFAULT_PARSE_OPTS,
  ) {
    filesToDataFrames(files, historyDispatch, options)

    setShowFileMenu(false)
  }

  async function convertGenes() {
    const df = history.currentStep.currentSheet

    console.log("from", fromSpecies, toSpecies)

    const dfa = await createGeneConvTable(df, fromSpecies, toSpecies, exact)

    if (dfa) {
      historyDispatch({
        type: "add_step",
        name: `Gene Conversion`,
        sheets: [dfa],
      })
    }
  }

  function save(format: "txt" | "csv") {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === "csv" ? "," : "\t"

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ["test_data"],
      queryFn: () => axios.get("/data/test/geneconv.txt"),
    })

    try {
      const lines = res.data
        .split(/[\r\n]+/g)
        .filter((line: string) => line.length > 0)

      const table = new DataFrameReader().indexCols(0).read(lines)

      historyDispatch({
        type: "reset",
        name: `Load Test`,
        sheets: [table.setName("Geneconv Test")],
      })
    } catch (error) {
      // do nothing
    }
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      name: "Home",
      content: (
        <>
          <ToolbarTabGroup>
            <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  setShowDialog({
                    name: makeRandId("open"),
                  })
                }
              }}
              multiple={true}
              fileTypes={["txt", "tsv", "gmx"]}
            />

            <ToolbarButton
              arial-label="Save table to local file"
              onClick={() => save("txt")}
              title="Save table"
            >
              <SaveIcon className="-scale-100 fill-foreground" />
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarButton
            aria-label="Annotate"
            onClick={convertGenes}
            title="Annotate"
          >
            <PlayIcon />
            <span>Convert</span>
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarTabGroup className="gap-x-2">
            <Label>From</Label>
            <ToggleButtons
              tabs={speciesTabs}
              value={fromSpecies}
              onTabChange={selectedTab => {
                setFromSpecies(selectedTab.tab.name)
              }}
            >
              <ToggleButtonTriggersFramer />
            </ToggleButtons>

            <Label>To</Label>
            <ToggleButtons
              tabs={speciesTabs}
              value={toSpecies}
              onTabChange={selectedTab => {
                setToSpecies(selectedTab.tab.name)
              }}
            >
              <ToggleButtonTriggersFramer />
            </ToggleButtons>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    // {
    //   //id: nanoid(),
    //   icon: <SlidersIcon />,
    //   name: "Options",
    //   content: (
    //     <GeneConvertPropsPanel
    //       fromSpecies={fromSpecies}
    //       toSpecies={toSpecies}
    //       exact={exact}
    //       setFromSpecies={setFromSpecies}
    //       setToSpecies={setToSpecies}
    //       setExact={setExact}
    //     />
    //   ),
    // },
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      name: "History",
      content: <HistoryPanel />,
    },
  ]

  // const sidebar: ITab[] = [
  //   {
  //     icon: <TableIcon className={TOOLBAR_BUTTON_ICON_CLS} />,
  //     label: "Table View",
  //     content: (
  //       <ResizablePanelGroup direction="horizontal">
  //         <ResizablePanel
  //           id="tables"
  //           defaultSize={75}
  //           minSize={50}
  //           className="flex flex-col"
  //         >
  //           <TabbedDataFrames
  //             selectedSheet={history.step.sheetIndex}
  //             dataFrames={history.step.dataframes}
  //             onTabChange={(tab: number) => {
  //               historyDispatch({ type: "change_sheet", index: tab })
  //             }}
  //             onSelectionChange={setSelection}
  //           />
  //         </ResizablePanel>
  //         <HResizeHandle />
  //         <ResizablePanel
  //           className="flex flex-col"
  //           id="right-tabs"
  //           defaultSize={25}
  //           minSize={10}
  //           collapsible={true}
  //         >
  //           <SideBar side="right"
  //             tabs={rightTabs}
  //             activeTabIndex={selectedRightTab}
  //             onTabChange={setSelectedRightTab}
  //           />
  //         </ResizablePanel>
  //       </ResizablePanelGroup>

  //     ),
  //   },
  // ]

  // const fileMenuTabs: ITab[] = [
  //   {
  //     id: nanoid(),
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
  //     id: nanoid(),
  //     name: TEXT_SAVE_AS,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Save text file"
  //               onClick={() => save("txt")}
  //             >
  //               <FileLinesIcon className="w-6" />
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
  //               onClick={() => save("csv")}
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
  // ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      name: "Open",
      icon: <OpenIcon fill="" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() =>
            setShowDialog({ name: makeRandId("open"), params: {} })
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
            onClick={() => save("txt")}
          >
            <FileLinesIcon fill="" />
            <span>Download as TXT</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save("csv")}
          >
            <span>Download as CSV</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.name === "alert" && (
        <BasicAlertDialog onReponse={() => setShowDialog(NO_DIALOG)}>
          {showDialog.params!.message}
        </BasicAlertDialog>
      )}

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

        <TabSlideBar
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={selectedTab => setRightTab(selectedTab.tab.name)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="pr-1"
        >
          <TabbedDataFrames
            selectedSheet={history.currentStep.currentSheetIndex}
            dataFrames={history.currentStep.sheets}
            onTabChange={selectedTab => {
              historyDispatch({
                type: "change_sheet",
                sheetId: selectedTab.index,
              })
            }}
            className={cn(DATA_PANEL_CLS, "pt-3 px-3")}
          />
        </TabSlideBar>

        <ToolbarFooter className="justify-end">
          <>
            {activeSideTab === 0 && (
              <span>{getFormattedShape(history.currentStep.currentSheet)}</span>
            )}
          </>
          <></>
          <></>
        </ToolbarFooter>

        <OpenFiles
          open={showDialog.name.includes("open") ? showDialog.name : ""}
          //onOpenChange={() => setShowDialog(NO_DIALOG)}
          onFileChange={(_, files) => onFileChange(files, openFiles)}
        />

        <a ref={downloadRef} className="hidden" href="#" />
      </ShortcutLayout>
    </>
  )
}

export function GeneConvQueryPage() {
  return (
    <QCP>
      <AccountSettingsProvider>
        <HistoryProvider>
          <GeneConvPage />
        </HistoryProvider>
      </AccountSettingsProvider>
    </QCP>
  )
}
