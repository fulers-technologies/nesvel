import type { RequestSendingEvent } from '../../interfaces/client/request-sending-event.interface';
import type { ResponseReceivedEvent } from '../../interfaces/client/response-received-event.interface';
import type { ConnectionFailedEvent } from '../../interfaces/client/connection-failed-event.interface';

/**
 * Union type of all HTTP events.
 */
export type AnyHttpEvent = RequestSendingEvent | ResponseReceivedEvent | ConnectionFailedEvent;
