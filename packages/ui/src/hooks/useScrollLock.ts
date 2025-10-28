"use client"

import { useEffect } from "react"

/**
 * Custom hook to lock/unlock body scroll.
 *
 * This hook is essential for modals, drawers, and overlays where you want to
 * prevent background scrolling while the component is open. It handles the
 * scroll lock by manipulating the body's overflow style and preserving the
 * current scroll position.
 *
 * @param isLocked - Whether the scroll should be locked (default: true)
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   // Lock scroll when modal is open
 *   useScrollLock(isOpen)
 *
 *   if (!isOpen) return null
 *
 *   return (
 *     <div className="modal-overlay">
 *       <div className="modal-content">
 *         <button onClick={onClose}>Close</button>
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With conditional locking based on viewport
 * function MobileMenu({ isOpen }) {
 *   const isMobile = useMediaQuery("(max-width: 768px)")
 *
 *   // Only lock scroll on mobile devices
 *   useScrollLock(isOpen && isMobile)
 *
 *   return <nav>Menu content</nav>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Drawer component
 * function Drawer({ isOpen, children }) {
 *   useScrollLock(isOpen)
 *
 *   return (
 *     <aside className={isOpen ? "drawer-open" : "drawer-closed"}>
 *       Content
 *     </aside>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Preserves the current scroll position when locking
 * - Properly restores scrolling when unlocked or component unmounts
 * - Accounts for scrollbar width to prevent layout shift
 * - Only works in browser environments (SSR safe)
 * - Multiple instances are supported (last one wins)
 */
export function useScrollLock(isLocked: boolean = true): void {
  useEffect(() => {
    /**
     * Early return if we're not in a browser environment.
     * During SSR, document will be undefined.
     */
    if (typeof document === "undefined") {
      return
    }

    /**
     * Early return if scroll should not be locked.
     * This allows conditional locking without unmounting.
     */
    if (!isLocked) {
      return
    }

    /**
     * Store the original body overflow style so we can restore it later.
     * This is important if the body already had overflow styling.
     */
    const originalOverflow = document.body.style.overflow

    /**
     * Store the original body padding-right to restore later.
     * We'll add padding to compensate for the hidden scrollbar.
     */
    const originalPaddingRight = document.body.style.paddingRight

    /**
     * Calculate the scrollbar width by comparing the window inner width
     * (viewport without scrollbar) with the document width (includes scrollbar).
     * This prevents layout shift when the scrollbar is hidden.
     */
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    /**
     * Lock the scroll by setting overflow to hidden.
     * This prevents the body from scrolling.
     */
    document.body.style.overflow = "hidden"

    /**
     * Add padding to the right side equal to the scrollbar width.
     * This prevents content from shifting when the scrollbar disappears.
     * Only add padding if there was a scrollbar (scrollbarWidth > 0).
     */
    if (scrollbarWidth > 0) {
      const currentPaddingRight =
        parseInt(
          window.getComputedStyle(document.body).paddingRight || "0",
          10
        ) || 0

      document.body.style.paddingRight =
        `${currentPaddingRight + scrollbarWidth}px`
    }

    /**
     * Cleanup function to restore the original scroll behavior.
     * This runs when:
     * - The component unmounts
     * - isLocked changes to false
     * - The effect re-runs for any reason
     */
    return () => {
      /**
       * Restore the original overflow style.
       * If there was no overflow style, this sets it to an empty string,
       * which removes the inline style.
       */
      document.body.style.overflow = originalOverflow

      /**
       * Restore the original padding-right.
       * This removes the padding we added to compensate for the scrollbar.
       */
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isLocked]) // Re-run effect when isLocked changes
}
