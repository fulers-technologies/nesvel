import type { LogLevel } from '@enums/log-level.enum';
import type { TransportType } from '@enums/transport-type.enum';

/**
 * Console transport options.
 *
 * Outputs colorized, pretty-printed logs to console.
 * Ideal for development.
 */
export interface IConsoleTransportOptions {
  /**
   * Transport type identifier.
   */
  type: TransportType.CONSOLE;

  /**
   * Whether this transport is enabled.
   * @default true in development
   */
  enabled?: boolean;

  /**
   * Enable colorized output.
   * @default true
   */
  colorize?: boolean;

  /**
   * Minimum log level for this transport.
   * @default LogLevel.DEBUG
   */
  level?: LogLevel | string;

  /**
   * Output format: 'pretty' or 'json'.
   * @default 'pretty'
   */
  format?: 'pretty' | 'json';

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
