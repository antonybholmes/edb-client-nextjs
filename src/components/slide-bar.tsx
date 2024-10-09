import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react'

import { cn } from '@lib/class-names'
import { H2_CLS } from '@theme'

import { BaseCol } from '@components/base-col'

import { type IButtonProps } from '@components/shadcn/ui/themed/button'

import type { IChildrenProps } from '@interfaces/children-props'
import type { IClassProps } from '@interfaces/class-props'
import type { IElementProps } from '@interfaces/element-props'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { HCenterRow } from './h-center-row'
import { CloseIcon } from './icons/close-icon'
import { Button } from './shadcn/ui/themed/button'
import {
  SlidebarContext,
  SlidebarProvider,
  type ISlidebarContext,
} from './slide-bar-provider'
import { VCenterRow } from './v-center-row'

const ANIMATION_DURATION_S = 0.4
const KEY_STEP = 5

const H_DIV_BOX_CLS =
  'group hidden sm:flex shrink-0 grow-0 cursor-ew-resize flex-row items-center justify-center rounded-full px-1 outline-none overflow-hidden'

const H_LINE_CLS =
  'pointer-events-none group-hover:bg-ring group-focus-visible:bg-ring h-full rounded-full trans-color'

const V_DIV_BOX_CLS =
  'group flex flex-col sm:hidden shrink-0 grow-0 cursor-ns-resize items-center justify-center rounded-full py-1 outline-none'

const V_LINE_CLS =
  'pointer-events-none group-hover:bg-ring group-focus-visible:bg-ring w-full rounded-full trans-color'

type DIR_TYPE = 'h' | 'v' | ''

export function CloseButton({ className, ...props }: IButtonProps) {
  return (
    <Button
      variant="muted"
      multiVariants="icon-md"
      //rounded="full"
      className={cn('shrink-0', className)}
      ripple={false}
      title="Close side bar"
      {...props}
    >
      <CloseIcon w="w-2.5" />
    </Button>
  )
}

export function SlideBarMain(props: IChildrenProps) {
  return <>{props.children}</>
}

export function SlideBarSide(props: IChildrenProps) {
  return <>{props.children}</>
}

interface ISlideBarProps extends ISlidebarContext, IElementProps {
  title?: string
  side?: 'left' | 'right'
  position: number
  limits: [number, number]
}

export const SlideBar = forwardRef(function SlideBar(
  {
    title,
    side = 'left',
    open = true,
    onOpenChange,
    position = 80,
    limits = [5, 85],
    mainContent,
    sideContent,
    className,
    children,
    ...props
  }: ISlideBarProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  //const c = Children.toArray(children)

  //let mainContent:ReactNode
  //let sideContent:ReactNode
  //let content:ReactNode[] = [];

  // Children.forEach(children,  (child:ReactNode)=> {
  //   console.log(child?.type)
  //   if (!isValidElement(child)) return;
  //   if (child.type === SlideBarMain) {
  //     mainContent = child;
  //   } else if (child.type === SlideBarSide) {
  //     sideContent = child;
  //   } else {
  //     content.push(child);
  //   }
  // })

  return (
    <SlidebarProvider
      title={title}
      side={side}
      open={open}
      position={position}
      limits={limits}
      onOpenChange={onOpenChange}
      mainContent={mainContent}
      sideContent={sideContent}
    >
      {children}
    </SlidebarProvider>
  )
})

interface ISlideBarContentProps extends IClassProps {}

export const SlideBarContent = forwardRef(function SlideBarContent(
  { className, ...props }: ISlideBarContentProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const firstUpdate = useRef(true)
  //const _value = value ?? tabs[0].name // getTabValue(value, tabs)

  const innerRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => innerRef.current!, [])

  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const sidebarContentRef = useRef<HTMLDivElement>(null)

  const {
    title,
    side,
    open,
    onOpenChange,
    position,
    limits,
    mainContent,
    sideContent,
  } = useContext(SlidebarContext)

  //const [focus, setFocus] = useState(false)
  const [isDragging, setIsDragging] = useState<DIR_TYPE>('')

  const divPos = useRef<number>(100)

  function onMouseHoldDown(e: MouseEvent | React.MouseEvent, dir: DIR_TYPE) {
    setIsDragging(dir)

    e.preventDefault()
    e.stopPropagation()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!focus) {
      return
    }

    //const p = parseInt(refC1.current?.style.flexGrow ?? "0") / 100

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        setDivPos(Math.max(limits[0], divPos.current - KEY_STEP))
        break
      case 'ArrowRight':
      case 'ArrowDown':
        setDivPos(Math.min(limits[1], divPos.current + KEY_STEP))
        break
    }
  }

  // useEffect(() => {
  //   //divPos.current = Math.max(0, Math.min(1, position)) * 100

  //   setDivPos(position)

  //   //moveByFraction()
  // }, [position])

  function setDivPos(p: number) {
    p = Math.max(limits[0], Math.min(limits[1], p))
    setFlexPos(p)

    divPos.current = p
  }

  function setFlexPos(p: number) {
    const p1 = p.toString()
    const p2 = (100 - p).toString()

    if (contentRef.current) {
      contentRef.current.style.flexGrow = side === 'right' ? p1 : p2 //`${change * 100}%`
    }

    if (sidebarRef.current) {
      sidebarRef.current.style.flexGrow = side === 'right' ? p2 : p1 //`${change * 100}%`
    }

    return p
  }

  useEffect(() => {
    function onMouseHoldUp() {
      //divPos.current = null

      setIsDragging('')
    }

    function onMouseHoldMove(e: MouseEvent) {
      if (!innerRef.current || !divRef.current || !isDragging) {
        return
      }

      const clientRect = innerRef.current.getBoundingClientRect()
      const divRect = divRef.current?.getBoundingClientRect()

      if (isDragging === 'h') {
        const bw = side == 'right' ? divRect.width : -divRect.width

        const p = Math.max(
          limits[0],
          Math.min(
            limits[1],
            ((e.pageX - clientRect.left - 0.5 * bw) / clientRect.width) * 100
          )
        )

        setDivPos(p)
      }

      if (isDragging === 'v') {
        const bw = side == 'right' ? divRect.height : -divRect.height

        const p = Math.max(
          limits[0],
          Math.min(
            limits[1],
            ((e.pageY - clientRect.top - 0.5 * bw) / clientRect.height) * 100
          )
        )

        setDivPos(p)
      }

      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('mouseup', onMouseHoldUp)
    document.addEventListener('mousemove', onMouseHoldMove)

    return () => {
      document.removeEventListener('mouseup', onMouseHoldUp)
      document.removeEventListener('mousemove', onMouseHoldMove)
    }
  }, [isDragging])

  // useEffect(() => {
  //   console.log(size)
  // }, [size])

  useEffect(() => {
    if (firstUpdate.current) {
      // on the first render, assume this is the setup for the UI before the user starts
      // messing about. In this case, set the positions instantly.

      // initially set where the divider should be.
      divPos.current = position

      // hide the sidebar if we are not open as well as resizing
      if (!open) {
        if (sidebarContentRef.current) {
          // stop it trying to infer with the sizing of the
          sidebarContentRef.current.style.display = 'none'
        }

        if (sidebarRef.current) {
          sidebarRef.current.style.opacity = '0'
        }
      }

      // if the slider is open, resize the divs to match the position of the divPos,
      // otherwise set to 0 so that the sidebar is hidden
      setFlexPos(open ? position : side === 'right' ? 100 : 0)

      firstUpdate.current = false
      return
    }

    //console.log("open sesame", _open, side, divPos.current)

    if (open) {
      const p1 = divPos.current
      const p2 = 100 - p1
      gsap
        .timeline()
        // .to(
        //   refC1.current,
        //   {
        //     flexGrow: divPos,
        //     duration: ANIMATION_DURATION_S,
        //     ease: "power2.inOut",
        //   },
        //   0,
        // )
        .to(sidebarContentRef.current, { display: 'flex' }, 0)
        // .to(
        //   contentRef.current,
        //   {
        //     flexGrow: side === "right" ? p1 : p2,

        //     duration: ANIMATION_DURATION_S,
        //     ease: "power2.inOut",
        //   },
        //   0,
        // )
        .to(
          sidebarRef.current,
          {
            flexGrow: side === 'right' ? p2 : p1,

            duration: ANIMATION_DURATION_S,
            ease: 'power2.inOut',
          },
          0
        )
        .to(
          sidebarRef.current,
          {
            opacity: 1,
            duration: ANIMATION_DURATION_S,
            ease: 'power2.inOut',
          },
          '-=90%'
        )
    } else {
      gsap
        .timeline()
        // .to(
        //   refC1.current,
        //   {
        //     flexGrow: 100,
        //     duration: ANIMATION_DURATION_S,
        //     ease: "power2.inOut",
        //   },
        //   0,
        // )
        .to(
          sidebarRef.current,
          {
            opacity: 0,
            duration: ANIMATION_DURATION_S,
            ease: 'power2.inOut',
          },
          0
        )
        .to(
          sidebarRef.current,
          {
            flexGrow: 0,

            duration: ANIMATION_DURATION_S,
            ease: 'power2.inOut',
          },
          '-=75%'
        )
        // .to(
        //   contentRef.current,
        //   {
        //     flexGrow: 100,

        //     duration: ANIMATION_DURATION_S,
        //     ease: "power2.inOut",
        //   },
        //   "-=75%",
        // )
        .to(sidebarContentRef.current, { display: 'none' }, '-=25%')
    }

    //onOpenChange?.(_open)
  }, [open])

  return (
    <div
      ref={innerRef}
      className={cn(
        'flex flex-col sm:flex-row grow min-h-0 h-full overflow-hidden',
        [isDragging === 'h', 'cursor-ew-resize'],
        [isDragging === 'v', 'cursor-ns-resize'],
        className
      )}
      {...props}
    >
      {side === 'right' && (
        <BaseCol
          ref={contentRef}
          id="center-pane"
          className="min-w-0 basis-0 overflow-hidden"
          //style={{ flexGrow: position }}
        >
          {mainContent && mainContent}
        </BaseCol>
      )}

      <div
        id="side-pane"
        ref={sidebarRef}
        className="flex flex-col sm:flex-row min-h-0 min-w-0 basis-0 overflow-hidden"
        //style={{ flexGrow: side === "right" ? 100 - position : position }}
      >
        <div
          ref={sidebarContentRef}
          className="flex flex-col sm:flex-row grow min-h-0 overflow-hidden"
        >
          {side === 'right' && (
            <>
              <div
                id="divider-hitbox"
                ref={divRef}
                className={H_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'h')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(H_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ width: 2 }}
                />
              </div>

              <div
                id="divider-hitbox"
                ref={divRef}
                className={V_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'v')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(V_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ height: 2 }}
                />
              </div>
            </>
          )}

          <BaseCol
            className={cn(
              'gap-y-1 grow overflow-hidden',
              //[side === "right", "pr-2", "pl-2"],
              [isDragging !== '', 'pointer-events-none'] // disable content whilst dragging
            )}
          >
            {title && (
              <VCenterRow className="justify-between">
                <h2 className={H2_CLS}>{title}</h2>
                <CloseButton onClick={() => onOpenChange?.(false)} />
              </VCenterRow>
            )}

            {sideContent && sideContent}
          </BaseCol>

          {side === 'left' && (
            <>
              <HCenterRow
                id="divider-hitbox"
                ref={divRef}
                className={H_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'h')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(H_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ width: 2 }}
                />
              </HCenterRow>

              <div
                id="divider-hitbox"
                ref={divRef}
                className={V_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'v')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(V_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ height: 2 }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {side === 'left' && (
        <BaseCol
          ref={contentRef}
          id="center-pane"
          className="min-w-0 basis-0 overflow-hidden"
        >
          {mainContent && mainContent}
        </BaseCol>
      )}
    </div>
  )
})

export const SlideBarContentFramer = forwardRef(function SlideBarContentFramer(
  { className, ...props }: ISlideBarContentProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const firstUpdate = useRef(true)
  //const _value = value ?? tabs[0].name // getTabValue(value, tabs)

  const innerRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => innerRef.current!, [])

  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const sidebarContentRef = useRef<HTMLDivElement>(null)

  const {
    title,
    side,
    open,
    onOpenChange,
    position,
    limits,
    mainContent,
    sideContent,
  } = useContext(SlidebarContext)

  //const [focus, setFocus] = useState(false)
  const [isDragging, setIsDragging] = useState<DIR_TYPE>('')
  const [divPos, setDivPos] = useState(position)
  const [flexPos, setFlexPos] = useState(
    open ? position : side === 'right' ? 100 : 0
  )
  const [duration, setDuration] = useState(0.8)

  function onMouseHoldDown(e: MouseEvent | React.MouseEvent, dir: DIR_TYPE) {
    setIsDragging(dir)

    e.preventDefault()
    e.stopPropagation()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!focus) {
      return
    }

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        setDivPos(Math.max(limits[0], divPos - KEY_STEP))
        break
      case 'ArrowRight':
      case 'ArrowDown':
        setDivPos(Math.min(limits[1], divPos + KEY_STEP))
        break
    }
  }

  function setNormDivPos(p: number) {
    p = Math.max(limits[0], Math.min(limits[1], p))
    setDivPos(p)
  }

  useEffect(() => {
    setDuration(isDragging !== '' ? 0 : 0.8)
  }, [isDragging])

  // set initial position
  useEffect(() => {
    setNormDivPos(position)
  }, [position])

  useEffect(() => {
    setFlexPos(open ? divPos : side === 'right' ? 100 : 0)
  }, [divPos, open])

  useEffect(() => {
    function onMouseHoldUp() {
      setIsDragging('')
    }

    function onMouseHoldMove(e: MouseEvent) {
      if (!innerRef.current || !divRef.current || !isDragging) {
        return
      }

      const clientRect = innerRef.current.getBoundingClientRect()
      const divRect = divRef.current?.getBoundingClientRect()

      if (isDragging === 'h') {
        const bw = side == 'right' ? divRect.width : -divRect.width

        const p = Math.max(
          limits[0],
          Math.min(
            limits[1],
            ((e.pageX - clientRect.left - 0.5 * bw) / clientRect.width) * 100
          )
        )

        setNormDivPos(p)
      }

      if (isDragging === 'v') {
        const bw = side == 'right' ? divRect.height : -divRect.height

        const p = Math.max(
          limits[0],
          Math.min(
            limits[1],
            ((e.pageY - clientRect.top - 0.5 * bw) / clientRect.height) * 100
          )
        )

        setNormDivPos(p)
      }

      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('mouseup', onMouseHoldUp)
    document.addEventListener('mousemove', onMouseHoldMove)

    return () => {
      document.removeEventListener('mouseup', onMouseHoldUp)
      document.removeEventListener('mousemove', onMouseHoldMove)
    }
  }, [isDragging])

  return (
    <div
      ref={innerRef}
      className={cn(
        'flex flex-col sm:flex-row grow min-h-0 h-full overflow-hidden',
        [isDragging === 'h', 'cursor-ew-resize'],
        [isDragging === 'v', 'cursor-ns-resize'],
        className
      )}
      {...props}
    >
      {side === 'right' && (
        <motion.div
          initial={false}
          layout
          transition={{ type: 'spring', duration }}
          ref={contentRef}
          id="center-pane"
          className="min-w-0 basis-0 overflow-hidden flex flex-col"
          animate={{ flexGrow: flexPos }}
        >
          {mainContent && mainContent}
        </motion.div>
      )}

      <motion.div
        initial={false}
        layout
        transition={{ type: 'spring', duration }}
        id="side-pane"
        ref={sidebarRef}
        className="flex flex-col sm:flex-row min-h-0 min-w-0 basis-0 overflow-hidden"
        animate={{ flexGrow: side === 'right' ? 100 - flexPos : flexPos }}
      >
        <div
          ref={sidebarContentRef}
          className="flex flex-col sm:flex-row grow min-h-0 overflow-hidden"
        >
          {side === 'right' && (
            <>
              <div
                id="divider-hitbox"
                ref={divRef}
                className={H_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'h')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(H_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ width: 1 }}
                />
              </div>

              <div
                id="divider-hitbox"
                ref={divRef}
                className={V_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'v')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(V_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ height: 1 }}
                />
              </div>
            </>
          )}

          <BaseCol
            className={cn(
              'gap-y-1 grow overflow-hidden',
              //[side === "right", "pr-2", "pl-2"],
              [isDragging !== '', 'pointer-events-none'] // disable content whilst dragging
            )}
          >
            {title && (
              <VCenterRow className="justify-between">
                <h2 className={H2_CLS}>{title}</h2>
                <CloseButton onClick={() => onOpenChange?.(false)} />
              </VCenterRow>
            )}

            {sideContent && sideContent}
          </BaseCol>

          {side === 'left' && (
            <>
              <HCenterRow
                id="divider-hitbox"
                ref={divRef}
                className={H_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'h')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(H_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ width: 1 }}
                />
              </HCenterRow>

              <div
                id="divider-hitbox"
                ref={divRef}
                className={V_DIV_BOX_CLS}
                onMouseDown={e => onMouseHoldDown(e, 'v')}
                onClick={() => {
                  divRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                <div
                  className={cn(V_LINE_CLS, [isDragging !== '', 'bg-ring'])}
                  style={{ height: 1 }}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {side === 'left' && (
        <motion.div
          initial={false}
          layout
          ref={contentRef}
          id="center-pane"
          className="min-w-0 basis-0 overflow-hidden"
          animate={{ flexGrow: 100 - flexPos }}
          transition={{ type: 'spring', duration }}
        >
          {mainContent && mainContent}
        </motion.div>
      )}
    </div>
  )
})
