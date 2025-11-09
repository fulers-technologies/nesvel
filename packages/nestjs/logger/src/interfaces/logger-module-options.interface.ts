import type {
  IHttpTransportOptions,
  IFileTransportOptions,
  IDailyTransportOptions,
  ISlackTransportOptions,
  IConsoleTransportOptions,
  ICloudWatchTransportOptions,
} from '@/interfaces';
import type { LogLevel } from '@enums/log-level.enum';
import { TransportType } from '@/enums/transport-type.enum';

/**
 * Configuration options for the Logger module.
 *
 * This interface defines the complete configuration for the logger module
 * using a transport-based architecture. Multiple transports can be configured
 * to send logs to different destinations simultaneously.
 *
 * @interface ILoggerModuleOptions
 *
 * @example Array format (legacy)
 * ```typescript
 * const options: ILoggerModuleOptions = {
 *   level: LogLevel.DEBUG,
 *   transports: [{
 *     type: TransportType.CONSOLE,
 *     level: LogLevel.DEBUG,
 *     colorize: true,
 *     format: 'pretty'
 *   }]
 * };
 * ```
 *
 * @example Object format (Laravel-style)
 * ```typescript
 * const options: ILoggerModuleOptions = {
 *   level: LogLevel.INFO,
 *   transports: {
 *     console: {
 *       enabled: true,
 *       type: TransportType.CONSOLE,
 *       level: LogLevel.DEBUG,
 *       colorize: true,
 *       format: 'pretty'
 *     },
 *     file: {
 *       enabled: true,
 *       type: TransportType.FILE,
 *       level: LogLevel.INFO,
 *       filename: './logs/app.log',
 *       maxsize: 5242880,
 *       maxFiles: 5
 *     },
 *     daily: {
 *       enabled: false,
 *       type: TransportType.DAILY,
 *       filename: './logs/app-%DATE%.log'
 *     }
 *   }
 * };
 * ```
 *
 * @example Production setup
 * ```typescript
 * const options: ILoggerModuleOptions = {
 *   level: LogLevel.INFO,
 *   transports: {
 *     daily: {
 *       enabled: true,
 *       type: TransportType.DAILY,
 *       filename: './logs/app-%DATE%.log',
 *       datePattern: 'YYYY-MM-DD',
 *       maxSize: '20m',
 *       maxFiles: '14d',
 *       zippedArchive: true
 *     },
 *     cloudwatch: {
 *       enabled: true,
 *       type: TransportType.CLOUDWATCH,
 *       logGroupName: '/aws/application/myapp',
 *       logStreamName: `${process.env.NODE_ENV}-${Date.now()}`,
 *       awsRegion: 'us-east-1'
 *     },
 *     slack: {
 *       enabled: true,
 *       type: TransportType.SLACK,
 *       level: LogLevel.ERROR,
 *       webhookUrl: process.env.SLACK_WEBHOOK_URL,
 *       channel: '#errors'
 *     }
 *   }
 * };
 * ```
 */
export interface ILoggerModuleOptions {
  /**
   * Whether the module should be registered as global.
   *
   * When true, the LoggerService and other providers will be available
   * globally across all modules without needing to import LoggerModule.
   *
   * @default true
   *
   * @example
   * ```typescript
   * LoggerModule.forRoot({
   *   level: LogLevel.INFO,
   *   isGlobal: true, // Available in all modules
   *   transporter: TransportType.CONSOLE
   * })
   * ```
   */
  isGlobal?: boolean;

  /**
   * Primary transport type to use for logging.
   *
   * Specifies which transport mechanism will be used to output logs.
   * The actual transport configuration is defined in the `transporters` object.
   *
   * @example
   * ```typescript
   * {
   *   transporter: TransportType.CONSOLE,
   *   transporters: {
   *     console: {
   *       enabled: true,
   *       colorize: true
   *     }
   *   }
   * }
   * ```
   */
  transporter: TransportType;

  /**
   * Default log level for the logger.
   * Individual transports can override this with their own level.
   *
   * @default LogLevel.INFO
   */
  level?: LogLevel | string;

  /**
   * Transport configurations for different logging destinations.
   *
   * Each transport can be individually configured with its own settings.
   * Multiple transports can be enabled simultaneously to send logs to
   * different destinations (console, files, cloud services, etc.).
   *
   * @example
   * ```typescript
   * {
   *   transporters: {
   *     console: {
   *       enabled: true,
   *       level: LogLevel.DEBUG,
   *       colorize: true
   *     },
   *     file: {
   *       enabled: true,
   *       filename: './logs/app.log',
   *       maxsize: 5242880
   *     }
   *   }
   * }
   * ```
   */
  transporters: {
    /**
     * Console transport configuration.
     *
     * Writes log messages to stdout/stderr. Useful for development and containerized
     * environments where logs are captured by orchestration platforms.
     *
     * @optional
     */
    console?: IConsoleTransportOptions;

    /**
     * File transport configuration.
     *
     * Writes log messages to a single file. Suitable for simple file-based logging
     * without rotation.
     *
     * @optional
     */
    file?: IFileTransportOptions;

    /**
     * Daily rotating file transport configuration.
     *
     * Writes log messages to files that rotate daily based on date patterns.
     * Supports automatic cleanup of old log files.
     *
     * @optional
     */
    daily?: IDailyTransportOptions;

    /**
     * AWS CloudWatch transport configuration.
     *
     * Sends log messages to AWS CloudWatch Logs. Useful for centralized logging
     * in AWS infrastructure.
     *
     * @optional
     */
    cloudwatch?: ICloudWatchTransportOptions;

    /**
     * Slack webhook transport configuration.
     *
     * Sends log messages to a Slack channel via webhooks. Typically used for
     * critical errors and alerts that require immediate attention.
     *
     * @optional
     */
    slack?: ISlackTransportOptions;

    /**
     * HTTP endpoint transport configuration.
     *
     * Sends log messages to a remote HTTP endpoint. Useful for custom logging
     * services or third-party log aggregation platforms.
     *
     * @optional
     */
    http?: IHttpTransportOptions;
  };
}
