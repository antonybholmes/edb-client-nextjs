import {
  BaseTabsList,
  BaseTabsTrigger,
  Tabs,
} from '@components/shadcn/ui/themed/tabs'
import { VCenterRow } from '@components/v-center-row'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import type { TabsProps } from '@radix-ui/react-tabs'
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type ReactNode,
} from 'react'
import { ToolbarIconButton } from './toolbar-icon-button'
import { ToolbarTabGroup } from './toolbar-tab-group'

import { Button } from '@components/shadcn/ui/themed/button'
import { cn } from '@lib/class-names'
import { motion } from 'framer-motion'
import {
  getTabFromValue,
  getTabId,
  type ITab,
  type ITabProvider,
} from '../tab-provider'

// const LINE_CLS =
//   "tab-line absolute bottom-0 left-0 block h-0.5 bg-theme"

interface IProps extends TabsProps, ITabProvider {
  defaultWidth?: number
  padding?: number
  scale?: number

  rightContent?: ReactNode
}

export const BottomBar = forwardRef(function BottomBar(
  {
    tabs,
    value,
    onValueChange,
    onTabChange,

    defaultWidth = 3.6,
    padding = 0.5,
    //scale = 1.5,

    rightContent,
    className,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  //const [tabUnderlineProps, setTabUnderlineProps] = useState<ITabProps[]>([])
  const [_scale, setScale] = useState(1)
  //const tabListRef = useRef<HTMLDivElement | null>(null)
  //const allTabsRef = useRef<(HTMLSpanElement | null)[]>([])
  //const tabLineRef1 = useRef<HTMLSpanElement>(null)
  //const tabLineRef2 = useRef<HTMLSpanElement>(null)

  const lineRef = useRef<SVGLineElement>(null)
  const currentTab = useRef<number>(-1)
  const initial = useRef(true)
  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])
  const [tabPos, setTabPos] = useState<{
    x: string
    width: string
  }>({
    x: '0rem',
    width: '0rem',
  })

  if (!selectedTab) {
    return null
  }

  const tabId = getTabId(selectedTab.tab)

  //const _tabValue = getTabValue(value ?? _value, tabs)

  function _onValueChange(value: string) {
    //const [name, index] = parseTabId(value)
    const selectedTab = getTabFromValue(value, tabs)

    if (selectedTab?.tab.name) {
      onValueChange?.(selectedTab?.tab.name)
    }

    if (selectedTab) {
      onTabChange?.(selectedTab)
    }
    //onTabIdChange?.(value)
  }

  let totalW = 0
  const tabUnderlineProps = useMemo(
    () =>
      Object.fromEntries(
        tabs.map(tab => {
          const tabId = getTabId(tab)
          const width = (tab.size ?? defaultWidth) + 2 * padding
          const ret = {
            w: width,
            x: totalW,
            //lineW: width,
          }
          totalW += width
          return [tabId, ret]
        })
      ),
    [tabs, defaultWidth, padding]
  )

  useEffect(() => {
    const x = tabUnderlineProps[tabId].x + (_scale === 1 ? padding : 0)
    const width = tabUnderlineProps[tabId].w - (_scale === 1 ? 2 * padding : 0)

    setTabPos({
      x: `${x}rem`,
      width: `${width}rem`,
    })

    //const tabValue = getTabId(selectedTab.tab)

    //if (!(tabValue in tabUnderlineProps)) {
    //  return
    //}

    // gsap.timeline().to([tabLineRef1.current, tabLineRef2.current], {
    //   width: `${tabUnderlineProps[_tabValue].lineW}rem`,
    //   transformOrigin: "center",
    //   transform: `translateX(${tabUnderlineProps[_tabValue].x}rem) scaleX(${
    //     _scale > 1
    //       ? tabUnderlineProps[_tabValue].w / tabUnderlineProps[_tabValue].lineW!
    //       : _scale
    //   })`,
    //   duration: TAB_ANIMATION_DURATION_S,
    //   stagger: STAGGER_ANIMATION_DURATION_S,
    //   ease: "power2.out",
    // })

    // const dir = tabUnderlineProps[tabId].x - currentTab.current

    // const ext = _scale > 1 ? 0 : 2
    // const x1 = (tabUnderlineProps[tabId].x / totalW) * 100 + ext

    // const x2 =
    //   ((tabUnderlineProps[tabId].x + tabUnderlineProps[tabId].w) / totalW) *
    //     100 -
    //   ext

    // const duration = initial.current ? 0 : ANIMATION_DURATION_S

    // if (dir > 0) {
    //   gsap
    //     .timeline()
    //     .to(lineRef.current, {
    //       attr: {
    //         x2,
    //       },
    //       duration,
    //       ease: "power2.out",
    //     })
    //     .to(
    //       lineRef.current,
    //       {
    //         attr: {
    //           x1,
    //         },
    //         duration,
    //         ease: "power2.out",
    //       },
    //       "-=50%",
    //     )
    // } else if (dir < 0) {
    //   gsap
    //     .timeline()
    //     .to(lineRef.current, {
    //       attr: {
    //         x1,
    //       },
    //       duration,
    //       ease: "power2.out",
    //     })
    //     .to(
    //       lineRef.current,
    //       {
    //         attr: {
    //           x2,
    //         },
    //         duration,
    //         ease: "power2.out",
    //       },
    //       "-=50%",
    //     )
    // } else {
    //   gsap.timeline().to(lineRef.current, {
    //     attr: {
    //       x1,
    //       x2,
    //     },
    //     duration,
    //     ease: "power2.out",
    //   })
    // }

    // currentTab.current = tabUnderlineProps[tabId].x
    // initial.current = false
  }, [_scale, selectedTab, tabUnderlineProps])

  // useEffect(() => {
  //   if (tabUnderlineProps.length == 0) {
  //     return
  //   }

  //   gsap.timeline().to([tabLineRef1.current, tabLineRef2.current], {
  //     transformOrigin: "center",
  //     transform: `translateX(${tabUnderlineProps[at].lineX}rem) scaleX(${
  //       _scale > 1
  //         ? tabUnderlineProps[at].w / tabUnderlineProps[at].lineW
  //         : _scale
  //     })`,
  //     duration: TAB_ANIMATION_DURATION_S,
  //     ease: "power2.out",
  //   })
  // }, [_scale])

  const selectedTabId = getTabId(selectedTab.tab)

  return (
    <Tabs
      ref={ref}
      value={tabId}
      onValueChange={_onValueChange}
      className={cn('flex grow flex-col', className)}
    >
      {/* <TabPanels className="grow">{c}</TabPanels> */}

      {/* {c[activeTabIndex]} */}

      {/* <TabPanels tabs={tabs} /> */}

      {/* {tabs.map((tab, ti) => (
        <TabsContent value={tab.name} key={ti} asChild>
          {tabs[at].content}
        </TabsContent>
      ))} */}

      {/* <TabsPanels tabs={tabs} /> */}
      {selectedTab.tab.content}

      <VCenterRow className="shrink-0 justify-between text-xs">
        <VCenterRow>
          <ToolbarTabGroup className="stroke-foreground">
            <ToolbarIconButton
              aria-label="Previous tab"
              variant="muted"
              size="icon-sm"
              onClick={() => {
                const i: number = Math.max(
                  0,
                  tabs
                    .map((t, ti) => [t, ti] as [ITab, number])
                    .filter(t => t[0].id === getTabId(selectedTab?.tab))
                    .map(t => t[1])[0] - 1
                )

                _onValueChange(getTabId(tabs[i]))
              }}
            >
              <ChevronRightIcon w="w-3" className="-scale-x-100" />
            </ToolbarIconButton>
            <ToolbarIconButton
              aria-label="Next tab"
              variant="muted"
              size="icon-sm"
              onClick={() => {
                const i: number = Math.min(
                  tabs.length - 1,
                  tabs
                    .map((t, ti) => [t, ti] as [ITab, number])
                    .filter(t => t[0].id === getTabId(selectedTab?.tab))
                    .map(t => t[1])[0] + 1
                )

                _onValueChange(getTabId(tabs[i]))
              }}
            >
              <ChevronRightIcon w="w-3" />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <BaseTabsList
          // className="relative flex flex-row group"
          // onMouseEnter={() => {
          //   setScale(2)
          // }}
          // onMouseLeave={() => {
          //   setScale(1)
          // }}
          >
            {tabs.map((tab, ti) => {
              //const id = makeTabId(tab, ti)

              const tabId = getTabId(tab)
              const selected = tabId === selectedTabId
              return (
                <BaseTabsTrigger value={tabId} key={tabId} asChild>
                  <Button
                    rounded="none"
                    variant="muted"
                    className="relative justify-center truncate"
                    ripple={false}
                    style={{
                      width: `${tabUnderlineProps[tabId].w}rem`,
                    }}
                    onMouseEnter={() => {
                      if (selected) {
                        setScale(2)
                      }
                    }}
                    onMouseLeave={() => {
                      if (selected) {
                        setScale(1)
                      }
                    }}
                    onMouseDown={() => {
                      setScale(2)
                    }}
                  >
                    {tab.name}
                  </Button>
                </BaseTabsTrigger>
              )
            })}

            {/* <span ref={tabLineRef1} className={LINE_CLS} />
            <span ref={tabLineRef2} className={LINE_CLS} /> */}

            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 100 1`}
              className="absolute h-[2px] w-full bottom-0 left-0"
              shapeRendering="crispEdges"
              preserveAspectRatio="none"
            >
              <line
                ref={lineRef}
                x1={0}
                y1={0}
                x2={0}
                y2={0}
                strokeWidth="100%"
                className={TAB_LINE_CLS}
              />
            </svg> */}

            <motion.span
              className="absolute bottom-0 h-[2px] z-0 bg-theme rounded-md"
              animate={{ ...tabPos, transformOrigin: 'center' }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
              initial={false}
              //transition={{ type: "spring" }}
            />
          </BaseTabsList>
        </VCenterRow>
        {rightContent}
      </VCenterRow>
    </Tabs>
  )
})
