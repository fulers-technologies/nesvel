import type { LogLevel } from '@enums/log-level.enum';

/**
 * Interface for transport implementations.
 *
 * All transports must implement this interface to ensure consistent behavior
 * across different logging destinations. Transports handle the actual delivery
 * of log messages to their respective destinations (console, file, remote service, etc.).
 *
 * @interface ITransport
 *
 * @example
 * ```typescript
 * class ConsoleTransport implements ITransport {
 *   log(level: LogLevel, message: string, context?: any): void {
 *     console.log(`[${level}] ${message}`, context);
 *   }
 *
 *   async flush(): Promise<void> {
 *     // No-op for console
 *   }
 *
 *   async close(): Promise<void> {
 *     // No-op for console
 *   }
 * }
 * ```
 */
export interface ITransport {
  /**
   * Logs a message at the specified level.
   *
   * This is the core method that all transports must implement. It receives
   * a log level, message, and optional context, then delivers the log entry
   * to its destination according to the transport's implementation.
   *
   * @param level - The severity level of the log message
   * @param message - The log message content
   * @param context - Optional contextual data to include with the log
   *
   * @example
   * ```typescript
   * transport.log(LogLevel.INFO, 'User logged in', { userId: '123' });
   * ```
   */
  log(level: LogLevel | string, message: string, context?: any): void;

  /**
   * Flushes any buffered log messages.
   *
   * Some transports may buffer messages for performance reasons. This method
   * ensures all buffered messages are sent to their destination. It's useful
   * before application shutdown or when immediate delivery is required.
   *
   * @returns Promise that resolves when all buffered messages are flushed
   *
   * @example
   * ```typescript
   * await transport.flush();
   * ```
   */
  flush(): Promise<void>;

  /**
   * Closes the transport and releases resources.
   *
   * This method should be called during application shutdown to properly
   * close connections, file handles, and other resources. It should flush
   * any remaining buffered messages before closing.
   *
   * @returns Promise that resolves when the transport is fully closed
   *
   * @example
   * ```typescript
   * await transport.close();
   * ```
   */
  close(): Promise<void>;
}
