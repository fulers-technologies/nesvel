/**
 * Options for publishing messages to a topic.
 *
 * These options are passed to the underlying driver and can be used
 * to configure driver-specific publish behavior.
 */
export interface PublishOptions extends Record<string, any> {
  /**
   * Optional message key for partitioning (Kafka).
   */
  key?: string;

  /**
   * Optional message headers/attributes.
   */
  headers?: Record<string, string>;

  /**
   * Optional message ID or correlation ID.
   */
  messageId?: string;

  /**
   * Optional delay before message becomes available (driver-specific).
   */
  delay?: number;

  /**
   * Optional time-to-live for the message in milliseconds.
   */
  ttl?: number;
}
