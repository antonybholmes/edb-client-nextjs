'use client'

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

import { ToolbarButton } from '@components/toolbar/toolbar-button'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onFileChange,
  OpenFiles,
  type IFileOpen,
  type IParseOptions,
} from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import { Tooltip } from '@components/tooltip'

import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { HistoryContext, HistoryProvider } from '@hooks/use-history'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { FileLinesIcon } from '@icons/file-lines-icon'
import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'

import { queryClient } from '@query'
import { useContext, useRef, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@consts'

import { SlidersIcon } from '@components/icons/sliders-icon'
import { UploadIcon } from '@components/icons/upload-icon'
import { PropsPanel } from '@components/props-panel'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import {
  RadioGroup,
  RadioGroupItem,
} from '@components/shadcn/ui/themed/radio-group'
import { TabSlideBar } from '@components/tab-slide-bar'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { makeRandId } from '@lib/utils'
import { API_DNA_ASSEMBLIES_URL, JSON_HEADERS } from '@modules/edb'
import { createDNATable, type FORMAT_TYPE } from '@modules/genomic/dna'
import { AccountSettingsProvider } from '@providers/account-settings-provider'
import axios from 'axios'

import { BaseCol } from '@components/base-col'
import { HistoryPanel } from '@components/pages/history-panel'
import { PropRow } from '@components/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Label } from '@components/shadcn/ui/themed/label'
import type { ITab } from '@components/tab-provider'
import {
  ToggleButtons,
  ToggleButtonTriggersFramer,
} from '@components/toggle-buttons'
import { useQuery } from '@tanstack/react-query'
import { SHEET_PANEL_CLS } from '../../matcalc/data-panel'
import MODULE_INFO from './module.json'

function DNAPage() {
  //const [dataFrame, setDataFile] = useState<BaseDataFrame>(INF_DATAFRAME)

  const [activeSideTab] = useState(0)
  const downloadRef = useRef<HTMLAnchorElement>(null)

  const [history, historyDispatch] = useContext(HistoryContext)

  const [rightTab, setRightTab] = useState('Settings')
  const [showSideBar, setShowSideBar] = useState(true)

  const [assembly, setAssembly] = useState('grch38')
  const [reverse, setReverse] = useState(false)
  const [complement, setComplement] = useState(false)
  const [format, setFormat] = useState<FORMAT_TYPE>('Auto')
  const [mask, setMask] = useState<'' | 'lower' | 'n'>('')

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [showFileMenu, setShowFileMenu] = useState(false)

  function openFiles(
    files: IFileOpen[],
    options: IParseOptions = DEFAULT_PARSE_OPTS
  ) {
    filesToDataFrames(files, historyDispatch, options)

    setShowFileMenu(false)
  }

  async function addDNA() {
    const df = history.currentStep.currentSheet

    const dfa = await createDNATable(queryClient, df, {
      assembly,
      format,
      mask,
      reverse,
      complement,
    })

    if (dfa) {
      historyDispatch({
        type: 'add_step',
        name: `DNA`,
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

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/dna.txt'),
    })

    try {
      const lines = res.data
        .split(/[\r\n]+/g)
        .filter((line: string) => line.length > 0)

      const table = new DataFrameReader().indexCols(0).read(lines)

      //resolve({ ...table, name: file.name })

      historyDispatch({
        type: 'reset',
        name: `Load "DNA Test"`,
        sheets: [table.setName('DNA Test')],
      })
    } catch (error) {
      // do nothing
    }
  }

  const assembliesQuery = useQuery({
    queryKey: ['databases'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await axios.post(
        API_DNA_ASSEMBLIES_URL,
        {},
        {
          headers: JSON_HEADERS,
        }
      )

      return res.data.data
    },
  })

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

            <Tooltip content="Save table">
              <ToolbarButton
                arial-label="Save table to local file"
                onClick={() => save('txt')}
              >
                <SaveIcon className="-scale-100 fill-foreground" />
              </ToolbarButton>
            </Tooltip>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarButton title="Add DNA" onClick={addDNA}>
            <PlayIcon />
            <span>Add DNA</span>
          </ToolbarButton>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <SlidersIcon />,
      name: 'Settings',
      content: (
        <PropsPanel>
          <ScrollAccordion value={['assembly', 'display']}>
            <AccordionItem value="assembly">
              <AccordionTrigger>Assembly</AccordionTrigger>
              <AccordionContent>
                {assembliesQuery.data && (
                  <RadioGroup
                    defaultValue={assembly ?? assembliesQuery.data[0]}
                    className="flex flex-col gap-y-1.5"
                  >
                    {assembliesQuery.data.map(
                      (assembly: string, dbi: number) => (
                        <RadioGroupItem
                          key={dbi}
                          value={assembly}
                          onClick={() => setAssembly(assembly)}
                        >
                          <Label>{assembly}</Label>
                        </RadioGroupItem>
                      )
                    )}
                  </RadioGroup>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="display">
              <AccordionTrigger>Display</AccordionTrigger>
              <AccordionContent>
                <PropRow title="Case" justify="">
                  <ToggleButtons
                    tabs={[
                      { id: 'Auto', name: 'Auto' },
                      { id: 'Upper', name: 'Upper' },
                      { id: 'Lower', name: 'Lower' },
                    ]}
                    value={format}
                    onTabChange={selectedTab => {
                      setFormat(selectedTab.tab.name as FORMAT_TYPE)
                    }}
                  >
                    <ToggleButtonTriggersFramer />
                  </ToggleButtons>
                </PropRow>

                <PropRow
                  title="Mask"
                  justify="justify-start"
                  items="items-start"
                >
                  <BaseCol className="gap-y-1 w-28">
                    <Checkbox
                      checked={mask == 'n'}
                      onCheckedChange={() => {
                        if (mask != 'n') {
                          setMask('n')
                        } else {
                          setMask('')
                        }
                      }}
                    >
                      <span>N</span>
                    </Checkbox>

                    <Checkbox
                      checked={mask == 'lower'}
                      onCheckedChange={() => {
                        if (mask != 'lower') {
                          setMask('lower')
                        } else {
                          setMask('')
                        }
                      }}
                    >
                      <span>Lowercase</span>
                    </Checkbox>
                  </BaseCol>
                </PropRow>

                <PropRow
                  title="Strand"
                  justify="justify-start"
                  items="items-start"
                >
                  <BaseCol className="gap-y-1 w-28">
                    <Checkbox
                      checked={reverse}
                      onCheckedChange={() => setReverse(!reverse)}
                    >
                      <span>Reverse</span>
                    </Checkbox>
                    <Checkbox
                      checked={complement}
                      onCheckedChange={() => setComplement(!complement)}
                    >
                      <span>Complement</span>
                    </Checkbox>
                  </BaseCol>
                </PropRow>
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      name: 'History',
      content: <HistoryPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
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
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
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
            defaultSize={80}
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
          <ResizablePanel
            className="flex flex-col"
            id="right-tabs"
            defaultSize={20}
            minSize={10}
            collapsible={true}
          >
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
          className="pr-1"
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
            className={SHEET_PANEL_CLS}
          />
        </TabSlideBar>

        <ToolbarFooter className="justify-end">
          <>
            {activeSideTab === 0 && (
              <span>{getFormattedShape(history.currentStep.currentSheet)}</span>
            )}
          </>
        </ToolbarFooter>

        <OpenFiles
          open={showDialog.name.includes('open') ? showDialog.name : ''}
          //onOpenChange={() => setShowDialog(NO_DIALOG)}
          onFileChange={(_, files) => onFileChange(files, openFiles)}
        />

        <a ref={downloadRef} className="hidden" href="#" />
      </ShortcutLayout>
    </>
  )
}

export function DNAQueryPage() {
  return (
    <AccountSettingsProvider>
      <HistoryProvider>
        <DNAPage />
      </HistoryProvider>
    </AccountSettingsProvider>
  )
}
