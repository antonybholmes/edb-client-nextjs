import { VCenterRow } from '@components/v-center-row'
import type { IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { FOCUS_INSET_RING_CLS } from '@theme'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

export const PLACEHOLDER_CLS = cn(
  'trans-300 min-w-0 flex flex-row gap-x-1.5 items-center placeholder:text-foreground/50',
  'disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden bg-background',
  FOCUS_INSET_RING_CLS
)

export const inputVariants = cva(PLACEHOLDER_CLS, {
  variants: {
    variant: {
      default: cn(
        'px-2 h-10 hover:border-ring',
        'data-[enabled=true]:data-[focus=true]:border-ring',
        'data-[enabled=true]:data-[focus=true]:ring-1',
        'border border-border'
      ),
      plain: '',
      translucent: 'bg-white/20 hover:bg-white/25 text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const INPUT_CLS = cn(
  'disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50',
  'outline-none border-none ring-none min-w-0 grow'
)

export interface IPlaceholderProps extends IElementProps {
  id: string | undefined
  placeholder: string | undefined
  focus?: boolean
  hover?: boolean
  value: string | number | readonly string[] | undefined
  disabled?: boolean
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  inputCls?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      leftChildren,
      rightChildren,
      type,
      inputCls,
      variant = 'default',
      className = 'rounded-md',
      disabled,
      ...props
    },
    ref
  ) => {
    const [focus, setFocus] = useState(false)

    return (
      <VCenterRow
        className={inputVariants({
          variant,
          className: cn(PLACEHOLDER_CLS, className),
        })}
        data-enabled={!disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        data-focus={focus}
      >
        {leftChildren && leftChildren}
        <input
          type={type}
          className={cn(INPUT_CLS, inputCls)}
          ref={ref}
          disabled={disabled}
          {...props}
        />

        {rightChildren && rightChildren}
      </VCenterRow>
    )
  }
)
