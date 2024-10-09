import { type IChildrenProps } from '@interfaces/children-props'

import {
  DEFAULT_SETTINGS,
  useSettingsStore,
  type ISettings,
} from '@stores/use-settings-store'
import { createContext } from 'react'

export const AccountSettingsContext = createContext<{
  settings: ISettings
  updateSettings: (settings: ISettings) => void
  resetSettings: () => void
}>({
  settings: { ...DEFAULT_SETTINGS },
  updateSettings: () => {},
  resetSettings: () => {},
})

export function AccountSettingsProvider({ children }: IChildrenProps) {
  const { settings, updateSettings, resetSettings } = useSettingsStore()

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
    <AccountSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </AccountSettingsContext.Provider>
  )
}
