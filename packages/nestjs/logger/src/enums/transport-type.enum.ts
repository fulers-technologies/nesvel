/**
 * Transport type enumeration.
 *
 * Defines the available transport types (drivers) for the logger module.
 * Each transport type represents a different output destination for logs.
 *
 * @enum {string}
 *
 * @example
 * ```typescript
 * import { TransportType } from '@enums/transport-type.enum';
 *
 * // Use console transport for development
 * const config = {
 *   transports: [{
 *     type: TransportType.CONSOLE,
 *     level: 'debug'
 *   }]
 * };
 * ```
 */
export enum TransportType {
  /**
   * Console transport - Output to stdout/stderr.
   * Best for development and debugging with colorized output.
   */
  CONSOLE = 'console',

  /**
   * File transport - Output to a single file.
   * Best for simple file logging without rotation.
   */
  FILE = 'file',

  /**
   * Daily rotate file transport - Output to date-rotated files.
   * Best for production with automatic log rotation by date.
   */
  DAILY = 'daily',

  /**
   * AWS CloudWatch transport - Output to CloudWatch Logs.
   * Best for AWS-hosted applications.
   */
  CLOUDWATCH = 'cloudwatch',

  /**
   * Slack transport - Send notifications to Slack.
   * Best for error alerting and team notifications.
   */
  SLACK = 'slack',

  /**
   * HTTP transport - Send logs to an HTTP endpoint.
   * Best for integration with external log aggregation services.
   */
  HTTP = 'http',

  /**
   * Custom transport - User-defined Winston transport.
   * Provides full control over transport implementation.
   */
  CUSTOM = 'custom',
}
