import { ulid } from 'ulid';
import type { LogLevel } from '@enums/log-level.enum';

/**
 * Message logged event class.
 *
 * This event is emitted whenever a structured log message is created.
 * It provides detailed information about the log entry including its
 * level, message content, context, and metadata.
 *
 * This event is useful for implementing custom log processors, filters,
 * or forwarding mechanisms without modifying the core logging logic.
 *
 * @class MessageLoggedEvent
 *
 * @example
 * ```typescript
 * @OnEvent('message.logged')
 * handleMessageLogged(event: MessageLoggedEvent) {
 *   if (event.level === LogLevel.ERROR) {
 *     this.errorTracker.captureException(event);
 *   }
 * }
 * ```
 */
export class MessageLoggedEvent {
  /**
   * Unique identifier for the log message.
   * Generated using ULID for sortable, globally unique IDs.
   */
  public readonly id: string;

  /**
   * Timestamp when the message was logged.
   */
  public readonly timestamp: Date;

  /**
   * Creates a new message logged event instance.
   *
   * @param level - The severity level of the log message
   * @param message - The log message content
   * @param context - Optional name/identifier for the logging context
   * @param data - Optional contextual data to include with the log
   * @param metadata - Additional metadata about the log entry
   *
   * @example
   * ```typescript
   * const event = new MessageLoggedEvent(
   *   LogLevel.ERROR,
   *   'Database connection failed',
   *   'DatabaseService',
   *   { host: 'localhost', port: 5432 },
   *   { attempt: 3, maxRetries: 5 }
   * );
   * ```
   */
  constructor(
    public readonly level: LogLevel | string,
    public readonly message: string,
    public readonly context?: string
  ) {
    this.id = ulid();
    this.timestamp = new Date();
  }
}
