/**
 * Frame Guard Configuration Options
 *
 * Sets X-Frame-Options header to prevent clickjacking attacks.
 * Protects against UI redress attacks by controlling frame embedding.
 */
export interface FrameGuardOptions {
  /**
   * Frame options directive.
   *
   * - 'DENY': Page cannot be displayed in a frame
   * - 'SAMEORIGIN': Page can only be displayed in a frame on the same origin
   * - 'ALLOW-FROM uri': Page can only be displayed in a frame on the specified origin (deprecated)
   *
   * @default 'SAMEORIGIN'
   */
  action?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';

  /**
   * URI to allow framing from (only used with ALLOW-FROM action).
   * Note: ALLOW-FROM is deprecated and not supported by all browsers.
   *
   * @deprecated Use Content-Security-Policy frame-ancestors directive instead
   */
  domain?: string;
}
