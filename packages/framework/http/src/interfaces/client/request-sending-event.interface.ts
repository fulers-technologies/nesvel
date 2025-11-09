import type { HttpEvent } from './http-event.interface';
import { HttpEventType } from '../../enums/client/http-event-type.enum';

/**
 * Event fired before a request is sent.
 */
export interface RequestSendingEvent extends HttpEvent {
  type: HttpEventType.REQUEST_SENDING;
}
