/**
 * TypeScript declaration module for winston-aws-cloudwatch transport.
 *
 * This module provides type definitions for the winston-aws-cloudwatch package,
 * which enables Winston logger to send log messages to AWS CloudWatch Logs.
 *
 * CloudWatch Logs provides centralized log management for AWS resources and
 * applications. This transport handles batching, retries, and automatic creation
 * of log groups and streams.
 *
 * @module winston-aws-cloudwatch
 * @see {@link https://www.npmjs.com/package/winston-aws-cloudwatch}
 * @see {@link https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html}
 */
declare module 'winston-aws-cloudwatch' {
  import * as Transport from 'winston-transport';

  /**
   * Configuration options for the CloudWatch transport.
   *
   * These options control how Winston log messages are batched, formatted,
   * and sent to AWS CloudWatch Logs. The transport handles authentication,
   * log group/stream management, and automatic retries.
   */
  interface CloudWatchTransportOptions {
    /**
     * The name of the CloudWatch log group.
     *
     * Log groups are containers for log streams. All log streams in a group
     * share the same retention, monitoring, and access control settings.
     *
     * @required
     * @example '/aws/lambda/my-function' or 'production/api'
     */
    logGroupName: string;

    /**
     * The name of the CloudWatch log stream within the log group.
     *
     * Log streams are sequences of log events from the same source. Common
     * patterns include using timestamps, instance IDs, or request IDs.
     *
     * @required
     * @example '2024-01-15' or 'instance-i-1234567890abcdef0'
     */
    logStreamName: string;

    /**
     * AWS region where the CloudWatch Logs service is located.
     *
     * If not specified, the SDK will attempt to determine the region from
     * environment variables or instance metadata.
     *
     * @optional
     * @example 'us-east-1', 'eu-west-1', 'ap-southeast-1'
     */
    awsRegion?: string;

    /**
     * AWS access key ID for authentication.
     *
     * If not specified, the SDK will use the default credential provider chain
     * (environment variables, instance profile, etc.).
     *
     * @optional
     * @security Should be stored securely, preferably in environment variables
     */
    awsAccessKeyId?: string;

    /**
     * AWS secret access key for authentication.
     *
     * If not specified, the SDK will use the default credential provider chain.
     *
     * @optional
     * @security Must be kept secret and never committed to version control
     */
    awsSecretAccessKey?: string;

    /**
     * Whether to send log messages as JSON.
     *
     * When true, the entire log info object is stringified as JSON before
     * sending to CloudWatch. When false, only the message property is sent.
     *
     * @optional
     * @default false
     */
    jsonMessage?: boolean;

    /**
     * Whether to automatically create the log group if it doesn't exist.
     *
     * When true, the transport will attempt to create the log group on first use.
     * Requires appropriate IAM permissions (logs:CreateLogGroup).
     *
     * @optional
     * @default false
     */
    createLogGroup?: boolean;

    /**
     * Whether to automatically create the log stream if it doesn't exist.
     *
     * When true, the transport will attempt to create the log stream on first use.
     * Requires appropriate IAM permissions (logs:CreateLogStream).
     *
     * @optional
     * @default false
     */
    createLogStream?: boolean;

    /**
     * Interval in milliseconds between batch submissions to CloudWatch.
     *
     * Log events are batched and sent at this interval to reduce API calls
     * and improve performance. Lower values provide near-real-time logging
     * but increase API usage.
     *
     * @optional
     * @default 2000 (2 seconds)
     * @example 1000 for 1 second, 5000 for 5 seconds
     */
    submissionInterval?: number;

    /**
     * Number of retry attempts for failed CloudWatch API calls.
     *
     * The transport will retry failed submissions this many times before
     * giving up. Useful for handling transient network issues or rate limiting.
     *
     * @optional
     * @default 3
     */
    submissionRetryCount?: number;

    /**
     * Maximum number of log events to include in a single CloudWatch batch.
     *
     * CloudWatch has a maximum batch size of 10,000 events or 1MB, whichever
     * comes first. This setting helps control batch size and API costs.
     *
     * @optional
     * @default 100
     * @example 500 for larger batches, 50 for smaller batches
     */
    batchSize?: number;

    /**
     * Minimum logging level for this transport.
     *
     * Only log messages at or above this level will be sent to CloudWatch.
     * Common levels: 'error', 'warn', 'info', 'debug'.
     *
     * @optional
     * @default 'info'
     * @example 'error' - Only log errors to CloudWatch
     */
    level?: string;

    /**
     * Whether this transport should handle uncaught exceptions.
     *
     * When true, uncaught exceptions will be logged to CloudWatch before
     * the process exits.
     *
     * @optional
     * @default false
     */
    handleExceptions?: boolean;

    /**
     * Whether this transport should handle unhandled promise rejections.
     *
     * When true, unhandled promise rejections will be logged to CloudWatch.
     *
     * @optional
     * @default false
     */
    handleRejections?: boolean;

    /**
     * Winston format to apply to log messages before sending to CloudWatch.
     *
     * Can be any Winston format (e.g., winston.format.json(), winston.format.simple()).
     *
     * @optional
     * @example winston.format.combine(winston.format.timestamp(), winston.format.json())
     */
    format?: any;
  }

  /**
   * Winston transport for sending log messages to AWS CloudWatch Logs.
   *
   * This class extends the base Winston Transport class to provide CloudWatch
   * integration. It handles batching, automatic retries, and graceful shutdown
   * to ensure all logs are sent before the process exits.
   *
   * The transport automatically manages log event sequencing and handles
   * CloudWatch's ordering requirements.
   *
   * @class CloudWatchTransport
   * @extends {Transport}
   *
   * @example
   * ```typescript
   * import winston from 'winston';
   * import CloudWatchTransport from 'winston-aws-cloudwatch';
   *
   * const logger = winston.createLogger({
   *   transports: [
   *     new CloudWatchTransport({
   *       logGroupName: '/aws/application/my-app',
   *       logStreamName: `${new Date().toISOString().split('T')[0]}`,
   *       awsRegion: 'us-east-1',
   *       createLogGroup: true,
   *       createLogStream: true,
   *       jsonMessage: true,
   *       level: 'info',
   *       handleExceptions: true
   *     })
   *   ]
   * });
   * ```
   */
  class CloudWatchTransport extends Transport {
    /**
     * Creates a new CloudWatch transport instance.
     *
     * Initializes the transport with the provided options and sets up the
     * AWS CloudWatch Logs client. If createLogGroup or createLogStream are
     * enabled, it will attempt to create these resources on first use.
     *
     * @param options - Configuration options for the CloudWatch transport
     * @throws {Error} If logGroupName or logStreamName are not provided
     * @throws {Error} If AWS credentials are invalid or insufficient permissions
     */
    constructor(options: CloudWatchTransportOptions);

    /**
     * Gracefully shuts down the transport and flushes pending log events.
     *
     * This method ensures all buffered log events are sent to CloudWatch
     * before the transport closes. It should be called during application
     * shutdown to prevent log loss.
     *
     * The method name "kthxbye" is a playful convention used by some Winston
     * transports to indicate graceful shutdown ("okay, thanks, bye").
     *
     * @optional This method may not be implemented in all versions
     * @param callback - Function to call after all pending logs are sent
     * @example
     * ```typescript
     * process.on('SIGTERM', () => {
     *   transport.kthxbye?.(() => {
     *     console.log('All logs flushed');
     *     process.exit(0);
     *   });
     * });
     * ```
     */
    kthxbye?(callback: () => void): void;
  }

  export = CloudWatchTransport;
}
