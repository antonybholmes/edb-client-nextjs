import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

//import { ZoomSlider } from "@components/toolbar/zoom-slider"
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { ClockRotateLeftIcon } from '@components/icons/clock-rotate-left-icon'

import { HistoryContext } from '@components/history-provider'
import {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
} from 'react'

import { MessageContext } from '@components/pages/message-context'
import { TabSlideBar } from '@components/tab-slide-bar'

import { nanoid } from '@lib/utils'

import { HistoryPanel } from '@components/pages/history-panel'
import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import type { ITab } from '@components/tab-provider'
import { type IDataPanelProps } from '../matcalc/data-panel'

export const DataPanel = forwardRef(function DataPanel(
  { panelId = 'Data' }: IDataPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [history, historyDispatch] = useContext(HistoryContext)

  const downloadRef = useRef<HTMLAnchorElement>(null)

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [selectedTab, setSelectedTab] = useState('Clinical Tracks')

  //const [scaleIndex, setScaleIndex] = useState(3)

  const [messageState, messageDispatch] = useContext(MessageContext)

  const [showSave, setShowSave] = useState('')

  const [showSideBar, setShowSideBar] = useState(true)

  function save(format: ISaveAsFormat) {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format.ext === 'csv' ? ',' : '\t'
    const hasHeader = !df.name.includes('GCT')
    const hasIndex = !df.name.includes('GCT')

    downloadDataFrame(df, downloadRef, {
      hasHeader,
      hasIndex,
      file: `table.${format}`,
      sep,
    })

    //setShowFileMenu(false)
  }

  useEffect(() => {
    const messages = messageState.queue.filter(
      message => message.target === panelId
    )

    console.log(messageState.queue, panelId)

    messages.forEach(message => {
      console.log(message)

      if (message.text.includes('save')) {
        let format = 'txt'

        if (message.text.includes(':')) {
          format = message.text.split(':')[1]
        }

        setShowSave(format)
      }

      if (message.text.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }
    })

    if (messageState.queue.length > 0) {
      messageDispatch({ type: 'clear' })
    }
    //downloadSvgAsPng(svgRef, canvasRef, downloadRef)
  }, [messageState])

  const rightTabs: ITab[] = [
    {
      id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      name: 'History',
      content: <HistoryPanel />,
    },
  ]

  return (
    <>
      <SaveTxtDialog
        open={showSave}
        onSave={format => {
          save(format)
          setShowSave('')
        }}
        onCancel={() => setShowSave('')}
      />

      {/* <ResizablePanelGroup
        direction="horizontal"
        id="heatmap-resizable-panels"

        //autoSaveId="heatmap-resizable-panels"
      >
        <ResizablePanel
          defaultSize={75}
          minSize={50}
          className="pl-2 pt-2 flex min-h-0 flex-col"
          id="data-frames"
          order={1}
        >
          <TabbedDataFrames
            selectedSheet={history.currentStep.currentSheetIndex}
            dataFrames={history.currentStep.sheets}
            onTabChange={(tab: number) => {
              historyDispatch({ type: "goto_sheet", sheetId: tab })
            }}
          />
        </ResizablePanel>
        <ThinHResizeHandle />
        <ResizablePanel
          id="data-frames-right"
          className="flex min-h-0 flex-col overflow-hidden"
          defaultSize={25}
          minSize={15}
          collapsible={true}
          order={2}
        >
          <SideBarTextTabs
            // we must add a key to multiple instances of objects
            // that use usestate otherwise they end up sharing
            key="right-tabs"
            tabs={rightTabs}
            value={selectedTab}
            onValueChange={setSelectedTab}
          />
        </ResizablePanel>
      </ResizablePanelGroup> */}

      <TabSlideBar
        side="right"
        tabs={rightTabs}
        onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
        value={selectedTab}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <TabbedDataFrames
          selectedSheet={history.currentStep.currentSheetIndex}
          dataFrames={history.currentStep.sheets}
          onTabChange={selectedTab => {
            historyDispatch({
              type: 'goto_sheet',
              sheetId: selectedTab.index,
            })
          }}
          //className={DATA_PANEL_CLS}
        />
      </TabSlideBar>

      {/* <SideBar
          // we must add a key to multiple instances of objects
          // that use usestate otherwise they end up sharing
          key="right-tabs"
          side="right"
          tabs={rightTabs}
          value={selectedTab}
          onValueChange={setSelectedTab}
        /> */}

      <ToolbarFooter className="justify-end">
        <span>{getFormattedShape(history.currentStep.currentSheet)}</span>
        <></>
        <>
          {/* <ZoomSlider
              scaleIndex={scaleIndex}
              onZoomChange={index => setScaleIndex(index)}
            /> */}
        </>
      </ToolbarFooter>

      <a ref={downloadRef} className="hidden" href="#" />
    </>
  )
})
