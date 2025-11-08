/**
 * New Line
 *
 * @description
 * Outputs one or more blank lines to the console.
 * Useful for adding vertical spacing between prompts or messages to improve readability.
 * Similar to Laravel's newLine() function.
 *
 * @param {number} count - Number of blank lines to output (default: 1)
 *
 * @example
 * ```typescript
 * // Output a single blank line
 * newLine();
 * ```
 *
 * @example
 * ```typescript
 * // Output multiple blank lines for better spacing
 * console.log('Section 1');
 * newLine(3);
 * console.log('Section 2');
 * ```
 *
 * @example
 * ```typescript
 * // Use between prompts for better UX
 * const name = await text('What is your name?');
 * newLine();
 * const email = await text('What is your email?');
 * newLine(2);
 * success('Registration complete!');
 * ```
 */
export function newLine(count: number = 1): void {
  if (count <= 0) return;

  for (let i = 0; i < count; i++) {
    console.log();
  }
}
