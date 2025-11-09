/**
 * Options for streamed responses.
 *
 * Controls streaming response behavior.
 */
export interface StreamOptions {
  /**
   * HTTP status code.
   * Default: 200
   */
  status?: number;

  /**
   * Content type for the stream.
   */
  contentType?: string;

  /**
   * Additional headers to send.
   */
  headers?: Record<string, string | string[]>;

  /**
   * Buffer size for streaming.
   */
  bufferSize?: number;
}
