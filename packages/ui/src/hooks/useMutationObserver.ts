'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Custom hook that observes DOM mutations using the MutationObserver API.
 *
 * This hook allows you to detect and react to changes in the DOM tree,
 * such as attribute changes, child element additions/removals, or text
 * content changes. It's useful for tracking dynamic content, implementing
 * custom animations, or syncing with third-party libraries.
 *
 * @param ref - A ref to the element to observe
 * @param callback - Function called when mutations occur
 * @param options - MutationObserver configuration options
 *
 * @example
 * ```tsx
 * function DynamicList() {
 *   const listRef = useRef<HTMLUListElement>(null)
 *   const [itemCount, setItemCount] = useState(0)
 *
 *   useMutationObserver(
 *     listRef,
 *     (mutations) => {
 *       mutations.forEach((mutation) => {
 *         if (mutation.type === "childList") {
 *           setItemCount(listRef.current?.children.length || 0)
 *         }
 *       })
 *     },
 *     { childList: true }
 *   )
 *
 *   return (
 *     <div>
 *       <p>Items: {itemCount}</p>
 *       <ul ref={listRef}>
 *         <li>Item 1</li>
 *         <li>Item 2</li>
 *       </ul>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Track attribute changes
 * function ThemeObserver() {
 *   const containerRef = useRef<HTMLDivElement>(null)
 *
 *   useMutationObserver(
 *     containerRef,
 *     (mutations) => {
 *       mutations.forEach((mutation) => {
 *         if (mutation.type === "attributes" && mutation.attributeName === "class") {
 *           console.log("Class changed:", mutation.target.className)
 *         }
 *       })
 *     },
 *     { attributes: true, attributeFilter: ["class"] }
 *   )
 *
 *   return <div ref={containerRef} className="container">Content</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Monitor text content changes
 * function TextMonitor() {
 *   const textRef = useRef<HTMLParagraphElement>(null)
 *
 *   useMutationObserver(
 *     textRef,
 *     (mutations) => {
 *       mutations.forEach((mutation) => {
 *         if (mutation.type === "characterData") {
 *           console.log("Text changed to:", mutation.target.textContent)
 *         }
 *       })
 *     },
 *     { characterData: true, subtree: true }
 *   )
 *
 *   return <p ref={textRef}>Watch this text</p>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Observe deeply nested changes
 * function DeepObserver() {
 *   const rootRef = useRef<HTMLDivElement>(null)
 *
 *   useMutationObserver(
 *     rootRef,
 *     (mutations) => {
 *       console.log(`${mutations.length} mutations detected`)
 *     },
 *     {
 *       attributes: true,
 *       childList: true,
 *       subtree: true,
 *       characterData: true
 *     }
 *   )
 *
 *   return <div ref={rootRef}>Complex nested structure</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Sync with third-party library changes
 * function ThirdPartyWrapper() {
 *   const containerRef = useRef<HTMLDivElement>(null)
 *
 *   useMutationObserver(
 *     containerRef,
 *     (mutations) => {
 *       // React to changes made by external library
 *       mutations.forEach((mutation) => {
 *         if (mutation.addedNodes.length > 0) {
 *           console.log("External library added nodes")
 *         }
 *       })
 *     }
 *   )
 *
 *   return <div ref={containerRef} />
 * }
 * ```
 *
 * @remarks
 * - Automatically disconnects the observer when component unmounts
 * - Observer is recreated if ref, callback, or options change
 * - Default options observe all mutation types on the element and its descendants
 * - Does nothing during SSR (no MutationObserver API)
 * - Be careful with performance - mutations can fire frequently
 * - Consider debouncing the callback for expensive operations
 * - The callback receives an array of MutationRecord objects
 */
export function useMutationObserver(
  ref: RefObject<HTMLElement | null>,
  callback: MutationCallback,
  options: MutationObserverInit = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  }
): void {
  useEffect(() => {
    /**
     * Get the element to observe from the ref.
     */
    const element = ref.current;

    /**
     * Early return if no element or if we're in SSR.
     * MutationObserver is only available in browser environments.
     */
    if (!element || typeof window === 'undefined') {
      return;
    }

    /**
     * Check if MutationObserver is supported in the browser.
     * While widely supported, it's good practice to check.
     */
    if (!('MutationObserver' in window)) {
      console.warn('MutationObserver is not supported in this browser');
      return;
    }

    /**
     * Create a new MutationObserver instance with the provided callback.
     * The callback will be invoked whenever mutations matching the options
     * are detected on the observed element.
     */
    const observer = new MutationObserver(callback);

    /**
     * Start observing the target element for mutations.
     * The observer will watch for changes based on the provided options:
     *
     * - attributes: Watch for attribute changes (e.g., class, id, data-*)
     * - characterData: Watch for text content changes
     * - childList: Watch for child element additions/removals
     * - subtree: Watch for mutations in descendants as well
     * - attributeOldValue: Include previous attribute value in mutation record
     * - characterDataOldValue: Include previous text content in mutation record
     * - attributeFilter: Array of specific attribute names to watch
     */
    observer.observe(element, options);

    /**
     * Cleanup function to disconnect the observer.
     * This is called when:
     * - Component unmounts
     * - The ref changes to a different element
     * - The callback or options change
     *
     * Disconnecting stops the observer and clears its record queue,
     * preventing memory leaks.
     */
    return () => {
      observer.disconnect();
    };
  }, [ref, callback, options]); // Re-run if ref, callback, or options change
}
