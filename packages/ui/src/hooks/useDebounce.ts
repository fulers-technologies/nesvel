"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook that debounces a value, delaying updates until after a specified delay.
 *
 * This is particularly useful for search inputs, API calls, and other scenarios
 * where you want to wait for the user to stop typing before performing an action.
 * It helps reduce unnecessary renders, API calls, and improves performance.
 *
 * @param value - The value to debounce (can be of any type)
 * @param delay - The debounce delay in milliseconds (default: 500ms)
 * @returns The debounced value that updates only after the delay period
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState("")
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500)
 *
 *   // This effect only runs when the debounced value changes
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform API call with debounced search term
 *       fetchSearchResults(debouncedSearchTerm)
 *     }
 *   }, [debouncedSearchTerm])
 *
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Debouncing window resize events
 * function ResponsiveComponent() {
 *   const [windowWidth, setWindowWidth] = useState(window.innerWidth)
 *   const debouncedWidth = useDebounce(windowWidth, 200)
 *
 *   useEffect(() => {
 *     const handleResize = () => setWindowWidth(window.innerWidth)
 *     window.addEventListener("resize", handleResize)
 *     return () => window.removeEventListener("resize", handleResize)
 *   }, [])
 *
 *   // Only recalculates layout after user stops resizing
 *   return <div>Window width: {debouncedWidth}px</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Debouncing form validation
 * function EmailInput() {
 *   const [email, setEmail] = useState("")
 *   const debouncedEmail = useDebounce(email, 300)
 *   const [isValid, setIsValid] = useState(true)
 *
 *   useEffect(() => {
 *     // Only validate after user stops typing
 *     if (debouncedEmail) {
 *       setIsValid(validateEmail(debouncedEmail))
 *     }
 *   }, [debouncedEmail])
 *
 *   return (
 *     <div>
 *       <input value={email} onChange={(e) => setEmail(e.target.value)} />
 *       {!isValid && <span>Invalid email</span>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * - The returned debounced value will initially be the same as the input value
 * - The debounced value only updates after the specified delay has passed
 * - If the value changes before the delay completes, the timer is reset
 * - The hook properly cleans up timers to prevent memory leaks
 * - Works with any value type (strings, numbers, objects, arrays, etc.)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  /**
   * State to store the debounced value.
   * Initialized with the current value to avoid undefined states.
   */
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    /**
     * Set up a timer that will update the debounced value
     * after the specified delay has elapsed.
     *
     * This timer is reset every time the value or delay changes,
     * ensuring that the debounced value only updates when the
     * input value has been stable for the full delay period.
     */
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    /**
     * Cleanup function that clears the timeout.
     *
     * This is called when:
     * 1. The value changes (before the delay completes)
     * 2. The delay changes
     * 3. The component unmounts
     *
     * Clearing the timer ensures that:
     * - We don't update state on unmounted components
     * - We reset the debounce timer when the value changes
     * - We prevent memory leaks from orphaned timers
     */
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay]) // Re-run effect when value or delay changes

  /**
   * Return the debounced value.
   * This will be the same as the input value initially,
   * then will update to new values after the delay period.
   */
  return debouncedValue
}
