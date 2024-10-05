import { type IModuleInfo } from "@interfaces/module-info"
import { ModuleLayout } from "@layouts/module-layout"
import { Plot } from "@modules/tracks/plot"

export const MODULE_INFO: IModuleInfo = {
  name: "Tracks",
  description: "Tracks",
  version: "1.0.0",
  copyright: "Copyright (C) 2023 Antony Holmes",
}

export function TracksPage() {
  return (
    <ModuleLayout info={MODULE_INFO}>
      <Plot />
    </ModuleLayout>
  )
}
