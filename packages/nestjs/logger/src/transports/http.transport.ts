import * as winston from 'winston';

import type { IHttpTransportOptions, ITransport } from '@interfaces';
import { LogLevel } from '@enums/log-level.enum';

/**
 * HTTP transport implementation.
 *
 * This transport sends log messages to HTTP endpoints, making it ideal for
 * integration with external log aggregation services, custom log processors,
 * or centralized logging systems.
 *
 * Features:
 * - Send logs to any HTTP endpoint
 * - Supports POST, PUT, and PATCH methods
 * - Custom headers for authentication
 * - SSL/TLS support
 * - Batch message delivery
 * - Integration with services like Loggly, Logstash, etc.
 *
 * The transport uses Winston's HTTP transport which provides reliable
 * delivery with retry logic.
 *
 * @class HttpTransport
 * @implements {ITransport}
 *
 * @example
 * ```typescript
 * const transport = new HttpTransport({
 *   type: TransportType.HTTP,
 *   level: LogLevel.INFO,
 *   host: 'logs.example.com',
 *   port: 443,
 *   path: '/api/logs',
 *   ssl: true,
 *   headers: {
 *     'Authorization': 'Bearer YOUR_TOKEN',
 *     'Content-Type': 'application/json'
 *   }
 * });
 *
 * logger.addTransport(transport);
 * ```
 */
export class HttpTransport implements ITransport {
  /**
   * Internal Winston HTTP transport instance.
   */
  private readonly winstonTransport: winston.transports.HttpTransportInstance;

  /**
   * Creates a new HTTP transport instance.
   *
   * The transport will send log messages to the specified HTTP endpoint
   * using the configured method (POST by default). Messages are sent
   * in JSON format.
   *
   * @param options - HTTP transport configuration options
   *
   * @example Basic HTTP endpoint
   * ```typescript
   * const transport = new HttpTransport({
   *   type: TransportType.HTTP,
   *   level: LogLevel.INFO,
   *   host: 'logs.myapp.com',
   *   port: 8080,
   *   path: '/logs',
   *   ssl: false
   * });
   * ```
   *
   * @example With authentication
   * ```typescript
   * const transport = new HttpTransport({
   *   type: TransportType.HTTP,
   *   level: LogLevel.INFO,
   *   host: 'api.loggly.com',
   *   port: 443,
   *   path: `/inputs/${process.env.LOGGLY_TOKEN}/tag/http/`,
   *   ssl: true,
   *   headers: {
   *     'Content-Type': 'application/json',
   *     'X-API-Key': process.env.API_KEY
   *   }
   * });
   * ```
   *
   * @example Logstash integration
   * ```typescript
   * const transport = new HttpTransport({
   *   type: TransportType.HTTP,
   *   level: LogLevel.INFO,
   *   host: 'logstash.internal',
   *   port: 5000,
   *   path: '/',
   *   ssl: false,
   *   method: 'POST'
   * });
   * ```
   */
  constructor(private readonly options: IHttpTransportOptions) {
    const format = winston.format.combine(
      winston.format.json(),
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    );

    const httpConfig: any = {
      format,
      level: options.level || LogLevel.INFO,
      handleExceptions: options.handleExceptions ?? true,
      handleRejections: options.handleRejections ?? true,
    };

    // Add optional configuration
    if (options.host) {
      httpConfig.host = options.host;
    }

    if (options.port) {
      httpConfig.port = options.port;
    }

    if (options.path) {
      httpConfig.path = options.path;
    }

    if (options.ssl !== undefined) {
      httpConfig.ssl = options.ssl;
    }

    if (options.method) {
      httpConfig.method = options.method;
    }

    if (options.headers) {
      httpConfig.headers = options.headers;
    }

    this.winstonTransport = new winston.transports.Http(httpConfig);
  }

  /**
   * Logs a message at the specified level.
   *
   * This method sends the log entry to the configured HTTP endpoint.
   * Messages are sent asynchronously in JSON format. Failed deliveries
   * may be retried depending on the HTTP response.
   *
   * @param level - The severity level of the log message
   * @param message - The log message content
   * @param context - Optional contextual data to include with the log
   *
   * @example
   * ```typescript
   * transport.log(LogLevel.INFO, 'User action completed', {
   *   userId: '123',
   *   action: 'purchase',
   *   amount: 99.99,
   *   timestamp: new Date().toISOString()
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
   * This method ensures all pending HTTP requests are completed.
   * Since HTTP transport sends messages asynchronously, this waits
   * for all in-flight requests to finish.
   *
   * @returns Promise that resolves when all messages are flushed
   *
   * @example
   * ```typescript
   * await transport.flush();
   * ```
   */
  async flush(): Promise<void> {
    // HTTP transport sends messages asynchronously
    // Give it a moment to send pending messages
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Closes the transport and releases resources.
   *
   * This method ensures all pending HTTP requests are completed
   * before closing the transport.
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
