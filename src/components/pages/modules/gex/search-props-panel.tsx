import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { Textarea3 } from '@components/shadcn/ui/themed/textarea3'

import { VCenterRow } from '@components/v-center-row'
import { APP_NAME, TEXT_OK } from '@consts'

import { SearchIcon } from '@components/icons/search-icon'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { VScrollPanel } from '@components/v-scroll-panel'
import { forwardRef, useState, type ForwardedRef } from 'react'

export interface IProps {
  setGenes?: (genes: string[]) => void
}

export const SearchPropsPanel = forwardRef(function SearchPropsPanel(
  { setGenes }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  //const [open, setOpen] = useState(false)

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

      <PropsPanel ref={ref}>
        <VScrollPanel>
          <Textarea3
            id="filter"
            aria-label="Filter"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Genes"
            className="h-32"
          />

          <VCenterRow className="shrink-0 justify-end gap-x-2">
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
          <Button
            variant="theme"
            aria-label="Apply filter to current matrix"
            onClick={() => {
              const genes = text
                .split(/[\r\n]/)
                .map(x => x.trim())
                .filter(x => x.length > 0)

              setGenes?.(genes)
            }}
          >
            <SearchIcon fill="fill-white" />
            <span>Search</span>
          </Button>
        </VScrollPanel>
      </PropsPanel>
    </>
  )
})
