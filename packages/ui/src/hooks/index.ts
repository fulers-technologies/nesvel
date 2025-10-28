/**
 * Custom React Hooks for the Nesvel UI Library
 *
 * This module exports a collection of reusable React hooks that provide
 * common functionality for building modern web applications. These hooks
 * cover various use cases including:
 *
 * - UI State Management (useToggle, useHover, useClickOutside)
 * - Data Persistence (useLocalStorage, useCopyToClipboard)
 * - Performance Optimization (useDebounce, usePrevious)
 * - Responsive Design (useMediaQuery, useWindowSize)
 * - User Interactions (useKeyPress, useScrollLock)
 * - Accessibility (useFocusTrap)
 * - Viewport Observations (useIntersectionObserver)
 * - Notifications (useToast)
 *
 * All hooks are designed to be:
 * - SSR-safe (work with server-side rendering)
 * - Type-safe (full TypeScript support)
 * - Well-documented (comprehensive JSDoc comments)
 * - Production-ready (tested and optimized)
 *
 * @module hooks
 * @packageDocumentation
 */

/**
 * Hook for detecting clicks outside of a specified element.
 * Useful for closing dropdowns, modals, and popovers.
 *
 * @see {@link useClickOutside}
 */
export { useClickOutside } from "./useClickOutside"

/**
 * Hook for copying text to the clipboard with feedback.
 * Includes fallback support for older browsers.
 *
 * @see {@link useCopyToClipboard}
 */
export { useCopyToClipboard } from "./useCopyToClipboard"

/**
 * Hook for debouncing values to reduce unnecessary updates.
 * Perfect for search inputs and performance optimization.
 *
 * @see {@link useDebounce}
 */
export { useDebounce } from "./useDebounce"

/**
 * Hook for trapping focus within an element for accessibility.
 * Essential for modal dialogs and dropdown menus.
 *
 * @see {@link useFocusTrap}
 */
export { useFocusTrap } from "./useFocusTrap"

/**
 * Hook for detecting hover state on DOM elements.
 * Useful for interactive UI components and tooltips.
 *
 * @see {@link useHover}
 */
export { useHover } from "./useHover"

/**
 * Hook for observing element visibility using Intersection Observer API.
 * Perfect for lazy loading, infinite scroll, and scroll animations.
 *
 * @see {@link useIntersectionObserver}
 */
export { useIntersectionObserver } from "./useIntersectionObserver"

/**
 * Hook for detecting keyboard key presses with modifier support.
 * Ideal for implementing keyboard shortcuts and hotkeys.
 *
 * @see {@link useKeyPress}
 */
export { useKeyPress } from "./useKeyPress"

/**
 * Hook for persisting state in browser localStorage.
 * Automatically syncs across tabs and handles serialization.
 *
 * @see {@link useLocalStorage}
 */
export { useLocalStorage } from "./useLocalStorage"

/**
 * Hook for responsive design using CSS media queries.
 * Returns boolean indicating if the query matches.
 *
 * @see {@link useMediaQuery}
 */
export { useMediaQuery } from "./useMediaQuery"

/**
 * Hook for accessing the previous value of state or props.
 * Useful for comparing current and previous values.
 *
 * @see {@link usePrevious}
 */
export { usePrevious } from "./usePrevious"

/**
 * Hook for locking/unlocking body scroll.
 * Essential for modals and drawers to prevent background scrolling.
 *
 * @see {@link useScrollLock}
 */
export { useScrollLock } from "./useScrollLock"

/**
 * Hook for displaying toast notifications.
 * Provides a simple interface for success, error, info, and loading toasts.
 *
 * @see {@link useToast}
 */
export { useToast } from "./useToast"

/**
 * Hook for managing boolean state with toggle functionality.
 * Provides convenient methods for toggling, setting true, or setting false.
 *
 * @see {@link useToggle}
 */
export { useToggle } from "./useToggle"

/**
 * Hook for tracking browser window dimensions.
 * Automatically updates on window resize events.
 *
 * @see {@link useWindowSize}
 */
export { useWindowSize } from "./useWindowSize"

/**
 * Hook for detecting if the user is on a macOS/Mac device.
 * Useful for showing platform-specific keyboard shortcuts and UI.
 *
 * @see {@link useIsMac}
 */
export { useIsMac } from "./useIsMac"

/**
 * Hook for detecting if the viewport is mobile-sized.
 * Simple boolean alternative to useMediaQuery for mobile detection.
 *
 * @see {@link useIsMobile}
 */
export { useIsMobile } from "./useIsMobile"

/**
 * Hook for detecting if a component has mounted.
 * Essential for preventing hydration mismatches in SSR.
 *
 * @see {@link useMounted}
 */
export { useMounted } from "./useMounted"

/**
 * Hook for observing DOM mutations using MutationObserver API.
 * Detects changes in attributes, children, or text content.
 *
 * @see {@link useMutationObserver}
 */
export { useMutationObserver } from "./useMutationObserver"
