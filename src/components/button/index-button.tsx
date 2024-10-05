import { IndexArrowIcon } from '@components/icons/index-arrow'
import { type IButtonProps } from '@components/shadcn/ui/themed/button'

import { cn } from '@lib/class-names'
import { CENTERED_ROW_CLS } from '@theme'

import { forwardRef, type ForwardedRef } from 'react'

export const IndexButton = forwardRef(function IndexButton(
  { className, children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  // useEffect(() => {
  //   gsap
  //     .timeline()
  //     .to(
  //       iconEl.current,
  //       { x: hover ? '0.15rem' : 0, ease: 'power2.out', duration: 0.2 },
  //       0
  //     )
  // }, [hover])

  return (
    <button
      ref={ref}
      className={cn(CENTERED_ROW_CLS, 'group gap-x-1', className)}
      {...props}
    >
      {children}

      <IndexArrowIcon className="w-4 stroke-2" />
    </button>
  )
})
