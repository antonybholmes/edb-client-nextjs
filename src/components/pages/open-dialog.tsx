import { BaseCol } from "@components/base-col"

import { VCenterRow } from "@components/v-center-row"

import { OKCancelDialog } from "@components/dialog/ok-cancel-dialog"
import { Checkbox } from "@components/shadcn/ui/themed/check-box"
import { Input } from "@components/shadcn/ui/themed/input"
import { TEXT_OK } from "@consts"
import { useEffect, useState } from "react"

import {
  getSep,
  parseSep,
  type IFileOpen,
  type IParseOptions,
} from "@components/pages/open-files"
import { Switch } from "@components/shadcn/ui/themed/switch"

export interface IProps {
  files: IFileOpen[]
  openFiles: (files: IFileOpen[], options: IParseOptions) => void
  onCancel: () => void
}

export function OpenDialog({ files, openFiles, onCancel }: IProps) {
  const [headers, setHeaders] = useState(true)
  const [indexCols, setIndexCols] = useState(true)
  const [keepDefaultNA, setKeepDefaultNA] = useState(false)
  const [sep, setSep] = useState("<tab>")

  useEffect(() => {
    setSep(getSep(files.length > 0 ? files[0] : null))
  }, [files])

  return (
    <OKCancelDialog
      open={files.length > 0}
      title="Open File"
      onReponse={resp => {
        if (resp === TEXT_OK) {
          openFiles(files, {
            colNames: headers ? 1 : 0,
            indexCols: indexCols ? 1 : 0,
            sep: parseSep(sep),
            keepDefaultNA,
          })
        } else {
          onCancel()
        }
      }}
      className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <BaseCol className="gap-y-4 text-sm">
        <Checkbox checked={headers} onCheckedChange={setHeaders}>
          <span>First row is header</span>
        </Checkbox>
        <Checkbox checked={indexCols} onCheckedChange={setIndexCols}>
          <span>First column is index</span>
        </Checkbox>

        <BaseCol className="gap-y-2">
          {/* <h3 className="font-semibold">Separator Options</h3> */}
          <VCenterRow className="gap-x-2">
            <span>Delimiter</span>
            <Input
              value={sep}
              onChange={e => setSep(e.target.value)}
              className="w-24 rounded-md"
            />
          </VCenterRow>
        </BaseCol>
        <Switch checked={keepDefaultNA} onCheckedChange={setKeepDefaultNA}>
          Keep default NA
        </Switch>
      </BaseCol>
    </OKCancelDialog>
  )
}
