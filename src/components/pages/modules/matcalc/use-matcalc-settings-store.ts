import { APP_ID } from "@consts"

import { persistentAtom } from "@nanostores/persistent"
import { useStore } from "@nanostores/react"
import MODULE_INFO from "./module.json"

const KEY = `${APP_ID}-${MODULE_INFO.name.toLowerCase()}-settings-v8`

export interface IMatcalcSettings {
  heatmap: {
    rowFilterMethod: string
    topRows: number
    distance: string
    linkage: string
    clusterRows: boolean
    clusterCols: boolean
    filterRows: boolean
    zscoreRows: boolean
  }
  geneConvert: {
    duplicateRows: boolean
    convertIndex: boolean
    useSelectedColumns: boolean
    delimiter: string
    outputSymbols: string
    fromSpecies: string
    toSpecies: string
  }

  sortByRow: {
    sortWithinGroups: boolean
    text: string
  }

  volcano: {
    log2FC: boolean
    log10P: boolean
  }
}

export const DEFAULT_SETTINGS: IMatcalcSettings = {
  heatmap: {
    zscoreRows: true,
    filterRows: false,
    clusterCols: false,
    clusterRows: false,
    linkage: "Average",
    distance: "Correlation",
    topRows: 1000,
    rowFilterMethod: "Stdev",
  },
  geneConvert: {
    fromSpecies: "Human",
    toSpecies: "Mouse",
    outputSymbols: "Symbol",
    delimiter: " /// ",
    convertIndex: true,
    useSelectedColumns: false,
    duplicateRows: false,
  },
  sortByRow: {
    text: "",
    sortWithinGroups: false,
  },
  volcano: {
    log10P: true,
    log2FC: false,
  },
}

const localStorageMap = persistentAtom<IMatcalcSettings>(
  KEY,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
)

export function useMatcalcSettingsStore(): {
  settings: IMatcalcSettings
  applySettings: (store: IMatcalcSettings) => void
  reset: () => void
} {
  const settings = useStore(localStorageMap)

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

  function applySettings(settings: IMatcalcSettings) {
    localStorageMap.set(settings)
  }

  function reset() {
    applySettings({ ...DEFAULT_SETTINGS })
  }

  return { settings, applySettings, reset }
}
