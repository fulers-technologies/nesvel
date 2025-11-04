import { Logger } from '@nestjs/common';

/**
 * CLI Error Handler
 *
 * Handles uncaught errors during CLI execution and provides
 * user-friendly error messages with debugging information based
 * on the current environment and verbosity settings.
 *
 * @param error - The error object to handle (Error instance or any other type)
 * @param context - Additional context describing where the error occurred
 * @param logger - Optional logger instance (creates new one if not provided)
 *
 * @remarks
 * - In development or verbose mode, displays full stack traces
 * - In production, shows simplified error messages
 * - Always exits the process with error code 1
 * - Handles both Error instances and other thrown values
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error: Error | any) {
 *   handleError(error, 'Database Migration');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom logger
 * const customLogger = new Logger('MyCommand');
 * handleError(new Error('Failed'), 'Command Execution', customLogger);
 * ```
 */
export function handleError(error: Error | any, context = 'CLI Execution', logger?: Logger): void {
  const log = logger || new Logger('NesvelORM-CLI');

  // Display error context
  log.error(`[${context}] Fatal error occurred:`);

  // Handle Error instances
  if (error instanceof Error) {
    log.error(`  Message: ${error.message}`);

    // Show stack trace in verbose mode or development environment
    const shouldShowStack =
      process.env.VERBOSE === 'true' ||
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG === 'true';

    if (shouldShowStack && error.stack) {
      log.error(`  Stack: ${error.stack}`);
    } else {
      log.error('  (Use --verbose flag or set NODE_ENV=development for stack trace)');
    }

    // Show error name if it's not a generic Error
    if (error.name && error.name !== 'Error') {
      log.error(`  Type: ${error.name}`);
    }

    // Show error code if available (e.g., from database errors)
    if ('code' in error && error.code) {
      log.error(`  Code: ${error.code}`);
    }
  } else {
    // Handle non-Error thrown values
    log.error(`  ${String(error)}`);
  }

  // Exit with error code
  process.exit(1);
}

/**
 * Create a CLI-friendly error message
 *
 * Formats an error message with consistent styling for CLI output.
 * Does not exit the process - useful for non-fatal errors.
 *
 * @param message - The error message to format
 * @param details - Optional additional details
 * @returns Formatted error message string
 *
 * @example
 * ```typescript
 * const errorMsg = formatErrorMessage(
 *   'Migration failed',
 *   'Table "users" already exists'
 * );
 * console.error(errorMsg);
 * ```
 */
export function formatErrorMessage(message: string, details?: string): string {
  let formatted = `❌ ${message}`;
  if (details) {
    formatted += `\n   ${details}`;
  }
  return formatted;
}

/**
 * Wrap an async function with error handling
 *
 * Higher-order function that wraps an async function with automatic
 * error handling, useful for CLI command handlers.
 *
 * @param fn - Async function to wrap
 * @param context - Error context for better error messages
 * @param logger - Optional logger instance
 * @returns Wrapped function with error handling
 *
 * @example
 * ```typescript
 * const safeCommand = withErrorHandling(
 *   async () => {
 *     await runMigrations();
 *   },
 *   'Migration Execution'
 * );
 *
 * await safeCommand();
 * ```
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  logger?: Logger,
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error: Error | any) {
      handleError(error, context, logger);
    }
  }) as T;
}
