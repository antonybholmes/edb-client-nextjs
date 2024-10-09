import { APP_ID } from '@consts'
import type { IStringMap } from '@interfaces/string-map'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

const THEME_KEY = `${APP_ID}-theme`
const SETTINGS_KEY = `${APP_ID}-settings-v3`

export const THEME_CYCLE: IStringMap = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

export type Theme = 'light' | 'dark' | 'system'
export const DEFAULT_THEME: Theme = 'system'

export interface ISettings {
  passwordless: boolean
  staySignedIn: boolean
}

export const DEFAULT_SETTINGS: ISettings = {
  passwordless: true,
  staySignedIn: true,
}

const localThemeStore = persistentAtom<Theme>(THEME_KEY, DEFAULT_THEME)

const localSettingsStore = persistentAtom<ISettings>(
  SETTINGS_KEY,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useSettingsStore(): {
  settings: ISettings
  theme: Theme
  updateSettings: (settings: ISettings) => void
  resetSettings: () => void
  applyTheme: (theme: Theme) => void
  resetTheme: () => void
} {
  const settings = useStore(localSettingsStore)
  const theme = useStore(localThemeStore)

  // // first load in the default values from the store
  // const [settings, setSettings] = useState<ISettings>({
  //   passwordless: localStore.passwordless === TRUE,
  //   staySignedIn: localStore.staySignedIn === TRUE,
  //   theme: localStore.theme as Theme,
  // })

  // // when the in memory store is updated, trigger a write to localstorage.
  // // There may be an unnecessary write at the start where the localstorage
  // // is overwritten with a copy of itself, but this is ok.
  // useEffect(() => {
  //   // Write to store when there are changes
  //   localStorageMap.set({
  //     passwordless: localStore.passwordless.toString(),
  //     staySignedIn: localStore.staySignedIn.toString(),
  //     theme: settings.theme,
  //   })
  // }, [settings])

  function updateSettings(settings: ISettings) {
    localSettingsStore.set(settings)
  }

  function resetSettings() {
    updateSettings({ ...DEFAULT_SETTINGS })
  }

  function resetTheme() {
    applyTheme(DEFAULT_THEME)
  }

  function applyTheme(theme: Theme) {
    if (
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    localThemeStore.set(theme)
  }

  return {
    settings,
    theme,
    updateSettings,
    resetSettings,
    applyTheme,
    resetTheme,
  }
}
