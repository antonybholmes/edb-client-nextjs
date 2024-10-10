import { VCenterRow } from '@components/v-center-row'
import { cn } from '@lib/class-names'
import { ROUNDED_MD_CLS, TRANS_COLOR_CLS, TRANS_TIME_CLS } from '@theme'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import type { IPlaceholderProps } from './input'

const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,

  ROUNDED_MD_CLS,
  'h-9 relative bg-background border data-[state=disabled]:border-border',
  'data-[enabled=true]:border-border data-[focus=true]:border-theme data-[enabled=true]:hover:border-theme',
  'data-[error=true]:ring-red-600 min-w-0',
  'data-[enabled=false]:bg-muted'
)

const PLACEHOLDER_CLS = cn(
  TRANS_TIME_CLS,
  'pointer-events-none absolute left-2 top-1/2 z-10 bg-background px-1',
  'data-[focus=false]:text-foreground/50 data-[focus=true]:text-theme data-[enabled=false]:text-foreground/50',
  'data-[hover=true]:text-theme'
)

const INPUT_CLS = cn(
  'px-3 min-w-0 grow disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50 outline-none border-none ring-none'
)

export function Placeholder({
  id,
  placeholder,
  focus,
  hover,
  value,
  disabled = false,

  className,
}: IPlaceholderProps) {
  return (
    <label
      data-focus={focus}
      data-hover={hover}
      data-value={value !== ''}
      className={cn(PLACEHOLDER_CLS, className)}
      data-enabled={!disabled}
      style={{
        transform: `translateY(${focus || value ? '-1.7rem' : '-50%'})`,
        fontSize: `${focus || value ? '75%' : '100%'}`,
        fontWeight: `${focus || value ? '500' : 'normal'}`,
      }}
      htmlFor={id}
    >
      {focus ? placeholder?.replace('...', '') : placeholder}
    </label>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | undefined
  globalClassName?: string
  inputClassName?: string
  rightChildren?: ReactNode
}

export const Input3 = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      placeholder,
      value,
      defaultValue,
      type,
      disabled,
      error = false,
      rightChildren,
      className,
      globalClassName,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const [focus, setFocus] = useState(false)
    const [hover, setHover] = useState(false)
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current!, [])

    useEffect(() => {
      if (focus && innerRef.current) {
        innerRef.current.select()
      }
    }, [focus])

    return (
      <VCenterRow
        className={cn(CONTAINER_CLS, globalClassName, className)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        data-enabled={!disabled}
        data-error={error}
        data-focus={focus}
      >
        {placeholder && (
          <Placeholder
            id={id}
            placeholder={placeholder}
            focus={focus}
            hover={hover}
            value={value ?? defaultValue}
            disabled={disabled}
            data-enabled={!disabled}
            className={globalClassName}
          />
        )}

        <input
          ref={innerRef}
          type={type}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          data-enabled={!disabled}
          className={cn(INPUT_CLS, globalClassName, inputClassName)}
          {...props}
        />

        {rightChildren}
      </VCenterRow>
    )
  }
)
