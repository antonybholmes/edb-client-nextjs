import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'

import { VCenterRow } from '@components/v-center-row'
import { APP_NAME, TEXT_OK } from '@consts'

import { BaseCol } from '@components/base-col'
import { CollapseTree } from '@components/collapse-tree'
import { SearchIcon } from '@components/icons/search-icon'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/shadcn/ui/themed/resizable'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'
import { getTabId, ITab } from '@components/tab-provider'
import { forwardRef, useState, type ForwardedRef } from 'react'
import { IGexDataset } from './gex-utils'
import { CloseIcon } from '@components/icons/close-icon'

export interface IProps {
  foldersTab: ITab

  datasets: IGexDataset[]
  datasetUseMap: Map<string, boolean>
  setDatasetUseMap: (datasetUseMap: Map<string, boolean>) => void
  setGenes: (genes: string[]) => void
}

export const SearchPropsPanel = forwardRef(function SearchPropsPanel(
  {
    foldersTab,

    datasets,
    datasetUseMap,
    setDatasetUseMap,
    setGenes,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [tab, setTab] = useState<ITab | undefined>(undefined)

  // Load some genes in dev, but otherwise leave empty
  const [text, setText] = useState<string>(
    process.env.NODE_ENV === 'development' ? 'BCL6\nPRDM1\nKMT2D' : ''
  )
  const [confirmClear, setConfirmClear] = useState(false)

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
        Are you sure you want to clear all the genes?
      </OKCancelDialog>

      <PropsPanel ref={ref} className="gap-y-2">
        <ResizablePanelGroup direction="vertical" className="grow">
          <ResizablePanel
            defaultSize={20}
            minSize={10}
            className="flex flex-col gap-y-2"
            id="search"
          >
            <BaseCol className="shadow-md grow m-2 p-2 rounded-lg border border-border/50 gap-y-2">
              <textarea
                id="filter"
                aria-label="Filter"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Genes..."
                className="grow p-2 rounded-md bg-white overflow-hidden outline-none placeholder:text-muted-foreground"
              />

              <VCenterRow className="shrink-0 justify-between gap-x-3 py-1 px-1">
                <Button
                  variant="theme"
                  title="Search for genes"
                  onClick={() => {
                    const genes = text
                      .split(/[\r\n]/)
                      .map(x => x.trim())
                      .filter(x => x.length > 0)

                    setGenes?.(genes)
                  }}
                  className="w-full"
                >
                  <SearchIcon fill="fill-white" />
                  <span>Search</span>
                </Button>

                {text && (
                  // <Button
                  //   variant="muted"
                  //   multiProps="icon"
                  //   ripple={false}
                  //   onClick={() => setConfirmClear(true)}
                  //   title="Clear all genes"
                  // >
                  //   <TrashIcon />
                  // </Button>

                  <Button
                    variant="link"
                    pad="none"
                    size="sm"
                    ripple={false}
                    onClick={() => setConfirmClear(true)}
                    title="Clear search"
                  >
                    <CloseIcon/>
                  </Button>
                )}
              </VCenterRow>
            </BaseCol>
          </ResizablePanel>
          <ThinVResizeHandle />
          <ResizablePanel
            defaultSize={80}
            minSize={10}
            className="flex flex-col gap-y-2 pt-2"
            id="tree"
          >
            <CollapseTree
              tab={foldersTab}
              value={tab}
              //asChild={true}

              onValueChange={t => {
                setTab(t)
              }}
              onCheckedChange={(tab: ITab, state: boolean) => {
                const tabId = getTabId(tab)

                if (tab.name === 'Datasets') {
                  // update all datasets and collections
                  setDatasetUseMap(
                    new Map<string, boolean>(
                      [...datasetUseMap.keys()].map(
                        key => [key, state] as [string, boolean]
                      )
                    )
                  )
                } else if (tabId.includes('institution')) {
                  // for a particular institution, update the datasets
                  setDatasetUseMap(
                    new Map<string, boolean>([
                      ...datasetUseMap.entries(),
                      ...datasets
                        .filter(dataset => dataset.institution === tab.name)
                        .map(
                          dataset =>
                            [dataset.id.toString(), state] as [string, boolean]
                        ),
                      [tab.name, state],
                    ])
                  )
                } else {
                  // update a specific dataset
                  setDatasetUseMap(
                    new Map<string, boolean>([
                      ...datasetUseMap.entries(),
                      [tabId, state],
                    ])
                  )
                }
              }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </PropsPanel>
    </>
  )
})
