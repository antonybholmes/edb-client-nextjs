import type { HistoryAction } from '@hooks/use-history'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import { truncate } from '@lib/text/text'

import { useEffect, useRef, type ChangeEvent, type Dispatch } from 'react'

export interface IFileOpen {
  name: string
  text: string
  ext: string
}

export function getSep(file: IFileOpen | null) {
  if (file && file.ext === 'csv') {
    return '<comma>'
  } else {
    return '<tab>'
  }
}

export function parseSep(sep: string) {
  if (sep.includes('comma')) {
    return '<comma>'
  } else {
    return '<tab>'
  }
}

export interface IParseOptions {
  colNames: number
  indexCols: number
  sep: string
  keepDefaultNA: boolean
}

export const DEFAULT_PARSE_OPTS: IParseOptions = {
  colNames: 1,
  indexCols: 0,
  sep: '\t',
  keepDefaultNA: false,
}

function getFileTypes(fileTypes: string[]) {
  return fileTypes
    .sort()
    .map(t => `.${t}`)
    .join(', ')
}

interface IProps {
  open: string
  //onOpenChange?: (message: string) => void
  onFileChange?: (message: string, files: FileList | null) => void
  multiple?: boolean
  fileTypes?: string[]
}

export function OpenFiles({
  open = '',
  //onOpenChange,
  onFileChange,
  multiple = false,
  fileTypes = ['txt', 'tsv', 'vst'],
}: IProps) {
  const ref = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function _onFileChange(e: ChangeEvent<HTMLInputElement>) {
    //filesDispatch({ type: "clear", files: [] })

    const { files } = e.target

    onFileChange?.(open, files)

    // force clear selection so we can keep selecting file if we want.
    e.target.value = ''
  }

  useEffect(() => {
    // simulate user clicking open button whenever open changes
    if (open) {
      ref.current?.click()
    }

    //onOpenChange?.("")
  }, [open])

  // if (!open) {
  //   return false
  // }

  return (
    <form className="hidden">
      {multiple ? (
        <input
          ref={ref}
          type="file"
          id="file"
          onChange={_onFileChange}
          multiple
          accept={getFileTypes(fileTypes)}
        />
      ) : (
        <input
          ref={ref}
          type="file"
          id="file"
          onChange={_onFileChange}
          accept={getFileTypes(fileTypes)}
        />
      )}
    </form>
  )
}

export function onFileChange(
  files: FileList | null,
  onLoad: (files: IFileOpen[]) => void
) {
  if (!files) {
    return
  }

  const file = files[0]
  const name = file.name

  //setFile(files[0])
  //setShowLoadingDialog(true)

  const fileReader = new FileReader()

  fileReader.onload = e => {
    const result = e.target?.result

    if (result) {
      const text: string =
        typeof result === 'string' ? result : Buffer.from(result).toString()

      onLoad([{ name, text, ext: name.split('.').pop() || '' }])
    }
  }

  fileReader.readAsText(file)

  //setShowFileMenu(false)
}

/**
 * Convert text files to dataframes.
 *
 * @param files
 * @param options parsing options
 * @param historyDispatch push dataframes to UI history
 * @returns
 */
export function filesToDataFrames(
  files: IFileOpen[],
  historyDispatch: Dispatch<HistoryAction>,

  options: IParseOptions
) {
  if (files.length < 1) {
    return
  }

  const file = files[0]
  const name = file.name

  const { indexCols, colNames, keepDefaultNA } = options

  const lines = file.text.split(/[\r\n]+/g).filter(line => line.length > 0)

  const sep = name.endsWith('csv') ? ',' : '\t'

  const table = new DataFrameReader()
    .sep(sep)
    .keepDefaultNA(keepDefaultNA)
    .colNames(colNames)
    .indexCols(indexCols)
    .read(lines)

  //resolve({ ...table, name: file.name })

  historyDispatch({
    type: 'reset',
    name: `Load ${name}`,
    sheets: [table.setName(truncate(name, { length: 16 }))],
  })
}
