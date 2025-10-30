'use client';

import { useCallback, useState } from 'react';

/**
 * Custom hook for managing boolean state with convenient toggle functionality.
 *
 * This hook simplifies working with boolean state by providing helper functions
 * to toggle, set to true, or set to false. It's perfect for managing UI states
 * like modals, dropdowns, visibility toggles, and feature flags.
 *
 * @param initialValue - The initial boolean value (default: false)
 * @returns A tuple containing the current value and an object with toggle methods
 *
 * @example
 * ```tsx
 * function Modal() {
 *   const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false)
 *
 *   return (
 *     <>
 *       <button onClick={toggle}>Toggle Modal</button>
 *       <button onClick={setTrue}>Open Modal</button>
 *       {isOpen && (
 *         <div>
 *           <h2>Modal Content</h2>
 *           <button onClick={setFalse}>Close</button>
 *         </div>
 *       )}
 *     </>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Dropdown menu
 * function Dropdown() {
 *   const [isExpanded, { toggle }] = useToggle()
 *
 *   return (
 *     <div>
 *       <button onClick={toggle}>Menu</button>
 *       {isExpanded && <ul>...</ul>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Dark mode toggle
 * function ThemeToggle() {
 *   const [isDark, { toggle, setValue }] = useToggle(false)
 *
 *   useEffect(() => {
 *     document.body.classList.toggle("dark", isDark)
 *   }, [isDark])
 *
 *   return (
 *     <button onClick={toggle}>
 *       {isDark ? "🌙" : "☀️"}
 *     </button>
 *   )
 * }
 * ```
 *
 * @remarks
 * - All helper functions are memoized with useCallback for stable references
 * - setValue accepts a boolean or a function that receives the current value
 * - Perfect for managing any boolean UI state
 */
export function useToggle(initialValue: boolean = false): [
  boolean,
  {
    toggle: () => void;
    setTrue: () => void;
    setFalse: () => void;
    setValue: (value: boolean | ((prev: boolean) => boolean)) => void;
  },
] {
  /**
   * State to track the current boolean value.
   */
  const [value, setValue] = useState<boolean>(initialValue);

  /**
   * Toggle the value between true and false.
   * Uses useCallback to ensure stable reference across renders.
   */
  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  /**
   * Set the value to true.
   * Useful when you always want to enable something (e.g., opening a modal).
   */
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  /**
   * Set the value to false.
   * Useful when you always want to disable something (e.g., closing a modal).
   */
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  /**
   * Return the current value and all helper methods.
   * setValue is already memoized by useState, so we don't need to wrap it.
   */
  return [value, { toggle, setTrue, setFalse, setValue }];
}
