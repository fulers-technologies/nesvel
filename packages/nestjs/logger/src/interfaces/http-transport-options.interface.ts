import type { LogLevel } from '@enums/log-level.enum';
import type { TransportType } from '@enums/transport-type.enum';

/**
 * HTTP transport options.
 *
 * Sends logs to external HTTP endpoints.
 * Useful for integration with log aggregation services.
 */
export interface IHttpTransportOptions {
  /**
   * Transport type identifier.
   */
  type: TransportType.HTTP;

  /**
   * Target host.
   * @example 'logs.example.com'
   */
  host?: string;

  /**
   * Target path.
   * @example '/api/logs'
   * @default '/'
   */
  path?: string;

  /**
   * Use SSL/TLS.
   * @default true
   */
  ssl?: boolean;

  /**
   * Whether this transport is enabled.
   * @default false
   */
  enabled?: boolean;

  /**
   * Target port.
   * @default 443
   */
  port?: number;

  /**
   * Minimum log level for this transport.
   * @default LogLevel.INFO
   */
  level?: LogLevel | string;

  /**
   * HTTP method to use.
   * @default 'POST'
   */
  method?: 'POST' | 'PUT' | 'PATCH';

  /**
   * Custom HTTP headers.
   */
  headers?: Record<string, string>;

  /**
   * Enable exception handling.
   * When true, uncaught exceptions will be logged before the process exits.
   *
   * @default true
   */
  handleExceptions?: boolean;

  /**
   * Enable rejection handling.
   * When true, unhandled promise rejections will be logged.
   *
   * @default true
   */
  handleRejections?: boolean;
}
