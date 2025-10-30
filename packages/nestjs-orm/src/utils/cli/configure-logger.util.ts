/**
 * Available log levels
 *
 * @constant
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  LOG: 'log',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
} as const;

/**
 * Configure CLI Logger
 *
 * Sets up the logger configuration based on environment variables
 * and command-line flags for appropriate verbosity levels.
 *
 * @remarks
 * Configuration priority (highest to lowest):
 * 1. Command-line flags (--verbose, --quiet, --debug)
 * 2. Environment variables (VERBOSE, LOG_LEVEL, DEBUG)
 * 3. NODE_ENV defaults
 *
 * @example
 * ```typescript
 * // Configure at CLI startup
 * configureLogger();
 *
 * // Now logger respects verbosity settings
 * logger.debug('This will only show in verbose mode');
 * ```
 */
export function configureLogger(): void {
  // Check for verbose flag
  if (process.argv.includes('--verbose') || process.env.VERBOSE === 'true') {
    process.env.LOG_LEVEL = LOG_LEVELS.DEBUG;
  }

  // Check for debug flag
  if (process.argv.includes('--debug') || process.env.DEBUG === 'true') {
    process.env.LOG_LEVEL = LOG_LEVELS.VERBOSE;
  }

  // Check for quiet flag
  if (process.argv.includes('--quiet') || process.env.QUIET === 'true') {
    process.env.LOG_LEVEL = LOG_LEVELS.ERROR;
  }

  // Disable colors in CI environments or when explicitly requested
  if (process.env.CI === 'true' || process.env.NO_COLOR === 'true') {
    process.env.FORCE_COLOR = '0';
    process.env.NO_COLOR = 'true';
  }

  // Set default log level based on environment if not already set
  if (!process.env.LOG_LEVEL) {
    const nodeEnv = process.env.NODE_ENV || 'development';
    switch (nodeEnv) {
      case 'production':
        process.env.LOG_LEVEL = LOG_LEVELS.WARN;
        break;
      case 'test':
        process.env.LOG_LEVEL = LOG_LEVELS.ERROR;
        break;
      case 'development':
      default:
        process.env.LOG_LEVEL = LOG_LEVELS.LOG;
        break;
    }
  }
}

/**
 * Get current log level
 *
 * Returns the currently configured log level.
 *
 * @returns Current log level string
 *
 * @example
 * ```typescript
 * const level = getLogLevel();
 * console.log('Current log level:', level);
 * ```
 */
export function getLogLevel(): string {
  return process.env.LOG_LEVEL || LOG_LEVELS.LOG;
}

/**
 * Set log level
 *
 * Programmatically set the log level.
 *
 * @param level - The log level to set
 *
 * @example
 * ```typescript
 * setLogLevel('debug');
 * ```
 */
export function setLogLevel(level: string): void {
  process.env.LOG_LEVEL = level;
}

/**
 * Check if verbose mode is enabled
 *
 * @returns True if verbose or debug mode is enabled
 *
 * @example
 * ```typescript
 * if (isVerbose()) {
 *   console.log('Detailed debug information...');
 * }
 * ```
 */
export function isVerbose(): boolean {
  const level = getLogLevel();
  return level === LOG_LEVELS.DEBUG || level === LOG_LEVELS.VERBOSE;
}

/**
 * Check if colors should be disabled
 *
 * @returns True if colors should be disabled
 *
 * @example
 * ```typescript
 * if (shouldDisableColors()) {
 *   // Use plain text output
 * }
 * ```
 */
export function shouldDisableColors(): boolean {
  return process.env.NO_COLOR === 'true' || process.env.FORCE_COLOR === '0';
}

/**
 * Valid NestJS log levels
 */
import { LogLevel } from '@/enums';

/**
 * @deprecated Use LogLevel enum instead
 */
export type LogLevelType = LogLevel;

/**
 * Get logger options for NestJS
 *
 * Returns logger options suitable for NestJS CommandFactory or application bootstrap.
 *
 * @returns Array of enabled log levels
 *
 * @example
 * ```typescript
 * const loggerOptions = getLoggerOptions();
 * await CommandFactory.run(ConsoleModule, {
 *   logger: loggerOptions,
 * });
 * ```
 */
export function getLoggerOptions(): LogLevelType[] {
  const level = getLogLevel();

  switch (level) {
    case LOG_LEVELS.ERROR:
      return ['error'];
    case LOG_LEVELS.WARN:
      return ['error', 'warn'];
    case LOG_LEVELS.LOG:
      return ['error', 'warn', 'log'];
    case LOG_LEVELS.DEBUG:
      return ['error', 'warn', 'log', 'debug'];
    case LOG_LEVELS.VERBOSE:
      return ['error', 'warn', 'log', 'debug', 'verbose'];
    default:
      return ['error', 'warn', 'log'];
  }
}

/**
 * Enable timestamp in logs
 *
 * Configures whether timestamps should be included in log output.
 *
 * @param enabled - Whether to enable timestamps
 *
 * @example
 * ```typescript
 * enableTimestamp(true);
 * ```
 */
export function enableTimestamp(enabled: boolean): void {
  process.env.LOG_TIMESTAMP = enabled ? 'true' : 'false';
}

/**
 * Check if timestamps are enabled
 *
 * @returns True if timestamps should be included in logs
 *
 * @example
 * ```typescript
 * if (isTimestampEnabled()) {
 *   // Include timestamp in custom log formatting
 * }
 * ```
 */
export function isTimestampEnabled(): boolean {
  return process.env.LOG_TIMESTAMP === 'true';
}
