'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook that detects if the viewport width is below the mobile breakpoint.
 *
 * This hook provides a simple boolean to determine if the user is viewing
 * the site on a mobile-sized screen. It automatically updates when the
 * window is resized, making it ideal for responsive components.
 *
 * @param mobileBreakpoint - The maximum width in pixels to consider mobile (default: 768)
 * @returns Boolean indicating whether the viewport is mobile-sized
 *
 * @example
 * ```tsx
 * function ResponsiveNavigation() {
 *   const isMobile = useIsMobile()
 *
 *   return isMobile ? <MobileMenu /> : <DesktopMenu />
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom breakpoint for tablet detection
 * function ResponsiveLayout() {
 *   const isMobile = useIsMobile(640)  // Mobile: < 640px
 *   const isTablet = useIsMobile(1024) // Tablet: < 1024px
 *
 *   if (isMobile) return <MobileLayout />
 *   if (isTablet) return <TabletLayout />
 *   return <DesktopLayout />
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional rendering based on screen size
 * function DataTable({ data }) {
 *   const isMobile = useIsMobile()
 *
 *   return isMobile ? (
 *     <CardList data={data} />
 *   ) : (
 *     <Table data={data} />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Adjust component behavior for mobile
 * function Gallery({ images }) {
 *   const isMobile = useIsMobile()
 *
 *   return (
 *     <div
 *       style={{
 *         display: "grid",
 *         gridTemplateColumns: isMobile
 *           ? "1fr"
 *           : "repeat(3, 1fr)",
 *         gap: isMobile ? "1rem" : "2rem"
 *       }}
 *     >
 *       {images.map(img => <img key={img.id} src={img.url} />)}
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Returns `false` during SSR to prevent hydration mismatches
 * - Uses `window.matchMedia` and window resize for efficient updates
 * - Default breakpoint of 768px aligns with common mobile/tablet boundary
 * - Automatically cleans up event listeners on unmount
 * - Consider using `useMediaQuery` for more complex media query needs
 * - For better performance with frequent updates, combine with `useDebounce`
 */
export function useIsMobile(mobileBreakpoint: number = 768): boolean {
  /**
   * Initialize state with undefined to detect initial mount.
   * This prevents hydration mismatches during SSR.
   */
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Early return if we're not in a browser environment.
     * During SSR, window will be undefined.
     */
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Create a media query list for the mobile breakpoint.
     * We subtract 1 from the breakpoint to make it exclusive:
     * - Mobile: width < mobileBreakpoint
     * - Desktop: width >= mobileBreakpoint
     */
    const mediaQueryList = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);

    /**
     * Handler function that updates the mobile state.
     * This is called initially and whenever the media query match changes.
     */
    const handleChange = () => {
      /**
       * Use window.innerWidth for the check to ensure consistency
       * with the media query and handle edge cases.
       */
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    /**
     * Add event listener for media query changes.
     * Modern approach using addEventListener.
     */
    mediaQueryList.addEventListener('change', handleChange);

    /**
     * Set the initial mobile state immediately.
     * This ensures the state is correct right after mounting.
     */
    handleChange();

    /**
     * Cleanup function to remove the event listener.
     * This prevents memory leaks when the component unmounts.
     */
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [mobileBreakpoint]); // Re-run if breakpoint changes

  return isMobile;
}
