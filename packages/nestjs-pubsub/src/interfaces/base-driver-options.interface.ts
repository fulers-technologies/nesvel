import { IPubSubMetrics } from './metrics.interface';

/**
 * Configuration options for production features in the base driver.
 *
 * These options are shared across all driver implementations and provide
 * consistent production-ready behavior including error handling, monitoring,
 * validation, and flow control.
 */
export interface IBaseDriverOptions {
  /**
   * Optional metrics collector for telemetry and monitoring.
   * If not provided, a no-op implementation is used.
   */
  metrics?: IPubSubMetrics;

  /**
   * Maximum number of handlers allowed per topic.
   * Prevents memory leaks from unbounded handler registration.
   *
   * @default 100
   */
  maxHandlersPerTopic?: number;

  /**
   * Dead Letter Queue topic name for failed messages.
   * When a message handler fails, the message is republished to this topic.
   */
  deadLetterQueue?: string;

  /**
   * Whether to throw errors when message handlers fail.
   *
   * - true: Errors propagate to caller (synchronous behavior)
   * - false: Errors are logged but don't halt execution (async behavior)
   *
   * @default false
   */
  throwOnHandlerError?: boolean;

  /**
   * Maximum allowed message size in bytes.
   * Messages exceeding this size are rejected before publishing.
   *
   * @default undefined (no limit)
   */
  maxMessageSize?: number;

  /**
   * Enable correlation ID tracking for distributed tracing.
   * Automatically generates or uses provided correlation IDs.
   *
   * @default true
   */
  enableCorrelationId?: boolean;

  /**
   * Log sampling rate for high-volume topics (0.0 to 1.0).
   *
   * Controls what percentage of operations are logged:
   * - 1.0: Log all operations (default)
   * - 0.1: Log 10% of operations
   * - 0.01: Log 1% of operations
   *
   * @default 1.0
   */
  logSamplingRate?: number;

  /**
   * Optional namespace prefix for all topics.
   * Automatically prepended to topic names for multi-tenancy or environment separation.
   */
  namespace?: string;
}
