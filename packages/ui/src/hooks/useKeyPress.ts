"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook that detects when a specific key is pressed.
 *
 * This hook monitors keyboard events and returns true when the specified key
 * is being pressed. It's useful for implementing keyboard shortcuts, hotkeys,
 * and keyboard-based interactions in your application.
 *
 * @param targetKey - The key to detect (e.g., "Enter", "Escape", "a", "Control")
 * @param options - Optional configuration for the key detection
 * @returns Boolean indicating whether the target key is currently pressed
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, setQuery] = useState("")
 *   const enterPressed = useKeyPress("Enter")
 *
 *   useEffect(() => {
 *     if (enterPressed && query) {
 *       performSearch(query)
 *     }
 *   }, [enterPressed, query])
 *
 *   return <input value={query} onChange={(e) => setQuery(e.target.value)} />
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Close modal on Escape key
 * function Modal({ isOpen, onClose }) {
 *   const escapePressed = useKeyPress("Escape")
 *
 *   useEffect(() => {
 *     if (escapePressed && isOpen) {
 *       onClose()
 *     }
 *   }, [escapePressed, isOpen, onClose])
 *
 *   return <div>Modal content</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Keyboard shortcut with modifier keys
 * function Editor() {
 *   const ctrlS = useKeyPress("s", { ctrlKey: true })
 *
 *   useEffect(() => {
 *     if (ctrlS) {
 *       saveDocument()
 *     }
 *   }, [ctrlS])
 *
 *   return <textarea />
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Detect arrow keys for navigation
 * function Gallery() {
 *   const leftPressed = useKeyPress("ArrowLeft")
 *   const rightPressed = useKeyPress("ArrowRight")
 *
 *   useEffect(() => {
 *     if (leftPressed) navigatePrevious()
 *     if (rightPressed) navigateNext()
 *   }, [leftPressed, rightPressed])
 *
 *   return <div>Gallery content</div>
 * }
 * ```
 *
 * @remarks
 * - Returns false during SSR to prevent hydration issues
 * - Tracks both keydown and keyup events for accurate state
 * - Supports modifier keys (Ctrl, Alt, Shift, Meta)
 * - Key names follow the KeyboardEvent.key standard
 * - Cleans up event listeners properly on unmount
 */

/**
 * Options for configuring key detection behavior.
 */
type KeyPressOptions = {
  /** Require Ctrl/Cmd key to be pressed */
  ctrlKey?: boolean
  /** Require Alt/Option key to be pressed */
  altKey?: boolean
  /** Require Shift key to be pressed */
  shiftKey?: boolean
  /** Require Meta/Windows/Command key to be pressed */
  metaKey?: boolean
  /** Target element (defaults to document) */
  target?: HTMLElement | Document | Window
}

export function useKeyPress(
  targetKey: string,
  options: KeyPressOptions = {}
): boolean {
  const {
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    metaKey = false,
    target,
  } = options

  /**
   * State to track whether the target key is currently pressed.
   * Initialized to false for SSR compatibility.
   */
  const [keyPressed, setKeyPressed] = useState<boolean>(false)

  useEffect(() => {
    /**
     * Early return if we're not in a browser environment.
     */
    if (typeof window === "undefined") {
      return
    }

    /**
     * Determine the event target.
     * Defaults to window if no target is specified.
     */
    const eventTarget = target || window

    /**
     * Handler for keydown events.
     * Sets keyPressed to true when the target key is pressed
     * and all required modifier keys match.
     *
     * @param event - The keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      /**
       * Check if the pressed key matches the target key.
       * Key comparison is case-sensitive.
       */
      if (event.key !== targetKey) {
        return
      }

      /**
       * Check if all required modifier keys match.
       * If any modifier requirement isn't met, don't set keyPressed.
       */
      const modifiersMatch =
        event.ctrlKey === ctrlKey &&
        event.altKey === altKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey

      if (modifiersMatch) {
        setKeyPressed(true)
      }
    }

    /**
     * Handler for keyup events.
     * Sets keyPressed to false when any key is released.
     * We reset on any keyup to ensure clean state management.
     *
     * @param event - The keyboard event
     */
    const handleKeyUp = (event: KeyboardEvent) => {
      /**
       * Only reset if the released key was our target key
       * or one of the required modifier keys.
       */
      if (
        event.key === targetKey ||
        (ctrlKey && event.key === "Control") ||
        (altKey && event.key === "Alt") ||
        (shiftKey && event.key === "Shift") ||
        (metaKey && event.key === "Meta")
      ) {
        setKeyPressed(false)
      }
    }

    /**
     * Add event listeners for keydown and keyup.
     * These track the pressed state of the key.
     */
    eventTarget.addEventListener("keydown", handleKeyDown as EventListener)
    eventTarget.addEventListener("keyup", handleKeyUp as EventListener)

    /**
     * Cleanup function to remove event listeners.
     * Prevents memory leaks when component unmounts.
     */
    return () => {
      eventTarget.removeEventListener("keydown", handleKeyDown as EventListener)
      eventTarget.removeEventListener("keyup", handleKeyUp as EventListener)
    }
  }, [targetKey, ctrlKey, altKey, shiftKey, metaKey, target])

  return keyPressed
}
