import type { IChildrenProps } from '@interfaces/children-props'
import type { IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { range } from '@lib/math/range'
import { FOCUS_RING_CLS } from '@theme'
import { motion } from 'framer-motion'
import { useContext, useEffect, useState } from 'react'
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
  'trans-color data-[state=active]:font-medium relative inline-flex flex-col justify-center items-center boldable-text-tab z-10'
)

const TOGGLE_VARIANT_DEFAULT_BUTTON_CLS = cn(
  BUTTON_CLS,
  'data-[state=inactive]:hover:bg-background/75 h-full rounded-md'
)

const TOGGLE_VARIANT_TOOLBAR_BUTTON_CLS = cn(
  BUTTON_CLS,
  'border-l border-border first:border-transparent'
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
  variant?: string
}

// export function ToggleButtonTriggers({
//   showLabels = true,
//   defaultWidth = 3.5,
//   className,
// }: IToggleButtonContentProps) {
//   const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

//   const lineRef1 = useRef<HTMLSpanElement>(null)
//   const initial = useRef(true)

//   const [tabPos, setTabPos] = useState<{ x: number; w: number }>({
//     x: -1,
//     w: -1,
//   })

//   useEffect(() => {
//     if (tabPos.x === -1) {
//       return
//     }

//     gsap.timeline().to(lineRef1.current, {
//       x: `${tabPos.x}rem`,
//       width: `${tabPos.w}rem`,
//       duration: initial.current ? 0 : ANIMATION_DURATION_S,
//       ease: 'power1.inOut',
//     })

//     initial.current = false
//   }, [tabPos])

//   useEffect(() => {
//     if (!selectedTab) {
//       return
//     }

//     const x = range(0, selectedTab.index).reduce(
//       (sum, index) => sum + (tabs[index].size ?? defaultWidth) + 0.125,
//       0
//     )

//     const w = tabs[selectedTab.index].size ?? defaultWidth

//     setTabPos({ x, w })
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
//     // <ToggleGroup
//     //   type="single"
//     //   value={_value}
//     //   onValueChange={_onValueChange}
//     //   className={cn("overflow-hidden rounded-md", className)}
//     // >
//     //   {tabs.map((tab, ti) => {
//     //     const id = makeTabId(tab, ti)

//     //     return (
//     //       <ToggleGroupItem
//     //         value={id}
//     //         key={id}
//     //         aria-label={tab.name}

//     //       >

//     //         {showLabels && <span>{tab.name}</span>}
//     //       </ToggleGroupItem>
//     //     )
//     //   })}
//     // </ToggleGroup>

//     <Tabs
//       value={getTabId(selectedTab.tab)}
//       onValueChange={_onValueChange}
//       className={className}
//     >
//       <BaseTabsList className="relative bg-muted p-0.5 gap-x-0.5 rounded-lg">
//         {tabs.map(tab => {
//           const tabId = getTabId(tab)
//           return (
//             <BaseTabsTrigger
//               value={tabId}
//               key={tabId}
//               aria-label={tab.name}
//               //data-selected={_value === id}
//               className={BUTTON_CLS}
//               style={{ width: `${tab.size ?? defaultWidth}rem` }}
//             >
//               {showLabels && <span>{tab.name}</span>}
//             </BaseTabsTrigger>
//           )
//         })}

//         <span
//           ref={lineRef1}
//           className="absolute left-0.5 top-0.5 z-0 bg-background rounded-md shadow"
//           style={{ height: 'calc(100% - 0.25rem)' }}
//         />
//       </BaseTabsList>
//     </Tabs>
//   )
// }

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
//       <BaseTabsList className="relative bg-muted p-0.5 rounded-lg">
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

const TOGGLE_VARIANT_DEFAULT_LIST_CLS =
  'relative bg-muted p-0.75 rounded-lg overflow-hidden h-8.5 gap-x-1'

const TOGGLE_VARIANT_TOOLBAR_LIST_CLS =
  'relative rounded-md overflow-hidden border border-border box-border h-8'

const TOGGLE_VARIANT_DEFAULT_TAB_CLS =
  'absolute left-0.75 top-0.75 bottom-0.75 z-0 bg-background rounded-md shadow'

const TOGGLE_VARIANT_TOOLBAR_TAB_CLS =
  'absolute left-0 top-0 h-full z-0 bg-muted'

export function ToggleButtonTriggers({
  showLabels = true,
  defaultWidth = 3.5,
  variant = 'default',
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
      (sum, index) => sum + (tabs[index].size ?? defaultWidth + 0.25),
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

  let tabListCls = TOGGLE_VARIANT_DEFAULT_LIST_CLS
  let tabButtonCls = TOGGLE_VARIANT_DEFAULT_BUTTON_CLS
  let tabCls = TOGGLE_VARIANT_DEFAULT_TAB_CLS

  if (variant === 'toolbar') {
    tabListCls = TOGGLE_VARIANT_TOOLBAR_LIST_CLS
    tabButtonCls = TOGGLE_VARIANT_TOOLBAR_BUTTON_CLS
    tabCls = TOGGLE_VARIANT_TOOLBAR_TAB_CLS
  }

  return (
    <Tabs
      value={getTabId(selectedTab.tab)}
      onValueChange={_onValueChange}
      className={className}
    >
      <BaseTabsList className={tabListCls}>
        {tabs.map(tab => {
          const tabId = getTabId(tab)
          return (
            <BaseTabsTrigger
              value={tabId}
              key={tabId}
              aria-label={tab.name}
              //data-selected={_value === id}
              className={tabButtonCls}
              style={{ width: tabPos.width }}
            >
              {showLabels && <span>{tab.name}</span>}
            </BaseTabsTrigger>
          )
        })}

        <motion.span
          className={tabCls}
          initial={false}
          animate={{ ...tabPos }}
          transition={{ ease: 'easeInOut' }}
        />
      </BaseTabsList>
    </Tabs>
  )
}
