import { BottomBar } from '@components/toolbar/bottom-bar'

import { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { getTabId, type ITab, type ITabChange } from '@components/tab-provider'
import { truncate } from '@lib/text/text'
import type { TabsProps } from '@radix-ui/react-tabs'
import { forwardRef, useState, type ForwardedRef } from 'react'
import { DataFrameSimpleCanvasUI } from './dataframe-simple-canvas-ui'

const MAX_NAME_CHARS = 15

interface IProps extends TabsProps, ITabChange {
  dataFrames: BaseDataFrame[]
  selectedSheet?: number
  scale?: number
  editable?: boolean
  contentClassName?: string
}

export const TabbedDataFrames = forwardRef(function TabbedDataFrames(
  {
    selectedSheet,
    dataFrames,
    scale = 1,
    editable = false,
    onValueChange,
    onTabChange,
    //onTabIdChange,
    contentClassName,
    className,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [_selectedSheet, setSelectedSheet] = useState(0)

  // useEffect(() => {
  //   setSelectedTab(dataFrames.length - 1)
  // }, [dataFrames])

  const tabs: ITab[] = dataFrames.map((df, i) => {
    const sheetId = `Sheet ${i + 1}`
    const name = truncate(df.name !== '' ? df.name : sheetId, {
      length: MAX_NAME_CHARS,
    })

    return {
      id: sheetId, //nanoid(),
      name,
      content: (
        <DataFrameSimpleCanvasUI
          df={df}
          key={i}
          scale={scale}
          editable={editable}
          className={contentClassName}
        />
      ),
      //content: <LazyGlideUI df={df} key={i} scale={scale} />,
    }
  })

  if (tabs.length === 0) {
    return null
  }

  const sheet = selectedSheet !== undefined ? selectedSheet : _selectedSheet

  const value = getTabId(tabs[sheet ?? 0])

  // transition between index based tabs and value selection
  // tables, possibly move to entirely name based tabs in the future
  return (
    <BottomBar
      ref={ref}
      value={value}
      tabs={tabs}
      onValueChange={onValueChange}
      onTabChange={selectedTab => {
        // historyDispatch({
        //   type: 'goto_sheet',
        //   sheetId: selectedTab.index,
        // })

        setSelectedSheet(selectedTab.index)

        onTabChange?.(selectedTab)
      }}
      //onTabIdChange={onTabIdChange}
      defaultWidth={4.5}
      className={className}
    />

    // <Tabs
    //   selected={selectedTab}
    //   onTabChange={(tab: number) => setSelectedTab(tab)}
    //   className="grow flex flex-col"
    // >
    //   <TabPanels className="grow flex flex-col">
    //     {dataFrames.map((df, i) => (
    //       <TabPanel className="grow flex flex-col" key={i}>
    //         <DataFrameSimpleCanvasUI df={df} key={i} />
    //       </TabPanel>
    //     ))}
    //   </TabPanels>
    //   {dataFrames.length > 0 && (
    //     <VCenterRow>
    //       <ToolbarButton
    //         className="w-6 h-6 items-center justify-center"
    //         onClick={() => setSelectedTab(Math.max(0, selectedTab - 1))}
    //       >
    //         <ChevronLeftIcon />
    //       </ToolbarButton>
    //       <ToolbarButton
    //         className="w-6 h-6 items-center justify-center"
    //         onClick={() =>
    //           setSelectedTab(Math.min(dataFrames.length - 1, selectedTab + 1))
    //         }
    //       >
    //         <ChevronRightIcon />
    //       </ToolbarButton>
    //       <TabList className="flex flex-row px-1">
    //         {dataFrames
    //           .filter(df => df.name !== "")
    //           .map((df, i) => (
    //             <ToolbarTab key={i}>{df.name}</ToolbarTab>
    //           ))}
    //       </TabList>
    //     </VCenterRow>
    //   )}
    // </Tabs>
  )
})
