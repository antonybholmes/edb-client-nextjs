import { BaseCol } from '@components/base-col'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { OpenFiles } from '@components/pages/open-files'
import { Textarea3 } from '@components/shadcn/ui/themed/textarea3'
import { ToggleButtonTriggers, ToggleButtons } from '@components/toggle-buttons'

import { VCenterRow } from '@components/v-center-row'
import { APP_NAME, TEXT_OK } from '@consts'
import { OpenIcon } from '@icons/open-icon'

import {
  AlertsContext,
  makeErrorAlert,
} from '@components/alerts/alerts-provider'
import { HistoryContext } from '@components/history-provider'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { VScrollPanel } from '@components/v-scroll-panel'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { filterColsById, filterRowsById } from '@lib/dataframe/dataframe-utils'
import { nanoid } from '@lib/utils'
import { forwardRef, useContext, useState, type ForwardedRef } from 'react'

export interface IProps {
  df: BaseDataFrame | null
}

export const FilterPropsPanel = forwardRef(function FilterPropsPanel(
  { df }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [open, setOpen] = useState(false)
  const [, historyDispatch] = useContext(HistoryContext)
  const [, alertDispatch] = useContext(AlertsContext)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [entireCell, setMatchEntireCell] = useState(false)
  const [keepOrder, setKeepOrder] = useState(false)
  const [text, setText] = useState<string>('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [filterMode, setFilterMode] = useState('Rows')

  function onFileChange(message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file = files[0]

    //setFile(files[0])
    //setShowLoadingDialog(true)

    const fileReader = new FileReader()

    fileReader.onload = e => {
      const result = e.target?.result

      if (result) {
        // since this seems to block rendering, delay by a second so that the
        // animation has time to start to indicate something is happening and
        // then finish processing the file
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        setText(text)
      }
    }

    fileReader.readAsText(file)

    //setShowFileMenu(false)
  }

  function filterTable() {
    const ids = text
      .split(/[\r\n]/)
      .map(x => x.trim())
      .filter(x => x.length > 0)

    if (!df) {
      return
    }

    if (filterMode.includes('Rows')) {
      df = filterRowsById(df, ids, {
        caseSensitive,
        entireCell,
        keepOrder,
      }).setName('Row Filter')
    } else {
      df = filterColsById(df, ids, {
        caseSensitive,
        entireCell,
        keepOrder,
      }).setName('Col Filter')
    }

    if (df.size === 0) {
      alertDispatch({
        type: 'add',
        alert: makeErrorAlert({
          title: `There were no ${
            filterMode.includes('Rows') ? 'rows' : 'columns'
          } matching your filter`,
        }),
      })

      return
    }

    historyDispatch({
      type: 'add_step',
      name: df.name,
      sheets: [df],
    })

    // historyState.current = ({
    //   step: historyState.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  return (
    <>
      <OKCancelDialog
        open={confirmClear}
        title={APP_NAME}
        onReponse={r => {
          if (r === TEXT_OK) {
            setText('')
          }
          setConfirmClear(false)
        }}
      >
        Are you sure you want to clear all the filter items?
      </OKCancelDialog>

      <PropsPanel className="gap-y-2">
        {/* <h2 className={H2_CLS}>Filter</h2> */}
        {/* <VCenterRow className="gap-x-3">
          <h2 className={H2_CLS}>Filter</h2>

          <ToolbarTabPanel className="rounded-full bg-accent/50 px-3 py-0.5">
            <ToolbarTabGroup>
              <ToolbarIconButton
                onClick={() => setOpen(true)}
                className="fill-foreground"
                tooltip="Open a filter list"
              >
                <OpenIcon fill="" />
              </ToolbarIconButton>
            </ToolbarTabGroup>
 
          </ToolbarTabPanel>
        </VCenterRow> */}

        <VCenterRow className="justify-between gap-x-2 shrink-0">
          <VCenterRow className="gap-x-2">
            <Button
              variant="muted"
              size="icon"
              ripple={false}
              onClick={() => setOpen(true)}
              className="fill-foreground"
              tooltip="Open a filter list"
            >
              <OpenIcon fill="fill-foreground" />
            </Button>

            <ToggleButtons
              value={filterMode}
              onTabChange={selectedTab => {
                if (selectedTab) {
                  setFilterMode(selectedTab.tab.name)
                }
              }}
              tabs={[
                { id: nanoid(), name: 'Rows' },
                { id: nanoid(), name: 'Cols' },
              ]}
            >
              <ToggleButtonTriggers />
            </ToggleButtons>
          </VCenterRow>
          {text && (
            <Button
              variant="link"
              pad="none"
              size="sm"
              ripple={false}
              onClick={() => setConfirmClear(true)}
            >
              Clear
            </Button>
          )}
        </VCenterRow>
        <VScrollPanel innerClassName="gap-y-2">
          <Textarea3
            id="filter"
            aria-label="Filter"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Filter ${filterMode}`}
            className="h-96"
          />

          <BaseCol className="justify-between gap-y-1 py-2 shrink-0">
            <Checkbox
              checked={caseSensitive}
              onCheckedChange={setCaseSensitive}
            >
              Case sensitive
            </Checkbox>
            <Checkbox
              checked={entireCell || keepOrder}
              onCheckedChange={setMatchEntireCell}
            >
              Match entire cell
            </Checkbox>
            <Checkbox
              checked={keepOrder}
              onCheckedChange={state => {
                setKeepOrder(state)

                if (state) {
                  setMatchEntireCell(true)
                }
              }}
            >
              Keep order
            </Checkbox>
          </BaseCol>

          <VCenterRow className="mb-2 shrink-0">
            <Button
              variant="accent"
              aria-label="Apply filter to current matrix"
              onClick={() => filterTable()}
            >
              Apply
            </Button>
          </VCenterRow>
        </VScrollPanel>
      </PropsPanel>
      <OpenFiles open={open ? 'open' : ''} onFileChange={onFileChange} />
    </>
  )
})
