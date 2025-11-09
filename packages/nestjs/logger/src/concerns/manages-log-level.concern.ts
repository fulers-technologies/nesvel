import { LogLevel } from '@enums/log-level.enum';

/**
 * ManagesLogLevel concern mixin.
 *
 * This concern provides methods for managing the minimum log level dynamically.
 * It allows runtime adjustment of logging verbosity without restarting the
 * application, useful for debugging production issues or adjusting log volume.
 *
 * The concern maintains the current log level and provides methods to query
 * and modify it.
 *
 * @class ManagesLogLevelConcern
 *
 * @example
 * ```typescript
 * class LoggerService extends Mixin(ManagesLogLevelConcern, OtherConcern) {
 *   // Logger service with log level management
 * }
 *
 * logger.setLogLevel(LogLevel.DEBUG);
 * logger.debug('This will now be logged');
 *
 * logger.setLogLevel(LogLevel.INFO);
 * logger.debug('This will be suppressed');
 * ```
 */
export class ManagesLogLevelConcern {
  /**
   * Current minimum log level.
   * Must be initialized by the implementing class.
   */
  protected currentLevel: LogLevel | string = LogLevel.INFO;

  /**
   * Log level priority mapping.
   * Lower numbers = higher priority (errors are more important than debug).
   */
  private readonly levelPriority: Record<string, number> = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  };

  /**
   * Determines if the logger should log at a given level.
   *
   * This method checks if messages at the specified level will be logged
   * based on the current minimum level setting. Useful for conditional
   * logging to avoid expensive operations when logs won't be output.
   *
   * @param level - The level to check if logger is configured for
   *
   * @returns Whether we should log at this level
   *
   * @example
   * ```typescript
   * if (logger.shouldLog('debug')) {
   *   const expensiveData = gatherDiagnostics();
   *   logger.debug('Diagnostics', expensiveData);
   * }
   * ```
   */
  shouldLog(level: string): boolean {
    return this.isLevelEnabled(level);
  }

  /**
   * Sets the minimum log level.
   *
   * This method updates the minimum severity level for logs. Messages below
   * this level will be suppressed. For example, setting the level to INFO
   * will suppress DEBUG and SILLY messages.
   *
   * @param level - The new minimum log level
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * // Enable verbose logging for debugging
   * logger.setLogLevel(LogLevel.DEBUG);
   *
   * // Reduce log volume in production
   * logger.setLogLevel(LogLevel.ERROR);
   * ```
   */
  setLogLevel(level: LogLevel | string): this {
    this.currentLevel = level;
    return this;
  }

  /**
   * Resets the logger to the default log level.
   *
   * This method restores the log level to INFO, which is the default level.
   * Useful for resetting after temporary debug sessions.
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.setLogLevel(LogLevel.DEBUG); // Temporary debug mode
   * // ... debugging ...
   * logger.unsetLogLevel(); // Back to INFO
   * ```
   */
  unsetLogLevel(): this {
    this.currentLevel = LogLevel.INFO;
    return this;
  }

  /**
   * Gets the current minimum log level.
   *
   * This method returns the current minimum severity level for logs.
   *
   * @returns The current log level
   *
   * @example
   * ```typescript
   * const currentLevel = logger.getLogLevel();
   * console.log(`Current log level: ${currentLevel}`);
   * ```
   */
  getLogLevel(): LogLevel | string {
    return this.currentLevel;
  }

  /**
   * Checks if a given log level is enabled.
   *
   * This method determines whether messages at the specified level will be
   * logged based on the current minimum level. Useful for conditionally
   * performing expensive operations before logging.
   *
   * @param level - The log level to check
   *
   * @returns True if the level is enabled
   *
   * @example
   * ```typescript
   * if (logger.isLevelEnabled(LogLevel.DEBUG)) {
   *   const expensiveDebugData = performExpensiveOperation();
   *   logger.debug('Debug data', expensiveDebugData);
   * }
   * ```
   */
  isLevelEnabled(level: LogLevel | string): boolean {
    const currentPriority = this.levelPriority[this.currentLevel] ?? 2;
    const checkPriority = this.levelPriority[level] ?? 2;
    return checkPriority <= currentPriority;
  }

  /**
   * Temporarily increases log level for debugging.
   *
   * This is a convenience method that sets the log level to DEBUG,
   * useful for quickly enabling verbose logging during troubleshooting.
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.enableDebug();
   * // Perform operations with debug logging
   * logger.debug('Detailed diagnostic info');
   * ```
   */
  enableDebug(): this {
    return this.setLogLevel(LogLevel.DEBUG);
  }

  /**
   * Disables all logging except errors.
   *
   * This is a convenience method that sets the log level to ERROR,
   * useful for reducing log noise in production or during high-load periods.
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.quietMode();
   * // Only errors will be logged
   * logger.info('This will be suppressed');
   * logger.error('This will still be logged');
   * ```
   */
  quietMode(): this {
    return this.setLogLevel(LogLevel.ERROR);
  }

  /**
   * Resets log level to default (INFO).
   *
   * This method restores the log level to the default INFO level.
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.resetLogLevel();
   * ```
   */
  resetLogLevel(): this {
    return this.setLogLevel(LogLevel.INFO);
  }
}
