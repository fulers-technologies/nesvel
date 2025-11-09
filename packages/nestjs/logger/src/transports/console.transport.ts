import * as winston from 'winston';

import { LogLevel } from '@enums/log-level.enum';
import type { IConsoleTransportOptions, ITransport } from '@interfaces';

/**
 * Console transport implementation.
 *
 * This transport outputs log messages to stdout/stderr with optional
 * colorization and formatting. It's ideal for development environments
 * where human-readable output is important.
 *
 * The transport uses Winston's console transport under the hood but
 * provides a simpler, opinionated interface.
 *
 * @class ConsoleTransport
 * @implements {ITransport}
 *
 * @example
 * ```typescript
 * const transport = new ConsoleTransport({
 *   type: TransportType.CONSOLE,
 *   level: LogLevel.DEBUG,
 *   colorize: true,
 *   format: 'pretty'
 * });
 *
 * logger.addTransport(transport);
 * ```
 */
export class ConsoleTransport implements ITransport {
  /**
   * Internal Winston console transport instance.
   */
  private readonly winstonTransport: winston.transports.ConsoleTransportInstance;

  /**
   * Creates a new console transport instance.
   *
   * @param options - Console transport configuration options
   *
   * @example
   * ```typescript
   * const transport = new ConsoleTransport({
   *   type: TransportType.CONSOLE,
   *   level: LogLevel.DEBUG,
   *   colorize: true
   * });
   * ```
   */
  constructor(private readonly options: IConsoleTransportOptions) {
    const format = this.buildFormat();

    this.winstonTransport = new winston.transports.Console({
      format,
      level: options.level || LogLevel.INFO,
      handleExceptions: options.handleExceptions ?? true,
      handleRejections: options.handleRejections ?? true,
    });
  }

  /**
   * Builds the Winston format based on configuration.
   *
   * This method creates the appropriate Winston format chain based on
   * the colorize and format options. It supports both pretty-printed
   * and JSON output formats.
   *
   * @returns Winston format configuration
   *
   * @private
   */
  private buildFormat(): winston.Logform.Format {
    const baseFormat = winston.format.combine(
      winston.format.splat(),
      winston.format.errors({ stack: true }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    );

    if (this.options.format === 'json') {
      return winston.format.combine(baseFormat, winston.format.json());
    }

    // Pretty format (default)
    const prettyFormat = winston.format.printf(
      ({ timestamp, level, message, context, ...meta }) => {
        const ctx = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
      }
    );

    if (this.options.colorize !== false) {
      return winston.format.combine(
        baseFormat,
        winston.format.colorize({ all: true }),
        prettyFormat
      );
    }

    return winston.format.combine(baseFormat, prettyFormat);
  }

  /**
   * Logs a message at the specified level.
   *
   * This method delegates to the underlying Winston transport after
   * formatting the log entry appropriately.
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
   * Console transport doesn't buffer messages, so this is a no-op.
   *
   * @returns Promise that resolves immediately
   *
   * @example
   * ```typescript
   * await transport.flush();
   * ```
   */
  async flush(): Promise<void> {
    // Console writes are synchronous, no buffering
    return Promise.resolve();
  }

  /**
   * Closes the transport and releases resources.
   *
   * This method closes the underlying Winston transport.
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
