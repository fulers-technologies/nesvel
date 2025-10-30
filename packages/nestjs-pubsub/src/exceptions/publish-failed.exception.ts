import { PubSubException } from './pubsub.exception';

/**
 * Exception thrown when publishing a message fails.
 *
 * This exception is thrown when a message cannot be published to a topic
 * due to connection issues, driver errors, serialization failures, or
 * other publishing-related problems.
 *
 * @example
 * ```typescript
 * try {
 *   await driver.publish(topic, data);
 * } catch (error: Error | any) {
 *   throw new PublishFailedException(topic, error);
 * }
 * ```
 */
export class PublishFailedException extends PubSubException {
  /**
   * Creates a new PublishFailedException.
   *
   * @param topic - The topic that the message was being published to
   * @param cause - The underlying error that caused the publish failure
   * @param messageData - Optional message data that failed to publish
   *
   * @example
   * ```typescript
   * try {
   *   await pubsub.publish('user.created', userData);
   * } catch (error: Error | any) {
   *   throw new PublishFailedException('user.created', error, userData);
   * }
   * ```
   */
  constructor(topic: string, cause: Error, messageData?: any) {
    const message = `Failed to publish message to topic '${topic}': ${cause.message}`;

    super(message, 'PUBLISH_FAILED', {
      topic,
      cause: cause.message,
      causeStack: cause.stack,
      messageData,
    });

    this.name = 'PublishFailedException';

    // Preserve the original error as the cause
    if ('cause' in Error.prototype) {
      (this as any).cause = cause;
    }
  }
}
