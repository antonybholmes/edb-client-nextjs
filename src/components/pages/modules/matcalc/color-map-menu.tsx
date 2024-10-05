import { ColorMapIcon } from '@components/plot/color-map-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/shadcn/ui/themed/dropdown-menu'

import { BWR_CMAP, ColorMap, JET_CMAP, VIRIDIS_CMAP } from '@lib/colormap'
import { useState } from 'react'

const COLOR_MAPS = [
  { name: 'Blue/White/Red', cmap: BWR_CMAP },
  { name: 'Viridis', cmap: VIRIDIS_CMAP },
  { name: 'Jet', cmap: JET_CMAP },
]

interface IProps {
  cmap: ColorMap
  onChange?: (cmap: ColorMap) => void
}

export function ColorMapMenu({ cmap = BWR_CMAP, onChange }: IProps) {
  const [open, setOpen] = useState(false)

  function _onChange(cmap: ColorMap) {
    setOpen(false)
    onChange && onChange(cmap)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-hidden="true"
        className=" w-8.5 overflow-hidden border border-border"
        onClick={() => setOpen(true)}
      >
        <ColorMapIcon cmap={cmap} className="h-7 w-full grow" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        align="start"
        className="fill-foreground"
      >
        {COLOR_MAPS.map((c, ci) => (
          <DropdownMenuItem onClick={() => _onChange(c.cmap)} key={ci}>
            <ColorMapIcon
              cmap={c.cmap}
              className="h-6 border border-foreground/75"
            />
            {c.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
