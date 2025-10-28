"use client"

import { useEffect, useRef, type RefObject } from "react"

/**
 * Custom hook that detects clicks outside of a specified element.
 *
 * This is commonly used for closing dropdowns, modals, popovers, and other
 * overlay components when the user clicks outside of them. The hook properly
 * handles both mouse and touch events for mobile compatibility.
 *
 * @param handler - Callback function to execute when a click outside is detected
 * @param enabled - Whether the click outside detection is active (default: true)
 * @returns A ref object to attach to the element you want to monitor
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   const [isOpen, setIsOpen] = useState(false)
 *   const dropdownRef = useClickOutside<HTMLDivElement>(() => {
 *     setIsOpen(false)
 *   })
 *
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *       {isOpen && <div>Dropdown content</div>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With conditional enabling
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useClickOutside<HTMLDivElement>(
 *     onClose,
 *     isOpen // Only detect clicks when modal is open
 *   )
 *
 *   if (!isOpen) return null
 *
 *   return <div ref={modalRef}>Modal content</div>
 * }
 * ```
 *
 * @remarks
 * - The hook uses mousedown/touchstart events instead of click for better UX
 * - Properly cleans up event listeners when unmounted or disabled
 * - Works with both mouse and touch devices
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): RefObject<T> {
  /**
   * Create a ref to attach to the element we want to monitor.
   * This ref will be returned and should be attached to the target element.
   */
  const ref = useRef<T>(null)

  useEffect(() => {
    /**
     * Early return if the hook is disabled.
     * This allows conditional click-outside detection without unmounting.
     */
    if (!enabled) {
      return
    }

    /**
     * Event listener handler that checks if the click/touch occurred outside
     * the referenced element and calls the handler if so.
     *
     * @param event - The mouse or touch event that occurred
     */
    const listener = (event: MouseEvent | TouchEvent) => {
      /**
       * Get the actual DOM element from the ref.
       * If ref is not attached or element is not in DOM, do nothing.
       */
      const element = ref.current

      if (!element) {
        return
      }

      /**
       * Get the target of the event (where the user clicked/touched).
       * We need to check if this is a valid Node for the contains check.
       */
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      /**
       * Check if the click/touch occurred inside the element.
       * If it did, we don't want to trigger the handler.
       */
      if (element.contains(target)) {
        return
      }

      /**
       * The click/touch was outside the element, so call the handler.
       * This is where you typically close your dropdown, modal, etc.
       */
      handler(event)
    }

    /**
     * Add event listeners for both mouse and touch events.
     * We use mousedown/touchstart instead of click for better UX:
     * - Triggers faster (doesn't wait for mouseup)
     * - Prevents issues with drag operations
     * - Works better with nested interactive elements
     *
     * We attach to document to catch all clicks anywhere on the page.
     * The 'true' parameter enables capture phase, ensuring we catch
     * the event before it bubbles up through the DOM.
     */
    document.addEventListener("mousedown", listener, true)
    document.addEventListener("touchstart", listener, true)

    /**
     * Cleanup function to remove event listeners.
     * This prevents memory leaks and is called when:
     * - Component unmounts
     * - Handler or enabled dependencies change
     * - Effect is re-run for any reason
     */
    return () => {
      document.removeEventListener("mousedown", listener, true)
      document.removeEventListener("touchstart", listener, true)
    }
  }, [handler, enabled]) // Re-run effect if handler or enabled state changes

  return ref
}
