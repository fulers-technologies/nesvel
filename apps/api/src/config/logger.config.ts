import type { LoggerConfig } from '@nesvel/nestjs-logger';
import { LogLevel, TransportType } from '@nesvel/nestjs-logger';

/**
 * Logger Module Configuration
 *
 * Laravel-style declarative configuration for the Logger module.
 * Define all transport configurations here without conditional logic.
 *
 * The LoggerModule will handle:
 * - Filtering enabled transports
 * - Instantiating transport instances
 * - Managing transport lifecycle
 *
 * Features:
 * - Declarative transport configuration
 * - Environment variable binding
 * - Type-safe configuration
 * - Enable/disable transports individually
 *
 * Environment Variables:
 * - LOGGER_LEVEL: Default log level (emergency, alert, critical, error, warning, notice, info, http, verbose, debug, silly)
 * - LOGGER_GLOBAL: Register module globally (true/false)
 * - LOGGER_HANDLE_EXCEPTIONS: Handle uncaught exceptions (true/false)
 * - LOGGER_HANDLE_REJECTIONS: Handle unhandled rejections (true/false)
 * - LOGGER_EXIT_ON_ERROR: Exit on uncaught exceptions (true/false)
 *
 * Console Transport:
 * - LOGGER_CONSOLE_ENABLED: Enable console transport (true/false, default: true in dev)
 * - LOGGER_CONSOLE_LEVEL: Console log level
 * - LOGGER_CONSOLE_COLORIZE: Enable colors (true/false, default: true)
 * - LOGGER_CONSOLE_FORMAT: Output format (pretty/json, default: pretty)
 *
 * File Transport:
 * - LOGGER_FILE_ENABLED: Enable file transport (true/false)
 * - LOGGER_FILE_LEVEL: File log level
 * - LOGGER_FILE_FILENAME: Log file path
 * - LOGGER_FILE_MAX_SIZE: Max file size in bytes
 * - LOGGER_FILE_MAX_FILES: Max number of files
 *
 * Daily Rotate Transport:
 * - LOGGER_DAILY_ENABLED: Enable daily rotation (true/false)
 * - LOGGER_DAILY_LEVEL: Daily log level
 * - LOGGER_DAILY_FILENAME: Filename pattern with %DATE%
 * - LOGGER_DAILY_DATE_PATTERN: Date pattern (default: YYYY-MM-DD)
 * - LOGGER_DAILY_MAX_SIZE: Max size (e.g., 20m, 1g)
 * - LOGGER_DAILY_MAX_FILES: Max files to keep (e.g., 14d, 10)
 * - LOGGER_DAILY_ZIPPED: Compress rotated files (true/false)
 *
 * CloudWatch Transport:
 * - LOGGER_CLOUDWATCH_ENABLED: Enable CloudWatch (true/false)
 * - LOGGER_CLOUDWATCH_LEVEL: CloudWatch log level
 * - LOGGER_CLOUDWATCH_LOG_GROUP: Log group name
 * - LOGGER_CLOUDWATCH_LOG_STREAM: Log stream name
 * - LOGGER_CLOUDWATCH_REGION: AWS region
 * - AWS_REGION: AWS region (alternative)
 * - AWS_ACCESS_KEY_ID: AWS access key
 * - AWS_SECRET_ACCESS_KEY: AWS secret key
 * - LOGGER_CLOUDWATCH_CREATE_LOG_GROUP: Auto-create log group (true/false)
 * - LOGGER_CLOUDWATCH_CREATE_LOG_STREAM: Auto-create log stream (true/false)
 *
 * Slack Transport:
 * - LOGGER_SLACK_ENABLED: Enable Slack (true/false)
 * - LOGGER_SLACK_LEVEL: Slack log level (default: error)
 * - LOGGER_SLACK_WEBHOOK_URL: Slack webhook URL (required)
 * - LOGGER_SLACK_CHANNEL: Channel name
 * - LOGGER_SLACK_USERNAME: Bot username
 * - LOGGER_SLACK_ICON_EMOJI: Bot icon emoji
 *
 * HTTP Transport:
 * - LOGGER_HTTP_ENABLED: Enable HTTP (true/false)
 * - LOGGER_HTTP_LEVEL: HTTP log level
 * - LOGGER_HTTP_HOST: Target host
 * - LOGGER_HTTP_PORT: Target port
 * - LOGGER_HTTP_PATH: Target path
 * - LOGGER_HTTP_SSL: Use SSL (true/false)
 *
 * @see {@link https://github.com/winstonjs/winston | Winston}
 * @see {@link https://github.com/winstonjs/winston-daily-rotate-file | winston-daily-rotate-file}
 *
 * @example Development configuration
 * ```typescript
 * // .env.development
 * NODE_ENV=development
 * LOGGER_CONSOLE_ENABLED=true
 * LOGGER_CONSOLE_LEVEL=debug
 * ```
 *
 * @example Production configuration
 * ```typescript
 * // .env.production
 * NODE_ENV=production
 * LOGGER_LEVEL=info
 * LOGGER_CONSOLE_ENABLED=false
 * LOGGER_DAILY_ENABLED=true
 * LOGGER_DAILY_FILENAME=./logs/app-%DATE%.log
 * LOGGER_DAILY_MAX_FILES=30d
 * LOGGER_CLOUDWATCH_ENABLED=true
 * LOGGER_CLOUDWATCH_LOG_GROUP=/aws/application/myapp
 * LOGGER_SLACK_ENABLED=true
 * LOGGER_SLACK_WEBHOOK_URL=https://hooks.slack.com/...
 * LOGGER_SLACK_LEVEL=error
 * ```
 */
/**
 * Logger configuration with all available transports.
 *
 * Each transport is defined declaratively with its configuration.
 * The LoggerModule will filter and instantiate only enabled transports.
 */
export const loggerConfig: LoggerConfig = {
  /**
   * Register module globally in NestJS.
   *
   * @env LOGGER_GLOBAL
   * @default false
   */
  isGlobal: process.env.LOGGER_GLOBAL === 'true',

  /**
   * Default log level for all transports.
   *
   * @env LOGGER_LEVEL
   * @default LogLevel.INFO
   */
  level: (process.env.LOGGER_LEVEL as LogLevel) || LogLevel.INFO,

  transporter: TransportType.CONSOLE,

  /**
   * Transport configurations.
   *
   * All transports are defined here with their full configuration.
   * Set `enabled: true` to activate a transport.
   */
  transporters: {
    /**
     * Console transport configuration.
     *
     * Outputs colorized, pretty-printed logs to console.
     * Ideal for development.
     */
    console: {
      enabled:
        process.env.NODE_ENV === 'development' || process.env.LOGGER_CONSOLE_ENABLED === 'true',
      type: TransportType.CONSOLE,
      colorize: process.env.LOGGER_CONSOLE_COLORIZE !== 'false',
      handleExceptions: process.env.LOGGER_HANDLE_EXCEPTIONS !== 'false',
      handleRejections: process.env.LOGGER_HANDLE_REJECTIONS !== 'false',
      level: (process.env.LOGGER_CONSOLE_LEVEL as LogLevel) || LogLevel.DEBUG,
      format: (process.env.LOGGER_CONSOLE_FORMAT as 'pretty' | 'json') || 'pretty',
    },

    /**
     * File transport configuration.
     *
     * Writes logs to a single file with rotation based on size.
     */
    file: {
      enabled: process.env.LOGGER_FILE_ENABLED === 'true',
      type: TransportType.FILE,
      filename: process.env.LOGGER_FILE_FILENAME || './logs/app.log',
      maxFiles: parseInt(process.env.LOGGER_FILE_MAX_FILES || '5', 10),
      handleExceptions: process.env.LOGGER_HANDLE_EXCEPTIONS !== 'false',
      handleRejections: process.env.LOGGER_HANDLE_REJECTIONS !== 'false',
      level: (process.env.LOGGER_FILE_LEVEL as LogLevel) || LogLevel.INFO,
      maxsize: parseInt(process.env.LOGGER_FILE_MAX_SIZE || '5242880', 10),
    },

    /**
     * Daily rotate transport configuration.
     *
     * Creates date-stamped log files with automatic rotation.
     * Ideal for production with long-term log retention.
     */
    daily: {
      enabled: process.env.LOGGER_DAILY_ENABLED === 'true',
      type: TransportType.DAILY,
      maxSize: process.env.LOGGER_DAILY_MAX_SIZE || '20m',
      maxFiles: process.env.LOGGER_DAILY_MAX_FILES || '14d',
      zippedArchive: process.env.LOGGER_DAILY_ZIPPED === 'true',
      datePattern: process.env.LOGGER_DAILY_DATE_PATTERN || 'YYYY-MM-DD',
      handleExceptions: process.env.LOGGER_HANDLE_EXCEPTIONS !== 'false',
      handleRejections: process.env.LOGGER_HANDLE_REJECTIONS !== 'false',
      level: (process.env.LOGGER_DAILY_LEVEL as LogLevel) || LogLevel.INFO,
      filename: process.env.LOGGER_DAILY_FILENAME || './logs/app-%DATE%.log',
    },

    /**
     * CloudWatch transport configuration.
     *
     * Sends logs to AWS CloudWatch Logs.
     * Requires AWS credentials or IAM role.
     */
    cloudwatch: {
      enabled: process.env.LOGGER_CLOUDWATCH_ENABLED === 'true',
      type: TransportType.CLOUDWATCH,
      logStreamName:
        process.env.LOGGER_CLOUDWATCH_LOG_STREAM ||
        `${process.env.NODE_ENV || 'development'}-${Date.now()}`,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      handleExceptions: process.env.LOGGER_HANDLE_EXCEPTIONS !== 'false',
      handleRejections: process.env.LOGGER_HANDLE_REJECTIONS !== 'false',
      level: (process.env.LOGGER_CLOUDWATCH_LEVEL as LogLevel) || LogLevel.INFO,
      createLogGroup: process.env.LOGGER_CLOUDWATCH_CREATE_LOG_GROUP !== 'false',
      createLogStream: process.env.LOGGER_CLOUDWATCH_CREATE_LOG_STREAM !== 'false',
      logGroupName: process.env.LOGGER_CLOUDWATCH_LOG_GROUP || '/aws/application/default',
      awsRegion: process.env.AWS_REGION || process.env.LOGGER_CLOUDWATCH_REGION || 'us-east-1',
    },

    /**
     * Slack transport configuration.
     *
     * Sends log notifications to Slack via webhooks.
     * Ideal for error alerting.
     */
    slack: {
      enabled:
        process.env.LOGGER_SLACK_ENABLED === 'true' && !!process.env.LOGGER_SLACK_WEBHOOK_URL,
      type: TransportType.SLACK,
      channel: process.env.LOGGER_SLACK_CHANNEL,
      webhookUrl: process.env.LOGGER_SLACK_WEBHOOK_URL!,
      username: process.env.LOGGER_SLACK_USERNAME || 'Logger Bot',
      iconEmoji: process.env.LOGGER_SLACK_ICON_EMOJI || ':warning:',
      handleExceptions: process.env.LOGGER_HANDLE_EXCEPTIONS !== 'false',
      handleRejections: process.env.LOGGER_HANDLE_REJECTIONS !== 'false',
      level: (process.env.LOGGER_SLACK_LEVEL as LogLevel) || LogLevel.ERROR,
    },

    /**
     * HTTP transport configuration.
     *
     * Sends logs to external HTTP endpoints.
     * Useful for integration with log aggregation services.
     */
    http: {
      type: TransportType.HTTP,
      host: process.env.LOGGER_HTTP_HOST,
      path: process.env.LOGGER_HTTP_PATH || '/',
      ssl: process.env.LOGGER_HTTP_SSL !== 'false',
      enabled: process.env.LOGGER_HTTP_ENABLED === 'true',
      port: parseInt(process.env.LOGGER_HTTP_PORT || '443', 10),
      handleExceptions: process.env.LOGGER_HANDLE_EXCEPTIONS !== 'false',
      handleRejections: process.env.LOGGER_HANDLE_REJECTIONS !== 'false',
      level: (process.env.LOGGER_HTTP_LEVEL as LogLevel) || LogLevel.INFO,
    },
  },
};
