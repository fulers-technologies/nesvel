import type { LogLevel } from '@enums/log-level.enum';
import type { TransportType } from '@enums/transport-type.enum';

/**
 * File transport options.
 *
 * Writes logs to a single file with rotation based on size.
 */
export interface IFileTransportOptions {
  /**
   * Transport type identifier.
   */
  type: TransportType.FILE;

  /**
   * Whether this transport is enabled.
   * @default false
   */
  enabled?: boolean;

  /**
   * Path to log file.
   * @example './logs/app.log'
   */
  filename: string;

  /**
   * Maximum number of log files to keep.
   * @default 5
   */
  maxFiles?: number;

  /**
   * Minimum log level for this transport.
   * @default LogLevel.INFO
   */
  level?: LogLevel | string;

  /**
   * Maximum size of the file in bytes.
   * @default 5242880 (5MB)
   */
  maxsize?: number;

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
