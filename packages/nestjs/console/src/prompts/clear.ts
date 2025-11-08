/**
 * Clear Console
 *
 * @description
 * Clears the terminal screen, providing a clean slate for output.
 * Uses ANSI escape codes for cross-platform compatibility.
 *
 * @param {boolean} showCursor - Whether to show cursor after clearing (default: true)
 *
 * @example
 * ```typescript
 * // Clear the screen before showing new content
 * clear();
 * console.log('Fresh start!');
 * ```
 *
 * @example
 * ```typescript
 * // Clear and hide cursor
 * clear(false);
 * ```
 */
export function clear(showCursor: boolean = true): void {
  // ANSI escape codes:
  // \x1Bc - Reset terminal (most reliable clear)
  // \x1B[2J - Clear entire screen
  // \x1B[0f - Move cursor to top-left
  // \x1B[?25h - Show cursor
  // \x1B[?25l - Hide cursor

  const clearSequence = '\x1Bc';
  const cursorSequence = showCursor ? '\x1B[?25h' : '\x1B[?25l';

  process.stdout.write(clearSequence + cursorSequence);
}

/**
 * Clear Line
 *
 * @description
 * Clears the current line in the terminal without clearing the entire screen.
 * Useful for updating progress indicators or status messages.
 *
 * @example
 * ```typescript
 * process.stdout.write('Loading...');
 * clearLine();
 * process.stdout.write('Done!');
 * ```
 */
export function clearLine(): void {
  // ANSI escape codes:
  // \r - Move cursor to beginning of line
  // \x1B[K - Clear from cursor to end of line
  process.stdout.write('\r\x1B[K');
}

/**
 * Clear Lines
 *
 * @description
 * Clears a specific number of lines above the cursor position.
 * Useful for updating multi-line output or replacing previous content.
 *
 * @param {number} count - Number of lines to clear
 *
 * @example
 * ```typescript
 * console.log('Line 1');
 * console.log('Line 2');
 * console.log('Line 3');
 * clearLines(3);
 * console.log('All cleared!');
 * ```
 */
export function clearLines(count: number): void {
  if (count <= 0) return;

  // Move cursor up and clear each line
  for (let i = 0; i < count; i++) {
    // \x1B[1A - Move cursor up one line
    // \x1B[2K - Clear entire line
    process.stdout.write('\x1B[1A\x1B[2K');
  }
  // Move cursor to beginning of line
  process.stdout.write('\r');
}
