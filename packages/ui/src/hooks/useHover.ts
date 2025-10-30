'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Custom hook for tracking hover state on a DOM element.
 *
 * This hook detects when the mouse enters or leaves an element, providing
 * a boolean state that indicates whether the element is currently being hovered.
 * Useful for implementing hover effects, tooltips, and interactive UI components.
 *
 * @returns A tuple containing a ref to attach and the hover state
 *
 * @example
 * ```tsx
 * function HoverCard() {
 *   const [ref, isHovered] = useHover<HTMLDivElement>()
 *
 *   return (
 *     <div ref={ref}>
 *       {isHovered ? "👋 Hovering!" : "Hover over me"}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With conditional styling
 * function InteractiveButton() {
 *   const [ref, isHovered] = useHover<HTMLButtonElement>()
 *
 *   return (
 *     <button
 *       ref={ref}
 *       style={{
 *         transform: isHovered ? "scale(1.05)" : "scale(1)",
 *         transition: "transform 0.2s"
 *       }}
 *     >
 *       Hover me
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Showing tooltip on hover
 * function TooltipButton() {
 *   const [ref, isHovered] = useHover<HTMLButtonElement>()
 *
 *   return (
 *     <div style={{ position: "relative" }}>
 *       <button ref={ref}>Help</button>
 *       {isHovered && (
 *         <div className="tooltip">
 *           This is helpful information
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Uses mouseenter/mouseleave events for clean hover detection
 * - Properly cleans up event listeners on unmount
 * - Returns false if element is not yet mounted
 * - Works with any HTML element type via generics
 */
export function useHover<T extends HTMLElement = HTMLElement>(): [RefObject<T>, boolean] {
  /**
   * Create a ref to attach to the element we want to track hover on.
   */
  const ref = useRef<T>(null);

  /**
   * State to track whether the element is currently hovered.
   */
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Get the current element from the ref.
     * If the ref is not attached yet, we can't add listeners.
     */
    const element = ref.current;

    if (!element) {
      return;
    }

    /**
     * Handler for when the mouse enters the element.
     * Sets the hover state to true.
     */
    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    /**
     * Handler for when the mouse leaves the element.
     * Sets the hover state to false.
     */
    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    /**
     * Add event listeners to the element.
     * We use mouseenter/mouseleave instead of mouseover/mouseout
     * because they don't bubble and are easier to work with.
     */
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    /**
     * Cleanup function to remove event listeners.
     * This prevents memory leaks and is called when:
     * - Component unmounts
     * - Ref changes to a different element
     */
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []); // Empty dependency array - listeners only set up once

  return [ref, isHovered];
}
