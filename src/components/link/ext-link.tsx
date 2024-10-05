import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'
import { forwardRef, type ForwardedRef } from 'react'

export const UNDERLINE_CLS = 'underline decoration-transparent'

export const ExtLink = forwardRef(function ExtLink(
  {
    href,
    target = '_blank',
    selected = false,
    className,
    children,
    ...props
  }: ILinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  return (
    <a
      ref={ref}
      data-selected={selected}
      href={href}
      target={target}
      className={cn(UNDERLINE_CLS, className)}
      {...props}
    >
      {children}
    </a>
  )
})
