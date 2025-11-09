import type { ClientRequest } from '../../client/request';
import type { HttpEventType } from '../../enums/client/http-event-type.enum';

/**
 * Base HTTP event interface.
 */
export interface HttpEvent {
  /**
   * Event type.
   */
  type: HttpEventType;

  /**
   * Timestamp when event was created.
   */
  timestamp: Date;

  /**
   * The request that triggered this event.
   */
  request: ClientRequest;
}
