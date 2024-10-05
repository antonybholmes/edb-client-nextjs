import { BaseCol } from '@components/base-col'

import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { InfoIcon } from '@components/icons/info-icon'
import {
  BASE_SIMPLE_COLOR_EXT_CLS,
  ColorPickerButton,
} from '@components/pages/plot/color-picker-button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@components/shadcn/ui/hover-card'
import { Input5 } from '@components/shadcn/ui/themed/input5'
import { VCenterRow } from '@components/v-center-row'
import { TEXT_CANCEL } from '@consts'
import { cn } from '@lib/class-names'
import type { IBaseClusterGroup } from '@lib/cluster-group'
import { useEffect, useState } from 'react'

export interface IProps {
  group?: IBaseClusterGroup
  callback?: (name: string, search: string[], color: string) => void

  onCancel: () => void
}

export function GroupDialog({ group, callback, onCancel }: IProps) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults
    if (group) {
      setName(group.name)
      setSearch(group.search.join(', '))
      if (group.color.match(/#[0-9a-fA-F]+/)) {
        setColor(group.color)
      }
    }
  }, [group])

  function makeGroup() {
    const searchFor = search.split(',').map(x => x.trim().toLowerCase())

    callback?.(name, searchFor, color)
  }

  return (
    <OKCancelDialog
      open={true}
      title={name ? `Edit ${name} group` : `New group`}
      onReponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel()
        } else {
          makeGroup()
        }
      }}
      showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      leftHeaderChildren={
        <ColorPickerButton
          color={color}
          onColorChange={setColor}
          className={cn(BASE_SIMPLE_COLOR_EXT_CLS, 'rounded-full shadow')}
          title="Set group color"
        />
      }
      headerStyle={{ color }}
    >
      <BaseCol className="gap-y-4">
        {/* <span>Name:</span> */}

        <Input5
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Group name"
        />

        <VCenterRow className="gap-x-2">
          <Input5
            id="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Matches"
            className="grow"
          >
            <HoverCard>
              <HoverCardTrigger>
                <InfoIcon fill="stroke-foreground/25 fill-foreground/25" />
              </HoverCardTrigger>
              <HoverCardContent className="flex flex-col gap-y-2">
                <h4 className="text-sm font-semibold">Matches</h4>
                <p className="text-sm">
                  A comma separated list of words or partial words that match
                  column names. All matching columns will belong to the group.
                </p>
              </HoverCardContent>
            </HoverCard>
          </Input5>
        </VCenterRow>

        {/* <VCenterRow>
          <span className="w-24 shrink-0">Color</span>
          <ColorPickerButton
            color={color}
            onColorChange={setColor}
            className={SIMPLE_COLOR_EXT_CLS}
          />
        </VCenterRow> */}

        {/* <span>Color</span> */}
      </BaseCol>
    </OKCancelDialog>
  )
}
