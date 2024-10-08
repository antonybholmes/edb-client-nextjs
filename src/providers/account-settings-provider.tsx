import { type IChildrenProps } from '@interfaces/children-props'

import {
  DEFAULT_SETTINGS,
  useSettingsStore,
  type ISettings,
} from '@stores/use-settings-store'
import { createContext, useEffect, useReducer, type Dispatch } from 'react'
//import { AccountContext, accountReducer } from "../hooks/use-account"

export type SettingAction =
  | {
      type: 'update'
      state: ISettings
    }
  | { type: 'reset' }

export function settingsReducer(
  state: ISettings,
  action: SettingAction
): ISettings {
  switch (action.type) {
    case 'apply':
      return { ...state, ...action.state }

    case 'reset':
      return { ...DEFAULT_SETTINGS }

    default:
      return state
  }
}

export function useSettings(): [ISettings, Dispatch<SettingAction>] {
  const { settings, applySettings } = useSettingsStore()

  const [settingsState, settingsDispatch] = useReducer(settingsReducer, {
    ...settings,
  })

  useEffect(() => {
    applySettings(settingsState)
  }, [settingsState])

  return [settingsState, settingsDispatch]
}

export const AccountSettingsContext = createContext<
  [ISettings, Dispatch<SettingAction>]
>([{ ...DEFAULT_SETTINGS }, () => {}])

export function AccountSettingsProvider({ children }: IChildrenProps) {
  const [settingsState, settingsDispatch] = useSettings()

  // const [accountStore, setAccountStore] = useUserStore()

  // const [accountState, accountDispatch] = useReducer(accountReducer, {
  //   ...accountStore,
  // })

  // when the account is changed, also write it back to the store

  // when the account is changed, also write it back to the store
  // useEffect(() => {
  //   setAccountStore(accountState)
  // }, [accountState])

  return (
    <AccountSettingsContext.Provider value={[settingsState, settingsDispatch]}>
      {children}
    </AccountSettingsContext.Provider>
  )
}
