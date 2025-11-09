import { HttpEvent } from './http-event';
import { ClientRequest } from '../request';

/**
 * Event fired when an HTTP connection fails.
 *
 * Listen to this event to:
 * - Log connection errors
 * - Implement retry logic
 * - Track service health
 * - Send error alerts
 *
 * @example
 * ```typescript
 * import { OnEvent } from '@nestjs/event-emitter';
 * import { ConnectionFailedEvent } from '@nesvel/nestjs-http';
 *
 * @Injectable()
 * export class ErrorTracker {
 *   @OnEvent('http.connection.failed')
 *   trackError(event: ConnectionFailedEvent) {
 *     console.error('Connection failed:', event.error.message);
 *     this.alerting.send({
 *       type: 'HTTP_ERROR',
 *       url: event.request.url(),
 *       error: event.error.message
 *     });
 *   }
 * }
 * ```
 */
export class ConnectionFailedEvent extends HttpEvent {
  /**
   * Event name for @OnEvent decorator.
   */
  public static readonly EVENT_NAME = 'http.connection.failed';

  /**
   * The error that caused the connection failure.
   */
  public readonly error: Error;

  /**
   * Create a new connection failed event.
   *
   * @param request - The HTTP request
   * @param error - The error that occurred
   */
  constructor(request: ClientRequest, error: Error) {
    super(request);
    this.error = error;
  }

  /**
   * Static factory method.
   *
   * @param request - The HTTP request
   * @param error - The error that occurred
   * @returns New event instance
   */
  public static make(request: ClientRequest, error: Error): ConnectionFailedEvent {
    return new ConnectionFailedEvent(request, error);
  }
}
