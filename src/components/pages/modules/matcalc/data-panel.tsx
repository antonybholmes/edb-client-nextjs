import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

//import { ZoomSlider } from "@components/toolbar/zoom-slider"

import { ClockRotateLeftIcon } from '@components/icons/clock-rotate-left-icon'
import { FilterIcon } from '@components/icons/filter-icon'
import { LayersIcon } from '@components/icons/layers-icon'

import { HistoryContext } from '@components/history-provider'
import {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
} from 'react'

import { GroupPropsPanel } from './group-props-panel'

import { HistoryPanel } from '@components/pages/history-panel'
import {
  MessageContext,
  messageTextFileFormat,
} from '@components/pages/message-context'
import { FilterPropsPanel } from '@components/pages/plot/filter-props-panel'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { type ISelectedTab, type ITab } from '@components/tab-provider'
import { TabSlideBar } from '@components/tab-slide-bar'
import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { cn } from '@lib/class-names'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

export const DEFAULT_PANEL_ID = 'Table 1'

export const DATA_PANEL_CLS =
  'bg-background border border-border/50 rounded-md overflow-hidden bg-white shadow-box m-2 relative grow flex flex-col'

export const SHEET_PANEL_CLS = cn(DATA_PANEL_CLS, 'px-3 pt-3')

export interface IDataPanelProps {
  panelId?: string
  //setSlidebarSide: (c: ReactElement | undefined) => void
}

export const DataPanel = forwardRef(function DataPanel(
  { panelId = DEFAULT_PANEL_ID }: IDataPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [history, historyDispatch] = useContext(HistoryContext)

  const downloadRef = useRef<HTMLAnchorElement>(null)

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [selectedTab, setSelectedTab] = useState('Groups')

  //const [scaleIndex, setScaleIndex] = useState(3)

  const [messageState, messageDispatch] = useContext(MessageContext)

  const [showSave, setShowSave] = useState('')

  const [showSideBar, setShowSideBar] = useState(true)

  //setFooterLeft(<span>{getFormattedShape(history.currentStep.currentSheet)}</span>)

  function save(format: string) {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'
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
    const messages = messageState.queue.filter(m => m.target === panelId)

    messages.forEach(message => {
      console.log(message)

      if (message.text.includes('save')) {
        setShowSave(messageTextFileFormat(message))
      }

      if (message.text.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }
    })

    // clear any messages so they are not repeatedly reused
    if (messageState.queue.length > 0) {
      messageDispatch({ type: 'clear' })
    }

    //downloadSvgAsPng(svgRef, canvasRef, downloadRef)
  }, [messageState])

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Groups',
      icon: <LayersIcon />,
      content: (
        <GroupPropsPanel
          df={history.currentStep.currentSheet}
          downloadRef={downloadRef}
        />
      ),
      children: [],
    },
    {
      //id: nanoid(),
      name: 'Filter',
      icon: <FilterIcon />,
      size: 2.2,
      content: <FilterPropsPanel df={history.currentStep.currentSheet} />,
    },
    {
      //id: nanoid(),
      name: 'History',
      icon: <ClockRotateLeftIcon />,
      content: <HistoryPanel />,
    },
  ]

  return (
    <>
      {showSave && (
        <SaveTxtDialog
          onSave={format => {
            save(format.ext)
            setShowSave('')
          }}
          onCancel={() => setShowSave('')}
        />
      )}

      <TabSlideBar
        value={selectedTab}
        tabs={rightTabs}
        side="right"
        limits={[50, 85]}
        onTabChange={selectedTab => setSelectedTab(selectedTab.tab.name)}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <TabbedDataFrames
          selectedSheet={history.currentStep.currentSheetIndex}
          dataFrames={history.currentStep.sheets}
          onTabChange={(selectedTab: ISelectedTab) => {
            historyDispatch({
              type: 'change_sheet',
              sheetId: selectedTab.index,
            })
          }}
          className={SHEET_PANEL_CLS}
        />
      </TabSlideBar>

      <ToolbarFooter>
        <span>{getFormattedShape(history.currentStep.currentSheet)}</span>
      </ToolbarFooter>

      <a ref={downloadRef} className="hidden" href="#" />
    </>
  )
})
