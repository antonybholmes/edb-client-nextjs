import type { IElementProps } from "@interfaces/element-props"
import { createContext, useState, type ReactElement } from "react"

export interface ITab {
  id?: string
  name: string
  //tab?: ReactNode
  icon?: ReactElement
  content?: ReactElement
  data?: any
  size?: number
  isOpen?: boolean
  closable?: boolean
  onDelete?: () => void
  onClick?: () => void
  checked?: boolean
  //onCheckedChange?: (state: boolean) => void
  children?: ITab[]
}

export interface IUrlTab extends ITab {
  url?: string
}

export interface ISelectedTab {
  index: number
  tab: ITab
}

export type TabChange = (selectedTab: ISelectedTab) => void

export interface ITabChange {
  onTabChange?: TabChange
}

export interface ITabProvider extends ITabChange {
  value?: string
  tabs: ITab[]
}

export interface ITabContext extends ITabChange {
  value: string
  selectedTab: ISelectedTab
  tabs: ITab[]
}

// export interface ITabContext extends ITabProvider, ITabChange {

// }

// export interface ITabProviderProps extends ITabContext {
//   value?: string
// }

export function getTabId(tab?: ITab): string {
  return tab?.id ?? tab?.name ?? ""
}

/**
 * Sets the displayed tab. Internally tabs are represented with ids
 * consisting of <tab name>:<tab zero based index>. Value can be either
 * the full tab id, or the more human readable tab name. For example the
 * Home tab might match to Home:0 so when setting which tab to display, we
 * must cope with being given both Home and Home:0, hence this function.
 *
 * @param value a name of a tab
 * @param tabs a list of tabs
 * @param setValue component's setValue function to control which tab is shown.
 * @returns
 */
export function getTabFromValue(
  value: string | undefined,
  tabs: ITab[],
): ISelectedTab | undefined {
  // if no tabs return undefined
  if (tabs.length === 0) {
    return undefined
  }

  // default to first tab if there is an error
  let selectedTab: ISelectedTab = { index: 0, tab: tabs[0] } //undefined

  // no value specified, default to first tab
  if (!value) {
    return selectedTab
  }

  for (const [ti, tab] of tabs.entries()) {
    const tabId = getTabId(tab)

    if (tabId.includes(value) || tab.name.includes(value)) {
      selectedTab = { index: ti, tab }
      break
    }
  }

  return selectedTab
}

export const TabContext = createContext<ITabContext | undefined>(undefined)

interface IProps extends ITabProvider, IElementProps {}

export function TabProvider({ value, onTabChange, tabs, children }: IProps) {
  const [_value, setValue] = useState("")

  function _onTabChange(selectedTab: ISelectedTab) {
    setValue(selectedTab.tab.name)

    onTabChange?.(selectedTab)
  }

  const v = value !== undefined ? value : _value

  let selectedTab: ISelectedTab | undefined = getTabFromValue(v, tabs)

  if (!selectedTab) {
    return null
  }

  return (
    <TabContext.Provider
      value={{ value: v, selectedTab, onTabChange: _onTabChange, tabs }}
    >
      {children}
    </TabContext.Provider>
  )
}
