import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Recorded request/response pair.
 *
 * Captured during testing to allow assertions on sent requests.
 */
export interface RecordedRequest {
  /**
   * The request configuration that was sent.
   */
  request: AxiosRequestConfig;

  /**
   * The response that was received (or stubbed).
   */
  response: AxiosResponse | null;

  /**
   * Timestamp when the request was made.
   */
  timestamp: Date;
}
