import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ForwardedRef,
} from 'react'

import type { IChildrenProps } from '@interfaces/children-props'
import { cn } from '@lib/class-names'
import { BaseTabsList, BaseTabsTrigger, Tabs } from './shadcn/ui/themed/tabs'

import { CloseButton, SlideBar, SlideBarContent } from './slide-bar'
import { getTabFromValue, getTabId, type ITabProvider } from './tab-provider'
import { VCenterRow } from './v-center-row'

interface IProps extends ITabProvider, IChildrenProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void

  position?: number
  limits?: [number, number]
  side?: 'left' | 'right'
  display?: 'block' | 'flex'
}

export const TabSlideBar = forwardRef(function TabSlideBar(
  {
    value,
    tabs,
    onTabChange,
    open,
    //value,
    //onValueChange,

    onOpenChange,

    position = 80,
    limits = [5, 85],
    side = 'left',

    className,
    children,
    ...props
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [_value, setValue] = useState('')
  const [_open, setOpen] = useState(true)
  const [hover, setHover] = useState(false)
  //const { selectedTab, onTabChange, tabs } = useContext(TabContext)

  function _onOpenChange(state: boolean) {
    setOpen(state)
    onOpenChange?.(state)
  }

  function _onValueChange(value: string) {
    const tab = getTabFromValue(value, tabs)

    //const [name, index] = parseTabId(value)

    //onValueChange?.(name)
    if (tab) {
      onTabChange?.(tab)
    }

    setValue(value)
  }

  // when tabs change, default to first tab
  useEffect(() => {
    if (tabs.length > 0) {
      setValue(getTabId(tabs[0]))
    }
  }, [tabs])

  // useEffect(() => {
  //   if (value) {
  //     setValue(getTabValue(value, tabs))
  //   }
  // }, [value])

  // useEffect(() => {
  //   onValueChange?.(_value)
  // }, [_value])

  const isOpen: boolean = open !== undefined ? open : _open

  const val = value !== undefined ? value : _value

  const tabsElem = useMemo(() => {
    const selectedTab = getTabFromValue(val, tabs)

    if (!selectedTab) {
      return null
    }

    const selectedTabId = getTabId(selectedTab.tab)

    return (
      <Tabs
        className="flex min-h-0 flex-col relative grow gap-y-1 pt-2"
        value={getTabId(selectedTab?.tab)} //selectedTab?.tab.id}
        //defaultValue={_value === "" ? `${tabs[0].name}:0`:undefined}
        onValueChange={_onValueChange}
        orientation="horizontal"
        ref={ref}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <VCenterRow className="justify-between gap-x-1">
          <BaseTabsList className="flex flex-row gap-x-4 text-xs overflow-hidden trans-color">
            {tabs.map(tab => {
              //const id = makeTabId(tab, ti)
              //const w = tab.size ?? defaultWidth
              const tabId = getTabId(tab)
              const selected = tabId === selectedTabId // tab.id === selectedTab?.tab.id
              return (
                <BaseTabsTrigger
                  value={tabId}
                  key={tabId}
                  aria-label={tab.name}
                  selected={selected}
                  className={cn(
                    'boldable-text-tab inline-flex flex-col items-start justify-between',
                    [
                      selected,
                      'fill-theme stroke-theme font-semibold text-theme',
                      'text-foreground/70 hover:text-foreground',
                    ]
                  )}
                >
                  {tab.name}
                </BaseTabsTrigger>
              )
            })}
          </BaseTabsList>
          <CloseButton
            onClick={() => _onOpenChange(false)}
            className={cn('trans-opacity', [hover, 'opacity-100', 'opacity-0'])}
          />
        </VCenterRow>

        {/* <TabsPanels tabs={tabs} /> */}
        {selectedTab.tab.content}
      </Tabs>
    )
  }, [val, tabs, hover])

  return (
    <SlideBar
      open={isOpen}
      onOpenChange={_onOpenChange}
      side={side}
      position={position}
      limits={limits}
      mainContent={children}
      sideContent={tabsElem}
    >
      <SlideBarContent className={className} />
    </SlideBar>
  )
})
