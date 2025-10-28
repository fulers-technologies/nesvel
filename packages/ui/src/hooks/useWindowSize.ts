"use client"

import { useEffect, useState } from "react"

/**
 * Window size dimensions.
 */
type WindowSize = {
  /** The width of the window in pixels */
  width: number
  /** The height of the window in pixels */
  height: number
}

/**
 * Custom hook that tracks the browser window dimensions.
 *
 * This hook provides the current width and height of the browser window
 * and automatically updates when the window is resized. It's useful for
 * implementing responsive layouts, calculating element positions, or
 * conditionally rendering components based on viewport size.
 *
 * @returns An object containing the current window width and height
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { width, height } = useWindowSize()
 *
 *   return (
 *     <div>
 *       <p>Window width: {width}px</p>
 *       <p>Window height: {height}px</p>
 *       {width < 768 ? <MobileView /> : <DesktopView />}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Calculate responsive columns
 * function Grid({ items }) {
 *   const { width } = useWindowSize()
 *
 *   const columns = width < 640 ? 1 : width < 1024 ? 2 : 3
 *
 *   return (
 *     <div style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
 *       {items.map(item => <div key={item.id}>{item.content}</div>)}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditionally render based on orientation
 * function OrientationAware() {
 *   const { width, height } = useWindowSize()
 *   const isLandscape = width > height
 *
 *   return (
 *     <div>
 *       {isLandscape ? (
 *         <LandscapeLayout />
 *       ) : (
 *         <PortraitLayout />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Dynamic viewport-based sizing
 * function FullscreenModal() {
 *   const { width, height } = useWindowSize()
 *
 *   return (
 *     <div
 *       style={{
 *         width: width * 0.9,
 *         height: height * 0.8,
 *         maxWidth: 1200
 *       }}
 *     >
 *       Modal content
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Returns { width: 0, height: 0 } during SSR to prevent hydration mismatches
 * - Updates on window resize events
 * - Automatically cleans up event listeners on unmount
 * - Consider debouncing if you need to perform expensive operations on resize
 * - For better performance with frequent updates, use with useDebounce hook
 */
export function useWindowSize(): WindowSize {
  /**
   * Initialize state with zeros for SSR compatibility.
   * This prevents hydration mismatches between server and client.
   * The actual window size will be set on mount.
   */
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    /**
     * Early return if we're not in a browser environment.
     * During SSR, window will be undefined.
     */
    if (typeof window === "undefined") {
      return
    }

    /**
     * Handler function that updates the window size state.
     * This is called on mount and whenever the window is resized.
     */
    const handleResize = () => {
      setWindowSize({
        /**
         * window.innerWidth includes scrollbar width.
         * Use document.documentElement.clientWidth if you want
         * to exclude scrollbar width.
         */
        width: window.innerWidth,
        /**
         * window.innerHeight is the visible height of the window.
         */
        height: window.innerHeight,
      })
    }

    /**
     * Set initial window size.
     * This ensures we have the correct size immediately after mounting,
     * rather than waiting for a resize event.
     */
    handleResize()

    /**
     * Add event listener for window resize events.
     * This ensures our state stays in sync with the actual window size.
     */
    window.addEventListener("resize", handleResize)

    /**
     * Cleanup function to remove the event listener.
     * This prevents memory leaks when the component unmounts.
     */
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, []) // Empty dependency array - only run on mount and unmount

  return windowSize
}
