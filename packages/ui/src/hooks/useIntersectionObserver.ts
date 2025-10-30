'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Options for the Intersection Observer.
 */
type IntersectionObserverOptions = {
  /** The element used as viewport for checking visibility (defaults to browser viewport) */
  root?: Element | null;
  /** Margin around the root (e.g., "10px 20px 30px 40px") */
  rootMargin?: string;
  /** Threshold(s) at which to trigger (0.0 to 1.0, or array of thresholds) */
  threshold?: number | number[];
  /** Whether to only trigger once and then stop observing */
  triggerOnce?: boolean;
  /** Initial value before first observation */
  initialIsIntersecting?: boolean;
};

/**
 * Custom hook that uses the Intersection Observer API to detect element visibility.
 *
 * This hook observes when an element enters or leaves the viewport, making it
 * perfect for implementing lazy loading, infinite scroll, scroll animations,
 * and analytics tracking. It provides a simple interface to the Intersection
 * Observer API with sensible defaults.
 *
 * @param options - Configuration options for the Intersection Observer
 * @returns A tuple containing a ref to attach and the intersection entry
 *
 * @example
 * ```tsx
 * // Basic lazy loading
 * function LazyImage({ src }) {
 *   const [ref, entry] = useIntersectionObserver<HTMLImageElement>({
 *     threshold: 0.1,
 *     triggerOnce: true
 *   })
 *
 *   return (
 *     <img
 *       ref={ref}
 *       src={entry?.isIntersecting ? src : "placeholder.jpg"}
 *       alt="Lazy loaded"
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Infinite scroll
 * function InfiniteList({ items, loadMore }) {
 *   const [sentryRef, entry] = useIntersectionObserver<HTMLDivElement>({
 *     threshold: 1.0
 *   })
 *
 *   useEffect(() => {
 *     if (entry?.isIntersecting) {
 *       loadMore()
 *     }
 *   }, [entry?.isIntersecting, loadMore])
 *
 *   return (
 *     <div>
 *       {items.map(item => <div key={item.id}>{item.name}</div>)}
 *       <div ref={sentryRef}>Loading...</div>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Scroll animation trigger
 * function AnimatedSection() {
 *   const [ref, entry] = useIntersectionObserver<HTMLDivElement>({
 *     threshold: 0.5,
 *     triggerOnce: true
 *   })
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={entry?.isIntersecting ? "fade-in" : ""}
 *     >
 *       Animated content
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Analytics tracking
 * function ViewTrackedComponent({ id }) {
 *   const [ref, entry] = useIntersectionObserver<HTMLDivElement>({
 *     threshold: 0.75,
 *     triggerOnce: true
 *   })
 *
 *   useEffect(() => {
 *     if (entry?.isIntersecting) {
 *       trackView(id)
 *     }
 *   }, [entry?.isIntersecting, id])
 *
 *   return <div ref={ref}>Content</div>
 * }
 * ```
 *
 * @remarks
 * - Returns null during SSR and before the observer is set up
 * - Automatically cleans up the observer when component unmounts
 * - Supports all standard Intersection Observer options
 * - Can be configured to only trigger once for performance
 * - Works with any HTML element via generic type parameter
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, IntersectionObserverEntry | null] {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    initialIsIntersecting = false,
  } = options;

  /**
   * Create a ref to attach to the element we want to observe.
   */
  const ref = useRef<T>(null);

  /**
   * State to store the intersection observer entry.
   * This contains information about the element's visibility.
   */
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  /**
   * Track whether we've already triggered (for triggerOnce mode).
   */
  const hasTriggered = useRef<boolean>(false);

  /**
   * Set initial intersecting state if provided.
   */
  useEffect(() => {
    if (initialIsIntersecting && !entry) {
      setEntry({
        isIntersecting: true,
      } as IntersectionObserverEntry);
    }
  }, [initialIsIntersecting, entry]);

  useEffect(() => {
    /**
     * Get the element to observe from the ref.
     */
    const element = ref.current;

    /**
     * Early return if no element or if we're in SSR.
     */
    if (!element || typeof window === 'undefined') {
      return;
    }

    /**
     * Check if the browser supports Intersection Observer.
     * If not, we can't proceed with observation.
     */
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver is not supported in this browser');
      return;
    }

    /**
     * If triggerOnce is enabled and we've already triggered,
     * don't set up a new observer.
     */
    if (triggerOnce && hasTriggered.current) {
      return;
    }

    /**
     * Callback function that's called whenever the intersection changes.
     * This is where we update our state with the new intersection data.
     *
     * @param entries - Array of intersection observer entries
     */
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      /**
       * We only observe one element, so we only care about the first entry.
       */
      const [observerEntry] = entries;

      /**
       * Update the entry state with the new intersection information.
       */
      setEntry(observerEntry);

      /**
       * If triggerOnce is enabled and the element is intersecting,
       * mark that we've triggered and disconnect the observer.
       */
      if (triggerOnce && observerEntry.isIntersecting) {
        hasTriggered.current = true;
        observer.disconnect();
      }
    };

    /**
     * Create the Intersection Observer with our options.
     * This observer will call handleIntersection whenever the
     * element's intersection with the viewport changes.
     */
    const observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    /**
     * Start observing the element.
     * From this point on, handleIntersection will be called
     * whenever the element's visibility changes.
     */
    observer.observe(element);

    /**
     * Cleanup function to disconnect the observer.
     * This is called when:
     * - Component unmounts
     * - The ref changes to a different element
     * - Any of the options change
     */
    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce]); // Re-run if options change

  return [ref, entry];
}
