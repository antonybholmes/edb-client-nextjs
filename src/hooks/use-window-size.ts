import { type IDim, NO_DIM } from "@interfaces/dim"
import { useEffect, useState } from "react"

// Hook
export function useWindowSize(): IDim {
  const [windowSize, setWindowSize] = useState<IDim>(NO_DIM)

  useEffect(() => {
    const handleResize = () => {
      // Set window width/height to state
      setWindowSize({
        w: window.innerWidth,
        h: window.innerHeight,
      })
    }

    // Handler to call on window resize
    //const dbResize = debounce(handleResize, 500)

    // Add event listener
    //window.addEventListener('resize', dbResize)
    // Call handler right away so state gets updated with initial window size
    //handleResize()
    // Remove event listener on cleanup
    //return () => window.removeEventListener('resize', dbResize)

    window.addEventListener("resize", handleResize)
    // Call handler right away so state gets updated with initial window size
    handleResize()
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, []) // Empty array ensures that effect is only run on mount

  return windowSize
}
