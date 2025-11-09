/**
 * Data structure for panic error information.
 *
 * This type represents the data passed to the panic handler when an error occurs.
 * It includes the error identifier and contextual information about the error location.
 *
 * @typedef {Object} PanicData
 *
 * @example
 * ```typescript
 * const panicData: PanicData = {
 *   id: PanicId.InvalidPath,
 *   context: {
 *     rootPath: '/path/to/project',
 *     path: '/invalid/path'
 *   }
 * };
 * ```
 */
export type PanicData = {
  /**
   * Unique identifier for the panic error.
   *
   * This ID corresponds to a specific error condition and is used
   * to determine the appropriate error message.
   */
  id: string;

  /**
   * Contextual information about the error location.
   */
  context: {
    /**
     * Root path of the project or operation.
     *
     * Typically the base directory where the operation was attempted.
     */
    rootPath: string;

    /**
     * Specific path where the error occurred.
     *
     * May be the same as rootPath or a nested path within it.
     */
    path: string;
  };
};
