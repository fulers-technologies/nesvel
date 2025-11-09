/**
 * Log level enumeration.
 *
 * Defines the severity levels for logging operations using Winston's NPM log levels.
 * Levels are ordered from most verbose (SILLY) to least verbose (ERROR).
 *
 * Winston NPM Levels:
 * - error: 0
 * - warn: 1
 * - info: 2
 * - http: 3 (default)
 * - verbose: 4
 * - debug: 5
 * - silly: 6
 *
 * @enum {string}
 *
 * @example
 * ```typescript
 * import { LogLevel } from '@enums/log-level.enum';
 *
 * // Use in configuration
 * const config = {
 *   level: LogLevel.INFO
 * };
 *
 * // Use in logging
 * logger.warn('Warning message');
 * ```
 */
export enum LogLevel {
  /**
   * Error level (0) - Error messages.
   * Use for error events that might still allow the application to continue.
   */
  ERROR = 'error',

  /**
   * Warn level (1) - Warning messages.
   * Use for potentially harmful situations or deprecation warnings.
   */
  WARN = 'warn',

  /**
   * Info level (2) - Informational messages.
   * Use for general informational messages about application operation.
   */
  INFO = 'info',

  /**
   * HTTP level (3) - HTTP request/response logging.
   * Default level. Use for logging HTTP requests and responses.
   */
  HTTP = 'http',

  /**
   * Verbose level (4) - Verbose informational messages.
   * Use for detailed operational information.
   */
  VERBOSE = 'verbose',

  /**
   * Debug level (5) - Detailed debugging information.
   * Use for diagnostic information useful during development.
   */
  DEBUG = 'debug',

  /**
   * Silly level (6) - Most verbose logging.
   * Use for extremely detailed debugging information.
   */
  SILLY = 'silly',
}
