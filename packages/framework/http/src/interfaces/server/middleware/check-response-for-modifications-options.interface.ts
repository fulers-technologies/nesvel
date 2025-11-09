/**
 * Check Response For Modifications Configuration Options
 *
 * Handles HTTP conditional requests (ETag/Last-Modified) and 304 Not Modified responses.
 * Improves performance by allowing browsers to use cached resources.
 */
export interface CheckResponseForModificationsOptions {
  /**
   * Whether to enable automatic 304 handling.
   *
   * @default true
   */
  enabled?: boolean;
}
