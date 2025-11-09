import { inspect } from 'util';
import stackTrace from 'stack-trace';
import { track } from '@medusajs/telemetry';

import { LogLevel } from '@enums/log-level.enum';
import { PanicData } from '@/types/panic-data.type';
import { panicHandler } from '@/utils/panic-handler.util';
import { MessageLoggedEvent } from '@/events/message-logged.event';

/**
 * LogsMessages concern mixin.
 *
 * This concern provides the core logging methods for different log levels.
 * It implements the standard logging interface with methods for each severity
 * level (error, warn, info, debug, etc.).
 *
 * This is designed to be mixed into the main logger service using ts-mixer,
 * providing a clean separation of concerns while maintaining a cohesive API.
 *
 * @class LogsMessagesConcern
 *
 * @example
 * ```typescript
 * class LoggerService extends Mixin(LogsMessagesConcern, OtherConcern) {
 *   // Logger service with all concern methods
 * }
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Database connection failed', { host: 'localhost' });
 * ```
 */
export class LogsMessagesConcern {
  /**
   * Logs an emergency message.
   *
   * Use this method for system is unusable situations. These are the highest
   * severity logs and should only be used when the entire system is down.
   *
   * @param message - The emergency message to log
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.emergency('System is down', { reason: 'Complete failure' });
   * ```
   */
  emergency(message: string, context: any = []): void {
    (this as any).write(LogLevel.ERROR, message, context);
  }

  /**
   * Logs an alert message.
   *
   * Use this method for situations where action must be taken immediately.
   * Less severe than emergency but still critical.
   *
   * @param message - The alert message to log
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.alert('Database corrupted', { database: 'users' });
   * ```
   */
  alert(message: string, context: any = []): void {
    (this as any).write(LogLevel.ERROR, message, context);
  }

  /**
   * Logs a critical message.
   *
   * Use this method for critical conditions that need immediate attention
   * but the system can still continue operating.
   *
   * @param message - The critical message to log
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.critical('Payment gateway timeout', { attempts: 3 });
   * ```
   */
  critical(message: string, context: any = []): void {
    (this as any).write(LogLevel.ERROR, message, context);
  }

  /**
   * Logs an error. If an error object is provided the stack trace for the error
   * will also be logged.
   *
   * Use this method for error events that might still allow the application
   * to continue running. Errors represent failures that should be investigated
   * and typically require immediate attention.
   *
   * @param {String | Error} messageOrError - can either be a string with a
   *   message to log the error under; or an error object.
   * @param {Error?} error - an error object to log message with
   *
   * @example
   * ```typescript
   * logger.error('Database connection failed', {
   *   host: 'localhost',
   *   port: 5432,
   *   error: err.message
   * });
   * ```
   */
  error(messageOrError: string | Error, error?: Error) {
    let message: string;
    let errorAsObject: Error | undefined;

    if (messageOrError && typeof messageOrError === 'object') {
      errorAsObject = messageOrError;
      message = messageOrError.message;
    } else if (error) {
      message = messageOrError;
      errorAsObject = error;
    } else {
      message = messageOrError;
    }

    const toLog: Record<string, any> = {
      message,
      level: 'error',
    };

    if (errorAsObject) {
      toLog['message'] = errorAsObject.message;
      toLog['stack'] = stackTrace.parse(errorAsObject);

      /**
       * Winston only logs the error properties when they are
       * string values. Hence we will have to self convert
       * the error cause to a string
       */
      const cause = (errorAsObject as any)?.cause;
      if (cause) {
        toLog['cause'] = inspect(cause);
      }
    }

    /**
     * If "errorAsObject" has a message property, then we will
     * print the standalone message as one log item and then
     * the actual error object as another log item.
     *
     * Otherwise, we always loose the message property from the
     * actual error object
     */
    if (errorAsObject?.message && errorAsObject?.message !== message) {
      (this as any).loggerInstance.log({ level: 'error', message });
    }

    (this as any).loggerInstance.log(toLog);

    /**
     * In dev we print the error using `console.error`, because Winston
     * CLI formatter does not print the error stack in that case
     */
    if (errorAsObject && (process.env.NODE_ENV || 'development').startsWith('dev')) {
      console.error(errorAsObject);
    }
  }

  /**
   * Logs a warning message.
   *
   * Use this method for potentially harmful situations or deprecation warnings.
   * Warnings indicate issues that should be addressed but don't prevent the
   * application from functioning.
   *
   * @param message - The warning message to log
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.warning('API rate limit approaching', {
   *   current: 950,
   *   limit: 1000,
   *   resetAt: new Date()
   * });
   * ```
   */
  warning(message: string, context: any = []): void {
    (this as any).write(LogLevel.WARN, message, context);
  }

  /**
   * Logs a notice message.
   *
   * Use this method for normal but significant conditions. More important
   * than info but not a warning.
   *
   * @param message - The notice message to log
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.notice('Configuration changed', { key: 'max_connections' });
   * ```
   */
  notice(message: string, context: any = []): void {
    (this as any).write(LogLevel.INFO, message, context);
  }

  /**
   * Logs an informational message.
   *
   * Use this method for general informational messages about application
   * operation. Info logs represent normal application behavior and important
   * milestones in the application lifecycle.
   *
   * @param message - The informational message to log
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.info('User logged in successfully', {
   *   userId: '123',
   *   loginMethod: 'oauth',
   *   provider: 'google'
   * });
   * ```
   */
  info(message: string, context: any = []): void {
    (this as any).write(LogLevel.INFO, message, context);
  }

  /**
   * Logs a silly/trace message.
   *
   * Use this method for extremely detailed debugging information. This is
   * the most verbose log level (Level 6 in Winston NPM levels).
   *
   * @param message - The silly message to log
   * @param context - Optional detailed diagnostic data
   *
   * @example
   * ```typescript
   * logger.silly('Variable state dump', { allVariables: {...} });
   * ```
   */
  silly(message: string, context: any = []): void {
    (this as any).write(LogLevel.SILLY, message, context);
  }

  /**
   * Logs a debug message.
   *
   * Use this method for diagnostic information useful during development.
   * Debug logs help track down issues and understand application behavior
   * in detail. Level 5 in Winston NPM levels.
   *
   * @param message - The debug message to log
   * @param context - Optional diagnostic data
   *
   * @example
   * ```typescript
   * logger.debug('Query executed', {
   *   sql: 'SELECT * FROM users WHERE id = ?',
   *   params: ['123'],
   *   executionTime: 45
   * });
   * ```
   */
  debug(message: string, context: any = []): void {
    (this as any).write(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs a verbose message.
   *
   * Use this method for detailed operational information.
   * Level 4 in Winston NPM levels.
   *
   * @param message - The verbose message to log
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.verbose('Cache entry updated', { key: 'user:123' });
   * ```
   */
  verbose(message: string, context: any = []): void {
    (this as any).write(LogLevel.VERBOSE, message, context);
  }

  /**
   * Logs an HTTP-related message.
   *
   * Use this method for logging HTTP requests and responses.
   * Level 3 in Winston NPM levels (default).
   *
   * @param message - The HTTP-related message to log
   * @param context - Optional request/response data
   *
   * @example
   * ```typescript
   * logger.http('GET /api/users', { statusCode: 200, duration: 45 });
   * ```
   */
  http(message: string, context: any = []): void {
    (this as any).write(LogLevel.HTTP, message, context);
  }

  /**
   * Generic log method.
   *
   * This is the main logging method that handles all log levels.
   *
   * @param level - The log level
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * logger.log('info', 'Operation completed', { duration: 100 });
   * ```
   */
  log(level: LogLevel | string, message: string, context: any = []): void {
    (this as any).write(level, message, context);
  }

  /**
   * Fires a log event.
   *
   * @param level - The log level
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @protected
   */
  protected fireLogEvent(level: LogLevel | string, message: string, context: any = []): void {
    const event = MessageLoggedEvent.make(level, message, context);

    if ((this as any).eventEmitter) {
      (this as any).eventEmitter.emit('log-message.logged', event);
    }
  }

  /**
   * Panic handler for critical errors that should terminate the process.
   *
   * This method logs a panic error and optionally terminates the process.
   * It's inspired by Medusa's panic handler for unrecoverable errors.
   * Use this for catastrophic failures that require immediate process termination.
   *
   * @param data - Panic data including id, message, and context
   * @param exitProcess - Whether to exit the process (default: true)
   *
   * @example
   * ```typescript
   * logger.panic({
   *   id: '10000',
   *   message: 'System is in an unrecoverable state',
   *   context: { reason: 'Database corrupted', path: '/var/db' },
   *   details: { errorCode: 'DB_CORRUPTION' }
   * });
   * ```
   */
  panic(data: PanicData) {
    const parsedPanic = panicHandler(data);

    (this as any).write({
      level: 'error',
      details: data,
      message: parsedPanic.message,
    });

    track('PANIC_ERROR_REACHED', {
      id: data.id,
    });

    process.exit(1);
  }
}
