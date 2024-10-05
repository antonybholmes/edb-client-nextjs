import { ToolbarOpenFile } from "@components/toolbar/toolbar-open-files"

import { ToolbarFooter } from "@components/toolbar/toolbar-footer"

import { BaseCol } from "@components/base-col"
import { Toolbar, ToolbarMenu, ToolbarPanel } from "@components/toolbar/toolbar"
import { ToolbarSeparator } from "@components/toolbar/toolbar-separator"
import { ToolbarTabPanel } from "@components/toolbar/toolbar-tab-panel"
import { PlayIcon } from "@icons/play-icon"

import { ToolbarButton } from "@components/toolbar/toolbar-button"

import { download } from "@lib/download-utils"

import { type IModuleInfo } from "@interfaces/module-info"

import { OpenFiles, onFileChange } from "@components/pages/open-files"
import { MenuButton } from "@components/toolbar/menu-button"

import { BasicAlertDialog } from "@components/dialog/basic-alert-dialog"
import { ToolbarTabGroup } from "@components/toolbar/toolbar-tab-group"

import { ToolbarTabButton } from "@components/toolbar/toolbar-tab-button"
import { FileLinesIcon } from "@icons/file-lines-icon"
import { SaveIcon } from "@icons/save-icon"

import { QCP } from "@query"
import {
  FILE_MENU_ITEM_DESC_CLS,
  FILE_MENU_ITEM_HEADING_CLS,
  H2_CLS,
} from "@theme"
import { useEffect, useRef, useState } from "react"

import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@components/shadcn/ui/themed/resizable"
import { HResizeHandle } from "@components/split-pane/h-resize-handle"
import { NO_DIALOG, TEXT_SAVE_AS, type IDialogParams } from "@consts"

import { CollapseBlock } from "@components/collapse-block"
import { Switch } from "@components/shadcn/ui/themed/switch"
import { Textarea } from "@components/shadcn/ui/themed/textarea"
import { VResizeHandle } from "@components/split-pane/v-resize-handle"
import { ToggleButtonTriggers, ToggleButtons } from "@components/toggle-buttons"
import { VCenterRow } from "@components/v-center-row"
import { GenomicLocation, parseLoc } from "@modules/genomic/genomic"

import { Input } from "@components/shadcn/ui/themed/input"
import { Label } from "@components/shadcn/ui/themed/label"

import type { ITab } from "@components/tab-provider"
import { ShortcutLayout } from "@layouts/shortcut-layout"
import { makeRandId, nanoid } from "@lib/utils"
import { dnaToJson, fetchDNA, type IDNA } from "@modules/genomic/dna"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"

export const MODULE_INFO: IModuleInfo = {
  name: "Get DNA",
  description: "Get DNA",
  version: "1.0.0",
  copyright: "Copyright (C) 2024 Antony Holmes",
}

function GetDNAPage() {
  const queryClient = useQueryClient()
  const downloadRef = useRef<HTMLAnchorElement>(null)

  const [text, setText] = useState("")

  const [output, setOutput] = useState("")
  const [outputMode, setOutputMode] = useState("FASTA")
  const [outputSeqs, setOutputSeqs] = useState<IDNA[]>([])

  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [showFileMenu, setShowFileMenu] = useState(false)

  // function openFiles(files: IFileOpen[]) {
  //   setShowFileMenu(false)
  // }

  async function getDNA() {
    const lines = text.split(/[\r?\n]/g)

    const seqs: GenomicLocation[] = []

    lines.forEach(line => {
      line = line.trim()
      if (line.startsWith(">")) {
        const loc = parseLoc(line.substring(1))
        if (loc) {
          seqs.push(loc)
        }
      }
    })

    console.log(seqs)

    const dnaseqs: (IDNA | null)[] = await Promise.all(
      seqs.map(
        async loc =>
          await fetchDNA(loc, { reverse: modeRev, complement: modeComp }),
      ),
    )

    setOutputSeqs(dnaseqs.filter(x => x !== null) as IDNA[])
  }

  function save(format = "fasta") {
    if (outputSeqs.length === 0) {
      return
    }

    switch (format) {
      case "json":
        download(dnaToJson(outputSeqs), downloadRef, "dna.json")
        break
      default:
        download(
          outputSeqs
            .map(seq => `>${seq.location.toString()}\n${seq.seq}`)
            .join("\n"),
          downloadRef,
          "dna.fasta",
        )
        break
    }

    setShowFileMenu(false)
  }

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ["test_data"],
      queryFn: () => axios.get("/data/test/get-dna.txt"),
    })

    setText(res.data)
  }

  useEffect(() => {
    if (outputSeqs.length > 0) {
      switch (outputMode) {
        case "JSON":
          setOutput(dnaToJson(outputSeqs))
          break
        default:
          setOutput(
            outputSeqs
              .map(seq => `>${seq.location.toString()}\n${seq.seq}`)
              .join("\n"),
          )
          break
      }
    }
  }, [outputSeqs])

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      name: "Home",
      content: (
        <ToolbarTabPanel>
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

            <ToolbarButton title="Save to local file" onClick={() => save()}>
              <SaveIcon className="-scale-100 fill-blue-400" />
            </ToolbarButton>
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

          <ToolbarButton title="Reverse Complement" onClick={getDNA}>
            <PlayIcon />
            <span>Convert</span>
          </ToolbarButton>

          {/* <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarButton
              selected={modeRev}
              onClick={() => setModeRev(!modeRev)}
            >
              Reverse
            </ToolbarButton>
            <ToolbarButton
              selected={modeComp}
              onClick={() => setModeComp(!modeComp)}
            >
              Complement
            </ToolbarButton>
          </ToolbarTabGroup> */}

          {/* <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarButton
              selected={outputMode === "fasta"}
              onClick={() => setOutputMode("fasta")}
            >
              FASTA
            </ToolbarButton>
            <ToolbarButton
              selected={outputMode === "json"}
              onClick={() => setOutputMode("json")}
            >
              JSON
            </ToolbarButton>
          </ToolbarTabGroup> */}
        </ToolbarTabPanel>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    // {
    //   tab: "Open",
    //   icon: <OpenIcon fill="" w="w-5" />,
    //   content: (
    //     <BaseCol className="gap-y-6 p-6 ">
    //       <h1 className="text-2xl">Open</h1>

    //       <ul className="flex flex-col gap-y-2 text-xs">
    //         <li>
    //           <MenuButton
    //             aria-label="Open file on your computer"
    //             onClick={() => setShowDialog({ name: "open", params: {} })}
    //           >
    //             <OpenIcon className="w-6 fill-amber-300" />
    //             <p>
    //               <span className={FILE_MENU_ITEM_HEADING_CLS}>
    //                 Open local file
    //               </span>
    //               <br />
    //               <span>Open a local file on your computer.</span>
    //             </p>
    //           </MenuButton>
    //         </li>
    //       </ul>
    //     </BaseCol>
    //   ),
    // },
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
                onClick={() => save("fasta")}
              >
                <FileLinesIcon className="w-6" />
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as FASTA
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save sequences as FASTA.
                  </span>
                </p>
              </MenuButton>
            </li>
            <li>
              <MenuButton
                aria-label="Save JSON file"
                onClick={() => save("json")}
              >
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as JSON
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save sequences as JSON.
                  </span>
                </p>
              </MenuButton>
            </li>
          </ul>
        </BaseCol>
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

      <ShortcutLayout info={MODULE_INFO}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel />
        </Toolbar>

        <ResizablePanelGroup direction="horizontal" className="grow pl-2">
          <ResizablePanel
            id="main"
            defaultSize={80}
            minSize={50}
            className="flex flex-col"
          >
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                id="dna"
                defaultSize={50}
                minSize={10}
                className="flex flex-col"
                collapsible={true}
              >
                <Textarea
                  className="grow whitespace-pre"
                  placeholder=">chr3:187453454-187454415"
                  value={text}
                  onChange={e => {
                    setText(e.target.value)
                  }}
                />
              </ResizablePanel>
              <VResizeHandle />
              <ResizablePanel
                className="flex flex-col"
                id="output"
                defaultSize={50}
                minSize={10}
                collapsible={true}
              >
                <Textarea
                  className="grow"
                  placeholder="Output..."
                  value={output}
                  readOnly
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <HResizeHandle />
          <ResizablePanel
            defaultSize={20}
            minSize={10}
            collapsible={true}
            className="flex flex-col"
            id="right-tabs"
          >
            <BaseCol className="grow gap-y-1 px-2 text-xs">
              <h2 className={H2_CLS}>Settings</h2>

              <CollapseBlock name="Padding">
                <VCenterRow className="gap-x-4">
                  <Label className="shrink-0">5&apos; padding</Label>

                  <Input className="w-full rounded" />
                </VCenterRow>
              </CollapseBlock>

              <CollapseBlock name="Output">
                <Switch
                  checked={modeRev}
                  onCheckedChange={state => setModeRev(state)}
                >
                  Reverse
                </Switch>

                <Switch
                  checked={modeComp}
                  onCheckedChange={state => setModeComp(state)}
                >
                  Compliment
                </Switch>
              </CollapseBlock>

              <CollapseBlock name="Format">
                <VCenterRow className="gap-x-2">
                  <ToggleButtons
                    tabs={[
                      { id: nanoid(), name: "FASTA" },
                      { id: nanoid(), name: "JSON" },
                    ]}
                    value={outputMode}
                    onTabChange={selectedTab =>
                      setOutputMode(selectedTab.tab.name)
                    }
                  >
                    <ToggleButtonTriggers />
                  </ToggleButtons>
                </VCenterRow>
              </CollapseBlock>
            </BaseCol>
          </ResizablePanel>
        </ResizablePanelGroup>

        <ToolbarFooter className="justify-end"></ToolbarFooter>

        <OpenFiles
          open={showDialog.name.includes("open") ? showDialog.name : ""}
          //onOpenChange={() => setShowDialog(NO_DIALOG)}
          onFileChange={(_, files) =>
            onFileChange(files, files => {
              setText(files[0].text)
            })
          }
          fileTypes={["fasta"]}
        />

        <a ref={downloadRef} className="hidden" href="#" />
      </ShortcutLayout>
    </>
  )
}

export function GetDNAQueryPage() {
  return (
    <QCP>
      <GetDNAPage />
    </QCP>
  )
}
