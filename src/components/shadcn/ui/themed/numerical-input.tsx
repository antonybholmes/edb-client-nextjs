import type { IInputProps } from '@interfaces/input-props'

import { BaseCol } from '@components/base-col'
import { ChevronRightIcon } from '@components/icons/chevron-right-icon'
import { useEffect, useState } from 'react'

import { VCenterRow } from '@components/v-center-row'
import { cn } from '@lib/class-names'
import { INPUT_CLS, PLACEHOLDER_CLS } from './input'

interface IProps extends IInputProps {
  limit?: [number, number]
  inc?: number
  dp?: number
  onNumChanged?: (v: number) => void
}

export function NumericalInput({
  value,
  limit = [1, 100],
  inc = 1,
  dp = 0,
  placeholder,
  type,
  onNumChanged,
  className = 'w-16 rounded-md',
  ...props
}: IProps) {
  const [_value, setValue] = useState<string | number | undefined>('')
  const [_numValue, setNumValue] = useState<number>(0)
  const [focus, setFocus] = useState(false)

  if (dp === undefined) {
    dp = 0
  }

  useEffect(() => {
    if (typeof value !== 'number') {
      value = limit[0]
    }

    setNumValue(Math.min(limit[1], Math.max(limit[0], value)))
  }, [value])

  useEffect(() => {
    setValue(_numValue.toFixed(dp))
  }, [_numValue])

  return (
    <VCenterRow
      className={cn(
        PLACEHOLDER_CLS,
        'pl-2 border border-border h-8',
        [focus, 'ring-2'],
        className
      )}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      title={props.title}
    >
      <input
        value={_value}
        type={type}
        className={INPUT_CLS}
        onKeyDown={e => {
          //console.log(e)
          if (e.key === 'Enter') {
            let v = Number(e.currentTarget.value)

            // default to min if garbage input
            if (Number.isNaN(v)) {
              v = limit[0]
            }

            onNumChanged?.(Math.min(limit[1], Math.max(limit[0], v)))
          } else {
            // respond to arrow keys when ctrl pressed
            if (e.ctrlKey) {
              switch (e.key) {
                case 'ArrowUp':
                case 'ArrowRight':
                  onNumChanged?.(Math.min(limit[1], _numValue + inc))
                  break
                case 'ArrowDown':
                case 'ArrowLeft':
                  onNumChanged?.(Math.max(limit[0], _numValue - inc))
                  break
                default:
                  break
              }
            }
          }
        }}
        onChange={e => {
          setValue(e.currentTarget.value)
        }}
        placeholder={placeholder}
      />

      <BaseCol className="shrink-0">
        <button
          className="w-5 shrink-0 h-3.5 flex flex-row items-center justify-center stroke-foreground hover:stroke-theme focus-visible:stroke-theme outline-none trans-color"
          onClick={() => {
            onNumChanged?.(Math.min(limit[1], _numValue + inc))
          }}
        >
          <ChevronRightIcon className="-rotate-90 -mb-1" w="w-2.5" fill="" />
        </button>
        <button
          className="w-5 shrink-0 h-3.5 flex flex-row justify-center items-center stroke-foreground hover:stroke-theme focus-visible:stroke-theme outline-none trans-color"
          onClick={() => {
            onNumChanged?.(Math.max(limit[0], _numValue - inc))
          }}
        >
          <ChevronRightIcon className="rotate-90 -mt-1" w="w-2.5" fill="" />
        </button>
      </BaseCol>
    </VCenterRow>
  )
}
