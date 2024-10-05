import { type IElementProps } from "@interfaces/element-props"
import { cn } from "@lib/class-names"
import { useContext, useEffect, useState } from "react"

import { type ITooltipSide } from "@interfaces/tooltip-side-props"

import { TabContext, TabProvider } from "@components/tab-provider"
import { range } from "@lib/math/range"
import { motion } from "framer-motion"
import { type IToolbarProps } from "./toolbar"

export function Shortcuts({ value, onTabChange, tabs }: IToolbarProps) {
  return (
    <TabProvider value={value} onTabChange={onTabChange} tabs={tabs}>
      <ShortcutContent />
    </TabProvider>
  )
}

interface IShortcutsProps extends IElementProps, ITooltipSide {
  defaultWidth?: number
}

export function ShortcutContent({
  tooltipSide = "right",
  defaultWidth = 2.5,

  className,

  ...props
}: IShortcutsProps) {
  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

  const w = `${defaultWidth}rem`

  // useEffect(() => {

  //   const dir = selectedTab.index - currentStep.current
  //   //const ext = _scale > 1 ? 0 : 2
  //   const y1 = h * selectedTab.index + offset
  //   const y2 = h * (selectedTab.index + 1) - offset
  //   const duration = initial.current ? 0 : ANIMATION_DURATION_S

  //   if (dir > 0) {
  //     gsap
  //       .timeline()
  //       .to(lineRef.current, {
  //         attr: { y2 },
  //         duration,
  //         ease: "power2.out",
  //       })
  //       .to(
  //         lineRef.current,
  //         {
  //           attr: { y1 },
  //           duration,
  //           ease: "power2.out",
  //         },
  //         "-=50%",
  //       )
  //   } else if (dir < 0) {
  //     gsap
  //       .timeline()
  //       .to(lineRef.current, {
  //         attr: { y1 },
  //         duration,
  //         ease: "power2.out",
  //       })
  //       .to(
  //         lineRef.current,
  //         {
  //           attr: { y2 },
  //           duration,
  //           ease: "power2.out",
  //         },
  //         "-=50%",
  //       )
  //   } else {
  //     gsap.timeline().to(lineRef.current, {
  //       attr: { y1, y2 },
  //       duration,
  //       ease: "power2.out",
  //     })
  //   }

  //   currentStep.current = selectedTab.index
  //   initial.current = false
  // }, [selectedTab.index])

  const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
    y: "0rem",
    height: `${defaultWidth}rem`,
  })

  useEffect(() => {
    if (!selectedTab) {
      return
    }

    const x = range(0, selectedTab.index).reduce(
      (sum, index) => sum + (tabs[index].size ?? defaultWidth),
      0,
    )

    const width = tabs[selectedTab.index].size ?? defaultWidth

    setTabPos({ y: `${x + 0.25}rem`, height: `${width - 0.5}rem` })
  }, [selectedTab.index])

  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-center my-2 w-12",
        className,
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
        transition={{ ease: "easeInOut" }}
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
