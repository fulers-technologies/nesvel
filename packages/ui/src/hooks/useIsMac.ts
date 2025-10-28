"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook that detects if the user is on a macOS/Mac device.
 *
 * This hook is useful for customizing UI elements or keyboard shortcuts
 * based on the operating system. For example, showing "⌘" instead of "Ctrl"
 * for keyboard shortcuts on Mac devices.
 *
 * @returns Boolean indicating whether the user is on a Mac device
 *
 * @example
 * ```tsx
 * function KeyboardShortcut() {
 *   const isMac = useIsMac()
 *
 *   return (
 *     <div>
 *       Press {isMac ? "⌘" : "Ctrl"}+K to open search
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Show platform-specific instructions
 * function InstallInstructions() {
 *   const isMac = useIsMac()
 *
 *   return (
 *     <div>
 *       {isMac ? (
 *         <p>Press Command+Space to open Spotlight</p>
 *       ) : (
 *         <p>Press Windows key to open Start Menu</p>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Platform-specific download button
 * function DownloadButton() {
 *   const isMac = useIsMac()
 *
 *   return (
 *     <button>
 *       Download for {isMac ? "macOS" : "Windows"}
 *     </button>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Returns `true` during SSR to prevent layout shift (assumes Mac by default)
 * - Detection is based on `navigator.platform` which includes "Mac" for macOS devices
 * - Covers MacBooks, iMacs, Mac Minis, Mac Pros, and other Apple computers
 * - Does not detect iOS devices (iPhone/iPad) - use a separate hook for mobile detection
 * - The detection happens on mount and doesn't update during the session
 */
export function useIsMac(): boolean {
  /**
   * Initialize state with true for SSR compatibility.
   * This prevents hydration mismatches and layout shifts.
   * We assume Mac by default since it's common in development.
   */
  const [isMac, setIsMac] = useState<boolean>(true)

  useEffect(() => {
    /**
     * Check if we're in a browser environment.
     * During SSR, navigator will be undefined.
     */
    if (typeof navigator === "undefined") {
      return
    }

    /**
     * Detect Mac platform using navigator.platform.
     * This checks for various Mac platform strings:
     * - "MacIntel" (Intel-based Macs)
     * - "MacPPC" (PowerPC Macs, legacy)
     * - "Mac68K" (Motorola 68k Macs, very legacy)
     *
     * We use toUpperCase() to handle case variations and
     * includes() to match any platform string containing "MAC".
     */
    const isMacPlatform = navigator.platform.toUpperCase().includes("MAC")

    setIsMac(isMacPlatform)
  }, []) // Empty dependency array - only run once on mount

  return isMac
}
