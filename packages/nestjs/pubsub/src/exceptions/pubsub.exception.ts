import { BaseException } from '@nesvel/exceptions';

/**
 * Base exception class for all PubSub-related errors.
 *
 * This class extends the standard Error class and provides a foundation
 * for more specific PubSub exception types. It includes additional context
 * such as error codes and metadata to help with error handling and debugging.
 *
 * All PubSub-specific exceptions should extend this base class to maintain
 * a consistent error hierarchy and enable type-safe error handling.
 */
export class PubSubException extends BaseException {
  /**
   * Optional error code for categorizing the error.
   * Can be used for programmatic error handling and internationalization.
   */
  public readonly code?: string;

  /**
   * Optional metadata providing additional context about the error.
   * Can include details like topic names, message IDs, or driver information.
   */
  public readonly metadata?: Record<string, any>;

  /**
   * Creates a new PubSub exception.
   *
   * @param message - Human-readable error message
   * @param code - Optional error code for categorization
   * @param metadata - Optional additional context about the error
   *
   * @example
   * ```typescript
   * throw PubSubException.make(
   *   'Failed to connect to messaging backend',
   *   'CONNECTION_FAILED',
   *   { driver: 'redis', host: 'localhost' }
   * );
   * ```
   */
  constructor(message: string, code?: string, metadata?: Record<string, any>) {
    super(message);
    this.name = 'PubSubException';
    this.code = code;
    this.metadata = metadata;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the exception to a plain object for serialization.
   *
   * This method is useful for logging, API responses, or storing error
   * information in a database.
   *
   * @returns A plain object representation of the exception
   *
   * @example
   * ```typescript
   * try {
   *   await pubsub.publish('topic', data);
   * } catch (error: Error | any) {
   *   if (error instanceof PubSubException) {
   *     logger.error(error.toJSON());
   *   }
   * }
   * ```
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}
