"use client"

import { useEffect, useRef } from "react"

/**
 * Custom hook that returns the previous value of a state or prop.
 *
 * This hook stores the previous value from the last render, making it useful
 * for comparing current and previous values, implementing animations based on
 * value changes, or tracking state history. It's particularly helpful when you
 * need to know what a value was before it changed.
 *
 * @param value - The current value to track
 * @returns The previous value (undefined on first render)
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useState(0)
 *   const prevCount = usePrevious(count)
 *
 *   return (
 *     <div>
 *       <p>Current: {count}</p>
 *       <p>Previous: {prevCount ?? "N/A"}</p>
 *       <button onClick={() => setCount(count + 1)}>Increment</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Detect if value increased or decreased
 * function PriceDisplay({ price }) {
 *   const prevPrice = usePrevious(price)
 *
 *   const trend = prevPrice === undefined
 *     ? "unchanged"
 *     : price > prevPrice
 *     ? "increased"
 *     : price < prevPrice
 *     ? "decreased"
 *     : "unchanged"
 *
 *   return (
 *     <div>
 *       <span>${price}</span>
 *       {trend === "increased" && <span>📈</span>}
 *       {trend === "decreased" && <span>📉</span>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Trigger side effect only when value changes in a specific way
 * function UserProfile({ userId }) {
 *   const prevUserId = usePrevious(userId)
 *
 *   useEffect(() => {
 *     // Only fetch if userId actually changed
 *     if (prevUserId !== undefined && prevUserId !== userId) {
 *       fetchUserData(userId)
 *     }
 *   }, [userId, prevUserId])
 *
 *   return <div>User: {userId}</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Animate based on previous value
 * function AnimatedNumber({ value }) {
 *   const prevValue = usePrevious(value)
 *   const [isAnimating, setIsAnimating] = useState(false)
 *
 *   useEffect(() => {
 *     if (prevValue !== undefined && prevValue !== value) {
 *       setIsAnimating(true)
 *       const timer = setTimeout(() => setIsAnimating(false), 300)
 *       return () => clearTimeout(timer)
 *     }
 *   }, [value, prevValue])
 *
 *   return (
 *     <span className={isAnimating ? "animate-pulse" : ""}>
 *       {value}
 *     </span>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Returns undefined on the first render (no previous value exists yet)
 * - The previous value is updated after each render
 * - Works with any value type (primitives, objects, arrays, etc.)
 * - Does not trigger re-renders itself
 * - Useful for comparing current and previous props/state
 */
export function usePrevious<T>(value: T): T | undefined {
  /**
   * Create a ref to store the previous value.
   * Using a ref ensures the value persists across renders
   * without causing re-renders when it changes.
   */
  const ref = useRef<T>()

  /**
   * Effect to update the previous value after each render.
   *
   * This runs after the render is complete, which means:
   * 1. During the current render, ref.current holds the PREVIOUS value
   * 2. After the render, this effect updates ref.current to the CURRENT value
   * 3. On the next render, ref.current will hold what is now the previous value
   *
   * This timing is crucial for the hook to work correctly.
   */
  useEffect(() => {
    /**
     * Store the current value in the ref.
     * This value will be the "previous" value on the next render.
     */
    ref.current = value
  }, [value]) // Run this effect whenever value changes

  /**
   * Return the previous value (what's currently in the ref).
   *
   * On the first render, ref.current will be undefined since we haven't
   * stored anything yet. On subsequent renders, it will contain the value
   * from the previous render.
   */
  return ref.current
}
