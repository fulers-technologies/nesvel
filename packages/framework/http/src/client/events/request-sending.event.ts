import { HttpEvent } from './http-event';
import { ClientRequest } from '../request';

/**
 * Event fired before an HTTP request is sent.
 *
 * Listen to this event to:
 * - Log outgoing requests
 * - Add tracking headers
 * - Modify requests globally
 * - Implement request interceptors
 *
 * @example
 * ```typescript
 * import { OnEvent } from '@nestjs/event-emitter';
 * import { RequestSendingEvent } from '@nesvel/nestjs-http';
 *
 * @Injectable()
 * export class HttpLogger {
 *   @OnEvent('http.request.sending')
 *   handleRequestSending(event: RequestSendingEvent) {
 *     console.log('Sending:', event.request.method(), event.request.url());
 *   }
 * }
 * ```
 */
export class RequestSendingEvent extends HttpEvent {
  /**
   * Event name for @OnEvent decorator.
   */
  public static readonly EVENT_NAME = 'http.request.sending';

  /**
   * Create a new request sending event.
   *
   * @param request - The HTTP request being sent
   */
  constructor(request: ClientRequest) {
    super(request);
  }

  /**
   * Static factory method.
   *
   * @param request - The HTTP request
   * @returns New event instance
   */
  public static make(request: ClientRequest): RequestSendingEvent {
    return new RequestSendingEvent(request);
  }
}
