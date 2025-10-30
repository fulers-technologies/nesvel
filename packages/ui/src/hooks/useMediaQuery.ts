'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to track media query matches in a React component.
 *
 * This hook provides a way to respond to CSS media queries in JavaScript,
 * enabling responsive behavior based on viewport size, device capabilities,
 * or user preferences.
 *
 * @param query - A valid CSS media query string (e.g., "(min-width: 768px)")
 * @returns A boolean indicating whether the media query currently matches
 *
 * @example
 * ```tsx
 * // Check if viewport is mobile size
 * const isMobile = useMediaQuery("(max-width: 768px)")
 *
 * // Check if user prefers dark mode
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
 *
 * // Check for high-resolution displays
 * const isRetina = useMediaQuery("(min-resolution: 2dppx)")
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileLayout /> : <DesktopLayout />}
 *   </div>
 * )
 * ```
 *
 * @remarks
 * - Returns `false` during server-side rendering to prevent hydration mismatches
 * - Automatically updates when the media query match status changes
 * - Cleans up event listeners when component unmounts
 * - Uses `window.matchMedia` API under the hood
 */
export function useMediaQuery(query: string): boolean {
  /**
   * Initialize state with false for SSR compatibility.
   * This prevents hydration mismatches between server and client.
   */
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Check if window is available (client-side only).
     * This guard prevents errors during server-side rendering.
     */
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Create a MediaQueryList object for the provided query.
     * This object allows us to check the current match status
     * and listen for changes.
     */
    const mediaQueryList = window.matchMedia(query);

    /**
     * Handler function that updates state when the media query match changes.
     * This will be called initially and whenever the match status changes.
     *
     * @param event - MediaQueryListEvent containing the new match status
     */
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    /**
     * Set the initial match status.
     * This ensures the state reflects the current media query status
     * on mount and after SSR hydration.
     */
    setMatches(mediaQueryList.matches);

    /**
     * Add event listener for media query changes.
     * Modern browsers use addEventListener, but we check for
     * the deprecated addListener for older browser support.
     */
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers (Safari < 14)
      mediaQueryList.addListener(handleChange);
    }

    /**
     * Cleanup function to remove event listener when component unmounts
     * or when the query changes. This prevents memory leaks.
     */
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers (Safari < 14)
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]); // Re-run effect if query changes

  return matches;
}
