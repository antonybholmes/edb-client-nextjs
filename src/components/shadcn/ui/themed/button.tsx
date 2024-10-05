import { Tooltip } from '@components/tooltip'
import type { IPos } from '@interfaces/pos'

import type { ITooltipSide } from '@interfaces/tooltip-side-props'
import { cn } from '@lib/class-names'
import { cv } from '@lib/class-variants'
import { Slot } from '@radix-ui/react-slot'
import {
  BASE_BUTTON_CLS,
  BASE_ICON_BUTTON_CLS,
  BUTTON_H_CLS,
  CENTERED_ROW_CLS,
  CORE_PRIMARY_BUTTON_CLS,
  CORE_PRIMARY_COLOR_BUTTON_CLS,
  DESTRUCTIVE_CLS,
  DROPDOWN_BUTTON_CLS,
  FOCUS_RING_CLS,
  ICON_BUTTON_CLS,
  LARGE_BUTTON_H_CLS,
  LARGE_ICON_BUTTON_CLS,
  MEDIUM_BUTTON_H_CLS,
  SECONDARY_BUTTON_CLS,
  SM_ICON_BUTTON_CLS,
  SMALL_BUTTON_H_CLS,
  TRANS_COLOR_CLS,
  XL_BUTTON_H_CLS,
  XS_ICON_BUTTON_CLS,
  XXL_BUTTON_H_CLS,
} from '@theme'
import { useAnimate } from 'framer-motion'
import {
  forwardRef,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
} from 'react'

const BASE_GHOST_CLS = 'hover:bg-accent data-[selected=true]:bg-accent'

export const BASE_MUTED_CLS = cn(
  'border border-transparent hover:bg-accent/50 data-[selected=false]:hover:bg-accent/50',
  'data-[selected=true]:bg-accent/50 data-[state=open]:bg-accent/50'
)

const BASE_ACCENT_CLS =
  'bg-accent/50 hover:bg-accent data-[selected=true]:bg-accent data-[state=open]:bg-accent'

const BASE_MUTED_OUTLINE_CLS = cn(
  BASE_MUTED_CLS,
  'border data-[selected=false]:border-transparent data-[selected=true]:border-border data-[selected=false]:hover:border-border'
)

//const BASE_OUTLINE_CLS = cn(BASE_GHOST_CLS, "border border-border")

const BASE_MENU_CLS = cn(
  BASE_GHOST_CLS,
  'justify-start text-left whitespace-nowrap'
)

const LINK_CLS = cn(
  FOCUS_RING_CLS,
  'text-theme underline-offset-4 hover:underline'
)

export const RIPPLE_CLS =
  'pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 w-4 h-4'

// export const buttonVariants = cva(BASE_BUTTON_CLS, {
//   variants: {
//     variant: {
//       none: "",
//       default: CORE_PRIMARY_BUTTON_CLS,
//       primary: CORE_PRIMARY_BUTTON_CLS,
//       "theme": CORE_PRIMARY_COLOR_BUTTON_CLS,
//       destructive: DESTRUCTIVE_CLS,
//       trans: "hover:bg-white/25 data-[selected=true]:bg-white/25",
//       outline: OUTLINE_BUTTON_CLS,
//       ghost: BASE_GHOST_CLS,
//       muted: BASE_MUTED_CLS,
//       accent: BASE_ACCENT_CLS,
//       toolbar: BASE_TOOLBAR_CLS,
//       side: "hover:bg-background",
//       menu: BASE_MENU_CLS,
//       link: LINK_CLS,
//       footer: "hover:bg-primary/20 data-[selected=true]:bg-primary/20",
//     },
//     font: {
//       none: "",
//       default: "font-normal",
//       normal: "font-normal",
//       medium: "font-medium",
//       semibold: "font-semibold",
//     },
//     rounded: {
//       none: "",
//       default: "rounded",
//       xs: "rounded-xs",
//       sm: "rounded-sm",
//       md: "rounded-md",
//       lg: "rounded-lg",
//       full: "rounded-full ",
//     },
//     ring: {
//       default: "ring-offset-1",
//       "offset-1": "ring-offset-1",
//       "offset-2": "ring-offset-2",
//       inset: "ring-inset",
//     },
//     items: {
//       default: "items-center",
//       center: "items-center",
//       start: "items-start",
//       end: "items-end",
//     },
//     justify: {
//       default: "justify-center",
//       center: "justify-center",
//       start: "justify-start",
//       end: "justify-end",
//     },
//     size: {
//       default: BUTTON_H_CLS,
//       base: BUTTON_H_CLS,
//       //narrow: cn(BUTTON_H_CLS, "w-5 justify-center"),
//       tab: "px-2 h-7 justify-center",
//       sm: SMALL_BUTTON_H_CLS,
//       md: MEDIUM_BUTTON_H_CLS,
//       lg: LARGE_BUTTON_H_CLS,
//       xl: XL_BUTTON_H_CLS,
//       xxl: XXL_BUTTON_H_CLS,
//       icon: cn(ICON_BUTTON_CLS, "justify-center"),
//       "icon-lg": cn(
//         BASE_ICON_BUTTON_CLS,
//         CENTERED_ROW_CLS,
//         LARGE_ICON_BUTTON_CLS,
//       ),
//       "icon-md": cn(
//         BASE_ICON_BUTTON_CLS,
//         CENTERED_ROW_CLS,
//         MEDIUM_BUTTON_H_CLS,
//       ),
//       "icon-sm": SM_ICON_BUTTON_CLS,
//       "icon-xs": XS_ICON_BUTTON_CLS,
//       none: "",
//     },
//     pad: {
//       none: "",
//       default: "px-4",
//       md: "px-3",
//       sm: "px-2",
//       xs: "px-1",
//     },
//     gap: {
//       none: "",
//       default: "gap-x-2",
//       sm: "gap-x-1",
//       xs: "gap-x-0.5",
//     },
//     animation: {
//       default: TRANS_COLOR_CLS,
//       color: TRANS_COLOR_CLS,
//       none: "",
//     },
//   },
// defaultVariants: {
//   variant: "primary",
//   justify: "center",
//   items: "center",
//   gap: "base",
//   size: "base",
//   font: "normal",
//   ring: "offset-1",
//   rounded: "base",
//   pad: "base",
//   animation: "default",
// },
// })

export const buttonVariants2 = cv(BASE_BUTTON_CLS, {
  variants: {
    variant: {
      none: '',
      primary: CORE_PRIMARY_BUTTON_CLS,
      theme: CORE_PRIMARY_COLOR_BUTTON_CLS,
      destructive: DESTRUCTIVE_CLS,
      trans: 'hover:bg-white/20 data-[selected=true]:bg-white/20',
      secondary: SECONDARY_BUTTON_CLS,
      ghost: BASE_GHOST_CLS,
      muted: BASE_MUTED_CLS,
      accent: BASE_ACCENT_CLS,
      'muted-outline': BASE_MUTED_OUTLINE_CLS,
      side: 'hover:bg-background',
      menu: BASE_MENU_CLS,
      link: LINK_CLS,
      footer: 'hover:bg-primary/20 data-[selected=true]:bg-primary/20',
    },
    font: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    rounded: {
      none: '',
      base: 'rounded',
      xs: 'rounded-xs',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full ',
    },
    ring: {
      'offset-1': 'ring-offset-1',
      'offset-2': 'ring-offset-2',
      inset: 'ring-inset',
    },
    items: {
      center: 'items-center',
      start: 'items-start',
      end: 'items-end',
    },
    justify: {
      center: 'justify-center',
      start: 'justify-start',
      end: 'justify-end',
    },
    size: {
      base: BUTTON_H_CLS,
      //narrow: cn(BUTTON_H_CLS, "w-5 justify-center"),
      tab: 'px-2 h-7 justify-center',
      sm: SMALL_BUTTON_H_CLS,
      md: MEDIUM_BUTTON_H_CLS,
      lg: LARGE_BUTTON_H_CLS,
      xl: XL_BUTTON_H_CLS,
      xxl: XXL_BUTTON_H_CLS,
      icon: cn(ICON_BUTTON_CLS, 'justify-center'),
      'icon-lg': cn(
        BASE_ICON_BUTTON_CLS,
        CENTERED_ROW_CLS,
        LARGE_ICON_BUTTON_CLS
      ),
      'icon-md': cn(
        BASE_ICON_BUTTON_CLS,
        CENTERED_ROW_CLS,
        MEDIUM_BUTTON_H_CLS
      ),
      'icon-sm': SM_ICON_BUTTON_CLS,
      'icon-xs': XS_ICON_BUTTON_CLS,
      dropdown: DROPDOWN_BUTTON_CLS,
      none: '',
    },
    pad: {
      none: '',
      lg: 'px-5',
      base: 'px-4',
      md: 'px-3',
      sm: 'px-2',
      xs: 'px-1',
    },
    gap: {
      none: '',
      base: 'gap-x-2',
      sm: 'gap-x-1',
      xs: 'gap-x-0.5',
    },
    animation: {
      default: TRANS_COLOR_CLS,
      color: TRANS_COLOR_CLS,
      none: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    justify: 'center',
    items: 'center',
    gap: 'sm',
    size: 'base',
    font: 'normal',
    ring: 'offset-1',
    rounded: 'md',
    pad: 'base',
    animation: 'default',
  },
  multiVariants: {
    icon: {
      size: 'icon',
      pad: 'none',
    },
    'icon-sm': {
      size: 'icon-sm',
      pad: 'none',
    },
    'icon-md': {
      size: 'icon-md',
      pad: 'none',
    },
    lg: {
      size: 'lg',
      pad: 'lg',
      rounded: 'md',
    },
    toolbar: {
      variant: 'muted',
      pad: 'sm',
      rounded: 'base',
    },
    dropdown: {
      variant: 'muted',
      pad: 'none',
      size: 'dropdown',
    },
    link: {
      variant: 'link',
      pad: 'none',
      size: 'none',
      justify: 'start',
    },
  },
})

export type ButtonState = 'active' | 'inactive'

export interface IButtonVariantProps {
  variant?: string
  size?: string
  rounded?: string
  ring?: string
  font?: string
  pad?: string
  gap?: string
  justify?: string
  items?: string
  animation?: string
  multiVariants?: string
}

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    //VariantProps<typeof buttonVariants>,
    //Component<typeof buttonVariants2>,
    IButtonVariantProps,
    ITooltipSide {
  title?: string
  asChild?: boolean
  selected?: boolean
  state?: ButtonState
  ripple?: boolean
  tooltip?: string
}

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      rounded,
      ring,
      font,
      pad,
      gap,
      justify,
      items,
      animation,
      multiVariants,
      selected = false,
      state = 'inactive',
      asChild = false,
      type = 'button',
      ripple = true,
      tooltip,
      tooltipSide = 'bottom',
      onMouseUp,
      onMouseDown,
      onMouseLeave,
      title,
      children,
      ...props
    },
    ref
  ) {
    const Comp = asChild ? Slot : 'button'

    const [scope, animate] = useAnimate()

    // if we set a title and the aria label is not set,
    // use the title to reduce instances of aria-label
    // being empty
    if (!props['aria-label']) {
      props['aria-label'] = title
    }

    //const rippleRef = useRef<HTMLSpanElement>(null)
    const [clickProps, setClickProps] = useState<IPos>({ x: -1, y: -1 })

    useEffect(() => {
      if (!ripple || clickProps.x === -1 || clickProps.y === -1) {
        return
      }

      // if (clickProps.x !== -1) {
      //   gsap.fromTo(
      //     rippleRef.current,
      //     {

      //       transform: "scale(1)",

      //       opacity: 0.9,
      //     },
      //     {
      //       transform: "scale(12)",
      //       opacity: 0,
      //       duration: 2,
      //       ease: "power3.out",
      //     },
      //   )
      // } else {
      //   gsap.to(rippleRef.current, {
      //     opacity: 0,
      //     duration: 1,
      //     ease: "power3.out",
      //   })
      // }

      // Trigger an animation on click
      animate(
        scope.current,
        {
          transform: ['scale(1)', 'scale(8)'], // Scale up then back down
          opacity: [0.9, 0], // Rotate 360 degrees
        },
        {
          duration: 1, // Animation duration (in seconds)
          ease: 'easeInOut', // Easing for a smooth effect
        }
      )
    }, [clickProps])

    function _onMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
      setClickProps({ x: -1, y: -1 })

      onMouseUp?.(e)
    }

    function _onMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
      //console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      setClickProps({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
      onMouseDown?.(e)
    }

    function _onMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
      //setClickProps({ x: -1, y: -1 })
      onMouseLeave?.(e)
    }

    const comp = (
      <Comp
        // className={buttonVariants({
        //   variant,
        //   size,
        //   rounded,
        //   ring,
        //   font,
        //   pad,
        //   gap,
        //   justify,
        //   items,
        //   animation,
        //   className: cn("relative", className),
        // })}
        className={buttonVariants2({
          variant,
          size,
          rounded,
          ring,
          font,
          pad,
          gap,
          justify,
          items,
          animation,
          className: cn('relative', className),
          multiVariants,
        })}
        ref={ref}
        data-selected={selected}
        data-state={state}
        type={type}
        onMouseDown={_onMouseDown}
        onMouseUp={_onMouseUp}
        onMouseLeave={_onMouseLeave}
        //@ts-ignore
        title={title}
        {...props}
      >
        {children}
        <span
          ref={scope}
          className={RIPPLE_CLS}
          style={{ left: clickProps.x, top: clickProps.y }}
        />
      </Comp>
    )

    if (tooltip) {
      return (
        <Tooltip side={tooltipSide} content={tooltip}>
          {comp}
        </Tooltip>
      )
    } else {
      return comp
    }
  }
)
