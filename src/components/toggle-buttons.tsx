import { ANIMATION_DURATION_S } from '@consts'
import type { IChildrenProps } from '@interfaces/children-props'
import type { IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { range } from '@lib/math/range'
import { FOCUS_RING_CLS } from '@theme'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { useContext, useEffect, useRef, useState } from 'react'
import { BaseCol } from './base-col'
import { BaseTabsList, BaseTabsTrigger, Tabs } from './shadcn/ui/themed/tabs'
import {
  getTabFromValue,
  getTabId,
  TabContext,
  TabProvider,
  type ITab,
  type TabChange,
} from './tab-provider'

const BUTTON_CLS = cn(
  FOCUS_RING_CLS,
  'relative inline-flex flex-col justify-center items-center boldable-text-tab z-10 h-7 rounded-md',
  'trans-color data-[state=inactive]:hover:bg-background/50 data-[state=active]:font-medium'
)

interface IToggleButtonsProps extends IChildrenProps {
  value?: string
  tabs: ITab[]
  onTabChange?: TabChange
}

export function ToggleButtons({
  value,
  tabs,
  onTabChange,
  children,
  className,
}: IToggleButtonsProps) {
  return (
    <TabProvider value={value} onTabChange={onTabChange} tabs={tabs}>
      <BaseCol className={className}>{children}</BaseCol>
    </TabProvider>
  )
}

interface IToggleButtonContentProps extends IElementProps {
  showLabels?: boolean
  defaultWidth?: number
}

export function ToggleButtonTriggers({
  showLabels = true,
  defaultWidth = 3.5,
  className,
}: IToggleButtonContentProps) {
  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

  const lineRef1 = useRef<HTMLSpanElement>(null)
  const initial = useRef(true)

  const [tabPos, setTabPos] = useState<{ x: number; w: number }>({
    x: -1,
    w: -1,
  })

  useEffect(() => {
    if (tabPos.x === -1) {
      return
    }

    gsap.timeline().to(lineRef1.current, {
      x: `${tabPos.x}rem`,
      width: `${tabPos.w}rem`,
      duration: initial.current ? 0 : ANIMATION_DURATION_S,
      ease: 'power1.inOut',
    })

    initial.current = false
  }, [tabPos])

  useEffect(() => {
    if (!selectedTab) {
      return
    }

    const x = range(0, selectedTab.index).reduce(
      (sum, index) => sum + (tabs[index].size ?? defaultWidth) + 0.125,
      0
    )

    const w = tabs[selectedTab.index].size ?? defaultWidth

    setTabPos({ x, w })
  }, [selectedTab])

  function _onValueChange(value: string) {
    const tab = getTabFromValue(value, tabs)
    //const [name, index] = parseTabId(value)

    //onValueChange?.(name)
    if (tab) {
      onTabChange?.(tab)
    }
  }

  if (!selectedTab) {
    return null
  }

  return (
    // <ToggleGroup
    //   type="single"
    //   value={_value}
    //   onValueChange={_onValueChange}
    //   className={cn("overflow-hidden rounded-md", className)}
    // >
    //   {tabs.map((tab, ti) => {
    //     const id = makeTabId(tab, ti)

    //     return (
    //       <ToggleGroupItem
    //         value={id}
    //         key={id}
    //         aria-label={tab.name}

    //       >

    //         {showLabels && <span>{tab.name}</span>}
    //       </ToggleGroupItem>
    //     )
    //   })}
    // </ToggleGroup>

    <Tabs
      value={getTabId(selectedTab.tab)}
      onValueChange={_onValueChange}
      className={className}
    >
      <BaseTabsList className="relative bg-accent/50 p-0.5 gap-x-0.5 rounded-lg">
        {tabs.map(tab => {
          const tabId = getTabId(tab)
          return (
            <BaseTabsTrigger
              value={tabId}
              key={tabId}
              aria-label={tab.name}
              //data-selected={_value === id}
              className={BUTTON_CLS}
              style={{ width: `${tab.size ?? defaultWidth}rem` }}
            >
              {showLabels && <span>{tab.name}</span>}
            </BaseTabsTrigger>
          )
        })}

        <span
          ref={lineRef1}
          className="absolute left-0.5 top-0.5 z-0 bg-background rounded-md shadow"
          style={{ height: 'calc(100% - 0.25rem)' }}
        />
      </BaseTabsList>
    </Tabs>
  )
}

// export function SpringToggleButtonTriggers({
//   showLabels = true,
//   defaultWidth = 60,
//   className,
// }: IToggleButtonContentProps) {
//   const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

//   const lineRef1 = useRef<HTMLSpanElement>(null)
//   const initial = useRef(true)
//   const [tabPos, setTabPos] = useState<{ x: number; width: number }>({
//     x: 0,
//     width: 0,
//   })

//   const [styles, api] = useSpring(() => tabPos)

//   useEffect(() => {
//     if (tabPos.x === -1) {
//       return
//     }

//     api.start({
//       x: tabPos.x,
//       width: tabPos.width,
//     })

//     initial.current = false
//   }, [tabPos])

//   useEffect(() => {
//     if (!selectedTab) {
//       return
//     }

//     const x = range(0, selectedTab.index).reduce(
//       (sum, index) => sum + (tabs[index].size ?? defaultWidth),
//       0,
//     )

//     const width = tabs[selectedTab.index].size ?? defaultWidth

//     setTabPos({ x, width })
//   }, [selectedTab])

//   function _onValueChange(value: string) {
//     const tab = getTabFromValue(value, tabs)
//     //const [name, index] = parseTabId(value)

//     //onValueChange?.(name)
//     if (tab) {
//       onTabChange?.(tab)
//     }
//   }

//   if (!selectedTab) {
//     return null
//   }

//   return (
//     <Tabs
//       value={getTabId(selectedTab.tab)}
//       onValueChange={_onValueChange}
//       className={className}
//     >
//       <BaseTabsList className="relative bg-accent/50 p-0.5 rounded-lg">
//         {tabs.map(tab => {
//           const tabId = getTabId(tab)
//           return (
//             <BaseTabsTrigger
//               value={tabId}
//               key={tabId}
//               aria-label={tab.name}
//               //data-selected={_value === id}
//               className={BUTTON_CLS}
//               style={{ width: tab.size ?? defaultWidth }}
//             >
//               {showLabels && <span>{tab.name}</span>}
//             </BaseTabsTrigger>
//           )
//         })}

//         <animated.span
//           ref={lineRef1}
//           className="absolute left-0.5 top-0.5 bottom-0.5 z-0 bg-background rounded-md shadow"
//           style={styles}
//         />
//       </BaseTabsList>
//     </Tabs>
//   )
// }

export function ToggleButtonTriggersFramer({
  showLabels = true,
  defaultWidth = 3.5,
  className,
}: IToggleButtonContentProps) {
  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

  const [tabPos, setTabPos] = useState<{ x: string; width: string }>({
    x: '0rem',
    width: `${defaultWidth}rem`,
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

    setTabPos({ x: `${x}rem`, width: `${width}rem` })
  }, [selectedTab])

  function _onValueChange(value: string) {
    const tab = getTabFromValue(value, tabs)
    //const [name, index] = parseTabId(value)

    //onValueChange?.(name)
    if (tab) {
      onTabChange?.(tab)
    }
  }

  return (
    <Tabs
      value={getTabId(selectedTab.tab)}
      onValueChange={_onValueChange}
      className={className}
    >
      <BaseTabsList className="relative bg-accent/50 p-0.5 rounded-lg">
        {tabs.map(tab => {
          const tabId = getTabId(tab)
          return (
            <BaseTabsTrigger
              value={tabId}
              key={tabId}
              aria-label={tab.name}
              //data-selected={_value === id}
              className={BUTTON_CLS}
              style={{ width: tabPos.width }}
            >
              {showLabels && <span>{tab.name}</span>}
            </BaseTabsTrigger>
          )
        })}

        <motion.span
          className="absolute left-0.5 top-0.5 bottom-0.5 z-0 bg-background rounded-md shadow"
          initial={false}
          animate={{ ...tabPos }}
          transition={{ ease: 'easeInOut' }}
        />
      </BaseTabsList>
    </Tabs>
  )
}
