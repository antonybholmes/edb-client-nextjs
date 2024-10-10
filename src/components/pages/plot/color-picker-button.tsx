import { BaseCol } from '@components/base-col'
import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'
import { MenuSeparator } from '@components/shadcn/ui/themed/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/shadcn/ui/themed/popover'
import { VCenterRow } from '@components/v-center-row'

import { cn } from '@lib/class-names'
import { hexToRgb } from '@lib/color'

import {
  FOCUS_INSET_RING_CLS,
  FOCUS_RING_CLS,
  INPUT_BORDER_CLS,
  XS_ICON_BUTTON_CLS,
} from '@theme'

import { useState } from 'react'
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful'

const COLOR_INPUT_CLS = cn(
  INPUT_BORDER_CLS,
  FOCUS_INSET_RING_CLS,
  //INPUT_CLS,
  'p-1 w-24 rounded bg-background'
)

export const COLOR_WHITE = '#ffffff'
export const COLOR_TRANSPARENT = '#00000000'

export const PRESET_COLORS = [
  '#ffffff',
  '#ff0000',
  '#3cb371',
  '#6495ed',
  '#FFA500',
  '#8a2be2',
  '#0000ff',
  '#FFD700',
  //"#800080",
  '#a9a9a9',
  '#000000',
]

// export const SIMPLE_COLOR_EXT_CLS = cn(
//   FOCUS_RING_CLS,
//   ICON_BUTTON_CLS,
//   "rounded-full",
// )

export const BASE_SIMPLE_COLOR_EXT_CLS = cn(XS_ICON_BUTTON_CLS, FOCUS_RING_CLS)

export const SIMPLE_COLOR_EXT_CLS = cn(BASE_SIMPLE_COLOR_EXT_CLS, 'rounded-sm')

export interface IProps extends IButtonProps {
  color: string
  defaultColor?: string
  tooltip?: string
  autoBorder?: boolean
  defaultBorderColor?: string
  allowNoColor?: boolean
  onColorChange: (color: string) => void
  onCancel?: () => void
}

export function ColorPickerButton({
  color,
  defaultColor,
  tooltip = 'Change color',
  onColorChange,
  autoBorder = false,
  allowNoColor = false,
  defaultBorderColor = 'border-foreground/25',
  className,
  children,
  ...props
}: IProps) {
  const [open, setOpen] = useState(false)

  // width of colorpicker defined by width of grid for preset colors.

  // use the color to decide whether to add a border, basically if
  // close to white, add a border

  let border = defaultBorderColor

  if (autoBorder) {
    const rgb = hexToRgb(color)
    const s = rgb.r + rgb.g + rgb.b

    //console.log("s", rgb, s, color)

    if (s > 700) {
      border = 'border-foreground/75'
    }
  }

  if (color === COLOR_TRANSPARENT) {
    border = 'border-foreground'
  }

  let button = (
    <PopoverTrigger
      className={cn(
        'relative aspect-square overflow-hidden border',
        border,
        className
      )}
      aria-label={props['aria-label'] ?? tooltip}
      style={{ backgroundColor: color }}
      {...props}
    >
      {children}

      {color === COLOR_TRANSPARENT && (
        <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
      )}
    </PopoverTrigger>
  )

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  return (
    <Popover open={open} onOpenChange={open => setOpen(open)}>
      {/* <Tooltip content={tooltip}>
      <DropdownMenuTrigger
        className={cn(
          "relative aspect-square overflow-hidden",
          [autoBorder && s > 750, "border border-border"],
          className,
        )}
        aria-label={ariaLabel ?? tooltip}
        style={{ backgroundColor: color }}
      /></Tooltip> */}

      {button}

      <PopoverContent
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        align="start"
        className="text-xs flex flex-col p-4 gap-y-3"
      >
        <BaseCol className="color-picker gap-y-3">
          <HexAlphaColorPicker
            color={color ?? COLOR_TRANSPARENT}
            onChange={onColorChange}
          />

          <VCenterRow className="gap-x-4">
            <span className="shrink-0">RGBA</span>
            <VCenterRow className="gap-x-0.5">
              {' '}
              <span className="shrink-0">#</span>
              <HexColorInput
                color={color.toUpperCase()}
                alpha={true}
                onChange={onColorChange}
                className={COLOR_INPUT_CLS}
              />
            </VCenterRow>
          </VCenterRow>
        </BaseCol>
        <VCenterRow className="gap-x-[3px]">
          {PRESET_COLORS.map(presetColor => {
            const prgb = hexToRgb(presetColor)
            const ps = prgb.r + prgb.g + prgb.b

            return (
              <button
                key={presetColor}
                className={cn(
                  'w-5 aspect-square border hover:scale-125 focus-visible:scale-125 rounded-sm',
                  [
                    autoBorder && ps > 750,
                    'border-border',
                    'border-transparent hover:border-white',
                  ]
                )}
                style={{ background: presetColor }}
                onClick={() => onColorChange(presetColor)}
                tabIndex={0}
              />
            )
          })}
        </VCenterRow>

        {(allowNoColor || defaultColor) && <MenuSeparator />}

        {allowNoColor && (
          <Button
            variant="muted"
            className="w-full"
            justify="start"
            pad="sm"
            rounded="md"
            onClick={() => onColorChange(COLOR_TRANSPARENT)}
          >
            <span className="relative aspect-square w-5 border border-border bg-background rounded-sm">
              <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
            </span>

            <span>No color</span>
          </Button>
        )}

        {defaultColor && (
          <Button
            variant="muted"
            className="w-full"
            justify="start"
            pad="sm"
            rounded="md"
            onClick={() => onColorChange(defaultColor)}
          >
            <span
              className="aspect-square w-5 border border-border rounded-sm"
              style={{ backgroundColor: defaultColor }}
            />
            <span>Reset color</span>
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
