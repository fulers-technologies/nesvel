'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Custom hook that traps focus within a DOM element for accessibility.
 *
 * This hook ensures that keyboard navigation (Tab key) stays within a specific
 * element, which is essential for accessible modals, dialogs, and dropdown menus.
 * It prevents users from accidentally tabbing out of important UI components.
 *
 * @param isActive - Whether the focus trap should be active (default: true)
 * @returns A ref object to attach to the element that should trap focus
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusTrap<HTMLDivElement>(isOpen)
 *
 *   if (!isOpen) return null
 *
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <input placeholder="First input" />
 *       <input placeholder="Second input" />
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Dropdown menu with focus trap
 * function Dropdown({ isOpen }) {
 *   const dropdownRef = useFocusTrap<HTMLDivElement>(isOpen)
 *
 *   return (
 *     <div ref={dropdownRef}>
 *       <button>Option 1</button>
 *       <button>Option 2</button>
 *       <button>Option 3</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Dialog with conditional focus trap
 * function Dialog({ isOpen, allowBackgroundInteraction }) {
 *   const dialogRef = useFocusTrap<HTMLDivElement>(
 *     isOpen && !allowBackgroundInteraction
 *   )
 *
 *   return <div ref={dialogRef}>Dialog content</div>
 * }
 * ```
 *
 * @remarks
 * - Automatically focuses the first focusable element when activated
 * - Handles Tab and Shift+Tab to maintain focus within the trapped area
 * - Returns focus to the previously focused element when deactivated
 * - Only works with elements that contain focusable children
 * - Essential for WCAG 2.1 compliance for modal dialogs
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean = true
): RefObject<T> {
  /**
   * Create a ref to attach to the element that should trap focus.
   */
  const ref = useRef<T>(null);

  /**
   * Store the element that was focused before the trap was activated.
   * We'll return focus to this element when the trap is deactivated.
   */
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    /**
     * Early return if focus trap is not active.
     */
    if (!isActive) {
      return;
    }

    /**
     * Get the container element from the ref.
     */
    const container = ref.current;

    if (!container) {
      return;
    }

    /**
     * Store the currently focused element so we can return focus to it later.
     * This is important for accessibility - users expect focus to return
     * to where it was before opening a modal/dialog.
     */
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    /**
     * Query string for all focusable elements.
     * This includes all standard interactive elements that can receive focus.
     */
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    /**
     * Get all focusable elements within the container.
     * These are the elements we'll cycle through when Tab is pressed.
     */
    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => {
          /**
           * Filter out elements that are not visible or are inert.
           * Hidden elements shouldn't be included in tab order.
           */
          return (
            element.offsetParent !== null &&
            !element.hasAttribute('inert') &&
            window.getComputedStyle(element).visibility !== 'hidden'
          );
        }
      );
    };

    /**
     * Focus the first focusable element in the container.
     * This ensures keyboard users start at the beginning of the trapped area.
     */
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    /**
     * Handler for the keydown event that manages focus cycling.
     * This intercepts Tab key presses and keeps focus within the container.
     *
     * @param event - The keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      /**
       * Only handle Tab key presses.
       */
      if (event.key !== 'Tab') {
        return;
      }

      /**
       * Get the current list of focusable elements.
       * We query each time because the DOM may have changed.
       */
      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        /**
         * No focusable elements, prevent default tab behavior.
         */
        event.preventDefault();
        return;
      }

      /**
       * Get the first and last focusable elements.
       * These are our boundaries for the focus trap.
       */
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      /**
       * Handle Shift+Tab (backwards tabbing).
       */
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          /**
           * If we're at the first element and user presses Shift+Tab,
           * wrap around to the last element.
           */
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        /**
         * Handle regular Tab (forward tabbing).
         */
        if (document.activeElement === lastElement) {
          /**
           * If we're at the last element and user presses Tab,
           * wrap around to the first element.
           */
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    /**
     * Add the keydown event listener to the document.
     * We listen on document to catch all Tab key presses.
     */
    document.addEventListener('keydown', handleKeyDown);

    /**
     * Cleanup function to remove event listener and restore focus.
     */
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      /**
       * Return focus to the element that was focused before the trap.
       * This is important for accessibility - users expect focus to return
       * to where they were before opening a modal/dialog.
       */
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive]); // Re-run when isActive changes

  return ref;
}
