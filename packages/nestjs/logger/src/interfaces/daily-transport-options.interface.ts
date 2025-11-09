import type { LogLevel } from '@enums/log-level.enum';
import type { TransportType } from '@enums/transport-type.enum';

/**
 * Daily rotate transport options.
 *
 * Creates date-stamped log files with automatic rotation.
 * Ideal for production with long-term log retention.
 */
export interface IDailyTransportOptions {
  /**
   * Transport type identifier.
   */
  type: TransportType.DAILY;

  /**
   * Whether this transport is enabled.
   * @default false
   */
  enabled?: boolean;

  /**
   * Maximum size of the file.
   * @example '20m', '1g'
   * @default '20m'
   */
  maxSize?: string;

  /**
   * Maximum number of days/files to keep.
   * @example '14d', '10'
   * @default '14d'
   */
  maxFiles?: string | number;

  /**
   * Compress rotated files with gzip.
   * @default false
   */
  zippedArchive?: boolean;

  /**
   * Date pattern for filename rotation.
   * @example 'YYYY-MM-DD', 'YYYY-MM-DD-HH'
   * @default 'YYYY-MM-DD'
   */
  datePattern?: string;

  /**
   * Filename pattern with %DATE% placeholder.
   * @example './logs/app-%DATE%.log'
   */
  filename: string;

  /**
   * Minimum log level for this transport.
   * @default LogLevel.INFO
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
