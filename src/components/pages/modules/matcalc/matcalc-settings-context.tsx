import type { IChildrenProps } from "@interfaces/children-props"
import { createContext, useEffect, useReducer, type Dispatch } from "react"
import {
  DEFAULT_SETTINGS,
  useMatcalcSettingsStore,
  type IMatcalcSettings,
} from "./use-matcalc-settings-store"

export type MatcalcSettingAction =
  | {
      type: "apply"
      state: IMatcalcSettings
    }
  | { type: "reset" }

export function settingsReducer(
  state: IMatcalcSettings,
  action: MatcalcSettingAction,
): IMatcalcSettings {
  switch (action.type) {
    case "apply":
      return { ...state, ...action.state }

    case "reset":
      return { ...DEFAULT_SETTINGS }

    default:
      return state
  }
}

export function useMatcalcSettings(): [
  IMatcalcSettings,
  Dispatch<MatcalcSettingAction>,
] {
  const { settings, applySettings } = useMatcalcSettingsStore()

  const [settingsState, settingsDispatch] = useReducer(settingsReducer, {
    ...settings,
  })

  useEffect(() => {
    applySettings(settingsState)
  }, [settingsState])

  return [settingsState, settingsDispatch]
}

export const MatcalcSettingsContext = createContext<
  [IMatcalcSettings, Dispatch<MatcalcSettingAction>]
>([{ ...DEFAULT_SETTINGS }, () => {}])

export function MatcalcSettingsProvider({ children }: IChildrenProps) {
  const [settings, settingsDispatch] = useMatcalcSettings()

  return (
    <MatcalcSettingsContext.Provider value={[settings, settingsDispatch]}>
      {children}
    </MatcalcSettingsContext.Provider>
  )
}
