import { HttpEvent } from './http-event';
import { ClientRequest } from '../request';
import { ClientResponse } from '../response';

/**
 * Event fired after an HTTP response is received.
 *
 * Listen to this event to:
 * - Log responses
 * - Track API metrics
 * - Implement response interceptors
 * - Collect performance data
 *
 * @example
 * ```typescript
 * import { OnEvent } from '@nestjs/event-emitter';
 * import { ResponseReceivedEvent } from '@nesvel/nestjs-http';
 *
 * @Injectable()
 * export class ApiMetrics {
 *   @OnEvent('http.response.received')
 *   trackResponse(event: ResponseReceivedEvent) {
 *     console.log('Response:', event.response.status(), `${event.durationMs}ms`);
 *     this.metrics.record({
 *       url: event.request.url(),
 *       status: event.response.status(),
 *       duration: event.durationMs
 *     });
 *   }
 * }
 * ```
 */
export class ResponseReceivedEvent extends HttpEvent {
  /**
   * Event name for @OnEvent decorator.
   */
  public static readonly EVENT_NAME = 'http.response.received';

  /**
   * The response that was received.
   */
  public readonly response: ClientResponse;

  /**
   * Duration of the request in milliseconds.
   */
  public readonly durationMs: number;

  /**
   * Create a new response received event.
   *
   * @param request - The HTTP request
   * @param response - The HTTP response
   * @param durationMs - Request duration in milliseconds
   */
  constructor(request: ClientRequest, response: ClientResponse, durationMs: number) {
    super(request);
    this.response = response;
    this.durationMs = durationMs;
  }

  /**
   * Static factory method.
   *
   * @param request - The HTTP request
   * @param response - The HTTP response
   * @param durationMs - Request duration in milliseconds
   * @returns New event instance
   */
  public static make(
    request: ClientRequest,
    response: ClientResponse,
    durationMs: number
  ): ResponseReceivedEvent {
    return ResponseReceivedEvent.make(request, response, durationMs);
  }
}
