import type { LogLevel } from '@enums/log-level.enum';
import type { TransportType } from '@enums/transport-type.enum';

/**
 * Custom transport options.
 *
 * Allows using any Winston-compatible transport.
 */
export interface ICustomTransportOptions {
  /**
   * Transport type identifier.
   */
  type: TransportType.CUSTOM;

  /**
   * Whether this transport is enabled.
   * @default false
   */
  enabled?: boolean;

  /**
   * Winston transport instance.
   */
  transport: any;

  /**
   * Minimum log level for this transport.
   */
  level?: LogLevel | string;

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
