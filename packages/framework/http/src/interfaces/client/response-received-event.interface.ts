import type { ClientResponse } from '../../client/response';
import type { HttpEvent } from './http-event.interface';
import { HttpEventType } from '../../enums/client/http-event-type.enum';

/**
 * Event fired after a response is received.
 */
export interface ResponseReceivedEvent extends HttpEvent {
  type: HttpEventType.RESPONSE_RECEIVED;

  /**
   * The response that was received.
   */
  response: ClientResponse;

  /**
   * Duration of the request in milliseconds.
   */
  durationMs: number;
}
