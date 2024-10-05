import {
  addScrollListener,
  getScrollLeft,
  getScrollTop,
  isBrowser,
  removeScrollListener,
} from "@lib/dom-utils"
import { useCallback, useEffect, useRef, useState } from "react"

export interface IScrollDirection {
  x: number
  dx: number
  y: number
  dy: number
}

export const DEFAULT_SCROLL_DIRECTION: IScrollDirection = {
  x: 0,
  dx: 0,
  y: 0,
  dy: 0,
}

// export interface ScrollDirectionHookResult {
//   isScrolling: boolean
//   isScrollingX: boolean
//   isScrollingY: boolean
//   isScrollingUp: boolean
//   isScrollingDown: boolean
//   isScrollingLeft: boolean
//   isScrollingRight: boolean
//   scrollDirection: ScrollDirection
//   scrollTargetRef: (node: HTMLElement) => void
// }

export interface IScrollDirectionHookResult {
  scrollTargetRef: (node: HTMLElement) => void
  //scrollDirection: IScrollDirection
}

export function useScrollDirection<T extends HTMLElement>(
  scroll?: (scrollDirection: IScrollDirection) => void,
): IScrollDirectionHookResult {
  //   const [targetFromApi, setTargetFromApi] = useState<HTMLElement | undefined>()
  //   const [targetFromProps, setTargetFromProps] = useState<
  //     HTMLElement | undefined
  //   >()

  //   const [scrollDirection, setScrollDirection] = useState<IScrollDirection>(
  //     DEFAULT_SCROLL_DIRECTION,
  //   )

  const [targetFromApi, setTargetFromApi] = useState<T>()
  const [targetFromProps, setTargetFromProps] = useState<T>()

  const targetToUse = targetFromProps || targetFromApi

  const scrollTargetRef = useCallback((node: T) => {
    setTargetFromApi(node)
  }, [])

  //   useEffect(() => {
  //     setTargetFromProps(target)
  //   }, [target])

  const scrollTimeout = useRef<number>()
  const lastScroll = useRef<IScrollDirection>(DEFAULT_SCROLL_DIRECTION)

  //   const isScrolling = scrollDirection !== null
  //   const isScrollingX = scrollDirection === "LEFT" || scrollDirection === "RIGHT"
  //   const isScrollingY = scrollDirection === "UP" || scrollDirection === "DOWN"
  //   const isScrollingUp = scrollDirection === "UP"
  //   const isScrollingDown = scrollDirection === "DOWN"
  //   const isScrollingLeft = scrollDirection === "LEFT"
  //   const isScrollingRight = scrollDirection === "RIGHT"

  //   const scrollTargetRef = useCallback((node: HTMLElement) => {
  //     setTargetFromApi(node)
  //   }, [])

  //   useEffect(() => {
  //     setTargetFromProps(target)
  //   }, [target])

  useEffect(() => {
    if (isBrowser()) {
      const handleScroll = () => {
        // Reset scroll direction when scrolling stops
        // scrollTimeout.current && window.clearTimeout(scrollTimeout.current)
        // scrollTimeout.current = window.setTimeout(() => {
        //   setScrollDirection({
        //     x: lastScroll.current.x,
        //     dx: 0,
        //     y: lastScroll.current.y,
        //     dy: 0,
        //   })
        // }, 60)

        window.requestAnimationFrame(() => {
          // Set vertical direction while scrolling
          const scrollTop = getScrollTop(targetToUse)
          const scrollLeft = getScrollLeft(targetToUse)

          lastScroll.current = {
            x: scrollLeft,
            dx: scrollLeft - lastScroll.current.x,
            y: scrollTop,
            dy: scrollTop - lastScroll.current.y,
          }

          //setScrollDirection(lastScroll.current)

          scroll && scroll(lastScroll.current)
        })
      }

      addScrollListener(targetToUse, handleScroll)
      return () => removeScrollListener(targetToUse, handleScroll)
    }
  }, [targetToUse])

  return {
    scrollTargetRef,
    //scrollDirection,
  }
}
