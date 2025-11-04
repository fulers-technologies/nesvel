import { LogLevel } from '@/enums/log-level.enum';

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
    process.env.LOG_LEVEL = LogLevel.DEBUG;
  }

  // Check for debug flag
  if (process.argv.includes('--debug') || process.env.DEBUG === 'true') {
    process.env.LOG_LEVEL = LogLevel.VERBOSE;
  }

  // Check for quiet flag
  if (process.argv.includes('--quiet') || process.env.QUIET === 'true') {
    process.env.LOG_LEVEL = LogLevel.ERROR;
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
        process.env.LOG_LEVEL = LogLevel.WARN;
        break;
      case 'test':
        process.env.LOG_LEVEL = LogLevel.ERROR;
        break;
      case 'development':
      default:
        process.env.LOG_LEVEL = LogLevel.LOG;
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
  return process.env.LOG_LEVEL || LogLevel.LOG;
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
  return level === LogLevel.DEBUG || level === LogLevel.VERBOSE;
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
export function getLoggerOptions(): LogLevel[] {
  const level = getLogLevel();

  switch (level) {
    case LogLevel.ERROR:
      return [LogLevel.ERROR];
    case LogLevel.WARN:
      return [LogLevel.ERROR, LogLevel.WARN];
    case LogLevel.LOG:
      return [LogLevel.ERROR, LogLevel.WARN, LogLevel.LOG];
    case LogLevel.DEBUG:
      return [LogLevel.ERROR, LogLevel.WARN, LogLevel.LOG, LogLevel.DEBUG];
    case LogLevel.VERBOSE:
      return [LogLevel.ERROR, LogLevel.WARN, LogLevel.LOG, LogLevel.DEBUG, LogLevel.VERBOSE];
    default:
      return [LogLevel.ERROR, LogLevel.WARN, LogLevel.LOG];
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
