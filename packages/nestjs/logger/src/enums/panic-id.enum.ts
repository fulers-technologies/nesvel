/**
 * Enumeration of panic error identifiers.
 *
 * Each panic ID represents a specific error condition that can occur
 * during logger initialization or project setup. These IDs are used
 * by the panic handler to provide contextual error messages.
 *
 * @enum {string}
 *
 * @example
 * ```typescript
 * throw new Error(PanicId.InvalidProjectName);
 * ```
 */
export enum PanicId {
  /**
   * Error code when a URL is provided as project name instead of a valid name.
   *
   * This occurs when users mistakenly pass a URL where a project name is expected.
   */
  InvalidProjectName = '10000',

  /**
   * Error code when the specified path is invalid or inaccessible.
   *
   * This occurs when attempting to create or access a project at a path
   * that doesn't exist or cannot be accessed.
   */
  InvalidPath = '10002',

  /**
   * Error code when attempting to initialize in an existing Node project.
   *
   * This occurs when the target directory already contains a package.json
   * or other Node.js project indicators.
   */
  AlreadyNodeProject = '10003',
}
