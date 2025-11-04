/**
 * Log Level Enum
 *
 * Defines the severity levels for application logging. These levels determine
 * which messages are logged based on their importance and the configured
 * logging threshold.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum LogLevel {
  /**
   * General informational messages
   * Default level for standard application events
   */
  LOG = 'log',

  /**
   * Error conditions that need attention
   * Indicates failures or exceptions that occurred
   */
  ERROR = 'error',

  /**
   * Warning messages for potentially harmful situations
   * Issues that don't prevent operation but should be reviewed
   */
  WARN = 'warn',

  /**
   * Detailed debugging information
   * Used during development and troubleshooting
   */
  DEBUG = 'debug',

  /**
   * Very detailed diagnostic information
   * More granular than debug, useful for tracing execution flow
   */
  VERBOSE = 'verbose',

  /**
   * Fatal errors that cause application termination
   * Critical failures that require immediate attention
   */
  FATAL = 'fatal',
}
