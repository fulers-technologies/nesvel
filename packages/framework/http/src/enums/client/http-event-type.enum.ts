/**
 * HTTP event types for the event system.
 */
export enum HttpEventType {
  /**
   * Fired before a request is sent.
   */
  REQUEST_SENDING = 'request:sending',

  /**
   * Fired after a response is received.
   */
  RESPONSE_RECEIVED = 'response:received',

  /**
   * Fired when a connection fails.
   */
  CONNECTION_FAILED = 'connection:failed',
}
