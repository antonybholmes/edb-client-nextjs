import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { useContext, useEffect, useState } from 'react'

import { type ITooltipSide } from '@interfaces/tooltip-side-props'

import { TabContext, TabProvider } from '@components/tab-provider'
import { range } from '@lib/math/range'
import { motion } from 'framer-motion'
import { type IToolbarProps } from './toolbar'

interface IShortcutProps extends IToolbarProps {
  defaultWidth?: number
}

export function Shortcuts({
  value,
  onTabChange,
  tabs,
  defaultWidth = 2.5,
}: IShortcutProps) {
  return (
    <TabProvider value={value} onTabChange={onTabChange} tabs={tabs}>
      <ShortcutContent defaultWidth={defaultWidth} />
    </TabProvider>
  )
}

interface IShortcutsProps extends IElementProps, ITooltipSide {
  defaultWidth?: number
}

export function ShortcutContent({
  defaultWidth = 2.5,
  className,
  ...props
}: IShortcutsProps) {
  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

  const w = `${defaultWidth}rem`

  const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
    y: '0rem',
    height: `${defaultWidth}rem`,
  })

  useEffect(() => {
    if (!selectedTab) {
      return
    }

    const x = range(0, selectedTab.index).reduce(
      (sum, index) => sum + (tabs[index].size ?? defaultWidth),
      0
    )

    const width = tabs[selectedTab.index].size ?? defaultWidth

    setTabPos({ y: `${x + 0.25}rem`, height: `${width - 0.5}rem` })
  }, [selectedTab.index])

  return (
    <div
      className={cn(
        'relative flex shrink-0 flex-col items-center my-2 w-12',
        className
      )}
      {...props}
    >
      {tabs.map((tab, ti) => {
        return (
          <button
            key={ti}
            title={tab.name}
            data-selected={ti === selectedTab.index}
            onClick={() => onTabChange?.({ index: ti, tab })}
            style={{ width: w, height: w }}
            className="flex flex-row items-center justify-center hover:bg-white/60 trans-color rounded data-[selected=false]:stroke-foreground/90 data-[selected=false]:fill-foreground/90 data-[selected=true]:stroke-blue-400 data-[selected=true]:fill-blue-400"
          >
            {tab.icon}
          </button>
          //
        )
      })}

      <motion.span
        className="absolute left-0 w-[3px] z-0 bg-theme rounded-md"
        animate={{ ...tabPos }}
        transition={{ ease: 'easeInOut' }}
      />
    </div>
  )
}

//   const [_activeTabIndex, setActiveTabIndex] = useState(0)

//   function _onTabChange(index: number) {
//     setActiveTabIndex(index)
//     onTabChange?.(index)
//   }

//   const at = activeTabIndex ?? _activeTabIndex

//   return (
//     <Tabs
//       className="flex grow flex-row"
//       activeTabIndex={at}
//       onTabChange={index => _onTabChange(index)}
//     >
//       <SideBarButtons tabs={tabs} />

//       <TabIndexContext.Provider value={at}>
//         <TabPanel className="grow">{tabs[at].content}</TabPanel>
//       </TabIndexContext.Provider>
//     </Tabs>
//   )
// }
