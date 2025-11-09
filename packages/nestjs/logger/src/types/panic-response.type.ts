/**
 * Response structure returned by the panic handler.
 *
 * Contains the formatted error message based on the panic ID and context.
 * This type represents the result of processing a panic error, providing
 * a human-readable message that can be displayed to users or logged.
 *
 * @typedef {Object} PanicResponse
 *
 * @example
 * ```typescript
 * const response: PanicResponse = {
 *   message: 'Could not create project because /invalid/path is not a valid path.'
 * };
 * console.error(response.message);
 * ```
 */
export type PanicResponse = {
  /**
   * Human-readable error message describing the panic condition.
   *
   * This message is contextually generated based on the panic ID and
   * includes relevant path information or other context to help users
   * understand and resolve the error.
   */
  message: string;
};
