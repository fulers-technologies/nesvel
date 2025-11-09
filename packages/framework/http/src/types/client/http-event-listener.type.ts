import type { AnyHttpEvent } from './any-http-event.type';

/**
 * Event listener callback type.
 */
export type HttpEventListener<T extends AnyHttpEvent = AnyHttpEvent> = (
  event: T
) => void | Promise<void>;
