/**
 * Helmet Security Configuration
 *
 * Security headers and protection settings.
 */
export interface HttpHelmetConfig {
  /**
   * Enable Helmet security middleware
   *
   * @env HTTP_HELMET_ENABLED
   * @default true
   */
  enabled?: boolean;

  /**
   * Content Security Policy
   *
   * @env HTTP_HELMET_CSP_ENABLED
   */
  contentSecurityPolicy?: boolean | Record<string, any>;

  /**
   * Cross-Origin-Embedder-Policy
   *
   * @env HTTP_HELMET_CROSS_ORIGIN_EMBEDDER_POLICY
   * @default false
   */
  crossOriginEmbedderPolicy?: boolean;

  /**
   * Cross-Origin-Opener-Policy
   *
   * @env HTTP_HELMET_CROSS_ORIGIN_OPENER_POLICY
   * @default false
   */
  crossOriginOpenerPolicy?: boolean;

  /**
   * Cross-Origin-Resource-Policy
   *
   * @env HTTP_HELMET_CROSS_ORIGIN_RESOURCE_POLICY
   * @default false
   */
  crossOriginResourcePolicy?: boolean;

  /**
   * DNS Prefetch Control
   *
   * @env HTTP_HELMET_DNS_PREFETCH_CONTROL
   * @default true
   */
  dnsPrefetchControl?: boolean;

  /**
   * Frameguard (X-Frame-Options)
   *
   * @env HTTP_HELMET_FRAMEGUARD
   * @default true
   */
  frameguard?: boolean;

  /**
   * Hide Powered-By header
   *
   * @env HTTP_HELMET_HIDE_POWERED_BY
   * @default true
   */
  hidePoweredBy?: boolean;

  /**
   * HTTP Strict Transport Security
   *
   * @env HTTP_HELMET_HSTS_ENABLED
   * @default true
   */
  hsts?: boolean | Record<string, any>;

  /**
   * IE No Open
   *
   * @env HTTP_HELMET_IE_NO_OPEN
   * @default true
   */
  ieNoOpen?: boolean;

  /**
   * No Sniff (X-Content-Type-Options)
   *
   * @env HTTP_HELMET_NO_SNIFF
   * @default true
   */
  noSniff?: boolean;

  /**
   * Referrer Policy
   *
   * @env HTTP_HELMET_REFERRER_POLICY
   * @default true
   */
  referrerPolicy?: boolean | Record<string, any>;

  /**
   * XSS Filter
   *
   * @env HTTP_HELMET_XSS_FILTER
   * @default true
   */
  xssFilter?: boolean;
}
