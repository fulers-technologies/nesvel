import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LogLevel } from '@enums/log-level.enum';
import type { IDailyTransportOptions, ITransport } from '@interfaces';

/**
 * Daily rotate file transport implementation.
 *
 * This transport writes log messages to date-rotated files using
 * winston-daily-rotate-file. It's ideal for production environments
 * where you need automatic log rotation based on date and size.
 *
 * Features:
 * - Automatic date-based rotation (YYYY-MM-DD by default)
 * - Size-based rotation (max file size)
 * - Automatic cleanup of old files
 * - Optional compression of rotated files
 * - JSON format for easy parsing
 *
 * The transport uses Winston's daily-rotate-file transport which provides
 * reliable log rotation with minimal configuration.
 *
 * @class DailyRotateTransport
 * @implements {ITransport}
 *
 * @example
 * ```typescript
 * const transport = DailyRotateTransport.make({
 *   type: TransportType.DAILY,
 *   level: LogLevel.INFO,
 *   filename: './logs/application-%DATE%.log',
 *   datePattern: 'YYYY-MM-DD',
 *   maxSize: '20m',
 *   maxFiles: '14d',
 *   zippedArchive: true
 * });
 *
 * logger.addTransport(transport);
 * ```
 */
export class DailyRotateTransport implements ITransport {
  /**
   * Internal Winston daily rotate file transport instance.
   */
  private readonly winstonTransport: DailyRotateFile;

  /**
   * Creates a new daily rotate transport instance.
   *
   * The filename should include a %DATE% placeholder which will be replaced
   * with the current date pattern. For example:
   * - 'application-%DATE%.log' becomes 'application-2025-11-09.log'
   * - 'logs/app-%DATE%.log' becomes 'logs/app-2025-11-09.log'
   *
   * @param options - Daily rotate transport configuration options
   *
   * @example
   * ```typescript
   * const transport = DailyRotateTransport.make({
   *   type: TransportType.DAILY,
   *   level: LogLevel.INFO,
   *   filename: './logs/app-%DATE%.log',
   *   datePattern: 'YYYY-MM-DD-HH',  // Hourly rotation
   *   maxSize: '100m',
   *   maxFiles: '30d',
   *   zippedArchive: true
   * });
   * ```
   */
  constructor(private readonly options: IDailyTransportOptions) {
    const format = winston.format.combine(
      winston.format.json(),
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    );

    this.winstonTransport = DailyRotateFile.make({
      format,
      filename: options.filename,
      maxSize: options.maxSize || '20m',
      maxFiles: options.maxFiles || '14d',
      level: options.level || LogLevel.INFO,
      zippedArchive: options.zippedArchive ?? false,
      datePattern: options.datePattern || 'YYYY-MM-DD',
      handleExceptions: options.handleExceptions ?? true,
      handleRejections: options.handleRejections ?? true,
    });
  }

  /**
   * Static factory method to create a new daily rotate transport instance.
   *
   * This method provides a fluent interface for creating transport instances
   * following the static factory pattern commonly used in Laravel and similar frameworks.
   *
   * @param options - Daily rotate transport configuration options
   * @returns A new DailyRotateTransport instance
   *
   * @example
   * ```typescript
   * const transport = DailyRotateTransport.make({
   *   type: TransportType.DAILY,
   *   filename: './logs/app-%DATE%.log',
   *   maxSize: '20m',
   *   maxFiles: '14d'
   * });
   * ```
   */
  static make(options: IDailyTransportOptions): DailyRotateTransport {
    return new DailyRotateTransport(options);
  }

  /**
   * Logs a message at the specified level.
   *
   * This method writes the log entry to the daily rotated file in JSON format.
   * Files are automatically rotated based on the date pattern and size limits.
   * Old files are cleaned up based on the maxFiles setting.
   *
   * @param level - The severity level of the log message
   * @param message - The log message content
   * @param context - Optional contextual data to include with the log
   *
   * @example
   * ```typescript
   * transport.log(LogLevel.INFO, 'User logged in', {
   *   userId: '123',
   *   timestamp: new Date()
   * });
   * ```
   */
  log(level: LogLevel | string, message: string, context?: any): void {
    this.winstonTransport.log?.(
      {
        level,
        message,
        ...context,
      },
      () => {}
    );
  }

  /**
   * Flushes any buffered log messages.
   *
   * This method ensures all buffered messages are written to the current
   * log file. File writes may be buffered by the OS, so this ensures data
   * is physically written to disk.
   *
   * @returns Promise that resolves when all messages are flushed
   *
   * @example
   * ```typescript
   * await transport.flush();
   * ```
   */
  async flush(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Winston's daily-rotate-file transport uses streams internally
      if ((this.winstonTransport as any)._stream) {
        (this.winstonTransport as any)._stream.once('finish', resolve);
        (this.winstonTransport as any)._stream.end();
      } else {
        resolve();
      }
    });
  }

  /**
   * Closes the transport and releases resources.
   *
   * This method closes the file handle and ensures all remaining
   * buffered messages are written before closing. Should be called
   * during application shutdown.
   *
   * @returns Promise that resolves when the transport is closed
   *
   * @example
   * ```typescript
   * await transport.close();
   * ```
   */
  async close(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.winstonTransport.close) {
        this.winstonTransport.close();
      }
      resolve();
    });
  }
}
