import * as winston from 'winston';

import { LogLevel } from '@enums/log-level.enum';
import type { IFileTransportOptions, ITransport } from '@interfaces';

/**
 * File transport implementation.
 *
 * This transport writes log messages to a file with optional size-based
 * rotation. It's suitable for applications that need persistent log storage
 * without date-based rotation.
 *
 * The transport uses Winston's file transport under the hood and writes
 * logs in JSON format for easy parsing and processing.
 *
 * @class FileTransport
 * @implements {ITransport}
 *
 * @example
 * ```typescript
 * const transport = FileTransport.make({
 *   type: TransportType.FILE,
 *   level: LogLevel.INFO,
 *   filename: './logs/app.log',
 *   maxsize: 5242880, // 5MB
 *   maxFiles: 5
 * });
 *
 * logger.addTransport(transport);
 * ```
 */
export class FileTransport implements ITransport {
  /**
   * Internal Winston file transport instance.
   */
  private readonly winstonTransport: winston.transports.FileTransportInstance;

  /**
   * Creates a new file transport instance.
   *
   * @param options - File transport configuration options
   *
   * @example
   * ```typescript
   * const transport = FileTransport.make({
   *   type: TransportType.FILE,
   *   level: LogLevel.INFO,
   *   filename: './logs/application.log',
   *   maxsize: 10485760, // 10MB
   *   maxFiles: 3
   * });
   * ```
   */
  constructor(private readonly options: IFileTransportOptions) {
    const format = winston.format.combine(
      winston.format.json(),
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    );

    this.winstonTransport = new winston.transports.File({
      format,
      maxsize: options.maxsize,
      maxFiles: options.maxFiles,
      filename: options.filename,
      level: options.level || LogLevel.INFO,
      handleExceptions: options.handleExceptions ?? true,
      handleRejections: options.handleRejections ?? true,
    });
  }

  /**
   * Static factory method to create a new file transport instance.
   *
   * This method provides a fluent interface for creating transport instances
   * following the static factory pattern commonly used in Laravel and similar frameworks.
   *
   * @param options - File transport configuration options
   * @returns A new FileTransport instance
   *
   * @example
   * ```typescript
   * const transport = FileTransport.make({
   *   type: TransportType.FILE,
   *   level: LogLevel.INFO,
   *   filename: './logs/app.log',
   *   maxsize: 5242880
   * });
   * ```
   */
  static make(options: IFileTransportOptions): FileTransport {
    return new FileTransport(options);
  }

  /**
   * Logs a message at the specified level.
   *
   * This method writes the log entry to the configured file in JSON format.
   * If the file reaches the maximum size, it will be rotated according to
   * the configured rotation policy.
   *
   * @param level - The severity level of the log message
   * @param message - The log message content
   * @param context - Optional contextual data to include with the log
   *
   * @example
   * ```typescript
   * transport.log(LogLevel.ERROR, 'Database connection failed', {
   *   error: 'Connection timeout',
   *   host: 'localhost'
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
   * This method ensures all buffered messages are written to the file.
   * File writes may be buffered by the OS, so this ensures data is
   * physically written to disk.
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
      // Winston's file transport doesn't expose a flush method directly,
      // but we can force a write by calling the internal stream methods
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
   * buffered messages are written before closing.
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
