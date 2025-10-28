"use client"

import { useState } from "react"

/**
 * State returned by the useCopyToClipboard hook.
 */
type CopyState = {
  /** The value that was copied (null if nothing has been copied yet) */
  copiedValue: string | null
  /** Whether the copy operation succeeded */
  success: boolean
  /** Error that occurred during copy (null if no error) */
  error: Error | null
}

/**
 * Custom hook for copying text to the clipboard with feedback.
 *
 * This hook provides a simple interface for copying text to the user's clipboard
 * using the modern Clipboard API with fallback for older browsers. It tracks
 * the copy state including success/failure and any errors that occur.
 *
 * @returns A tuple containing the copy state and a copy function
 *
 * @example
 * ```tsx
 * function CopyButton({ text }) {
 *   const [copyState, copy] = useCopyToClipboard()
 *
 *   const handleCopy = async () => {
 *     await copy(text)
 *   }
 *
 *   return (
 *     <button onClick={handleCopy}>
 *       {copyState.success ? "Copied!" : "Copy"}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With toast notification
 * function ShareButton({ url }) {
 *   const [copyState, copy] = useCopyToClipboard()
 *   const toast = useToast()
 *
 *   const handleShare = async () => {
 *     const success = await copy(url)
 *     if (success) {
 *       toast.success("Link copied to clipboard!")
 *     } else {
 *       toast.error("Failed to copy link")
 *     }
 *   }
 *
 *   return <button onClick={handleShare}>Share</button>
 * }
 * ```
 *
 * @remarks
 * - Uses the modern Clipboard API (navigator.clipboard) when available
 * - Falls back to document.execCommand for older browsers
 * - Requires HTTPS or localhost for clipboard access (browser security)
 * - Returns a promise that resolves to the success status
 */
export function useCopyToClipboard(): [
  CopyState,
  (text: string) => Promise<boolean>
] {
  /**
   * State to track the copy operation results.
   * Includes the copied value, success status, and any error.
   */
  const [copyState, setCopyState] = useState<CopyState>({
    copiedValue: null,
    success: false,
    error: null,
  })

  /**
   * Function to copy text to the clipboard.
   *
   * Attempts to use the modern Clipboard API first, then falls back
   * to the older execCommand method if the Clipboard API is not available.
   *
   * @param text - The text string to copy to clipboard
   * @returns A promise that resolves to true if successful, false otherwise
   */
  const copy = async (text: string): Promise<boolean> => {
    /**
     * Check if we're in a browser environment.
     * During SSR, navigator will be undefined.
     */
    if (typeof navigator === "undefined") {
      setCopyState({
        copiedValue: null,
        success: false,
        error: new Error("Navigator not available (SSR)"),
      })
      return false
    }

    try {
      /**
       * Try using the modern Clipboard API first.
       * This is the preferred method and works in all modern browsers.
       * Note: Requires HTTPS or localhost for security reasons.
       */
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)

        // Update state to reflect successful copy
        setCopyState({
          copiedValue: text,
          success: true,
          error: null,
        })

        return true
      }

      /**
       * Fallback for older browsers that don't support Clipboard API.
       * Uses the deprecated document.execCommand method.
       */
      const success = await copyWithExecCommand(text)

      if (success) {
        setCopyState({
          copiedValue: text,
          success: true,
          error: null,
        })
        return true
      }

      // If fallback also failed
      throw new Error("Both clipboard methods failed")
    } catch (error) {
      /**
       * Handle any errors that occurred during the copy operation.
       * This could be due to:
       * - Browser permissions denied
       * - Insecure context (not HTTPS)
       * - Browser doesn't support clipboard access
       */
      const errorMessage =
        error instanceof Error ? error : new Error("Copy failed")

      setCopyState({
        copiedValue: null,
        success: false,
        error: errorMessage,
      })

      return false
    }
  }

  return [copyState, copy]
}

/**
 * Fallback copy method using the deprecated execCommand API.
 *
 * This method creates a temporary textarea element, selects its content,
 * and uses document.execCommand to copy. While deprecated, it still works
 * in browsers that don't support the modern Clipboard API.
 *
 * @param text - The text to copy
 * @returns Promise resolving to true if successful, false otherwise
 */
async function copyWithExecCommand(text: string): Promise<boolean> {
  /**
   * Create a temporary textarea element to hold the text.
   * We'll select this text and copy it using execCommand.
   */
  const textArea = document.createElement("textarea")

  // Set the text content
  textArea.value = text

  /**
   * Style the textarea to be invisible but still functional.
   * We need it in the DOM for the selection and copy to work,
   * but we don't want users to see it.
   */
  textArea.style.position = "fixed"
  textArea.style.top = "-9999px"
  textArea.style.left = "-9999px"
  textArea.style.opacity = "0"

  // Add to DOM
  document.body.appendChild(textArea)

  try {
    /**
     * Select the text content.
     * We need to focus the element first, then select its content.
     */
    textArea.focus()
    textArea.select()

    /**
     * Execute the copy command.
     * This is the deprecated API but works as a fallback.
     * Returns true if successful, false otherwise.
     */
    const successful = document.execCommand("copy")

    return successful
  } catch (error) {
    console.error("Fallback copy failed:", error)
    return false
  } finally {
    /**
     * Always remove the temporary textarea from the DOM,
     * whether the copy succeeded or failed.
     */
    document.body.removeChild(textArea)
  }
}
