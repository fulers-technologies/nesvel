import * as winston from 'winston';
import WinstonCloudWatch from 'winston-aws-cloudwatch';

import { LogLevel } from '@enums/log-level.enum';
import { ICloudWatchTransportOptions, ITransport } from '@/interfaces';

/**
 * AWS CloudWatch Logs transport implementation.
 *
 * This transport sends log messages to AWS CloudWatch Logs, making it ideal
 * for AWS-hosted applications. CloudWatch provides centralized log management,
 * searching, filtering, and integration with other AWS services.
 *
 * Features:
 * - Automatic batching of log messages
 * - Configurable submission intervals
 * - Retry logic for failed submissions
 * - Automatic log group/stream creation
 * - Integration with AWS IAM for authentication
 *
 * Authentication can be provided via:
 * - AWS credentials (accessKeyId, secretAccessKey)
 * - IAM roles (when running on EC2/ECS/Lambda)
 * - AWS profiles
 * - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 *
 * @class CloudWatchTransport
 * @implements {ITransport}
 *
 * @example
 * ```typescript
 * const transport = CloudWatchTransport.make({
 *   type: TransportType.CLOUDWATCH,
 *   level: LogLevel.INFO,
 *   logGroupName: '/aws/application/myapp',
 *   logStreamName: `${process.env.NODE_ENV}-${Date.now()}`,
 *   awsRegion: 'us-east-1',
 *   createLogGroup: true,
 *   createLogStream: true
 * });
 *
 * logger.addTransport(transport);
 * ```
 */
export class CloudWatchTransport implements ITransport {
  /**
   * Internal Winston CloudWatch transport instance.
   */
  private readonly winstonTransport: any;

  /**
   * Creates a new CloudWatch transport instance.
   *
   * The transport will automatically batch log messages and send them
   * to CloudWatch at configured intervals. Log groups and streams can
   * be created automatically if they don't exist.
   *
   * @param options - CloudWatch transport configuration options
   *
   * @example With explicit credentials
   * ```typescript
   * const transport = CloudWatchTransport.make({
   *   type: TransportType.CLOUDWATCH,
   *   level: LogLevel.INFO,
   *   logGroupName: '/aws/myapp/logs',
   *   logStreamName: 'production-instance-1',
   *   awsRegion: 'us-east-1',
   *   awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
   *   awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   *   submissionInterval: 2000,
   *   batchSize: 100
   * });
   * ```
   *
   * @example Using IAM roles (EC2/ECS/Lambda)
   * ```typescript
   * const transport = CloudWatchTransport.make({
   *   type: TransportType.CLOUDWATCH,
   *   level: LogLevel.INFO,
   *   logGroupName: '/aws/myapp/logs',
   *   logStreamName: `${process.env.HOSTNAME}-${Date.now()}`,
   *   awsRegion: process.env.AWS_REGION || 'us-east-1',
   *   createLogGroup: true,
   *   createLogStream: true
   * });
   * ```
   */
  constructor(private readonly options: ICloudWatchTransportOptions) {
    const format = winston.format.combine(
      winston.format.json(),
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    );

    // Build CloudWatch config
    const cloudWatchConfig: any = {
      format,
      jsonMessage: true,
      awsRegion: options.awsRegion,
      logGroupName: options.logGroupName,
      logStreamName: options.logStreamName,
      level: options.level || LogLevel.INFO,
      handleExceptions: options.handleExceptions ?? true,
      handleRejections: options.handleRejections ?? true,
    };

    // Add optional credentials
    if (options.awsAccessKeyId && options.awsSecretAccessKey) {
      cloudWatchConfig.awsAccessKeyId = options.awsAccessKeyId;
      cloudWatchConfig.awsSecretAccessKey = options.awsSecretAccessKey;
    }

    // Add optional configuration
    if (options.createLogGroup !== undefined) {
      cloudWatchConfig.createLogGroup = options.createLogGroup;
    }

    if (options.createLogStream !== undefined) {
      cloudWatchConfig.createLogStream = options.createLogStream;
    }

    if (options.submissionInterval !== undefined) {
      cloudWatchConfig.submissionInterval = options.submissionInterval;
    }

    if (options.submissionRetryCount !== undefined) {
      cloudWatchConfig.submissionRetryCount = options.submissionRetryCount;
    }

    if (options.batchSize !== undefined) {
      cloudWatchConfig.batchSize = options.batchSize;
    }

    this.winstonTransport = WinstonCloudWatch.make(cloudWatchConfig);
  }

  /**
   * Static factory method to create a new CloudWatch transport instance.
   *
   * This method provides a fluent interface for creating transport instances
   * following the static factory pattern commonly used in Laravel and similar frameworks.
   *
   * @param options - CloudWatch transport configuration options
   * @returns A new CloudWatchTransport instance
   *
   * @example
   * ```typescript
   * const transport = CloudWatchTransport.make({
   *   type: TransportType.CLOUDWATCH,
   *   logGroupName: '/aws/application/myapp',
   *   logStreamName: 'production',
   *   awsRegion: 'us-east-1'
   * });
   * ```
   */
  static make(options: ICloudWatchTransportOptions): CloudWatchTransport {
    return new CloudWatchTransport(options);
  }

  /**
   * Logs a message at the specified level.
   *
   * This method queues the log entry for submission to CloudWatch.
   * Messages are batched and sent at configured intervals for efficiency.
   * The message will include all context data in JSON format.
   *
   * @param level - The severity level of the log message
   * @param message - The log message content
   * @param context - Optional contextual data to include with the log
   *
   * @example
   * ```typescript
   * transport.log(LogLevel.INFO, 'API request processed', {
   *   method: 'POST',
   *   path: '/api/users',
   *   statusCode: 201,
   *   duration: 145,
   *   requestId: 'req_123'
   * });
   * ```
   */
  log(level: LogLevel | string, message: string, context?: any): void {
    this.winstonTransport.log?.(
      {
        level,
        message,
        ...context,
      },
      () => {}
    );
  }

  /**
   * Flushes any buffered log messages.
   *
   * This method ensures all queued messages are immediately sent to CloudWatch.
   * Useful before application shutdown or when immediate delivery is required.
   * Note that CloudWatch has rate limits, so frequent flushing may cause throttling.
   *
   * @returns Promise that resolves when all messages are flushed
   *
   * @example
   * ```typescript
   * // Before application shutdown
   * await transport.flush();
   * ```
   */
  async flush(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.winstonTransport.kthxbye) {
        this.winstonTransport.kthxbye(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Closes the transport and releases resources.
   *
   * This method flushes all remaining buffered messages to CloudWatch
   * and closes the connection. Should be called during application shutdown.
   *
   * @returns Promise that resolves when the transport is closed
   *
   * @example
   * ```typescript
   * await transport.close();
   * ```
   */
  async close(): Promise<void> {
    return this.flush();
  }
}
