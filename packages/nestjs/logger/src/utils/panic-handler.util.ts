import { PanicId } from '@enums/panic-id.enum';
import type { PanicData, PanicResponse } from '@/types';

/**
 * Handles panic errors and returns appropriate error messages.
 *
 * This utility function processes panic errors by matching the error ID
 * to a specific error condition and generating a contextual error message.
 * It's designed to provide clear, actionable feedback to users when
 * critical errors occur during logger initialization or project setup.
 *
 * The handler uses a switch statement to map panic IDs to specific error
 * messages, incorporating contextual information (paths, project names, etc.)
 * to make the errors more meaningful and actionable.
 *
 * @param {PanicData} panicData - Object containing panic ID and context information
 * @returns {PanicResponse} Object containing the formatted error message
 *
 * @example
 * ```typescript
 * // Handle invalid project name
 * const result = panicHandler({
 *   id: PanicId.InvalidProjectName,
 *   context: {
 *     rootPath: 'https://example.com',
 *     path: ''
 *   }
 * });
 * console.error(result.message);
 * // Output: "Looks like you provided a URL as your project name..."
 * ```
 *
 * @example
 * ```typescript
 * // Handle invalid path
 * const result = panicHandler({
 *   id: PanicId.InvalidPath,
 *   context: {
 *     rootPath: '/project',
 *     path: '/invalid/path'
 *   }
 * });
 * console.error(result.message);
 * // Output: "Could not create project because /invalid/path is not a valid path."
 * ```
 */
export const panicHandler = (
  panicData: PanicData = {} as PanicData
): PanicResponse => {
  const { id, context } = panicData;

  // Match panic ID to specific error condition and generate appropriate message
  switch (id) {
    // User provided a URL instead of a project name
    case PanicId.InvalidProjectName:
      return {
        message: `Looks like you provided a URL as your project name. Try "medusa new my-medusa-store ${context.rootPath}" instead.`,
      };

    // Specified path is invalid or inaccessible
    case PanicId.InvalidPath:
      return {
        message: `Could not create project because ${context.path} is not a valid path.`,
      };

    // Target directory already contains a Node.js project
    case PanicId.AlreadyNodeProject:
      return {
        message: `Directory ${context.rootPath} is already a Node project.`,
      };

    // Fallback for unknown or unhandled panic IDs
    default:
      return {
        message: 'Unknown error',
      };
  }
};
