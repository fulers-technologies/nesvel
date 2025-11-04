import { Logger } from '@nestjs/common';
import { handleError } from './handle-error.util';

/**
 * Global logger for error handling
 *
 * @constant
 * @private
 */
const logger = new Logger('NesvelORM-CLI');

/**
 * Setup Global Error Handlers
 *
 * Configures process-level error handlers to catch unhandled rejections,
 * uncaught exceptions, and process signals, ensuring graceful error reporting
 * and cleanup.
 *
 * @remarks
 * This function sets up handlers for:
 * - Unhandled Promise rejections
 * - Uncaught exceptions
 * - SIGINT (Ctrl+C) for user interruption
 * - SIGTERM for graceful shutdown
 *
 * Should be called early in the CLI bootstrap process, before any
 * async operations are performed.
 *
 * @example
 * ```typescript
 * // Setup at the beginning of CLI bootstrap
 * setupErrorHandlers();
 *
 * // Now all unhandled errors will be caught
 * await runCommand();
 * ```
 */
export function setupErrorHandlers(): void {
  /**
   * Handle unhandled promise rejections
   *
   * Catches promises that reject without a .catch() handler
   * to prevent silent failures and provide better error visibility.
   *
   * @param reason - The rejection reason (error or value)
   */
  process.on('unhandledRejection', (reason: any) => {
    handleError(reason, 'Unhandled Promise Rejection', logger);
  });

  /**
   * Handle uncaught exceptions
   *
   * Catches synchronous errors that weren't caught by try-catch blocks.
   * This is a last-resort error handler.
   *
   * @param error - The uncaught error
   */
  process.on('uncaughtException', (error: Error) => {
    handleError(error, 'Uncaught Exception', logger);
  });

  /**
   * Handle SIGINT (Ctrl+C) for graceful shutdown
   *
   * Allows users to interrupt long-running commands cleanly
   * with Ctrl+C, providing feedback that the operation was cancelled.
   */
  process.on('SIGINT', () => {
    logger.log('\n\n⚠️  Operation interrupted by user (SIGINT)');
    logger.log('   Cleaning up and exiting...');
    process.exit(130); // Standard exit code for SIGINT (128 + 2)
  });

  /**
   * Handle SIGTERM for graceful shutdown
   *
   * Responds to termination signals from the OS or process managers
   * (like Docker, systemd, etc.), allowing for cleanup before exit.
   */
  process.on('SIGTERM', () => {
    logger.log('\n\n⚠️  Operation terminated (SIGTERM)');
    logger.log('   Cleaning up and exiting...');
    process.exit(143); // Standard exit code for SIGTERM (128 + 15)
  });

  /**
   * Handle uncaught exceptions in rejected promises (Node.js warning)
   *
   * This event is emitted when a Promise is rejected and no error handler
   * is attached to the promise within a turn of the event loop.
   */
  process.on('rejectionHandled', (promise: Promise<any>) => {
    logger.warn('⚠️  Promise rejection was handled late:', promise);
  });

  /**
   * Handle warnings from Node.js
   *
   * Useful for catching deprecation warnings and other Node.js warnings
   * during development.
   */
  if (process.env.NODE_ENV === 'development' || process.env.VERBOSE === 'true') {
    process.on('warning', (warning: Error) => {
      logger.warn('⚠️  Node.js Warning:');
      logger.warn(`   Name: ${warning.name}`);
      logger.warn(`   Message: ${warning.message}`);
      if (warning.stack) {
        logger.warn(`   Stack: ${warning.stack}`);
      }
    });
  }
}

/**
 * Remove Global Error Handlers
 *
 * Removes all error handlers that were set up by setupErrorHandlers().
 * Useful for testing or when you need to clean up handlers.
 *
 * @example
 * ```typescript
 * setupErrorHandlers();
 * // ... do work ...
 * removeErrorHandlers();
 * ```
 */
export function removeErrorHandlers(): void {
  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('SIGINT');
  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('rejectionHandled');
  process.removeAllListeners('warning');
}

/**
 * Setup error handlers with custom handler function
 *
 * Allows providing a custom error handler function instead of using
 * the default handleError function.
 *
 * @param customHandler - Custom error handling function
 *
 * @example
 * ```typescript
 * setupErrorHandlersWithCustomHandler((error, context) => {
 *   // Custom error handling logic
 *   console.error(`Custom handler: ${context}`, error);
 *   process.exit(1);
 * });
 * ```
 */
export function setupErrorHandlersWithCustomHandler(
  customHandler: (error: any, context: string) => void,
): void {
  process.on('unhandledRejection', (reason: any) => {
    customHandler(reason, 'Unhandled Promise Rejection');
  });

  process.on('uncaughtException', (error: Error) => {
    customHandler(error, 'Uncaught Exception');
  });

  process.on('SIGINT', () => {
    logger.log('\n\n⚠️  Operation interrupted by user (SIGINT)');
    process.exit(130);
  });

  process.on('SIGTERM', () => {
    logger.log('\n\n⚠️  Operation terminated (SIGTERM)');
    process.exit(143);
  });
}
