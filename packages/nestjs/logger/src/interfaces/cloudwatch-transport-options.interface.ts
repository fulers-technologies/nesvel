import type { LogLevel } from '@enums/log-level.enum';
import type { TransportType } from '@enums/transport-type.enum';

/**
 * CloudWatch transport options.
 *
 * Sends logs to AWS CloudWatch Logs.
 * Requires AWS credentials or IAM role.
 */
export interface ICloudWatchTransportOptions {
  /**
   * Transport type identifier.
   */
  type: TransportType.CLOUDWATCH;

  /**
   * Whether this transport is enabled.
   * @default false
   */
  enabled?: boolean;

  /**
   * CloudWatch log stream name.
   * @example 'production-server-1'
   */
  logStreamName: string;

  /**
   * AWS access key ID.
   * Can also be provided via AWS_ACCESS_KEY_ID environment variable.
   */
  awsAccessKeyId?: string;

  /**
   * AWS secret access key.
   * Can also be provided via AWS_SECRET_ACCESS_KEY environment variable.
   */
  awsSecretAccessKey?: string;

  /**
   * Minimum log level for this transport.
   * @default LogLevel.INFO
   */
  level?: LogLevel | string;

  /**
   * Create log group if it doesn't exist.
   * @default true
   */
  createLogGroup?: boolean;

  /**
   * Create log stream if it doesn't exist.
   * @default true
   */
  createLogStream?: boolean;

  /**
   * CloudWatch log group name.
   * @example '/aws/application/myapp'
   * @default '/aws/application/default'
   */
  logGroupName: string;

  /**
   * AWS region.
   * @default 'us-east-1'
   */
  awsRegion?: string;

  /**
   * Submission interval in milliseconds.
   */
  submissionInterval?: number;

  /**
   * Number of submission retries.
   */
  submissionRetryCount?: number;

  /**
   * Batch size for log submissions.
   */
  batchSize?: number;

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
