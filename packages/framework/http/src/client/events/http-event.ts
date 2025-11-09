import { ClientRequest } from '../request';

/**
 * Base HTTP event class.
 *
 * All HTTP events extend this base class and can be listened to
 * using @nestjs/event-emitter's @OnEvent() decorator or EventEmitter2.
 */
export abstract class HttpEvent {
  /**
   * Timestamp when event was created.
   */
  public readonly timestamp: Date = new Date();

  /**
   * The request that triggered this event.
   */
  public readonly request: ClientRequest;

  /**
   * Create a new HTTP event.
   *
   * @param request - The HTTP request
   */
  constructor(request: ClientRequest) {
    this.request = request;
  }
}
