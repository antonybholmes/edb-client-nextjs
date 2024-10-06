import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'
import Link from 'next/link'
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
    <Link
      ref={ref}
      data-selected={selected}
      href={href}
      target={target}
      className={cn(UNDERLINE_CLS, className)}
      {...props}
    >
      {children}
    </Link>
  )
})
