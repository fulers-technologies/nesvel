'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook that tracks whether a component has been mounted.
 *
 * This hook is essential for preventing hydration mismatches in SSR applications
 * by allowing you to defer rendering of client-only content until after the
 * component has mounted. It's particularly useful for components that rely on
 * browser APIs or need to show different content on the server vs. client.
 *
 * @returns Boolean indicating whether the component has mounted
 *
 * @example
 * ```tsx
 * function ClientOnlyComponent() {
 *   const mounted = useMounted()
 *
 *   // Don't render anything during SSR
 *   if (!mounted) return null
 *
 *   return <div>This only renders on the client</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Prevent hydration mismatch with localStorage
 * function ThemeToggle() {
 *   const mounted = useMounted()
 *   const [theme, setTheme] = useState("light")
 *
 *   useEffect(() => {
 *     if (mounted) {
 *       const savedTheme = localStorage.getItem("theme") || "light"
 *       setTheme(savedTheme)
 *     }
 *   }, [mounted])
 *
 *   if (!mounted) {
 *     // Return a placeholder during SSR to prevent layout shift
 *     return <div className="w-10 h-10" />
 *   }
 *
 *   return (
 *     <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
 *       {theme === "light" ? "🌞" : "🌙"}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditionally render browser-specific features
 * function BrowserFeature() {
 *   const mounted = useMounted()
 *
 *   if (!mounted) {
 *     return <div>Loading...</div>
 *   }
 *
 *   return (
 *     <div>
 *       <p>User Agent: {navigator.userAgent}</p>
 *       <p>Screen Width: {window.innerWidth}px</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Delay animation until after mount
 * function AnimatedBanner() {
 *   const mounted = useMounted()
 *
 *   return (
 *     <div
 *       className={mounted ? "animate-fade-in" : "opacity-0"}
 *     >
 *       Welcome!
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Use with other client-only hooks
 * function ResponsiveComponent() {
 *   const mounted = useMounted()
 *   const { width } = useWindowSize()
 *
 *   if (!mounted) {
 *     // Return SSR-safe default layout
 *     return <DefaultLayout />
 *   }
 *
 *   return width < 768 ? <MobileLayout /> : <DesktopLayout />
 * }
 * ```
 *
 * @remarks
 * - Returns `false` during SSR and on first render
 * - Returns `true` after the component has mounted on the client
 * - Essential for preventing React hydration warnings
 * - Use when you need to access browser-only APIs (window, document, localStorage, etc.)
 * - Helps avoid "window is not defined" errors in SSR
 * - Consider showing a loading state or placeholder when `mounted` is false
 * - The state updates synchronously after the first render completes
 */
export function useMounted(): boolean {
  /**
   * Initialize state with false.
   * This represents the "not yet mounted" state during SSR
   * and the initial client-side render.
   */
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Set mounted to true after the component mounts.
     * This runs only on the client after the first render,
     * ensuring that we're past the SSR/hydration phase.
     *
     * The effect runs after the DOM has been updated and painted,
     * making it safe to access browser APIs and perform client-only logic.
     */
    setMounted(true);

    /**
     * No cleanup needed - the mounted state should remain true
     * for the lifetime of the component. We don't reset it on unmount
     * because the component will be removed from the DOM anyway.
     */
  }, []); // Empty dependency array - only run once after mount

  return mounted;
}
