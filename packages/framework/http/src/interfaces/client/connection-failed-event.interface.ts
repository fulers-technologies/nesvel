import type { HttpEvent } from './http-event.interface';
import { HttpEventType } from '../../enums/client/http-event-type.enum';

/**
 * Event fired when a connection fails.
 */
export interface ConnectionFailedEvent extends HttpEvent {
  type: HttpEventType.CONNECTION_FAILED;

  /**
   * The error that caused the connection failure.
   */
  error: Error;
}
